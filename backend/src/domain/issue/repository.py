from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import List, Optional

from src.domain.issue.model import Issue
from src.domain.issue.dto import IssueCreate, IssueUpdate
from src.domain.user.model import User


class IssueRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, issue_data: IssueCreate, current_user: Optional[User] = None) -> Issue:
        """Create a new issue"""
        db_issue = Issue(
            name=issue_data.name,
            description=issue_data.description,
            tag_id=issue_data.tag_id,
            created_by_user_id=current_user.id if current_user else None,
        )

        self.db.add(db_issue)
        self.db.commit()
        self.db.refresh(db_issue)
        return db_issue

    def get_by_id(self, issue_id: int) -> Optional[Issue]:
        """Get an issue by its ID"""
        query = select(Issue).where(Issue.id == issue_id)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_all(self) -> List[Issue]:
        """Get all issues"""
        query = select(Issue)
        result = self.db.execute(query).scalars().all()
        return result

    def get_by_user(self, user_id: int) -> List[Issue]:
        """Get all issues created by a specific user"""
        query = select(Issue).where(Issue.created_by_user_id == user_id)
        result = self.db.execute(query).scalars().all()
        return result

    def get_by_tag(self, tag_id: int) -> List[Issue]:
        """Get all issues with a specific tag"""
        query = select(Issue).where(Issue.tag_id == tag_id)
        result = self.db.execute(query).scalars().all()
        return result

    def update(self, issue_id: int, issue_data: IssueUpdate) -> Optional[Issue]:
        """Update an issue"""
        # First check if the issue exists
        db_issue = self.get_by_id(issue_id)
        if not db_issue:
            return None

        # Prepare update data
        update_data = {}
        if issue_data.name is not None:
            update_data["name"] = issue_data.name
        if issue_data.description is not None:
            update_data["description"] = issue_data.description
        if issue_data.tag_id is not None:
            update_data["tag_id"] = issue_data.tag_id

        # Execute update if there's data to update
        if update_data:
            stmt = update(Issue).where(Issue.id == issue_id).values(**update_data)
            self.db.execute(stmt)
            self.db.commit()
            
            # Refresh the issue object
            return self.get_by_id(issue_id)
        return db_issue

    def delete(self, issue_id: int) -> bool:
        """Delete an issue"""
        # First check if the issue exists
        db_issue = self.get_by_id(issue_id)
        if not db_issue:
            return False

        # Execute delete
        stmt = delete(Issue).where(Issue.id == issue_id)
        self.db.execute(stmt)
        self.db.commit()
        return True 