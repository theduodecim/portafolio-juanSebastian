---
id: react-19-snippets
title: React 19.2 — Patrones Modernos & Snippets Reutilizables
---

# React 19.2 — Patrones Modernos & Snippets Reutilizables

Esta sección reúne fragmentos prácticos y patrones modernos utilizados en React 19, incluyendo Server Components, Actions, use hook, y optimizaciones de rendimiento.

---

## 🚀 Server Components

### Server Component Básico

```jsx
// app/users/page.jsx
async function UsersPage() {
  // Fetch directo en el servidor - no necesita useEffect
  const users = await fetch('https://api.example.com/users').then(r => r.json());

  return (
    <div>
      <h1>Users List</h1>
      {users.map(user => (
        <div key={user.id}>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}

export default UsersPage;
```

### Server Component con Datos Paralelos

```jsx
async function DashboardPage() {
  // Fetch paralelo para mejor performance
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json()),
  ]);

  return (
    <div>
      <UsersWidget data={users} />
      <PostsWidget data={posts} />
      <CommentsWidget data={comments} />
    </div>
  );
}
```

---

## ⚡ Client Components

### Componente con use Hook

```jsx
'use client';

import { use, Suspense } from 'react';

function UserProfile({ userPromise }) {
  // 'use' desenvuelve promises directamente
  const user = use(userPromise);

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}

export default function ProfilePage() {
  const userPromise = fetch('/api/user').then(r => r.json());

  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

### use con Context

```jsx
'use client';

import { use, createContext } from 'react';

const ThemeContext = createContext(null);

function ThemedButton() {
  // 'use' funciona con Context también
  const theme = use(ThemeContext);

  return (
    <button style={{ background: theme.primary }}>
      Click me
    </button>
  );
}
```

---

## 🎯 Actions (Server & Client)

### Server Action para Forms

```jsx
// app/actions.js
'use server';

export async function createUser(formData) {
  const name = formData.get('name');
  const email = formData.get('email');

  const user = await db.users.create({
    data: { name, email }
  });

  revalidatePath('/users');
  return { success: true, user };
}
```

```jsx
// app/users/new/page.jsx
import { createUser } from '../actions';

export default function NewUserPage() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create User</button>
    </form>
  );
}
```

### useActionState para Estado de Formularios

```jsx
'use client';

import { useActionState } from 'react';
import { createUser } from './actions';

export default function UserForm() {
  const [state, formAction, isPending] = useActionState(createUser, {
    success: false,
    message: ''
  });

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>

      {state.success && (
        <div className="success">{state.message}</div>
      )}
    </form>
  );
}
```

### useOptimistic para Actualización Optimista

```jsx
'use client';

