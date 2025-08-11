"""
Project-related models for SQLAlchemy.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class ProjectStatus(str, enum.Enum):
    """Project status enumeration."""
    PLANNING = "planning"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on-hold"


class ProjectPriority(str, enum.Enum):
    """Project priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Project(Base):
    """Project model."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    startDate = Column(DateTime(timezone=True), nullable=False)
    endDate = Column(DateTime(timezone=True), nullable=False)
    budget = Column(Numeric(15, 2), nullable=True)
    actualCost = Column(Numeric(15, 2), default=0, nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING, nullable=False)
    priority = Column(Enum(ProjectPriority), default=ProjectPriority.MEDIUM, nullable=False)
    progress = Column(Integer, default=0, nullable=False)  # 0-100
    
    # Manager foreign key
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Location as JSON field
    location = Column(JSON, nullable=False)  # {address, city, state, zipCode, coordinates: {lat, lng}}
    
    # Tags as JSON array
    tags = Column(JSON, nullable=True)  # Array of strings
    
    isActive = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    manager = relationship("User", back_populates="managed_projects", foreign_keys=[manager_id])
    team_members = relationship("ProjectTeamMember", back_populates="project", cascade="all, delete-orphan")
    attachments = relationship("ProjectAttachment", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.name}>"


class ProjectTeamMember(Base):
    """Project team member association model."""
    __tablename__ = "project_team_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(50), default="member", nullable=False)
    joinedDate = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="team_members")
    user = relationship("User", back_populates="team_memberships")

    def __repr__(self):
        return f"<ProjectTeamMember project_id={self.project_id} user_id={self.user_id}>"


class ProjectAttachment(Base):
    """Project attachment model."""
    __tablename__ = "project_attachments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    originalName = Column(String(255), nullable=False)
    url = Column(Text, nullable=False)
    uploadedBy = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploadedAt = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="attachments")
    uploaded_by_user = relationship("User", back_populates="uploaded_attachments")

    def __repr__(self):
        return f"<ProjectAttachment {self.filename}>"


class ProjectMilestone(Base):
    """Project milestone model."""
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    dueDate = Column(DateTime(timezone=True), nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    completedAt = Column(DateTime(timezone=True), nullable=True)
    completedBy = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="milestones")
    completed_by_user = relationship("User", back_populates="completed_milestones")

    def __repr__(self):
        return f"<ProjectMilestone {self.name}>"