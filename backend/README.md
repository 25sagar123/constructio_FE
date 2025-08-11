# Construction Management Backend API

A robust FastAPI backend for construction project management, designed to work seamlessly with the existing frontend codebase.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **RESTful APIs**: Comprehensive API endpoints for users, projects, and authentication
- **Security**: JWT tokens, password hashing with bcrypt, CORS protection
- **Data Validation**: Request/response validation using Pydantic schemas
- **Documentation**: Auto-generated API documentation with FastAPI
- **Migration Support**: Database schema management with Alembic

## Tech Stack

- **Runtime**: Python 3.8+
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens) with python-jose
- **Validation**: Pydantic schemas
- **Migrations**: Alembic
- **Security**: Passlib with bcrypt, CORS middleware

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app configuration
│   ├── core/                # Core utilities
│   │   ├── config.py        # Application configuration
│   │   └── security.py      # JWT and password utilities
│   ├── db/                  # Database layer
│   │   ├── base.py          # Base class for Alembic
│   │   └── session.py       # SQLAlchemy session
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py          # User model
│   │   └── project.py       # Project models
│   ├── schemas/             # Pydantic schemas
│   │   ├── user.py          # User request/response schemas
│   │   └── project.py       # Project request/response schemas
│   └── api/                 # API routes
│       ├── deps.py          # Dependencies (auth, db)
│       └── routes/          # API route handlers
│           ├── auth.py      # Authentication endpoints
│           ├── users.py     # User management endpoints
│           └── projects.py  # Project management endpoints
├── alembic/                 # Database migrations
│   ├── env.py              # Alembic environment
│   ├── script.py.mako      # Migration template
│   └── versions/           # Migration files
├── alembic.ini             # Alembic configuration
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Python 3.8 or higher
- PostgreSQL database
- pip (Python package manager)

### Installation

1. **Clone and navigate to backend**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your environment variables:
   ```env
   ENVIRONMENT=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   DATABASE_URL=postgresql://user:password@localhost/constructio_db
   ```

5. **Database setup**:
   
   Create the PostgreSQL database:
   ```sql
   CREATE DATABASE constructio_db;
   ```

6. **Run migrations**:
   ```bash
   alembic upgrade head
   ```

### Running the Application

**Development mode:**
```bash
uvicorn app.main:app --reload --port 5000
```

**Production mode:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

The server will start on `http://localhost:5000`.

### API Documentation

- **Interactive docs**: `http://localhost:5000/docs`
- **ReDoc**: `http://localhost:5000/redoc`
- **Health check**: `http://localhost:5000/health`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users (Manager/Admin only)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (Admin only)
- `PUT /api/users/{id}/role` - Update user role (Admin only)
- `GET /api/users/role/{role}` - Get users by role

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create new project (Manager/Admin only)
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/team` - Add team member
- `DELETE /api/projects/{id}/team/{userId}` - Remove team member
- `GET /api/projects/status/{status}` - Get projects by status

### Health Check
- `GET /health` - Server health status

## User Roles

- **user**: Basic user with limited access
- **manager**: Can manage projects and users
- **admin**: Full system access

## Database Migrations

### Create a new migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations
```bash
alembic upgrade head
```

### Downgrade migrations
```bash
alembic downgrade -1
```

## Security Features

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Hashing**: bcrypt with configurable rounds
- **CORS Protection**: Configurable cross-origin requests
- **Role-based Access**: Fine-grained permission control
- **Input Validation**: Pydantic schema validation
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "detail": "Additional error details"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE_MINUTES` | JWT expiration time | `10080` (7 days) |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `JWT_REFRESH_EXPIRE_MINUTES` | Refresh token expiration | `43200` (30 days) |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

## Development

### Code Structure
- Models use SQLAlchemy ORM with proper relationships
- Schemas use Pydantic for validation and serialization
- Routes are organized by feature (auth, users, projects)
- Dependencies handle authentication and database sessions
- Response format matches existing frontend expectations

### Adding New Features
1. Create/update models in `app/models/`
2. Create/update schemas in `app/schemas/`
3. Add route handlers in `app/api/routes/`
4. Generate migration with `alembic revision --autogenerate`
5. Apply migration with `alembic upgrade head`

## License

This project is licensed under the MIT License.