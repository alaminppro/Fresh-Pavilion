
# Fresh Pavilion - Supabase Database Schema

To ensure the app works correctly with Supabase, create the following tables in your Supabase project using the SQL Editor or Table Editor.

## 1. `products` Table
- `id` (UUID, PK, default: uuid_generate_v4())
- `name` (TEXT)
- `price` (NUMERIC)
- `description` (TEXT)
- `image` (TEXT)
- `category` (TEXT)
- `stock` (INTEGER)
- `unit` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE, default: now())

## 2. `orders` Table
- `id` (TEXT, PK) - e.g., #FP-123456
- `customer_name` (TEXT)
- `customer_phone` (TEXT)
- `location` (TEXT)
- `items` (JSONB) - Stores array of products
- `total_price` (NUMERIC)
- `status` (TEXT) - 'Pending', 'Delivered', 'Cancelled'
- `created_at` (TIMESTAMP WITH TIME ZONE, default: now())

## 3. `customers` Table (Crucial for CRM)
- `phone` (TEXT, PK, Unique)
- `name` (TEXT)
- `total_orders` (INTEGER, default: 0)
- `total_spent` (NUMERIC, default: 0)
- `last_location` (TEXT)
- `updated_at` (TIMESTAMP WITH TIME ZONE, default: now())

## 4. `categories` Table
- `id` (BIGINT, PK, Generated Always)
- `name` (TEXT, Unique)

## 5. `admin_users` Table
- `id` (UUID, PK, default: uuid_generate_v4())
- `username` (TEXT, Unique)
- `password` (TEXT)
- `phone` (TEXT)
- `role` (TEXT) - 'admin' or 'staff'

## 6. `site_settings` Table
- `key` (TEXT, PK, Unique)
- `value` (TEXT)
