"""
Projects API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from decimal import Decimal

from app.db.session import get_db
from app.api.deps import get_current_active_user, require_manager_or_admin
from app.models.user import User, UserRole
from app.models.project import Project, ProjectTeamMember, ProjectStatus, ProjectPriority
from app.schemas.project import ProjectCreate, ProjectUpdate, TeamMemberAdd


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


def serialize_user_summary(user: User) -> dict:
    """Serialize user for project responses."""
    if not user:
        return None
    return {
        "id": user.id,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "role": user.role.value
    }


def serialize_team_member(team_member: ProjectTeamMember) -> dict:
    """Serialize team member."""
    return {
        "id": team_member.id,
        "user": serialize_user_summary(team_member.user),
        "role": team_member.role,
        "joinedDate": team_member.joinedDate
    }


def serialize_attachment(attachment) -> dict:
    """Serialize project attachment."""
    return {
        "id": attachment.id,
        "filename": attachment.filename,
        "originalName": attachment.originalName,
        "url": attachment.url,
        "uploadedBy": attachment.uploadedBy,
        "uploadedAt": attachment.uploadedAt
    }


def serialize_milestone(milestone) -> dict:
    """Serialize project milestone."""
    return {
        "id": milestone.id,
        "name": milestone.name,
        "description": milestone.description,
        "dueDate": milestone.dueDate,
        "completed": milestone.completed,
        "completedAt": milestone.completedAt,
        "completedBy": milestone.completedBy
    }


def serialize_project(project: Project, include_details: bool = True) -> dict:
    """Serialize project model to dictionary."""
    data = {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "startDate": project.startDate,
        "endDate": project.endDate,
        "budget": float(project.budget) if project.budget else None,
        "actualCost": float(project.actualCost),
        "status": project.status.value,
        "priority": project.priority.value,
        "progress": project.progress,
        "managerId": project.manager_id,
        "manager": serialize_user_summary(project.manager),
        "location": project.location,
        "tags": project.tags or [],
        "isActive": project.isActive,
        "createdAt": project.createdAt,
        "updatedAt": project.updatedAt
    }
    
    if include_details:
        data.update({
            "teamMembers": [serialize_team_member(tm) for tm in project.team_members],
            "attachments": [serialize_attachment(att) for att in project.attachments],
            "milestones": [serialize_milestone(ms) for ms in project.milestones],
            "teamSize": len(project.team_members) + 1,  # +1 for manager
        })
    else:
        data["teamSize"] = len(project.team_members) + 1
    
    return data


@router.get("", response_model=dict)
async def get_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    managerId: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all projects with pagination and filtering."""
    query = db.query(Project).options(
        joinedload(Project.manager),
        joinedload(Project.team_members).joinedload(ProjectTeamMember.user)
    ).filter(Project.isActive == True)
    
    # Apply filters
    if status:
        try:
            status_enum = ProjectStatus(status)
            query = query.filter(Project.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )
    
    if priority:
        try:
            priority_enum = ProjectPriority(priority)
            query = query.filter(Project.priority == priority_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid priority: {priority}"
            )
    
    if managerId:
        query = query.filter(Project.manager_id == managerId)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Project.name.ilike(search_pattern)) |
            (Project.description.ilike(search_pattern))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    projects = query.offset(offset).limit(limit).all()
    
    # Serialize projects (summary view for list)
    projects_data = [serialize_project(project, include_details=False) for project in projects]
    
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
    
    return create_response(True, "Projects retrieved successfully", {"projects": projects_data}, meta)


