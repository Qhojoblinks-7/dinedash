# DineDash Testing Guide

## 🚀 Complete Testing Setup

### Applications Running
- **Backend API**: `http://localhost:8000` (Django REST API)
- **Staff Dashboard**: `http://localhost:5175` (React + Redux)
- **Customer Client**: `http://localhost:5176` (React + Redux)

---

## 🧪 Payment Testing Scenarios

### Test Transaction References
Use these in the payment form to simulate different outcomes:

| Scenario | Transaction Reference | Expected Status |
|----------|----------------------|-----------------|
| ✅ **Success** | `TEST_SUCCESS_123` | `completed` |
| ⏳ **Pending** | `TEST_PENDING_456` | `pending` |
| ❌ **Failed** | `TEST_FAIL_789` | `failed` |

### Running Payment Tests
```bash
# Run automated payment tests
python test_payment_scenarios.py
```

---

## 📋 Complete Testing Workflow

### Step 1: Start All Services
```bash
# Terminal 1 - Backend
cd dinedash-backend && python manage.py runserver

# Terminal 2 - Dashboard
cd dinedash-dashboard && npm run dev

# Terminal 3 - Client
cd dinedash-client && npm run dev
```

### Step 2: Test Customer Ordering
1. **Open Client App**: `http://localhost:5176`
2. **Add Items to Cart**: Browse menu, add items
3. **Checkout Process**:
   - Fill customer details
   - Choose payment method
   - **Use test transaction refs above**
   - Complete payment

### Step 3: Verify Staff Dashboard
1. **Open Dashboard**: `http://localhost:5175`
2. **Real-time Updates**: Orders appear within 30 seconds
3. **Check Payment Status**: Verify correct status based on transaction ref
4. **Order Management**: Staff can view and manage orders

---

## 🍽️ Sample Menu Data

The system includes 8 sample meals:

| Meal | Price | Type | Description |
|------|-------|------|-------------|
| Margherita Pizza | $15.99 | Veg | Classic pizza with tomato sauce, mozzarella, and fresh basil |
| Chicken Burger | $12.99 | Non-Veg | Grilled chicken patty with lettuce, tomato, and special sauce |
| Caesar Salad | $9.99 | Veg | Crisp romaine lettuce with Caesar dressing and croutons |
| Beef Tacos | $13.99 | Non-Veg | Three soft tacos with seasoned beef, salsa, and cheese |
| Chocolate Brownie | $7.99 | Veg | Rich chocolate brownie served with vanilla ice cream |
| Grilled Salmon | $18.99 | Non-Veg | Fresh salmon fillet grilled with herbs and lemon |
| Vegetable Stir Fry | $11.99 | Veg | Mixed vegetables stir-fried with tofu and soy sauce |
| Iced Coffee | $4.99 | Veg | Cold brewed coffee served over ice with milk |

---

## 🔄 Real-Time Synchronization

### How It Works
1. **Customer places order** → Client app sends to backend
2. **Backend processes payment** → Simulates payment status
3. **Dashboard polls every 30s** → Fetches latest orders
4. **Staff sees updates** → Real-time order visibility

### Technical Implementation
- **Redux State Management**: Centralized data flow
- **Periodic Polling**: 30-second intervals for order updates
- **Error Handling**: Graceful failure recovery
- **Loading States**: User feedback during data fetching

---

## 🧪 Manual Testing Checklist

### Customer App Testing
- [ ] Browse menu items with descriptions
- [ ] Add/remove items from cart
- [ ] Calculate totals correctly
- [ ] Fill customer information
- [ ] Test all payment methods
- [ ] Use test transaction references
- [ ] Verify order confirmation

### Dashboard Testing
- [ ] Menu items load with descriptions
- [ ] Orders appear automatically
- [ ] Payment statuses display correctly
- [ ] Real-time updates work
- [ ] Error states handled properly
- [ ] Responsive design works

### Payment Testing
- [ ] **Success scenario**: `TEST_SUCCESS_*` → completed
- [ ] **Pending scenario**: `TEST_PENDING_*` → pending
- [ ] **Failure scenario**: `TEST_FAIL_*` → failed
- [ ] All payment methods work
- [ ] Transaction IDs generated

---

## 🐛 Troubleshooting

### Common Issues

**Dashboard not loading menu:**
```bash
# Check backend is running
curl http://localhost:8000/api/meals/
```

**Orders not appearing:**
```bash
# Check orders API
curl http://localhost:8000/api/orders/
```

**Payment simulation not working:**
- Ensure transaction_ref contains test keywords
- Check backend logs for payment processing

**Redux state issues:**
- Check browser DevTools → Redux tab
- Verify API responses match expected format

---

## 📊 API Endpoints

### Meals
- `GET /api/meals/` - List all meals (public read)
- `GET /api/meals/{id}/` - Get specific meal

### Orders
- `GET /api/orders/` - List all orders (staff read-only)
- `POST /api/orders/create/` - Create order
- `POST /api/orders/checkout/` - Complete checkout with payment

### Tables (Mock Data)
- Returns static table data for testing

---

## 🎯 Testing Goals Achieved

✅ **Complete Payment Flow**: All payment methods simulated
✅ **Real-time Updates**: Orders sync automatically
✅ **Error Scenarios**: Success, pending, and failure states
✅ **Data Consistency**: Redux manages state across apps
✅ **User Experience**: Smooth ordering and management flow
✅ **Staff Efficiency**: Immediate order visibility and management

---

## 🚀 Production Considerations

For production deployment:
- Replace payment simulation with real payment processors
- Implement WebSocket connections for instant updates
- Add authentication and authorization
- Set up proper database and caching
- Configure monitoring and logging
- Add comprehensive error handling

---

*Happy Testing! 🎉*