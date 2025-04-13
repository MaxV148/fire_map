from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import List, Optional
from geoalchemy2.functions import ST_GeomFromText
from geoalchemy2.shape import to_shape
import json

from src.domain.issue.model import Issue
from src.domain.issue.dto import IssueCreate, IssueUpdate
from src.domain.user.model import User
from src.domain.tag.model import Tag


class IssueRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_location_coordinates(self, issue: Issue) -> Optional[List[float]]:
        """Extract coordinates from a geometry point"""
        if issue.location is None:
            return None

        point = to_shape(issue.location)
        return [point.x, point.y]

    def create(
        self, issue_data: IssueCreate, current_user: Optional[User] = None
    ) -> Issue:
        """Create a new issue"""
        # Convert coordinates to PostGIS geometry if provided
        location = None
        if issue_data.location:
            location = ST_GeomFromText(
                f"POINT({issue_data.location[0]} {issue_data.location[1]})"
            )

        # Create the issue
        db_issue = Issue(
            name=issue_data.name,
            description=issue_data.description,
            created_by_user_id=current_user.id if current_user else None,
            location=location,
        )

        # Add tags if provided
        if issue_data.tag_ids:
            tags = self.db.query(Tag).filter(Tag.id.in_(issue_data.tag_ids)).all()
            db_issue.tags = tags

        self.db.add(db_issue)
        self.db.commit()
        self.db.refresh(db_issue)

        # Convert location to coordinates before returning
        db_issue.location = self.get_location_coordinates(db_issue)
        return db_issue

    def get_by_id(self, issue_id: int) -> Optional[Issue]:
        """Get an issue by its ID"""
        query = select(Issue).where(Issue.id == issue_id)
        result = self.db.execute(query).scalar_one_or_none()
        if result:
            result.location = self.get_location_coordinates(result)
        return result

    def get_all(self) -> List[Issue]:
        """Get all issues"""
        query = select(Issue)
        result = self.db.execute(query).scalars().all()
        for issue in result:
            issue.location = self.get_location_coordinates(issue)
        return result

    def get_by_user(self, user_id: int) -> List[Issue]:
        """Get all issues created by a specific user"""
        query = select(Issue).where(Issue.created_by_user_id == user_id)
        result = self.db.execute(query).scalars().all()
        for issue in result:
            issue.location = self.get_location_coordinates(issue)
        return result

    def get_by_tag(self, tag_id: int) -> List[Issue]:
        """Get all issues with a specific tag"""
        query = select(Issue).join(Issue.tags).where(Tag.id == tag_id)
        result = self.db.execute(query).scalars().all()
        for issue in result:
            issue.location = self.get_location_coordinates(issue)
        return result

    def update(self, issue_id: int, issue_data: IssueUpdate) -> Optional[Issue]:
        """Update an issue"""
        # First check if the issue exists
        db_issue = self.get_by_id(issue_id)
        if not db_issue:
            return None

        # Update basic fields
        if issue_data.name is not None:
            db_issue.name = issue_data.name
        if issue_data.description is not None:
            db_issue.description = issue_data.description

        # Update location if provided
        if issue_data.location is not None:
            db_issue.location = ST_GeomFromText(
                f"POINT({issue_data.location[0]} {issue_data.location[1]})"
            )

        # Update tags if provided
        if issue_data.tag_ids is not None:
            tags = self.db.query(Tag).filter(Tag.id.in_(issue_data.tag_ids)).all()
            db_issue.tags = tags

        self.db.commit()
        self.db.refresh(db_issue)

        # Convert location to coordinates before returning
        db_issue.location = self.get_location_coordinates(db_issue)
        return db_issue

    def delete(self, issue_id: int) -> bool:
        """Delete an issue"""
        # First check if the issue exists
        db_issue = self.get_by_id(issue_id)
        if not db_issue:
            return False

        # Execute delete
        self.db.delete(db_issue)
        self.db.commit()
        return True
