---
id: angular-20-snippets
title: Angular 20 — Patrones Modernos & Snippets Reutilizables
---

# Angular 20 — Patrones Modernos & Snippets Reutilizables

Esta sección reúne fragmentos prácticos y patrones modernos utilizados en Angular 17-20, orientados a aplicaciones escalables con Signals, Standalone Components y optimización de rendimiento.

---

## 🔥 Standalone Components

### Componente Básico con Signals

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <button (click)="increment()">+1</button>
    <span>{{ count() }}</span>
  `,
})
export class CounterComponent {
  count = signal(0);
  increment = () => this.count.update(v => v + 1);
}
```

### Componente con Computed Signals

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  template: `
    <div>Items: {{ itemCount() }}</div>
    <div>Total: ${{ total() }}</div>
  `,
})
export class ShoppingCartComponent {
  items = signal([
    { name: 'Product 1', price: 10, quantity: 2 },
    { name: 'Product 2', price: 15, quantity: 1 },
  ]);

  itemCount = computed(() => this.items().length);
  total = computed(() => 
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
}
```

---

## 🎯 Servicios Modernos con Signals

### Service con Estado Reactivo

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private users = signal<User[]>([]);
  
  // Computed values
  userCount = computed(() => this.users().length);
  activeUsers = computed(() => this.users().filter(u => u.active));

  constructor(private http: HttpClient) {}

  async loadUsers() {
    const data = await this.http.get<User[]>('/api/users').toPromise();
    this.users.set(data);
  }

  addUser(user: User) {
    this.users.update(current => [...current, user]);
  }
}
```

---

## 🚀 Directivas Standalone

### Directiva de Auto-focus

```typescript
import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit() {
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}
```

### Directiva de Highlight

```typescript
import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  color = input<string>('yellow');

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = this.color();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = '';
  }
}
```

---

## 🔄 Manejo de Estado con Effects

### Effect para Persistencia Local

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button (click)="toggleTheme()">
      {{ theme() === 'dark' ? '☀️' : '🌙' }}
    </button>
  `,
})
export class ThemeToggleComponent {
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    // Load from localStorage
    const saved = localStorage.getItem('theme');
    if (saved) this.theme.set(saved as any);

    // Auto-save on change
    effect(() => {
      localStorage.setItem('theme', this.theme());
      document.body.className = this.theme();
    });
  }

  toggleTheme() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }
}
```

---

## 📡 HTTP con Signals

### Fetch con Loading State

```typescript
import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    @if (loading()) {
      <div>Loading...</div>
    }
    @if (error()) {
      <div class="error">{{ error() }}</div>
    }
    @for (user of users(); track user.id) {
      <div>{{ user.name }}</div>
    }
  `,
})
export class UserListComponent {
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const data = await this.http.get<User[]>('/api/users').toPromise();
      this.users.set(data);
    } catch (err) {
      this.error.set('Failed to load users');
    } finally {
      this.loading.set(false);
    }
  }
}
```

---

## 🎨 Control Flow Moderno (@if, @for)

### Renderizado Condicional

```typescript
@Component({
  template: `
    @if (isLoggedIn()) {
      <div>Welcome, {{ username() }}!</div>
      <button (click)="logout()">Logout</button>
    } @else {
      <button (click)="login()">Login</button>
    }
  `,
})
export class AuthComponent {
  isLoggedIn = signal(false);
  username = signal('');

  login() {
    this.isLoggedIn.set(true);
    this.username.set('Juan Sebastian');
  }

  logout() {
    this.isLoggedIn.set(false);
    this.username.set('');
  }
}
```

### Listas Optimizadas

```typescript
@Component({
  template: `
    @for (item of items(); track item.id) {
      <div class="item">
        {{ item.name }} - ${{ item.price }}
      </div>
    } @empty {
      <div>No items available</div>
    }
  `,
})
export class ItemListComponent {
  items = signal([
    { id: 1, name: 'Item 1', price: 100 },
    { id: 2, name: 'Item 2', price: 200 },
  ]);
}
```

---

## 🛠️ Pipes Personalizados

### Pipe Standalone

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date): string {
    const seconds = Math.floor((Date.now() - value.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
```

---

## 📦 Routing Standalone

### Configuración de Rutas

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
```

---

## ⚡ Optimización & Performance

### OnPush Strategy con Signals

```typescript
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-optimized',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ data() }}</div>`,
})
export class OptimizedComponent {
  data = signal('Initial value');
  
  // Signals automáticamente notifican cambios con OnPush
  updateData(newValue: string) {
    this.data.set(newValue);
  }
}
```

---

## 🔐 Guards Funcionales

### Auth Guard Moderno

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};

// Uso en rutas
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () => import('./dashboard.component'),
}
```

---

## 🎯 Buenas Prácticas

1. **Usa Signals** para estado reactivo en lugar de RxJS cuando sea posible
2. **Standalone Components** para mejor tree-shaking
3. **Control Flow** moderno (@if, @for) en lugar de *ngIf, *ngFor
4. **Lazy Loading** para optimizar bundle size
5. **OnPush** + Signals para máximo rendimiento
6. **Typed Forms** para type safety
7. **Inject function** en lugar de constructor injection

---

## 📚 Recursos

- [Angular Docs](https://angular.dev)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Angular Best Practices](https://angular.dev/best-practices)