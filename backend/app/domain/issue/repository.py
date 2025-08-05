from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete, and_, func
from typing import List, Optional, Tuple
from geoalchemy2.functions import ST_GeomFromText
from geoalchemy2.shape import to_shape
import json

from domain.issue.model import Issue
from domain.issue.dto import IssueCreate, IssueUpdate, IssueFilter
from domain.user.model import User
from domain.tag.model import Tag


class IssueRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self, issue_data: IssueCreate, current_user: Optional[User] = None
    ) -> Issue:
        """Create a new issue"""
        # Convert coordinates to PostGIS geometry if provided
        wkt_point = None
        if issue_data.location and len(issue_data.location) >= 2:
            lon, lat = issue_data.location[0], issue_data.location[1]
            wkt_point = f"POINT({lon} {lat})"

        # Create the issue
        db_issue = Issue(
            name=issue_data.name,
            description=issue_data.description,
            created_by_user_id=current_user.id if current_user else None,
            location=ST_GeomFromText(wkt_point) if wkt_point else None,
        )

        # Add tags if provided
        if issue_data.tag_ids:
            tags = self.db.query(Tag).filter(Tag.id.in_(issue_data.tag_ids)).all()
            db_issue.tags = tags

        self.db.add(db_issue)
        self.db.commit()
        self.db.refresh(db_issue)

        # Convert location to coordinates before returning
        return db_issue

    def get_by_id(self, issue_id: int) -> Optional[Issue]:
        """Get an issue by its ID"""
        query = select(Issue).where(Issue.id == issue_id)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_filtered_issues(self, filter: IssueFilter) -> Tuple[List[Issue], int]:
        """Get filtered issues with pagination and total count"""
        query = select(Issue)
        if filter.tag_ids:
            query = query.join(Issue.tags).where(Tag.id.in_(filter.tag_ids))

        conditions = []
        if filter.start_date:
            conditions.append(Issue.created_at >= filter.start_date)
        if filter.end_date:
            conditions.append(Issue.created_at <= filter.end_date)

        # Filter für Name anwenden (case-insensitive LIKE)
        if filter.name:
            conditions.append(Issue.name.ilike(f"%{filter.name}%"))

        # Filter für Beschreibung anwenden (case-insensitive LIKE)
        if filter.description:
            conditions.append(Issue.description.ilike(f"%{filter.description}%"))

        if conditions:
            query = query.where(and_(*conditions))

        # Paginierung anwenden
        offset = (filter.page - 1) * filter.limit
        paginated_query = query.offset(offset).limit(filter.limit)
        
        # Issues abrufen
        issues = self.db.execute(paginated_query).scalars().all()
        
        # Gesamtanzahl der Issues ermitteln (ohne Paginierung)
        # Bei Joins müssen wir distinct verwenden, um doppelte Zählungen zu vermeiden
        if filter.tag_ids:
            count_query = select(func.count(Issue.id.distinct()))
            count_query = count_query.join(Issue.tags).where(Tag.id.in_(filter.tag_ids))
            if conditions:
                count_query = count_query.where(and_(*conditions))
        else:
            count_query = select(func.count(Issue.id))
            if conditions:
                count_query = count_query.where(and_(*conditions))
        
        total_count = self.db.execute(count_query).scalar()
        
        return issues, total_count

    def get_by_user(self, user_id: int) -> List[Issue]:
        """Get all issues created by a specific user"""
        query = select(Issue).where(Issue.created_by_user_id == user_id)
        result = self.db.execute(query).scalars().all()
        for issue in result:
            issue.location = self.get_location_coordinates(issue)
        return result

    def get_by_tag(self, tag_id: int):
        """Get all issues with a specific tag"""
        query = select(Issue).join(Issue.tags).where(Tag.id == tag_id)
        result = self.db.execute(query).scalars().all()

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
