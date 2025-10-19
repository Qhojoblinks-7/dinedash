

# 🍽️ DineDash: The Complete Restaurant Management System

## Capstone Project: Bringing Restaurants into the Digital Age

DineDash is a **production-ready, full-stack solution** designed to eliminate wait times, confusion, and payment friction in modern dining. It replaces static paper menus with a dynamic, real-time digital experience for customers and provides staff with a powerful, live operations dashboard.

-----

## 🎯 The Core Problem We Solve

In many restaurants, the experience is held back by old technology:

  * **The Wait:** Customers often face long waits because staff are juggling orders, cash, and outdated systems.
  * **The Surprise:** Customers order a meal only to find out it's **unavailable** or the preparation time is much longer than expected.
  * **The Hassle:** Slow, cash-based transactions and a lack of easy digital payment options create bottlenecks.

### **Our Solution: Real-Time Transparency**

DineDash solves this by providing **live visibility** across the entire restaurant:

| Feature | Customer Benefit | Staff Benefit |
| :--- | :--- | :--- |
| **Digital Menu** | Never orders an out-of-stock meal. | Fewer disappointed customers, less waste. |
| **Prep Time Display** | Gets realistic expectations (e.g., "15 minutes"). | Reduces "Where's my order?" complaints. |
| **Integrated Payments** | Fast, secure payment via Momo, Card, or POS. | No more cash headaches, faster table turnover. |
| **Live Dashboard** | Faster service. | Real-time command center for all operations. |

-----

## 🚀 Key Features: What's Under the Hood

DineDash is built on a **modern, decoupled stack** to handle high-volume restaurant traffic.

### **👥 Customer App** (`dinedash-client`)

  * **Intuitive Browsing:** A beautiful, responsive menu accessible from any device.
  * **Smart Cart & Checkout:** Easy selection of **Dine-in, Takeaway, or Delivery** options.
  * **Multi-Payment Flow:** Securely pay with **Cash, Mobile Money (Momo), or Card**.
  * **Live Tracking:** Customers monitor their order status in real-time.

### **👨‍🍳 Staff Dashboard** (`dinedash-dashboard`)

  * **The Command Center:** A single-page application with a **live order feed** that updates every 30 seconds.
  * **Menu Control:** Staff can instantly **toggle meal availability**, adjust prices, and update preparation times.
  * **Order Workflow:** Clear steps to **verify payment**, **send to kitchen**, and **mark orders as served/completed**.
  * **Operational Insight:** Track orders, tables, and payment statuses instantly.

### **🔧 Backend API** (`dinedash-backend`)

  * **Tech Stack:** Django 5.2 and Django REST Framework (DRF).
  * **Data Integrity:** Manages the entire lifecycle for **Meals, Orders, Order Items, Users, and Payments**.
  * **Scalability:** Provides fast, secure RESTful endpoints for all frontends.

-----

## 🗂️ Project Architecture

Our project is structured into three highly focused components that communicate via the REST API:

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend API** | **Django / DRF** | The brain. Manages database, business logic, and payments. |
| **Customer App** | **React / Vite / Redux** | The storefront. Public-facing menu and checkout. |
| **Staff Dashboard** | **React / Vite / Redux** | The operations hub. Staff management tool for orders and menu. |

### **Entity Relationship Diagram (ERD) Simplified**

The data model ensures every transaction is traceable:

  * An **Order** contains multiple **OrderItems**.
  * Each **OrderItem** points to a specific **Meal** on the menu.
  * Each **Order** is linked to a **Payment** record, tracking the method and status.
  * **Staff Users** manage the system and track the Orders.

-----

## ⚡ Quick Start: Get DineDash Running

Ready to see it in action? Here's how to spin up the entire system in three terminals.

### **Prerequisites**

  * **Python 3.8+** (for Django)
  * **Node.js 18+** (for React/Vite)

### **1. Setup Backend (Terminal 1)**

```bash
cd dinedash-backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser # Create staff/admin login
python manage.py runserver
```

*(Backend API is now running on **http://localhost:8000**)*

### **2. Launch Frontends (Terminal 2 & 3)**

| App | Command | Access |
| :--- | :--- | :--- |
| **Customer App** | `cd ../dinedash-client && npm install && npm run dev` | **http://localhost:5173** |
| **Staff Dashboard** | `cd ../dinedash-dashboard && npm install && npm run dev` | **http://localhost:5174** |

-----

## 💡 Usage Guide

### **For Customers (http://localhost:5173)**

1.  Browse the menu, see real-time availability and prep times.
2.  Add items to the cart.
3.  Checkout, select **Dine-in (Table A1)**, **Takeaway**, or **Delivery**.
4.  Place the order and watch the status update live\!

### **For Staff (http://localhost:5174)**

1.  Log in using your superuser credentials.
2.  See the **live stream of incoming orders** at the bottom of the screen.
3.  Click an order to open the details panel.
4.  Verify a payment, then click **"Send to Kitchen"** to update the status to *'in progress'*.
5.  Go to the **Menu Management** tab to update prices or mark items as sold out.

**🎉 DineDash is fully operational—ready to serve customers and streamline your operations\!**