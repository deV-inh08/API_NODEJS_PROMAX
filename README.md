# 🛒 E-commerce API

A comprehensive **REST API** for e-commerce platforms, built with **Node.js**, **TypeScript**, and **MongoDB**.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Architecture](#architecture)
- [Design Patterns](#design-patterns)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Changelog](#changelog)

---

## 🔎 Overview

This API provides a complete backend solution for online shopping platforms:

- **User management**
- **Product catalog**
- **Shopping cart**
- **Order processing**

### Key Benefits

- **Scalable Architecture**: Microservice principles
- **Security First**: JWT, validation, encryption
- **Developer Friendly**: TypeScript strict mode
- **Production Ready**: Monitoring, logging, error handling

---

## 🚀 Features

### Core Functionality

- **User Management**: register, login, profile, wishlist
- **Product Management**: categories, variants, search, inventory
- **Shopping Experience**: cart, checkout, discounts, orders
- **Business Tools**: shop management, analytics, notifications

### API Reference

### 🔑 Authentication

| Method | Endpoint              | Description   |
| ------ | --------------------- | ------------- |
| POST   | `/auth/register`      | Register      |
| POST   | `/auth/login`         | Login         |
| POST   | `/auth/refresh-token` | Refresh token |
| POST   | `/auth/logout`        | Logout        |

---

### 🛍 Products

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | `/product/create`     | Create product    |
| GET    | `/product/search`     | Search products   |
| GET    | `/product/find/:id`   | Get product by ID |
| PATCH  | `/product/update/:id` | Update product    |

---

### 🛒 Cart

| Method | Endpoint           | Description |
| ------ | ------------------ | ----------- |
| POST   | `/cart/add`        | Add to cart |
| GET    | `/cart`            | View cart   |
| PATCH  | `/cart/update/:id` | Update item |
| DELETE | `/cart/delete/:id` | Remove item |

---

### 📦 Orders

| Method | Endpoint         | Description   |
| ------ | ---------------- | ------------- |
| POST   | `/orders/create` | Create order  |
| GET    | `/orders`        | User orders   |
| GET    | `/orders/:id`    | Order details |

### Technical Features

- RESTful API design
- TypeScript for type safety
- MongoDB with optimized indexing
- JWT-based authentication
- Validation with **Zod**
- Error handling middleware
- Unit + Integration tests
- Monitoring & logging

---

### Design Patterns

1. Repository Pattern
   class UserRepository extends BaseRepository<User> {
   async findByEmail(email: string) {
   return this.findOne({ email });
   }
   }

class AuthService {
constructor(private userRepo: UserRepository) {}

async register(payload: RegisterDTO) {
const existed = await this.userRepo.findByEmail(payload.email);
if (existed) throw new Error('EMAIL_EXISTS');
return this.userRepo.create(payload);
}
}

2. Singleton Pattern

Ensure one MongoDB connection across the app.
export class MongoConnection {
private static \_instance: MongoConnection | null = null;
private connected = false;

private constructor() {}

static instance() {
if (!this.\_instance) this.\_instance = new MongoConnection();
return this.\_instance;
}

async connect(uri: string) {
if (this.connected) return;
await mongoose.connect(uri);
this.connected = true;
}
}

3. Factory Pattern

Create objects (e.g., Payment providers) without spreading if/else.
interface PaymentProvider {
authorize(amount: number): Promise<{ authId: string }>;
}

class StripeProvider implements PaymentProvider {
async authorize(amount: number) {
return { authId: 'stripe_auth_123' };
}
}

class PaymentFactory {
static create(channel: 'stripe' | 'momo'): PaymentProvider {
switch (channel) {
case 'stripe': return new StripeProvider();
case 'momo': return new MomoProvider();
default: throw new Error('UNSUPPORTED_CHANNEL');
}
}
}

## ⚙️ Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 8
- **MongoDB** ≥ 6

Optional:

- Docker ≥ 20
- Redis (caching)
- RabbitMQ (message queue)

---

## 📥 Installation

### Development Setup

```bash
git clone <repository-url>
cd API_Ecommerce
npm install
cp .env.example .env
npm run dev
```
