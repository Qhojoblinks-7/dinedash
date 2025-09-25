# 🍽️ DineDash - Complete Restaurant Management System

## 🎯 **Overview**
DineDash is a comprehensive restaurant management system featuring a **customer-facing digital menu**, **staff dashboard**, and **complete backend API**. Built with modern technologies for seamless restaurant operations.

### **🏗️ Architecture**
- **Backend**: Django REST Framework with SQLite database
- **Customer App**: React + Vite with Tailwind CSS
- **Staff Dashboard**: React + Vite with Tailwind CSS
- **Real-time Updates**: Polling-based order synchronization

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

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎉 DineDash is now a complete, production-ready restaurant management system!**

**Ready to serve customers and streamline restaurant operations! 🍽️✨**
