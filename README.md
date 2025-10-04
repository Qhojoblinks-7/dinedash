# 🍽️ DineDash - Complete Restaurant Management System

## Capstone Project - ALX B.E

### Project Idea
This project is a Restaurant Virtual Menu System that will be designed to solve common issues in restaurants, such as long wait time and ordering unavailable meals. This system will feature a customer-facing digital menu with real-time updates on meal availability and preparation times, as well as an integrated payment system. A separated dashboard will allow restaurant staff to manage menu items and track orders.

### Problem Statement
In restaurants across Ghana and beyond, customers often face long wait times, uncertainty about mail availability, and limited transparency in ordering process. Traditional menus are static and do not reflect real time updates, customers may order meals that are unavailable or face unexpected delays in preparation.

Additionally, restaurants lack digital payment integration that simplifies transactions, leading to inefficiencies for both customers and staff. Existing digital menu systems are either too expensive, not tailored to local restaurant needs, or lack features like real-time availability tracking and estimated wait times.

This creates frustrations for customers and operational challenges for restaurants, ultimately reducing customer satisfaction and business efficiency.

### Solution Statement
To address these challenges, we propose building a restaurant Virtual Menu System that integrates:

Digital menu with Real-Time Updates
Customers can view available meals from any device(mobile, tablets, etc.). Meals marked as out of stock or not available or not ready are automatically updated, preventing wasted time and orders.

Preparation Time Tracking
Each dish will include an estimated preparation time(e.g. 15 minutes), giving customers realistic expectations and reducing frustration.

Integrated Payment System
Customers can securely pay through mobile money, credits cards, or POS (Point of Sale) integration. This reduces cash handling limits and streamlines the payment process.

Restaurant Dashboard A backend interface for staff to update menu items, mark meals as available/unavailable, and adjust preparation times. Includes basic analytics such as most ordered meals and peak times.

Customer-Centered Design A clean, intuitive interface for customers to browse meals, place orders, and pay without needing external assistance.

This solution ensures that restaurants can increase efficiency, reduce wait-time complaints, and improve customer satisfaction, while also providing a scalable system that can be extended to multiple restaurant chains in the future.

### Main Features
The project will focus on the following core functionalities to ensure a functional and complete application:

Customer Digital Menu: A responsive menu accessible from any device that shows all meals, with out-or-stock items clearly marked.

Preparation Time Display: each menu item will show an estimated preparation time.

Order Placement: Customers can add items to an order, review a summary, and place the orders.

Staff Dashboard: A simple, secure interface for staff to toggle meal availability and view incoming orders.

API for Real-Time Data: The front-end will connect to a backend API to fetch and update menu and order information in real-time.

### API Usage
This project will not require an external third-party API. Instead, we will build our own RESTful API using Django and the Django REST Framework (DRF). This is a crucial part of the project that will allow the front-end to communicate with the database and manage all the data.

### Project Structure and Database Schema
The project will be structured into three main Django apps for clear separation of concerns:
users App: Handles staff authentication and roles. Customers will not need to create an account or log in to use the menu.
meals App: Manages all menu items, including their availability and preparation times.
orders App: Handles the entire customer ordering process, from creation to status tracking.

Database Schema (Django Models)
The database will consist of the following models, with a clear outline of their fields and relationships:
User Model (in users app):
username: CharField (unique identifier for staff login)
password: CharField (hashed password)
role: CharField (e.g., 'staff')

Meal Model (in meals app):
name: CharField
description: TextField
price: DecimalField
prep_time: IntegerField (in minutes)
is_available: BooleanField (default=True)
image: ImageField (optional)

Order Model (in orders app):
customer_identifier: CharField (e.g., table number)
status: CharField (e.g., 'pending', 'in-progress', 'ready', 'completed')
total_amount: DecimalField
created_at: DateTimeField

OrderItem Model (in orders app):
order: ForeignKey to Order (one order can have many items)
meal: ForeignKey to Meal (references the item being ordered)
quantity: IntegerField

### Basic Timeline
This is a simple plan to help break down the work into manageable weekly goals:
Week 1: Backend Foundations
Set up the Django project and the three apps (users, meals, orders).
Define the Django models (User, Meal, Order, OrderItem).
Set up Django Admin to easily add and manage menu items.

