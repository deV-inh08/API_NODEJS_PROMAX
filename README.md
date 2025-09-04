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

- **Scalable Architecture**: Built with microservice principles
- **Security First**: JWT auth, validation, encryption
- **Developer Friendly**: TypeScript + clear docs
- **Production Ready**: Monitoring, logging, error handling

---

## 🚀 Features

### Core Functionality

- **User Management**: register, login, profile, wishlist, address book
- **Product Management**: categories, search/filter, variants, inventory
- **Shopping Experience**: cart, checkout, discounts, order tracking
- **Business Tools**: shop management, analytics, notifications

### Technical Features

- RESTful API
- TypeScript strict typing
- MongoDB with optimized indexes
- JWT authentication
- Validation with **Zod**
- Error handling middleware
- Automated tests (unit + integration)
- Monitoring & logging

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 8
- **MongoDB** ≥ 6

Optional:

- Docker ≥ 20
- Redis (caching)
- RabbitMQ (message queueing)

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
