"""
Users API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.session import get_db
from app.api.deps import get_current_active_user, require_admin, require_manager_or_admin
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import UserRead, UserUpdate, UserRoleUpdate


router = APIRouter()


def create_response(success: bool, message: str, data=None, meta=None):
    """Create standardized API response."""
    response = {
        "success": success,
        "message": message
    }
    if data is not None:
        response["data"] = data
    if meta is not None:
        response["meta"] = meta
    return response


def serialize_user(user: User) -> dict:
    """Serialize user model to dictionary."""
    return {
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
        "fullName": user.fullName,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt
    }


@router.get("", response_model=dict)
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    """Get all users with pagination and filtering."""
    query = db.query(User).filter(User.isActive == True)
    
    # Apply filters
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {role}"
            )
    
    if department:
        query = query.filter(User.department == department)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.firstName.ilike(search_pattern)) |
            (User.lastName.ilike(search_pattern)) |
            (User.email.ilike(search_pattern))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()
    
    # Serialize users
    users_data = [serialize_user(user) for user in users]
    
    # Pagination metadata
    total_pages = (total + limit - 1) // limit
    meta = {
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages,
        "hasNext": page < total_pages,
        "hasPrev": page > 1
    }
    
    return create_response(True, "Users retrieved successfully", {"users": users_data}, meta)


@router.get("/role/{role}", response_model=dict)
async def get_users_by_role(
    role: str,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    """Get users by role."""
    try:
        role_enum = UserRole(role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {role}"
        )
    
    users = db.query(User).filter(
        User.role == role_enum,
        User.isActive == True
    ).all()
    
    users_data = [serialize_user(user) for user in users]
    
    return create_response(True, f"Users with role '{role}' retrieved successfully", {"users": users_data})


@router.get("/{user_id}", response_model=dict)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user by ID."""
    # Check if user can access this profile
    if (current_user.role not in [UserRole.MANAGER, UserRole.ADMIN] and 
        current_user.id != user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    user = db.query(User).filter(User.id == user_id, User.isActive == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_data = serialize_user(user)
    
    return create_response(True, "User retrieved successfully", {"user": user_data})


@router.put("/{user_id}", response_model=dict)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user information."""
    # Check if user can update this profile
    if (current_user.role not in [UserRole.MANAGER, UserRole.ADMIN] and 
        current_user.id != user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    user = db.query(User).filter(User.id == user_id, User.isActive == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    user_data = serialize_user(user)
    
    return create_response(True, "User updated successfully", {"user": user_data})


@router.put("/{user_id}/role", response_model=dict)
async def update_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user role (Admin only)."""
    user = db.query(User).filter(User.id == user_id, User.isActive == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from changing their own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    user.role = role_data.role
    db.commit()
    db.refresh(user)
    
    user_data = serialize_user(user)
    
    return create_response(True, "User role updated successfully", {"user": user_data})


@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete user (soft delete - Admin only)."""
    user = db.query(User).filter(User.id == user_id, User.isActive == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Soft delete
    user.isActive = False
    user.refreshToken = None  # Invalidate tokens
    db.commit()
    
    return create_response(True, "User deleted successfully")