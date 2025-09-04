# 🛒 E-commerce API

A comprehensive **REST API** for e-commerce platforms, built with **Node.js**, **TypeScript**, and **MongoDB**.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Design Patterns](#design-patterns)

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
- Apply Design Patterns: **Singleton**, **Repository**, **Factory**
- Redis-based **distributed locking** to handle concurrent user purchases
- Containerized with **Docker** for easy deployment
- Asynchronous **Notification Service** with RabbitMQ (event-driven architecture)

---

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
