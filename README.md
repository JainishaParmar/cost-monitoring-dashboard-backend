# Cost Monitoring Backend API

A robust Node.js/TypeScript backend API for monitoring and analyzing AWS cost data. This application provides RESTful endpoints for cost tracking, user authentication, and cost analytics with comprehensive filtering and aggregation capabilities.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Cost Data Management**: CRUD operations for AWS cost records
- **Advanced Analytics**: Cost summaries, trends, and filtering capabilities
- **Security**: Rate limiting, CORS, Helmet security headers
- **Database**: PostgreSQL with Sequelize ORM
- **TypeScript**: Full type safety and modern JavaScript features
- **Logging**: Winston-based structured logging
- **Error Handling**: Comprehensive error handling and validation

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** package manager

### Installing PostgreSQL with Homebrew

If you don't have PostgreSQL installed, you can install it using Homebrew:

```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Verify PostgreSQL is running
brew services list | grep postgresql
```

### PostgreSQL Management Commands

```bash
# Start PostgreSQL service
brew services start postgresql@14

# Stop PostgreSQL service
brew services stop postgresql@14

# Restart PostgreSQL service
brew services restart postgresql@14

# Check PostgreSQL status
brew services list | grep postgresql

# Connect to PostgreSQL
psql postgres

# Create a new database user (optional)
createuser --interactive --pwprompt

# Create the database
createdb cost_monitoring_db
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cost-monitoring-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cost_monitoring_db
   DB_USER=postgres
   DB_PASSWORD=postgres

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. **Database Setup**
   ```bash
   # Create database
   npm run db:create

   # Run migrations
   npm run migrate

   # Seed initial data (optional)
   npm run seed
   ```

## 🚀 Available Scripts

### Development
```bash
# Start development server with hot reload
npm run dev

# Alternative development server with nodemon
npm run dev:nodemon

# Type checking
npm run type-check
```

### Production
```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Database Management
```bash
# Create database
npm run db:create

# Drop database
npm run db:drop

# Run migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Undo all migrations
npm run migrate:undo:all

# Check migration status
npm run migrate:status
```

### Data Seeding
```bash
# Run seed data
npm run seed

# Run all seeders
npm run seed:all

# Undo all seeders
npm run seed:undo:all
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `created_at`
- `updated_at`

### Cost Records Table
- `id` (Primary Key)
- `date` (Date of cost record)
- `service_name` (AWS service: EC2, S3, Lambda, etc.)
- `cost_amount` (Cost in USD)
- `region` (AWS region)
- `account_id` (AWS account ID)
- `resource_id` (Optional AWS resource identifier)
- `usage_type` (Optional usage type)
- `description` (Optional description)
- `created_at`
- `updated_at`

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/refresh` | Refresh JWT token | No |
| GET | `/profile` | Get user profile | Yes |
| POST | `/logout` | User logout | Yes |

### Cost Routes (`/api/costs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all cost records with filtering | Yes |
| GET | `/summary` | Get cost summary by service | Yes |
| GET | `/trends` | Get cost trends over time | Yes |
| GET | `/filters` | Get available filter options | Yes |
| POST | `/` | Create new cost record | Yes |
| PUT | `/:id` | Update cost record | Yes |
| DELETE | `/:id` | Delete cost record | Yes |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login**: Get access token and refresh token
2. **Protected Routes**: Include `Authorization: Bearer <token>` header
3. **Token Refresh**: Use refresh token to get new access token
4. **Logout**: Invalidate refresh token

### Example Usage:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Use protected endpoint
curl -X GET http://localhost:5000/api/costs \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 📈 Cost Analytics Features

### Filtering Options
- **Date Range**: Filter by specific date periods
- **Service Name**: Filter by AWS services
- **Region**: Filter by AWS regions
- **Account ID**: Filter by specific AWS accounts
- **Cost Range**: Filter by cost amount ranges

### Aggregation Features
- **Service Summary**: Total costs grouped by service
- **Trend Analysis**: Daily cost trends over time
- **Regional Analysis**: Costs by AWS region
- **Account Analysis**: Costs by AWS account

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers protection
- **Input Validation**: Comprehensive request validation
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token management

## 🏗️ Project Structure

```
backend/
├── config/                 # Configuration files
├── migrations/            # Database migrations
├── models/               # Sequelize models
├── seeders/              # Database seeders
├── src/
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # TypeScript models
│   ├── routes/          # API routes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | cost_monitoring_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3000 |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - |
| `JWT_EXPIRES_IN` | Access token expiry | 15m |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d |

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running: `brew services list | grep postgresql`
   - Start PostgreSQL if stopped: `brew services start postgresql@14`
   - Check database credentials in `.env`
   - Verify database exists: `npm run db:create`

2. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`

3. **TypeScript Compilation Errors**
   - Run: `npm run type-check`
   - Fix type issues before building

4. **Migration Errors**
   - Reset database: `npm run db:drop && npm run db:create`
   - Run migrations: `npm run migrate`

5. **PostgreSQL Service Issues**
   ```bash
   # Check if PostgreSQL is running
   brew services list | grep postgresql
   
   # Restart PostgreSQL if needed
   brew services restart postgresql@14
   
   # Check PostgreSQL logs
   tail -f /usr/local/var/log/postgresql@14.log
   ```

## 📝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Use async/await for database operations
- Implement proper error handling

### Adding New Features
1. Create TypeScript interfaces in `src/types/`
2. Add Sequelize models in `src/models/`
3. Create controllers in `src/controllers/`
4. Define routes in `src/routes/`
5. Add middleware if needed in `src/middleware/`

### Testing
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request
