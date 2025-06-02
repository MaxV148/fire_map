from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from domain.invite.model import Invite
from domain.invite.dto import InviteCreate


class InviteRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self, invite_data: InviteCreate, created_by_id: Optional[int] = None
    ) -> Invite:
        """Create a new invitation"""
        # Calculate expiration date (default 7 days or custom)
        expire_days = invite_data.expire_days or 7
        expire_date = datetime.now() + timedelta(days=expire_days)

        # Create invite record
        invite = Invite(
            email=invite_data.email,
            expire_date=expire_date,
            created_by_id=created_by_id,
        )
        self.db.add(invite)
        self.db.commit()
        self.db.refresh(invite)
        return invite

    def get_by_uuid(self, invite_uuid: UUID) -> Optional[Invite]:
        """Get an invite by its UUID"""
        return self.db.query(Invite).filter(Invite.invite_uuid == invite_uuid).first()

    def get_by_email(self, email: str) -> Optional[Invite]:
        """Get a non-used, non-expired invite by email"""
        return (
            self.db.query(Invite)
            .filter(
                Invite.email == email,
                Invite.is_used == False,
                Invite.expire_date > datetime.now(),
            )
            .first()
        )

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Invite]:
        """Get a list of invites with pagination"""
        return self.db.query(Invite).offset(skip).limit(limit).all()

    def count(self) -> int:
        """Count total number of invites"""
        return self.db.scalar(select(func.count()).select_from(Invite))

    def is_valid(self, invite_uuid: UUID) -> bool:
        """Check if an invite is valid (exists, not used, not expired)"""
        invite = self.get_by_uuid(invite_uuid)
        if not invite:
            return False

        return not invite.is_used and invite.expire_date > datetime.now()

    def mark_as_used(self, invite_uuid: UUID) -> Optional[Invite]:
        """Mark an invite as used"""
        invite = self.get_by_uuid(invite_uuid)
        if invite:
            invite.is_used = True
            self.db.commit()
            self.db.refresh(invite)
        return invite

    def delete(self, invite_uuid: UUID) -> bool:
        """Delete an invite by UUID"""
        invite = self.get_by_uuid(invite_uuid)
        if invite:
            self.db.delete(invite)
            self.db.commit()
            return True
        return False
