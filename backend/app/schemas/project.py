"""
Project-related Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from app.models.project import ProjectStatus, ProjectPriority


# Location schema
class LocationBase(BaseModel):
    """Base location schema."""
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    zipCode: str = Field(..., min_length=1)
    coordinates: Optional[Dict[str, float]] = Field(None, description="Latitude and longitude")


# Team member schemas
class TeamMemberBase(BaseModel):
    """Base team member schema."""
    userId: int
    role: str = "member"


class TeamMemberRead(BaseModel):
    """Team member response schema."""
    id: int
    user: Dict[str, Any]  # Will contain user info
    role: str
    joinedDate: datetime

    class Config:
        from_attributes = True


class TeamMemberAdd(BaseModel):
    """Schema for adding team member."""
    userId: int
    role: Optional[str] = "member"


# Attachment schemas
class AttachmentRead(BaseModel):
    """Attachment response schema."""
    id: int
    filename: str
    originalName: str
    url: str
    uploadedBy: int
    uploadedAt: datetime

    class Config:
        from_attributes = True


# Milestone schemas
class MilestoneBase(BaseModel):
    """Base milestone schema."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    dueDate: datetime


class MilestoneRead(MilestoneBase):
    """Milestone response schema."""
    id: int
    completed: bool
    completedAt: Optional[datetime]
    completedBy: Optional[int]

    class Config:
        from_attributes = True


# Project base schema
class ProjectBase(BaseModel):
    """Base project schema with common fields."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    startDate: datetime
    endDate: datetime
    budget: Optional[Decimal] = Field(None, ge=0)
    status: Optional[ProjectStatus] = ProjectStatus.PLANNING
    priority: Optional[ProjectPriority] = ProjectPriority.MEDIUM
    progress: Optional[int] = Field(0, ge=0, le=100)
    location: LocationBase
    tags: Optional[List[str]] = None


# Project creation schema
class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    managerId: int


# Project update schema
class ProjectUpdate(BaseModel):
    """Schema for updating project information."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    budget: Optional[Decimal] = Field(None, ge=0)
    actualCost: Optional[Decimal] = Field(None, ge=0)
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    location: Optional[LocationBase] = None
    tags: Optional[List[str]] = None


# Project response schema
class ProjectRead(ProjectBase):
    """Schema for project response."""
    id: int
    actualCost: Decimal
    managerId: int
    manager: Dict[str, Any]  # Will contain manager user info
    teamMembers: List[TeamMemberRead] = []
    attachments: List[AttachmentRead] = []
    milestones: List[MilestoneRead] = []
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


# Project summary schema (for list views)
class ProjectSummary(BaseModel):
    """Schema for project summary in list views."""
    id: int
    name: str
    description: Optional[str]
    status: ProjectStatus
    priority: ProjectPriority
    progress: int
    startDate: datetime
    endDate: datetime
    budget: Optional[Decimal]
    actualCost: Decimal
    managerId: int
    manager: Dict[str, Any]
    location: Dict[str, Any]
    teamSize: int
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True