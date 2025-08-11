"""
Base classes and metadata for Alembic migrations.
"""

from app.db.session import Base

# Import all models to ensure they are registered with Base.metadata
# This is needed for Alembic to detect all tables
def import_models():
    """Import all models to register them with Base.metadata."""
    from app.models.user import User  # noqa
    from app.models.project import Project, ProjectTeamMember, ProjectAttachment, ProjectMilestone  # noqa


# For Alembic migrations
target_metadata = Base.metadata