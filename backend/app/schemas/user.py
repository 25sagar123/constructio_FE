"""
User-related Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# Base user schema
class UserBase(BaseModel):
    """Base user schema with common fields."""
    firstName: str = Field(..., min_length=1, max_length=50)
    lastName: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    department: Optional[str] = Field(None, max_length=100)


# User creation schema
class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8)
    role: Optional[UserRole] = UserRole.USER


# User update schema
class UserUpdate(BaseModel):
    """Schema for updating user information."""
    firstName: Optional[str] = Field(None, min_length=1, max_length=50)
    lastName: Optional[str] = Field(None, min_length=1, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    department: Optional[str] = Field(None, max_length=100)
    profileImage: Optional[str] = None


# User role update schema
class UserRoleUpdate(BaseModel):
    """Schema for updating user role."""
    role: UserRole


# User response schema
class UserRead(UserBase):
    """Schema for user response."""
    id: int
    role: UserRole
    isActive: bool
    lastLogin: Optional[datetime]
    profileImage: Optional[str]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


# User profile schema (more detailed)
class UserProfile(UserRead):
    """Schema for detailed user profile."""
    fullName: str

    class Config:
        from_attributes = True


# User login schema
class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


# Token schemas
class Token(BaseModel):
    """Schema for JWT token response."""
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"


class TokenPayload(BaseModel):
    """Schema for JWT token payload."""
    id: int
    email: str
    role: str


class RefreshToken(BaseModel):
    """Schema for refresh token request."""
    refreshToken: str