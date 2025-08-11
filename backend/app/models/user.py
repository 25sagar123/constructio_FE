"""
User model for SQLAlchemy.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    USER = "user"
    MANAGER = "manager"
    ADMIN = "admin"


class User(Base):
    """User model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firstName = Column(String(50), nullable=False)
    lastName = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # Will store bcrypt hash
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    phone = Column(String(20), nullable=True)
    department = Column(String(100), nullable=True)
    isActive = Column(Boolean, default=True, nullable=False)
    lastLogin = Column(DateTime(timezone=True), nullable=True)
    profileImage = Column(Text, nullable=True)  # URL to profile image
    refreshToken = Column(Text, nullable=True)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    managed_projects = relationship("Project", back_populates="manager", foreign_keys="Project.manager_id")
    team_memberships = relationship("ProjectTeamMember", back_populates="user")
    uploaded_attachments = relationship("ProjectAttachment", back_populates="uploaded_by_user")
    completed_milestones = relationship("ProjectMilestone", back_populates="completed_by_user")

    def __repr__(self):
        return f"<User {self.email}>"

    @property
    def fullName(self):
        """Get full name."""
        return f"{self.firstName} {self.lastName}"