@router.get("/status/{project_status}", response_model=dict)
async def get_projects_by_status(
    project_status: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get projects by status."""
    try:
        status_enum = ProjectStatus(project_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {project_status}"
        )
    
    projects = db.query(Project).options(
        joinedload(Project.manager),
        joinedload(Project.team_members).joinedload(ProjectTeamMember.user)
    ).filter(
        Project.status == status_enum,
        Project.isActive == True
    ).all()
    
    projects_data = [serialize_project(project, include_details=False) for project in projects]
    
    return create_response(True, f"Projects with status '{project_status}' retrieved successfully", {"projects": projects_data})


@router.get("/{project_id}", response_model=dict)
async def get_project_by_id(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get project by ID."""
    project = db.query(Project).options(
        joinedload(Project.manager),
        joinedload(Project.team_members).joinedload(ProjectTeamMember.user),
        joinedload(Project.attachments),
        joinedload(Project.milestones)
    ).filter(Project.id == project_id, Project.isActive == True).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project_data = serialize_project(project, include_details=True)
    
    return create_response(True, "Project retrieved successfully", {"project": project_data})


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    """Create new project."""
    # Verify manager exists
    manager = db.query(User).filter(
        User.id == project_data.managerId,
        User.isActive == True,
        User.role.in_([UserRole.MANAGER, UserRole.ADMIN])
    ).first()
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid manager ID or user is not a manager/admin"
        )
    
    # Create project
    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        startDate=project_data.startDate,
        endDate=project_data.endDate,
        budget=project_data.budget,
        status=project_data.status,
        priority=project_data.priority,
        progress=project_data.progress,
        manager_id=project_data.managerId,
        location=project_data.location.dict(),
        tags=project_data.tags
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Reload with relationships
    project = db.query(Project).options(
        joinedload(Project.manager),
        joinedload(Project.team_members).joinedload(ProjectTeamMember.user),
        joinedload(Project.attachments),
        joinedload(Project.milestones)
    ).filter(Project.id == new_project.id).first()
    
    project_data = serialize_project(project, include_details=True)
    
    return create_response(True, "Project created successfully", {"project": project_data})


@router.put("/{project_id}", response_model=dict)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update project."""
    project = db.query(Project).filter(Project.id == project_id, Project.isActive == True).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check permissions
    if (current_user.role not in [UserRole.ADMIN] and 
        project.manager_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update project fields
    update_data = project_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "location" and value is not None:
            setattr(project, field, value.dict())
        else:
            setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    # Reload with relationships
    project = db.query(Project).options(
        joinedload(Project.manager),
        joinedload(Project.team_members).joinedload(ProjectTeamMember.user),
        joinedload(Project.attachments),
        joinedload(Project.milestones)
    ).filter(Project.id == project_id).first()
    
    project_data = serialize_project(project, include_details=True)
    
    return create_response(True, "Project updated successfully", {"project": project_data})


@router.delete("/{project_id}", response_model=dict)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete project (soft delete)."""
    project = db.query(Project).filter(Project.id == project_id, Project.isActive == True).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check permissions
    if (current_user.role not in [UserRole.ADMIN] and 
        project.manager_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Soft delete
    project.isActive = False
    db.commit()
    
    return create_response(True, "Project deleted successfully")


@router.post("/{project_id}/team", response_model=dict)
async def add_team_member(
    project_id: int,
    team_data: TeamMemberAdd,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add team member to project."""
    project = db.query(Project).filter(Project.id == project_id, Project.isActive == True).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check permissions
    if (current_user.role not in [UserRole.ADMIN] and 
        project.manager_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Verify user exists
    user = db.query(User).filter(User.id == team_data.userId, User.isActive == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    
    # Check if user is already a team member
    existing_member = db.query(ProjectTeamMember).filter(
        ProjectTeamMember.project_id == project_id,
        ProjectTeamMember.user_id == team_data.userId
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a team member"
        )
    
    # Check if user is the manager
    if project.manager_id == team_data.userId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project manager cannot be added as team member"
        )
    
    # Add team member
    team_member = ProjectTeamMember(
        project_id=project_id,
        user_id=team_data.userId,
        role=team_data.role
    )
    
    db.add(team_member)
    db.commit()
    db.refresh(team_member)
    
    # Load with user relationship
    team_member = db.query(ProjectTeamMember).options(
        joinedload(ProjectTeamMember.user)
    ).filter(ProjectTeamMember.id == team_member.id).first()
    
    team_member_data = serialize_team_member(team_member)
    
    return create_response(True, "Team member added successfully", {"teamMember": team_member_data})


@router.delete("/{project_id}/team/{user_id}", response_model=dict)
async def remove_team_member(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove team member from project."""
    project = db.query(Project).filter(Project.id == project_id, Project.isActive == True).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check permissions
    if (current_user.role not in [UserRole.ADMIN] and 
        project.manager_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Find team member
    team_member = db.query(ProjectTeamMember).filter(
        ProjectTeamMember.project_id == project_id,
        ProjectTeamMember.user_id == user_id
    ).first()
    
    if not team_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    
    db.delete(team_member)
    db.commit()
    
    return create_response(True, "Team member removed successfully")