Week 2: Building the API
Set up the Django REST Framework.
Create API serializers and views for the Meal and Order models.
Implement API endpoints for viewing and creating meals and orders.

Week 3: Front-End UI
Set up the React project with Vite and Tailwind CSS.
Build the main UI components for the customer menu (MenuItemCard, OrderSummary).
Create the basic page layouts and routing.

Week 4: Integration and Polish
Connect the React front-end to the Django API to fetch and display data.
Implement the ordering and status-tracking logic.
Work on final styling and responsiveness.
 
## Implementation Extensions
The current DineDash implementation has been expanded beyond the basic capstone requirements to include:

- **Payment Processing**: Full payment integration with multiple methods (Cash, Momo, Card)
- **Order Types**: Support for Dine-in, Takeaway, and Delivery orders
- **Advanced Staff Dashboard**: Real-time order monitoring, table status tracking, and analytics
- **Additional Database Models**: Payment model for transaction tracking
- **Enhanced API**: Comprehensive endpoints for all operations

This provides a production-ready restaurant management system.

## 📁 **Project Structure**
```
dinedash/
├── dinedash-backend/          # Django REST API
│   ├── dinedash/             # Main Django project
│   ├── users/                # Staff user management
│   ├── meals/                # Menu items management
│   ├── orders/               # Order processing
│   └── payments/             # Payment processing
├── dinedash-client/          # Customer-facing React app
│   ├── src/components/
│   │   ├── features/         # Menu, Cart, Checkout
│   │   └── ui/               # Reusable UI components
│   └── store/                # Redux state management
└── dinedash-dashboard/       # Staff dashboard React app
    ├── src/components/
    │   ├── features/         # Dashboard, Orders, Menu management
    │   └── ui/               # Reusable UI components
    └── store/                # Redux state management
```

## 🔄 **User Flows**

### **Customer Journey**
1. **Browse Menu** → Select category or search meals
2. **Add to Cart** → Adjust quantities, view cart summary
3. **Checkout** → Select order type (Dine-in/Takeaway/Delivery)
4. **Payment** → Choose method (Cash/Momo/Card), enter details
5. **Order Confirmation** → Receive tracking code, monitor status
6. **Order Completion** → Real-time updates until delivery/pickup

### **Staff Workflow**
1. **Login** → Access dashboard with role-based permissions
2. **Monitor Orders** → View live order feed (auto-updates every 30s)
3. **Process Payments** → Verify payments for pending orders
4. **Send to Kitchen** → Update order status to 'in_progress'
5. **Manage Menu** → Add/edit meals, update availability
6. **Track Analytics** → Monitor peak hours, most ordered items

### **Admin Operations**
1. **User Management** → Create staff accounts with roles
2. **Menu CRUD** → Full meal management with images
3. **Order Oversight** → View all orders, intervene if needed
4. **Payment Monitoring** → Track payment statuses and issues

## 🗂️ **Entity Relationship Diagram (ERD)**

```
┌─────────────────┐       ┌─────────────────┐
│     User        │       │      Order      │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ username        │       │ customer_name   │
│ email           │       │ order_type      │
│ role            │       │ status          │
│ created_at      │       │ total_amount    │
│                 │       │ delivery_fee    │
│                 │       │ table_number    │
│                 │       │ tracking_code   │
│                 │       │ created_at      │
│                 │       │ user_id (FK)    │
└─────────────────┘       └─────────────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────┐       ┌─────────────────┐
│   Payment       │       │   OrderItem     │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ amount          │       │ quantity        │
│ method          │       │ unit_price      │
│ status          │       │ item_name       │
│ transaction_ref │       │ order_id (FK)   │
│ bank_details    │       │ meal_id (FK)    │
│ order_id (FK)   │       └─────────────────┘
└─────────────────┘               │
         ▲                       │
         │                       │
         │                       ▼
         │               ┌─────────────────┐
         │               │      Meal       │
         │               │─────────────────│
         │               │ id (PK)         │
         │               │ name            │
         │               │ description     │
         │               │ price           │
         │               │ image           │
         │               │ is_available    │
         │               │ is_veg          │
         │               │ prep_time       │
         │               └─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│ Payment Methods │
│─────────────────│
│ Cash            │
│ Momo (MTN/Voda) │
│ Flutterwave     │
│ Bank Transfer   │
└─────────────────┘
```

