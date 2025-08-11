"""
Authentication API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_active_user, oauth2_scheme
from app.core.security import verify_password, get_password_hash, generate_tokens, verify_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserLogin, Token, RefreshToken, UserProfile


router = APIRouter()


def create_response(success: bool, message: str, data=None):
    """Create standardized API response."""
    response = {
        "success": success,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return response


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists with this email"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create new user
    new_user = User(
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        email=user_data.email,
        password=hashed_password,
        role=user_data.role,
        phone=user_data.phone,
        department=user_data.department
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate tokens
    tokens = generate_tokens(new_user.id, new_user.email, new_user.role.value)
    
    # Update refresh token in database
    new_user.refreshToken = tokens["refreshToken"]
    db.commit()
    
    # Prepare user data for response
    user_response = {
        "id": new_user.id,
        "firstName": new_user.firstName,
        "lastName": new_user.lastName,
        "email": new_user.email,
        "role": new_user.role.value,
        "phone": new_user.phone,
        "department": new_user.department,
        "isActive": new_user.isActive,
        "lastLogin": new_user.lastLogin,
        "profileImage": new_user.profileImage,
        "createdAt": new_user.createdAt,
        "updatedAt": new_user.updatedAt
    }
    
    response_data = {
        "user": user_response,
        "tokens": tokens
    }
    
    return create_response(True, "User registered successfully", response_data)


@router.post("/login", response_model=dict)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user with email and password."""
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.isActive:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive"
        )
    
    # Update last login
    user.lastLogin = datetime.utcnow()
    
    # Generate tokens
    tokens = generate_tokens(user.id, user.email, user.role.value)
    
    # Update refresh token in database
    user.refreshToken = tokens["refreshToken"]
    db.commit()
    
    # Prepare user data for response
    user_response = {
        "id": user.id,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "role": user.role.value,
        "phone": user.phone,
        "department": user.department,
        "isActive": user.isActive,
        "lastLogin": user.lastLogin,
        "profileImage": user.profileImage,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt
    }
    
    response_data = {
        "user": user_response,
        "tokens": tokens
    }
    
    return create_response(True, "Login successful", response_data)


@router.post("/refresh", response_model=dict)
async def refresh_token(
    refresh_data: RefreshToken,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    try:
        payload = verify_token(refresh_data.refreshToken, settings.JWT_REFRESH_SECRET)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("id")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user or user.refreshToken != refresh_data.refreshToken:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        if not user.isActive:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive"
            )
        
        # Generate new tokens
        tokens = generate_tokens(user.id, user.email, user.role.value)
        
        # Update refresh token in database
        user.refreshToken = tokens["refreshToken"]
        db.commit()
        
        return create_response(True, "Token refreshed successfully", {"tokens": tokens})
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/logout", response_model=dict)
async def logout(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Logout user by invalidating refresh token."""
    # Clear refresh token
    current_user.refreshToken = None
    db.commit()
    
    return create_response(True, "Logout successful")


@router.get("/profile", response_model=dict)
async def get_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile."""
    user_response = {
        "id": current_user.id,
        "firstName": current_user.firstName,
        "lastName": current_user.lastName,
        "email": current_user.email,
        "role": current_user.role.value,
        "phone": current_user.phone,
        "department": current_user.department,
        "isActive": current_user.isActive,
        "lastLogin": current_user.lastLogin,
        "profileImage": current_user.profileImage,
        "fullName": current_user.fullName,
        "createdAt": current_user.createdAt,
        "updatedAt": current_user.updatedAt
    }
    
    return create_response(True, "Profile retrieved successfully", {"user": user_response})