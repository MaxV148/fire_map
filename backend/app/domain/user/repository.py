from sqlalchemy.orm import Session

from domain.role.model import Role
from domain.user.model import User, PasswordReset


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, user: User):
        self.db.add(user)
        self.db.commit()
        return self.db.refresh(user)

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

    def change_password(self, user_id: int, new_password: str):
        self.db.query(User).filter(User.id == user_id).update(
            {"password": new_password}
        )
        self.db.commit()

    def create_pw_reset(self, pw_reset: PasswordReset):
        self.db.add(pw_reset)
        self.db.commit()
        self.db.refresh(pw_reset)
        return pw_reset

    def get_pw_reset_by_token(self, reset_token: str):
        return (
            self.db.query(PasswordReset)
            .filter(PasswordReset.reset_token == reset_token)
            .one_or_none()
        )

    def set_pw_reset_token_used(self, reset_token: str):
        self.db.query(PasswordReset).filter(
            PasswordReset.reset_token == reset_token
        ).update(
            {
                "is_used": True,
            }
        )
        self.db.commit()

    def get_pw_reset_by_code(self, code: str):
        return (
            self.db.query(PasswordReset)
            .filter(PasswordReset.reset_code == code)
            .one_or_none()
        )

    def set_pw_reset_code_used(self, reset_code: str):
        self.db.query(PasswordReset).filter(
            PasswordReset.reset_code == reset_code
        ).update(
            {
                "is_used": True,
            }
        )
        self.db.commit()
