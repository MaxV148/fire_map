from domain.user.model import User


def is_admin(user: User) -> bool:
    return user.role.name == "admin"