import { useOptimistic } from 'react';

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  async function handleSubmit(formData) {
    const text = formData.get('text');
    const newTodo = { id: Date.now(), text };
    
    // Actualización optimista inmediata
    addOptimisticTodo(newTodo);
    
    // Actualización real al servidor
    await addTodo(newTodo);
  }

  return (
    <>
      <form action={handleSubmit}>
        <input name="text" required />
        <button type="submit">Add</button>
      </form>

      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

---

## 🎨 useFormStatus Hook

### Botón de Submit con Estado

```jsx
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Spinner />
          Submitting...
        </>
      ) : (
        'Submit'
      )}
    </button>
  );
}

export default function MyForm() {
  return (
    <form action={submitAction}>
      <input name="email" />
      <SubmitButton />
    </form>
  );
}
```

---

## 📦 Streaming & Suspense

### Streaming con Suspense Boundaries

```jsx
import { Suspense } from 'react';

async function SlowComponent() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return <div>Slow content loaded!</div>;
}

export default function StreamingPage() {
  return (
    <div>
      <h1>Page loads immediately</h1>
      
      {/* Este contenido se carga rápido */}
      <FastComponent />

      {/* Este contenido hace streaming cuando está listo */}
      <Suspense fallback={<LoadingSkeleton />}>
        <SlowComponent />
      </Suspense>

      {/* Más contenido que no bloquea */}
      <Footer />
    </div>
  );
}
```

### Múltiples Suspense Boundaries

```jsx
export default function Dashboard() {
  return (
    <div className="dashboard">
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <UserStats />
      </Suspense>
    </div>
  );
}
```

---

## 🔄 Transiciones con useTransition

### Navegación sin Bloqueo

```jsx
'use client';

import { useState, useTransition } from 'react';

export default function TabContainer() {
  const [tab, setTab] = useState('about');
  const [isPending, startTransition] = useTransition();

  function handleTabChange(newTab) {
    startTransition(() => {
      setTab(newTab);
    });
  }

  return (
    <div>
      <div className="tabs">
        <button onClick={() => handleTabChange('about')}>About</button>
        <button onClick={() => handleTabChange('posts')}>Posts</button>
        <button onClick={() => handleTabChange('contact')}>Contact</button>
      </div>

      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        {tab === 'about' && <AboutTab />}
        {tab === 'posts' && <PostsTab />}
        {tab === 'contact' && <ContactTab />}
      </div>
    </div>
  );
}
```

---

## 🎯 Custom Hooks Modernos

### useAsync Hook

```jsx
import { useState, useEffect } from 'react';

function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = async (...params) => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction(...params);
      setData(response);
      setStatus('success');
    } catch (error) {
      setError(error);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { execute, status, data, error };
}

// Uso
function UserProfile({ userId }) {
  const { status, data, error } = useAsync(
    () => fetch(`/api/users/${userId}`).then(r => r.json())
  );

  if (status === 'pending') return <div>Loading...</div>;
  if (status === 'error') return <div>Error: {error.message}</div>;
  if (status === 'success') return <div>{data.name}</div>;
}
```

### useLocalStorage Hook

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

// Uso
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

---

## 🎨 Patrones de Composición

### Compound Components

```jsx
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      className={isActive ? 'tab active' : 'tab'}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  
  return <div className="tab-panel">{children}</div>;
}

// Uso
export default function App() {
  return (
    <Tabs defaultValue="profile">
      <TabList>
        <Tab value="profile">Profile</Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>

      <TabPanel value="profile">
        <h2>Profile Content</h2>
      </TabPanel>

      <TabPanel value="settings">
        <h2>Settings Content</h2>
      </TabPanel>
    </Tabs>
  );
}
```

---

## 🔐 Error Boundaries (React 19)

### Error Boundary Moderno

```jsx
'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error.message}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Uso
export default function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

---

## ⚡ Performance Optimization

### React.memo con comparación personalizada

```jsx
import { memo } from 'react';

const UserCard = memo(
  function UserCard({ user, onSelect }) {
    console.log('UserCard rendered');
    
    return (
      <div onClick={() => onSelect(user.id)}>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Solo re-renderiza si el user.id cambió
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### useCallback y useMemo

```jsx
import { useState, useCallback, useMemo } from 'react';

function ExpensiveComponent({ items }) {
  const [filter, setFilter] = useState('');

  // Memoiza la función de filtrado
  const handleFilter = useCallback((searchTerm) => {
    setFilter(searchTerm);
  }, []);

  // Memoiza el resultado filtrado
  const filteredItems = useMemo(() => {
    console.log('Filtering...');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <div>
      <input 
        value={filter} 
        onChange={(e) => handleFilter(e.target.value)} 
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🎯 Metadata API (App Router)

### Metadata Estática

```jsx
// app/about/page.jsx
export const metadata = {
  title: 'About Us',
  description: 'Learn more about our company',
  openGraph: {
    title: 'About Us',
    description: 'Learn more about our company',
    images: ['/og-image.jpg'],
  },
};

export default function AboutPage() {
  return <div>About content</div>;
}
```

### Metadata Dinámica

```jsx
// app/blog/[slug]/page.jsx
export async function generateMetadata({ params }) {
  const post = await fetch(`/api/posts/${params.slug}`).then(r => r.json());

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage],
    },
  };
}

export default function BlogPost({ params }) {
  return <article>...</article>;
}
```

---

## 🛠️ Utility Functions

### Class Name Helper

```jsx
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Uso
<div className={cn(
  'base-class',
  isActive && 'active',
  isDisabled && 'disabled'
)}>
  Content
</div>
```

### Debounce Hook

```jsx
import { useEffect, useState } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Uso
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Ejecuta búsqueda
      console.log('Searching for:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

## 🎯 Buenas Prácticas

1. **Server Components por defecto** - Solo usa 'use client' cuando necesites interactividad
2. **use hook** para unwrap promises y context de forma más limpia
3. **Server Actions** para mutations sin necesidad de API routes
4. **Suspense boundaries** estratégicos para mejor UX
5. **useTransition** para actualizaciones no urgentes
6. **useOptimistic** para feedback instantáneo
7. **Metadata API** para mejor SEO
8. **Error Boundaries** para manejo robusto de errores
9. **Memoización inteligente** - solo cuando sea necesario
10. **TypeScript** para type safety completo

---

## 📚 Recursos

- [React 19 Docs](https://react.dev)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [App Router Guide](https://nextjs.org/docs/app)
- [React Patterns](https://reactpatterns.com)