### **Key Relationships**
- **User ↔ Order**: One-to-many (staff can manage multiple orders)
- **Order ↔ OrderItem**: One-to-many (orders contain multiple items)
- **Order ↔ Payment**: One-to-one (each order has one payment)
- **OrderItem ↔ Meal**: Many-to-one (items reference menu meals)
- **Payment ↔ Payment Methods**: Many-to-one (payments use specific methods)

## ✨ **Features**

### **👥 Customer App** (`dinedash-client`)
- **Digital Menu**: Browse meals with categories and search
- **Smart Cart**: Add/remove items with quantity controls
- **Complete Checkout**: Multiple order types (Dine-in, Takeaway, Delivery)
- **Payment Methods**: Cash, Mobile Money (Momo), Card payments
- **Order Tracking**: Real-time order status updates
- **Responsive Design**: Works on mobile and desktop

### **👨‍🍳 Staff Dashboard** (`dinedash-dashboard`)
- **Real-time Order Monitoring**: Live order updates every 30 seconds
- **Order Management**: View, process, and complete orders
- **Menu Management**: Add/edit menu items and availability
- **Table Status**: Track table occupancy and service
- **Payment Tracking**: Monitor payment statuses
- **Kitchen Integration**: Order preparation workflow

### **🔧 Backend API** (`dinedash-backend`)
- **RESTful API**: Complete CRUD operations for all entities
- **Payment Processing**: Integrated payment gateway simulation
- **Order Management**: Full order lifecycle management
- **User Authentication**: Staff role-based access control
- **Real-time Data**: Polling-based updates for live dashboards

## 🗄️ **Database Models**

### **Users App**
- **User Model**: Staff authentication with roles
  - `role`: waiter, kitchen, admin
  - Extends Django AbstractUser

### **Meals App**
- **Meal Model**: Menu items management
  - `name`, `description`, `price`, `prep_time`
  - `is_available`, `is_veg`, `image`
  - Category classification

### **Orders App**
- **Order Model**: Customer orders
  - `customer_name`, `order_type`, `status`
  - `total_amount`, `created_at`, `table_number`
  - Delivery and contact information

- **OrderItem Model**: Order line items
  - Links orders to meals with quantities

### **Payments App**
- **Payment Model**: Payment processing
  - `method`, `provider`, `status`
  - `transaction_ref`, `bank_details`
  - Order-payment relationship

## 🚀 **Quick Start**

### **Prerequisites**
- **Python 3.8+** with Django 5.2+
- **Node.js 18+** with npm
- **Git** for version control

### **Installation & Setup**

#### **1. Clone and Setup Backend**
```bash
cd dinedash-backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

#### **2. Setup Client App**
```bash
cd ../dinedash-client
npm install
```

#### **3. Setup Dashboard App**
```bash
cd ../dinedash-dashboard
npm install
```

### **Running the System**

#### **Terminal 1: Backend API**
```bash
cd dinedash-backend
python manage.py runserver
```
**Access**: http://localhost:8000

#### **Terminal 2: Customer App**
```bash
cd dinedash-client
npm run dev
```
**Access**: http://localhost:5173

#### **Terminal 3: Staff Dashboard**
```bash
cd dinedash-dashboard
npm run dev
```
**Access**: http://localhost:5174

## 📡 **API Endpoints**

### **Meals API**
| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/meals/` | GET | List all meals | Public |
| `/api/meals/<id>/` | GET | Get meal details | Public |
| `/api/meals/` | POST | Create meal | Staff |
| `/api/meals/<id>/` | PUT/PATCH | Update meal | Staff |
| `/api/meals/<id>/` | DELETE | Delete meal | Staff |

### **Orders API**
| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/orders/checkout/` | POST | Complete checkout | Public |
| `/api/orders/` | GET | List all orders | Staff |
| `/api/orders/<id>/` | GET | Get order details | Staff |
| `/api/orders/<id>/status/` | PATCH | Update order status | Staff |

### **Payments API**
| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/payments/` | GET | List payments | Staff |
| `/api/payments/<id>/` | GET | Get payment details | Staff |

