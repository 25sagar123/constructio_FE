# Construction Management System

This is a full-stack construction management system built with Next.js frontend and Node.js/Express.js backend.

## Project Structure

```
constructio_FE/
├── frontend (Next.js)
│   ├── src/app/           # Next.js App Router
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── ...
└── backend (Node.js/Express.js)
    ├── src/               # Backend source code
    │   ├── controllers/   # Request handlers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   ├── middleware/    # Custom middleware
    │   ├── config/        # Configuration
    │   └── utils/         # Utilities
    ├── tests/             # Test files
    ├── server.js          # Server entry point
    └── package.json       # Backend dependencies
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

### Backend (Node.js/Express.js)

Navigate to the backend directory and start the server:

```bash
cd backend
npm install
npm run dev
```

The backend server will start on [http://localhost:5000](http://localhost:5000).

#### Backend Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Database Support**: MongoDB, MySQL, or in-memory storage
- **API Endpoints**: RESTful APIs for users, projects, and authentication
- **Security**: Rate limiting, CORS, helmet protection, input validation
- **Testing**: Comprehensive unit and integration tests
- **Documentation**: Well-documented API endpoints

#### API Documentation

- **Health Check**: `GET /health`
- **API Info**: `GET /api`
- **Authentication**: 
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user
  - `GET /api/auth/profile` - Get user profile
  - `POST /api/auth/logout` - Logout user
- **Users**: 
  - `GET /api/users` - Get all users
  - `GET /api/users/:id` - Get user by ID
  - `PUT /api/users/:id` - Update user
- **Projects**: 
  - `GET /api/projects` - Get all projects
  - `POST /api/projects` - Create new project
  - `GET /api/projects/:id` - Get project by ID

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

Edit the `.env` file with your database credentials and other configuration.

## Testing

### Frontend
```bash
npm run build  # Build the application
npm run lint   # Run ESLint
```

### Backend
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run lint            # Run ESLint
```

## Technologies Used

### Frontend
- Next.js 15.4.5
- React 19.1.0
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- MongoDB/MySQL/In-Memory Database
- Jest Testing Framework
- Joi Validation
- bcryptjs for password hashing

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
