# Maira Jewels REST API Backend

Full-featured, secured, and modular Node.js / Express backend with MongoDB (Mongoose) architecture for **Maira Jewels Website** & **Admin Panel**.

---

## 🌟 Features

- **Authentication & Roles**:
  - JWT Stateless tokens with salted bcrypt passwords.
  - Role-based authorization: `admin`, `manager`, `customer`.
- **Product Management**:
  - Filtering by category, metal, gemstone, badge, and price ranges.
  - Support for multi-thumbnail galleries and specifications.
- **Category Management**:
  - Auto-computed active product counts.
- **Orders & Checkout**:
  - Public/Guest and authenticated customer checkout.
  - Lifecycle states: `Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`.
- **Payment Transaction Records**:
  - Full audit trail of transaction IDs, methods, and reconciliation statuses.
- **Customer Concierge Inquiries**:
  - Contact form integration with admin read/reply tracking.
- **FAQ Management**:
  - Categorized store knowledge base (Product Care, Shipping, Warranty).
- **Store Configuration**:
  - Dynamic store hours, contact details, currency symbol, and social links.
- **Dashboard Analytics**:
  - Aggregate sales revenue, order counts, customer insights, and recent activity.
- **Media Uploads**:
  - Multer upload handlers for product imagery.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd E:\Build\MairaBackend
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://errahulverma:NBscZYSOYG1P07qZ@vmax-cluster09.tqrpt4d.mongodb.net/mairajewels?retryWrites=true&w=majority
JWT_SECRET=maira_jewels_super_secret_jwt_key_2026_luxury_secure
JWT_EXPIRE=30d
```

### 3. Seed Database
Seeds default catalog, FAQs, store settings, and default admin account (`admin@mirajewels.com` / `admin123`):
```bash
npm run seed
```

### 4. Start Server
```bash
npm start
# or for development mode:
npm run dev
```

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Customer registration |
| `POST` | `/login` | Public | Customer & Admin login |
| `POST` | `/admin-login` | Public | Dedicated Admin portal login |
| `GET` | `/me` | Private | Retrieve logged-in user profile |
| `PUT` | `/profile` | Private | Update name, phone, address |
| `PUT` | `/change-password` | Private | Update password |

### 💎 Products (`/api/v1/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Filtered product catalog |
| `GET` | `/:id` | Public | Product details & related items |
| `POST` | `/` | Admin | Create new piece |
| `PUT` | `/:id` | Admin | Update product |
| `DELETE`| `/:id` | Admin | Remove product |

### 🏷️ Categories (`/api/v1/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | All categories with product counts |
| `POST` | `/` | Admin | Create category |
| `PUT` | `/:id` | Admin | Update category |
| `DELETE`| `/:id` | Admin | Delete category |

### 📦 Orders (`/api/v1/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Public/Customer | Place checkout order |
| `GET` | `/my-orders` | Customer | Logged-in customer orders |
| `GET` | `/` | Admin | All orders with status filters |
| `GET` | `/:id` | Customer/Admin | View order breakdown |
| `PATCH`| `/:id/status` | Admin | Update fulfillment status & tracking |

### 💳 Payments (`/api/v1/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Admin | List all transaction records |
| `PATCH`| `/:id/status` | Admin | Update payment transaction state |

### ✉️ Inquiries & Contact (`/api/v1/inquiries`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Public | Submit customer inquiry |
| `GET` | `/` | Admin | View messages |
| `PATCH`| `/:id` | Admin | Update status / reply note |
| `DELETE`| `/:id` | Admin | Delete inquiry |

### ❓ FAQs (`/api/v1/faqs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Get active FAQs |
| `POST` | `/` | Admin | Create FAQ item |
| `PUT` | `/:id` | Admin | Edit FAQ item |
| `DELETE`| `/:id` | Admin | Delete FAQ |

### 📊 Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin | Revenue, counts, category charts |

### 🖼️ Media Uploads (`/api/v1/upload`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/single` | Admin | Upload single image |
| `POST` | `/multiple` | Admin | Upload multiple gallery images |
