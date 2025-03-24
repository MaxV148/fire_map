from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import List, Optional

from src.domain.tag.model import Tag
from src.domain.tag.dto import TagCreate, TagUpdate


class TagRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, tag_data: TagCreate) -> Tag:
        """Create a new tag"""
        db_tag = Tag(
            name=tag_data.name,
        )

        self.db.add(db_tag)
        self.db.commit()
        self.db.refresh(db_tag)
        return db_tag

    def get_by_id(self, tag_id: int) -> Optional[Tag]:
        """Get a tag by its ID"""
        query = select(Tag).where(Tag.id == tag_id)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_by_name(self, name: str) -> Optional[Tag]:
        """Get a tag by its name"""
        query = select(Tag).where(Tag.name == name)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_all(self) -> List[Tag]:
        """Get all tags"""
        query = select(Tag)
        result = self.db.execute(query).scalars().all()
        return result

    def update(self, tag_id: int, tag_data: TagUpdate) -> Optional[Tag]:
        """Update a tag"""
        # First check if the tag exists
        db_tag = self.get_by_id(tag_id)
        if not db_tag:
            return None

        # Prepare update data
        update_data = {}
        if tag_data.name is not None:
            update_data["name"] = tag_data.name

        # Execute update if there's data to update
        if update_data:
            stmt = update(Tag).where(Tag.id == tag_id).values(**update_data)
            self.db.execute(stmt)
            self.db.commit()

            # Refresh the tag object
            return self.get_by_id(tag_id)
        return db_tag

    def delete(self, tag_id: int) -> bool:
        """Delete a tag"""
        # First check if the tag exists
        db_tag = self.get_by_id(tag_id)
        if not db_tag:
            return False

        # Execute delete
        stmt = delete(Tag).where(Tag.id == tag_id)
        self.db.execute(stmt)
        self.db.commit()
        return True
