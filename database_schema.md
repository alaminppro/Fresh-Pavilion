
# Fresh Pavilion - Database Schema Design (PostgreSQL/Relational)

## 1. `admins` Table
Stores administrative users with hashed credentials.
- `id` (UUID, PK)
- `username` (VARCHAR, Unique)
- `password_hash` (TEXT)
- `email` (VARCHAR, Unique)
- `created_at` (TIMESTAMP)

## 2. `products` Table
Stores product details managed by the admin.
- `id` (UUID, PK)
- `name_bn` (VARCHAR) - Bengali Name
- `name_en` (VARCHAR) - English Name
- `description_bn` (TEXT)
- `price` (DECIMAL)
- `stock_quantity` (INTEGER)
- `image_url` (TEXT)
- `category` (VARCHAR)
- `updated_at` (TIMESTAMP)

## 3. `orders` Table
Stores order details and delivery information.
- `id` (UUID, PK)
- `customer_name` (VARCHAR)
- `customer_phone` (VARCHAR)
- `delivery_location` (ENUM: 'Zero Point', 'Shuttle Station', 'One Stop', 'Halls')
- `total_price` (DECIMAL)
- `order_status` (ENUM: 'Pending', 'Processing', 'Delivered', 'Cancelled')
- `created_at` (TIMESTAMP)

## 4. `order_items` Table
Junction table for products in an order.
- `id` (UUID, PK)
- `order_id` (UUID, FK -> orders.id)
- `product_id` (UUID, FK -> products.id)
- `quantity` (INTEGER)
- `price_at_order` (DECIMAL)

## 5. `customer_details` Table
Optional profiling for returning students.
- `id` (UUID, PK)
- `phone` (VARCHAR, Unique)
- `hall_name` (VARCHAR)
- `department` (VARCHAR)
- `last_order_at` (TIMESTAMP)
