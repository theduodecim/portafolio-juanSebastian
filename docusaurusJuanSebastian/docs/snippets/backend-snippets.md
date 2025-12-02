---
id: backend-snippets
title: Backend — Patrones Modernos & Snippets Reutilizables
---

# Backend — Patrones Modernos & Snippets Reutilizables

Esta sección reúne patrones prácticos de desarrollo backend con Next.js, Node.js, TypeScript, MySQL, Firebase y arquitecturas RESTful escalables.

---

## 🎯 Next.js API Routes

### API Route Básica con TypeScript

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    
    const users = await db.users.findMany({
      skip: (parseInt(page) - 1) * 10,
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: users,
      page: parseInt(page),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await db.users.create({
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

### API Route con Parámetros Dinámicos

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.users.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const user = await db.users.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.users.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
```

### Middleware de Autenticación

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    // Lógica protegida
    const data = await getProtectedData(decoded.userId);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}
```

---

## 🚀 Node.js + Express + TypeScript

### Server Setup con TypeScript

```typescript
// src/server.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: Date.now() });
});

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
```

### RESTful Controller Pattern

```typescript
// src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { ApiError } from '../utils/ApiError';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /api/users
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const result = await this.userService.findAll({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/users/:id
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/users
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const user = await this.userService.create(userData);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/users/:id
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userData = req.body;

      const user = await this.userService.update(id, userData);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/users/:id
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.userService.delete(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
```

### Service Layer Pattern

```typescript
// src/services/userService.ts
import { db } from '../config/database';
import { ApiError } from '../utils/ApiError';
import bcrypt from 'bcrypt';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export class UserService {
  async findAll(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM users';
    const params: any[] = [];

    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [users] = await db.execute(query, params);

    // Count total
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM users'
    );
    const total = (countResult as any)[0].total;

    return {
      users,
      page,
      limit,
      total,
    };
  }

  async findById(id: string) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return (rows as any[])[0];
  }

  async findByEmail(email: string) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return (rows as any[])[0];
  }

  async create(data: CreateUserDto) {
    // Check if email exists
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ApiError(400, 'Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [data.name, data.email, hashedPassword]
    );

    const userId = (result as any).insertId;
    return this.findById(userId);
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.name) {
      updates.push('name = ?');
      params.push(data.name);
    }

    if (data.email) {
      updates.push('email = ?');
      params.push(data.email);
    }

    if (updates.length === 0) {
      return user;
    }

    params.push(id);

    await db.execute(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
}
```

### Middleware de Error Handling

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

// src/utils/ApiError.ts
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}
```

---

## 🗄️ MySQL con Node.js

### Conexión con Pool

```typescript
// src/config/database.ts
import mysql from 'mysql2/promise';
import { config } from './index';

export const db = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection
export const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    process.exit(1);
  }
};
```

### Query Builder Helper

```typescript
// src/utils/queryBuilder.ts
export class QueryBuilder {
  private table: string;
  private whereConditions: string[] = [];
  private whereParams: any[] = [];
  private selectFields: string = '*';
  private limitValue?: number;
  private offsetValue?: number;
  private orderByClause?: string;

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string | string[]) {
    this.selectFields = Array.isArray(fields) ? fields.join(', ') : fields;
    return this;
  }

  where(field: string, operator: string, value: any) {
    this.whereConditions.push(`${field} ${operator} ?`);
    this.whereParams.push(value);
    return this;
  }

  whereIn(field: string, values: any[]) {
    const placeholders = values.map(() => '?').join(', ');
    this.whereConditions.push(`${field} IN (${placeholders})`);
    this.whereParams.push(...values);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC') {
    this.orderByClause = `ORDER BY ${field} ${direction}`;
    return this;
  }

  limit(limit: number) {
    this.limitValue = limit;
    return this;
  }

  offset(offset: number) {
    this.offsetValue = offset;
    return this;
  }

  build(): { query: string; params: any[] } {
    let query = `SELECT ${this.selectFields} FROM ${this.table}`;

    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }

    if (this.orderByClause) {
      query += ` ${this.orderByClause}`;
    }

    if (this.limitValue) {
      query += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue) {
      query += ` OFFSET ${this.offsetValue}`;
    }

    return {
      query,
      params: this.whereParams,
    };
  }
}

// Uso
const qb = new QueryBuilder('users')
  .select(['id', 'name', 'email'])
  .where('status', '=', 'active')
  .where('age', '>', 18)
  .orderBy('created_at', 'DESC')
  .limit(10)
  .offset(0);

