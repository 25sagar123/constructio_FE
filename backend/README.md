# Construction Management Backend API

A robust Node.js/Express.js backend API for construction project management, designed to work seamlessly with the existing frontend codebase.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Database Support**: Flexible support for both MongoDB and MySQL databases
- **RESTful APIs**: Comprehensive API endpoints for users, projects, and authentication
- **Security**: Rate limiting, CORS, helmet protection, input validation
- **Testing**: Unit and integration tests with Jest
- **Error Handling**: Centralized error handling with detailed logging
- **Validation**: Request validation using Joi schemas
- **Documentation**: Well-documented API endpoints

## Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Databases**: MongoDB (with Mongoose) / MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, bcryptjs, express-rate-limit

## Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── projectController.js
│   ├── models/             # Database models
│   │   ├── User.js         # MongoDB user model
│   │   ├── Project.js      # MongoDB project model
│   │   └── UserMySQL.js    # MySQL user model
│   ├── routes/             # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── projectRoutes.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   ├── validation.js   # Validation middleware
│   │   ├── errorHandler.js # Error handling
│   │   └── notFound.js     # 404 handler
│   ├── config/             # Configuration files
│   │   ├── index.js        # Main config
│   │   ├── mongodb.js      # MongoDB connection
│   │   └── mysql.js        # MySQL connection
│   └── utils/              # Utility functions
│       └── helpers.js      # Helper functions
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── setup.js           # Test setup
├── server.js              # Server entry point
├── package.json           # Dependencies
├── .env.example           # Environment template
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (>=18.0.0)
- npm or yarn
- MongoDB or MySQL database

### Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   
   # For MongoDB
   MONGODB_URI=mongodb://localhost:27017/constructio_db
   
   # OR for MySQL
   MYSQL_HOST=localhost
   MYSQL_USER=your_user
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=constructio_db
   ```

3. **Database setup**:
   
   **For MongoDB:**
   - Make sure MongoDB is running
   - The database and collections will be created automatically

   **For MySQL:**
   - Create the database: `CREATE DATABASE constructio_db;`
   - Tables will be created automatically when the server starts

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

### Testing

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users (Manager/Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PUT /api/users/:id/role` - Update user role (Admin only)
- `GET /api/users/role/:role` - Get users by role

### Projects (MongoDB only)
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (Manager/Admin only)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/team` - Add team member
- `DELETE /api/projects/:id/team/:userId` - Remove team member
- `GET /api/projects/status/:status` - Get projects by status

### Health Check
- `GET /health` - Server health status

## User Roles

- **user**: Basic user with limited access
- **manager**: Can manage projects and users
- **admin**: Full system access

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Parameterized queries

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Validation errors if applicable
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | `30d` |
| `MONGODB_URI` | MongoDB connection string | Optional |
| `MYSQL_HOST` | MySQL host | Optional |
| `MYSQL_USER` | MySQL username | Optional |
| `MYSQL_PASSWORD` | MySQL password | Optional |
| `MYSQL_DATABASE` | MySQL database name | Optional |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.