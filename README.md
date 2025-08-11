# Construction Management System

This is a full-stack construction management system built with Next.js frontend and FastAPI backend.

## Project Structure

```
constructio_FE/
├── frontend (Next.js)
│   ├── src/app/           # Next.js App Router
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── ...
└── backend (FastAPI/Python)
    ├── app/               # FastAPI application
    │   ├── main.py        # FastAPI app configuration
    │   ├── core/          # Core utilities (config, security)
    │   ├── db/            # Database layer (SQLAlchemy)
    │   ├── models/        # SQLAlchemy models
    │   ├── schemas/       # Pydantic schemas
    │   └── api/           # API routes and dependencies
    ├── alembic/           # Database migrations
    ├── requirements.txt   # Python dependencies
    └── README.md          # Backend documentation
```

## Getting Started

### Frontend (Next.js)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Backend (FastAPI/Python)

Navigate to the backend directory and start the server:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
alembic upgrade head  # Run database migrations
uvicorn app.main:app --reload --port 5000
```

The backend server will start on [http://localhost:5000](http://localhost:5000).

#### Backend Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **API Endpoints**: RESTful APIs for users, projects, and authentication
- **Security**: JWT tokens, password hashing with bcrypt, CORS protection
- **Data Validation**: Pydantic schemas for request/response validation
- **Documentation**: Auto-generated API docs with FastAPI
- **Migration Support**: Database schema management with Alembic

#### API Documentation

- **Interactive Docs**: `http://localhost:5000/docs`
- **ReDoc**: `http://localhost:5000/redoc`
- **Health Check**: `GET /health`
- **API Info**: `GET /api`
- **Authentication**: 
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user
  - `POST /api/auth/refresh` - Refresh access token
  - `POST /api/auth/logout` - Logout user
  - `GET /api/auth/profile` - Get user profile
- **Users**: 
  - `GET /api/users` - Get all users
  - `GET /api/users/{id}` - Get user by ID
  - `PUT /api/users/{id}` - Update user
  - `DELETE /api/users/{id}` - Delete user
  - `PUT /api/users/{id}/role` - Update user role
  - `GET /api/users/role/{role}` - Get users by role
- **Projects**: 
  - `GET /api/projects` - Get all projects
  - `POST /api/projects` - Create new project
  - `GET /api/projects/{id}` - Get project by ID
  - `PUT /api/projects/{id}` - Update project
  - `DELETE /api/projects/{id}` - Delete project
  - `POST /api/projects/{id}/team` - Add team member
  - `DELETE /api/projects/{id}/team/{userId}` - Remove team member
  - `GET /api/projects/status/{status}` - Get projects by status

For detailed API documentation, see [backend/README.md](backend/README.md).

## Environment Configuration

### Frontend
The frontend environment is configured automatically by Next.js.

### Backend
Copy the environment template and configure your settings:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your database credentials and other configuration:

```env
ENVIRONMENT=development
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
DATABASE_URL=postgresql://user:password@localhost/constructio_db
```

Set up the PostgreSQL database:
```sql
CREATE DATABASE constructio_db;
```

Run database migrations:
```bash
alembic upgrade head
```

## Testing

### Frontend
```bash
npm run build  # Build the application
npm run lint   # Run ESLint
```

### Backend
```bash
cd backend
pip install -r requirements.txt  # Install dependencies
alembic upgrade head              # Run migrations
uvicorn app.main:app --reload     # Start development server
```

Available commands:
```bash
make install                      # Install dependencies
make dev                         # Start development server
make migrate MSG="message"       # Create migration
make upgrade                     # Apply migrations
make docker-up                   # Start with Docker
```

## Technologies Used

### Frontend
- Next.js 15.4.5
- React 19.1.0
- TypeScript
- Tailwind CSS

### Backend
- Python 3.8+
- FastAPI
- SQLAlchemy with PostgreSQL
- JWT Authentication
- Alembic Migrations
- Pydantic Validation
- Passlib with bcrypt

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
