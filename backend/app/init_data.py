from infrastructure.postgresql.db import SessionLocal
from domain.user.repository import UserRepository
from domain.role.repository import RoleRepository
from config.config_provider import get_config
from loguru import logger
from domain.auth.service import hash_password
from domain.user.model import User
from domain.role.dto import RoleCreate

# Import all models to ensure proper relationship mapping
from domain.role.model import Role
from domain.event.model import Event
from domain.issue.model import Issue
from domain.tag.model import Tag
from domain.vehicletype.model import VehicleType
from domain.invite.model import Invite

config = get_config()


def setup_initial_admin():
    """Setup initial admin user if it doesn't exist"""
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        role_repo = RoleRepository(db)

        # Check if admin user already exists
        existing_admin = user_repo.get_user_by_email(config.initial_admin_email)
        if existing_admin:
            logger.info("Admin user already exists")
            return

        # Check if admin role exists, create if not
        admin_role = role_repo.get_by_name("admin")
        if not admin_role:
            logger.info("Creating admin role")
            admin_role_data = RoleCreate(
                name="admin", description="Administrator role with full access"
            )
            admin_role = role_repo.create(admin_role_data)
        # Check if user role exists, create if not
        user_role = role_repo.get_by_name("user")
        if not user_role:
            logger.info("Creating user role")
            user_role_data = RoleCreate(
                name="user", description="Standard user role with limited access"
            )
            role_repo.create(user_role_data)

        # Create admin user
        logger.info(f"Creating initial admin user: {config.initial_admin_email}")
        hashed_password = hash_password(config.initial_admin_password)

        admin_user = User(
            email=config.initial_admin_email,
            first_name="Admin",
            last_name="User",
            password=hashed_password,
            role_id=admin_role.id,
        )

        user_repo.create_user(admin_user)
        logger.info("Initial admin user created successfully")

    except Exception as e:
        logger.error(f"Error setting up initial admin: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    setup_initial_admin()
    logger.info("Initial data setup completed")
