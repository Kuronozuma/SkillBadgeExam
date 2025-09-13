# APSI Backend API

A comprehensive backend API for the APSI Inventory Management System built with Express.js, PostgreSQL, and Sequelize.

## Features

- 🔐 JWT-based authentication with role-based authorization
- 📦 Complete inventory management
- 👥 Customer and distributor management
- 📋 Order processing and tracking
- 🏪 Warehouse operations and logging
- 📊 Comprehensive reporting system
- 🛡️ Security middleware and input validation
- 📈 Dashboard analytics

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Joi** - Input validation
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

4. Update the `.env` file with your database credentials and configuration.

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001` by default.

### Database Setup

1. Make sure your PostgreSQL database is running and accessible.

2. The application will automatically create tables on first run in development mode.

3. Seed the database with sample data:
```bash
npm run migrate
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register new user (username, password only)
- `POST /login` - User login (username, password only)
- `GET /me` - Get current user
- `POST /logout` - Logout user
- `PUT /profile` - Update user profile (optional fields)
- `PUT /change-password` - Change password

#### Inventory (`/api/inventory`)
- `GET /` - Get all inventory items
- `GET /:id` - Get single item
- `POST /` - Create new item
- `PUT /:id` - Update item
- `DELETE /:id` - Delete item
- `GET /categories` - Get all categories
- `PUT /:id/stock` - Update item stock

#### Customers (`/api/customers`)
- `GET /` - Get all customers
- `GET /:id` - Get single customer
- `POST /` - Create new customer
- `PUT /:id` - Update customer
- `DELETE /:id` - Delete customer
- `GET /:id/orders` - Get customer orders

#### Distributors (`/api/distributors`)
- `GET /` - Get all distributors
- `GET /:id` - Get single distributor
- `POST /` - Create new distributor
- `PUT /:id` - Update distributor
- `DELETE /:id` - Delete distributor
- `GET /:id/items` - Get distributor items

#### Orders (`/api/orders`)
- `GET /` - Get all orders
- `GET /:id` - Get single order
- `POST /` - Create new order
- `PUT /:id` - Update order
- `DELETE /:id` - Cancel order
- `PUT /:id/status` - Update order status

#### Warehouse (`/api/warehouse`)
- `GET /` - Get warehouse logs
- `GET /summary` - Get warehouse summary
- `POST /` - Create warehouse log
- `PUT /:id` - Update warehouse log
- `DELETE /:id` - Delete warehouse log
- `GET /items/:itemId` - Get item warehouse logs

#### Reports (`/api/reports`)
- `GET /inventory` - Inventory report
- `GET /customers` - Customer report
- `GET /monthly` - Monthly summary
- `GET /sales` - Sales report (Accounting/Admin only)
- `GET /stock-alerts` - Stock alerts

#### Dashboard (`/api/dashboard`)
- `GET /` - Dashboard overview
- `GET /stats` - Dashboard statistics
- `GET /recent-activity` - Recent activity

## User Roles

- **CSR** - Customer Service Representative
  - Can manage customers, inventory, and orders
  - Can create and update warehouse logs
  - Can view reports and dashboard

- **TL** - Team Leader
  - All CSR permissions
  - Can delete inventory items and customers
  - Can manage distributors
  - Can update order status

- **Accounting** - Accounting Department
  - All TL permissions
  - Can view sales reports
  - Can access financial data

- **Admin** - System Administrator
  - Full system access
  - Can manage users
  - Can access all features

## Sample Data

The seeding script creates sample data including:
- 4 users with different roles
- 3 customers
- 2 distributors
- 6 inventory items
- 3 orders with order items
- Warehouse logs

### Test Accounts
- **Admin**: `admin` / `admin123`
- **CSR**: `csr1` / `csr123`
- **TL**: `tl1` / `tl123`
- **Accounting**: `accounting1` / `acc123`

**Note**: Login only requires username and password. Email, first name, and last name are optional fields that can be added later through profile management.

## Environment Variables

```env
# Database Configuration
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation with Joi
- Rate limiting
- CORS protection
- SQL injection prevention
- XSS protection with helmet

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Database Migration
```bash
npm run migrate
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production database
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Set up SSL/TLS
6. Use a process manager like PM2

## License

MIT License