const { query, params } = qb.build();
const [results] = await db.execute(query, params);
```

### Transactions

```typescript
// src/services/orderService.ts
import { db } from '../config/database';

export class OrderService {
  async createOrder(userId: string, items: any[]) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Create order
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
        [userId, 0, 'pending']
      );
      const orderId = (orderResult as any).insertId;

      // 2. Insert order items
      let total = 0;
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.productId, item.quantity, item.price]
        );
        
        // 3. Update stock
        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.productId]
        );

        total += item.price * item.quantity;
      }

      // 4. Update order total
      await connection.execute(
        'UPDATE orders SET total = ? WHERE id = ?',
        [total, orderId]
      );

      await connection.commit();

      return { orderId, total };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
```

---

## 🔥 Firebase Integration

### Firebase Admin Setup

```typescript
// src/config/firebase.ts
import * as admin from 'firebase-admin';

const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export const auth = admin.auth();
export const db = admin.firestore();
export const rtdb = admin.database();
export const storage = admin.storage();
```

### Firestore CRUD Operations

```typescript
// src/services/firestoreService.ts
import { db } from '../config/firebase';
import { ApiError } from '../utils/ApiError';

export class FirestoreService {
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  async getAll() {
    const snapshot = await db.collection(this.collection).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async getById(id: string) {
    const doc = await db.collection(this.collection).doc(id).get();
    
    if (!doc.exists) {
      throw new ApiError(404, 'Document not found');
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async create(data: any) {
    const docRef = await db.collection(this.collection).add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return this.getById(docRef.id);
  }

  async update(id: string, data: any) {
    await db.collection(this.collection).doc(id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return this.getById(id);
  }

  async delete(id: string) {
    await db.collection(this.collection).doc(id).delete();
    return true;
  }

  async query(filters: { field: string; operator: any; value: any }[]) {
    let query: any = db.collection(this.collection);

    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async paginate(limit: number, lastDoc?: any) {
    let query = db.collection(this.collection).orderBy('createdAt').limit(limit);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    
    return {
      data: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === limit,
    };
  }
}
```

### Firebase Auth Middleware

```typescript
// src/middleware/firebaseAuth.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    [key: string]: any;
  };
}

export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      ...decodedToken,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};
```

### Realtime Database Operations

```typescript
// src/services/realtimeDbService.ts
import { rtdb } from '../config/firebase';

export class RealtimeDbService {
  async setValue(path: string, data: any) {
    await rtdb.ref(path).set(data);
  }

  async updateValue(path: string, data: any) {
    await rtdb.ref(path).update(data);
  }

  async getValue(path: string) {
    const snapshot = await rtdb.ref(path).once('value');
    return snapshot.val();
  }

  async pushValue(path: string, data: any) {
    const ref = rtdb.ref(path).push();
    await ref.set(data);
    return ref.key;
  }

  async deleteValue(path: string) {
    await rtdb.ref(path).remove();
  }

  // Listener en tiempo real
  listenToChanges(path: string, callback: (data: any) => void) {
    const ref = rtdb.ref(path);
    
    ref.on('value', (snapshot) => {
      callback(snapshot.val());
    });

    // Retorna función para detener el listener
    return () => ref.off('value');
  }
}
```

---

## 🔐 Authentication Patterns

### JWT Authentication

```typescript
// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: '7d',
  });
};
```

### Login/Register Controller

```typescript
// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { UserService } from '../services/userService';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      // Validación
      if (!name || !email || !password) {
        throw new ApiError(400, 'All fields are required');
      }

      if (password.length < 6) {
        throw new ApiError(400, 'Password must be at least 6 characters');
      }

      const user = await this.userService.create({ name, email, password });

      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
      }

      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new ApiError(401, 'Invalid credentials');
      }

      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
```

---

## 🎯 Best Practices

1. **TypeScript** para type safety en todo el backend
2. **Capas separadas** (Controller → Service → Repository)
3. **Error handling** centralizado
4. **Validación** de datos en todos los endpoints
5. **Authentication** con JWT o Firebase
6. **Rate limiting** para prevenir abuse
7. **CORS** configurado correctamente
8. **Environment variables** para configuración
9. **Logging** estructurado (Winston, Pino)
10. **Testing** unitario e integración

---

## 📚 Recursos

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MySQL Best Practices](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)