### **Users API**
| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/users/` | GET | List staff users | Staff |
| `/api/auth/login/` | POST | Staff login | Public |

### **Example: Complete Checkout**
```bash
POST /api/orders/checkout/
Content-Type: application/json

{
  "order": {
    "customer_name": "John Doe",
    "order_type": "dine_in",
    "table_number": "A12",
    "items": [
      {"meal": 1, "quantity": 2},
      {"meal": 3, "quantity": 1}
    ]
  },
  "payment": {
    "method": "cash",
    "provider": "",
    "phone": "",
    "transaction_ref": ""
  }
}
```

## 🎮 **Usage Guide**

### **For Customers**
1. **Browse Menu**: Visit http://localhost:5173
2. **Add Items**: Click menu items to add to cart
3. **Checkout**: Open cart drawer and select payment method
4. **Complete Order**: Fill required fields and place order
5. **Track Order**: View real-time order status

### **For Staff**
1. **Dashboard**: Visit http://localhost:5174
2. **Monitor Orders**: View live order feed (updates every 30s)
3. **Process Orders**: Mark orders as served when ready
4. **Manage Menu**: Add/edit menu items and availability
5. **Track Tables**: Monitor table status and service

### **Admin Panel**
- **Django Admin**: http://localhost:8000/admin/
- **Manage Users**: Create staff accounts with roles
- **Menu Management**: CRUD operations on meals
- **Order Oversight**: View all orders and payments

## 🧪 **Testing**

### **Automated Tests**
```bash
cd dinedash-backend
python test_payment_scenarios.py
```

### **Manual Testing**
1. **Place Order**: Customer app → Cart → Checkout
2. **Verify Dashboard**: Order appears within 30 seconds
3. **Process Order**: Staff marks as served
4. **Check Status**: Real-time updates across apps

## 📊 **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer App  │    │   Staff Dashboard│    │   Backend API   │
│   (React)       │◄──►│   (React)       │◄──►│   (Django)      │
│                 │    │                 │    │                 │
│ • Digital Menu  │    │ • Order Monitor │    │ • REST API      │
│ • Cart System   │    │ • Menu Mgmt     │    │ • Database       │
│ • Checkout Flow │    │ • Real-time     │    │ • Payments       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Development**

### **Tech Stack**
- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Django 5.2, Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production)
- **State Management**: Redux Toolkit
- **Icons**: FontAwesome, Lucide React

### **Key Features Implemented**
- ✅ **Complete Customer Experience**: Menu browsing to order completion
- ✅ **Staff Dashboard**: Real-time order monitoring and management
- ✅ **Payment Integration**: Multiple payment methods with status tracking
- ✅ **Order Lifecycle**: From placement to completion
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Real-time Updates**: Polling-based synchronization

### **API Response Codes**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Server Error

## 🚀 **Production Deployment**

### **Environment Setup**
1. **Database**: Switch to PostgreSQL
2. **Static Files**: Configure CDN for images
3. **Security**: Add HTTPS, CORS configuration
4. **Monitoring**: Add logging and error tracking

### **Scaling Considerations**
- **WebSocket Integration**: Replace polling with real-time updates
- **Caching**: Redis for session and API caching
- **Load Balancing**: Multiple backend instances
- **Database Optimization**: Indexing and query optimization

## 📝 **Contributing**

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/new-feature`
3. **Commit** changes: `git commit -m 'Add new feature'`
4. **Push** to branch: `git push origin feature/new-feature`
5. **Create** Pull Request

## 🧹 **Code Quality**

### **Linting & Code Standards**
- **Backend**: Django system checks pass with no issues
- **Frontend**: ESLint configured for React best practices
- **Code Cleanup**: Removed duplicate serializer classes and unused variables
- **Dependencies**: No duplicate packages across client and dashboard apps

### **Development Standards**
- Consistent code formatting across all components
- Proper error handling and logging
- Clean separation of concerns between apps
- Responsive design patterns implemented

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎉 DineDash is now a complete, production-ready restaurant management system!**

**Ready to serve customers and streamline restaurant operations! 🍽️✨**

