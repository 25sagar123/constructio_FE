"""
FastAPI main application module for Construction Management System.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import auth, users, projects


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    # Startup
    print("🚀 Starting FastAPI server...")
    print(f"📱 Environment: {settings.ENVIRONMENT}")
    print(f"🌐 API Base URL: http://localhost:{settings.PORT}/api")
    yield
    # Shutdown
    print("🛑 Shutting down FastAPI server...")


app = FastAPI(
    title="Construction Management API",
    description="A robust FastAPI backend for construction project management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    from datetime import datetime
    import time
    
    return {
        "status": "OK",
        "timestamp": datetime.now().isoformat(),
        "uptime": time.time(),
        "environment": settings.ENVIRONMENT
    }

# API info endpoint  
@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "message": "Construction Management API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "users": "/api/users", 
            "projects": "/api/projects",
            "health": "/health"
        },
        "documentation": "See /docs for detailed API documentation"
    }

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True if settings.ENVIRONMENT == "development" else False
    )