# DineDash Project

## Overview
DineDash is a Django-based restaurant management application designed to handle staff roles, menu items, and customer orders efficiently. It uses Django 5.2.6 with a SQLite database.

## Project Structure
- **dinedash/**: Main project directory containing settings, URLs, and WSGI configuration.
- **users/**: App for managing staff users with custom roles.
- **meals/**: App for managing restaurant menu items.
- **orders/**: App for handling customer orders and order items.

## Apps and Models

### Users App
- **User Model**: Extends Django's AbstractUser.
  - Inherits standard fields: username, email, password, first_name, last_name, etc.
  - Additional field: `role` (CharField with choices: 'waiter', 'kitchen', 'admin').
  - Used for staff authentication and role-based access.

### Meals App
- **Meal Model**: Represents menu items.
  - `name`: CharField (max 200, unique) - Name of the meal.
  - `description`: TextField (blank allowed) - Description of the meal.
  - `price`: DecimalField (max_digits=6, decimal_places=2) - Price of the meal.
  - `prep_time`: IntegerField - Preparation time in minutes.
  - `is_available`: BooleanField (default=True) - Availability status.
  - `image`: ImageField (optional, uploads to 'meal_images/') - Meal image.

### Orders App
- **Order Model**: Represents customer orders.
  - `customer_identifier`: UUIDField (default=uuid4, unique, not editable) - Unique customer ID.
  - `customer_name`: CharField (max 200, blank allowed) - Customer name or table number.
  - `order_type`: CharField (choices: 'dine_in', 'take-out', default='dine_in') - Type of order.
  - `status`: CharField (choices: 'pending', 'in_progress', 'completed', 'cancelled', default='pending') - Order status.
  - `total_amount`: DecimalField (max_digits=8, decimal_places=2, default=0.00) - Total order amount.
  - `created_at`: DateTimeField (auto_now_add=True) - Timestamp of order creation.

- **OrderItem Model**: Represents individual items in an order.
  - `order`: ForeignKey to Order (on_delete=CASCADE, related_name='items').
  - `meal`: ForeignKey to Meal (on_delete=CASCADE).
  - `quantity`: PositiveBigIntegerField (default=1) - Quantity of the meal in the order.

## Relationships
- OrderItem links Orders to Meals via foreign keys, allowing multiple meals per order with quantities.
- Orders depend on Meals (migration dependency).

## Admin Interface
- All models (`User`, `Meal`, `Order`, `OrderItem`) are registered with the Django admin site.
- Allows CRUD operations on all entities through the admin panel.

## Database and Migrations
- Uses SQLite as the default database.
- Initial migrations have been created and applied for all apps.
- Custom user model is set as AUTH_USER_MODEL in settings.

## Current State
- Models, admin registrations, and database migrations are fully implemented.
- REST API endpoints are implemented for meals, orders, and users using Django REST Framework.
- Views and URL patterns are configured for API functionality.
- No frontend templates implemented yet.

## API Endpoints Reference

### 1. Meals API
The meals API allows for the management of all menu items. It provides public-facing endpoints for customers to browse meals and staff-only endpoints for administrative tasks.

| URL Pattern           | HTTP Methods       | Functionality                          | Notes                                      |
|----------------------|--------------------|--------------------------------------|--------------------------------------------|
| /api/meals/          | GET, POST          | List all meals or create a new meal. | Publicly accessible. Staff can create meals. |
| /api/meals/<int:pk>/ | GET, PUT, PATCH, DELETE | Retrieve, update, or delete a single meal. | Crucial for managing the menu.              |

Example: GET request to list meals
```
GET /api/meals/
```
Response:
```json
[
  {
    "id": 1,
    "name": "Jollof Rice with Chicken",
    "description": "A classic West African rice dish with fried chicken.",
    "price": "25.00",
    "prep_time": 30,
    "is_available": true
  },
  {
    "id": 2,
    "name": "Waakye",
    "description": "A Ghanaian dish of cooked rice and beans.",
    "price": "15.00",
    "prep_time": 20,
    "is_available": true
  }
]
```

### 2. Orders API
The orders API is designed to handle the customer ordering process and provides a staff-only endpoint to view a list of all orders.

| URL Pattern           | HTTP Methods | Functionality           | Notes                          |
|----------------------|--------------|------------------------|--------------------------------|
| /api/orders/create/  | POST         | Create a new order.     | Publicly accessible for customers. |
| /api/orders/         | GET          | Retrieve all orders.    | Staff-only, requires authentication. |

Example: POST request to create an order
```
POST /api/orders/create/
```
Request Body:
```json
{
  "customer_identifier": "Table 5",
  "items": [
    {
      "meal": 1,
      "quantity": 2
    },
    {
      "meal": 2,
      "quantity": 1
    }
  ]
}
```
Response:
```json
{
  "id": 1,
  "customer_identifier": "Table 5",
  "status": "pending",
  "total_amount": "65.00",
  "created_at": "2024-05-20T10:30:00Z",
  "items": [
    {
      "id": 1,
      "meal": 1,
      "quantity": 2
    },
    {
      "id": 2,
      "meal": 2,
      "quantity": 1
    }
  ]
}
```

### 3. Users API
The users API provides endpoints to manage and retrieve user information, primarily for staff use.

| URL Pattern | HTTP Methods | Functionality        | Notes                  |
|-------------|--------------|---------------------|------------------------|
| /api/users/ | GET          | Retrieve all users.  | Staff-only access.      |

Example: GET request to list all users
```
GET /api/users/
```
Response:
```json
[
  {
    "id": 1,
    "username": "dinedash",
    "role": "staff"
  }
]
```

## Setup and Installation
1. Ensure Python and Django are installed.
2. Clone or navigate to the project directory.
3. Install dependencies (if requirements.txt exists): `pip install -r requirements.txt`
4. Apply migrations: `python manage.py migrate`
5. Create a superuser: `python manage.py createsuperuser`
6. Run the development server: `python manage.py runserver`
7. Access the admin interface at `http://localhost:8000/admin/`

## Next Steps
- Create frontend user interfaces using React JSX with Tailwind CSS.
- Add authentication and authorization logic.
- Add tests for models and views.

This README will be updated as development progresses.
