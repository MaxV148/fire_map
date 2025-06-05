from sqlalchemy.orm import Session

from domain.role.model import Role
from domain.user.model import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first()

    def get_all_users(self):
        return self.db.query(User).all()

    def set_role(self, user_id: int, role_id: int):
        self.db.query(User).filter(User.id == user_id).update({"role_id": role_id})
        self.db.commit()

    def deactivate_otp(self, user: User):
        self.db.query(User).filter(User.id == user.id).update(
            {"otp_configured": False, "otp_secret": None}
        )
        self.db.commit()

    def deactivate_user(self, user: User, deactivate_bool: bool):
        self.db.query(User).filter(User.id == user.id).update(
            {"deactivated": deactivate_bool}
        )
        self.db.commit()
        self.db.refresh(user)
        return user
