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
- Views, templates, and URL patterns are yet to be developed.
- No frontend or API endpoints implemented yet.

## Setup and Installation
1. Ensure Python and Django are installed.
2. Clone or navigate to the project directory.
3. Install dependencies (if requirements.txt exists): `pip install -r requirements.txt`
4. Apply migrations: `python manage.py migrate`
5. Create a superuser: `python manage.py createsuperuser`
6. Run the development server: `python manage.py runserver`
7. Access the admin interface at `http://localhost:8000/admin/`

## Next Steps
- Implement views and URL patterns for the apps.
- Create templates for user interfaces.
- Add authentication and authorization logic.
- Develop APIs if needed (e.g., for mobile app integration).
- Add tests for models and views.

This README will be updated as development progresses.
