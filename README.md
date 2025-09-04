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
- **Payment integration**

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

Base URL: http://localhost:3000/api/v1
Auth: JWT Bearer token

Authentication
POST /auth/register → Register

POST /auth/login → Login

POST /auth/refresh-token → Refresh token

POST /auth/logout → Logout

Products
POST /product/create → Create product

GET /product/search → Search products

GET /product/find/:id → Get product by ID

PATCH /product/update/:id → Update product

Cart
POST /cart/add → Add to cart

GET /cart → View cart

PATCH /cart/update/:id → Update item

DELETE /cart/delete/:id → Remove item

Orders
POST /orders/create → Create order

GET /orders → User orders

GET /orders/:id → Order details

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
