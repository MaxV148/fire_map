from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from dependencies.repository_dependencies import get_tag_repository
from infrastructure.postgresql.db import get_db
from domain.user.model import User
from domain.tag.repository import TagRepository
from domain.tag.dto import TagCreate, TagUpdate, TagResponse

# Create router
tag_router = APIRouter(prefix="/tag")


@tag_router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag_data: TagCreate,
    tag_repository: TagRepository = Depends(get_tag_repository),
):
    return tag_repository.create(tag_data)


@tag_router.get("", response_model=List[TagResponse])
def get_all_tags(tag_repository: TagRepository = Depends(get_tag_repository)):
    """Get all tags"""
    return tag_repository.get_all()


@tag_router.get("/{tag_id}", response_model=TagResponse)
def get_tag(
    tag_id: int,
    tag_repository: TagRepository = Depends(get_tag_repository),
):
    """Get a tag by ID"""
    tag = tag_repository.get_by_id(tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found",
        )
    return tag


@tag_router.get("/name/{name}", response_model=TagResponse)
def get_tag_by_name(
    name: str,
    tag_repository: TagRepository = Depends(get_tag_repository),
):
    """Get a tag by name"""
    tag = tag_repository.get_by_name(name)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with name '{name}' not found",
        )
    return tag


@tag_router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: int,
    tag_data: TagUpdate,
    tag_repository: TagRepository = Depends(get_tag_repository),
):
    """Update a tag"""
    updated_tag = tag_repository.update(tag_id, tag_data)
    if not updated_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found",
        )
    return updated_tag


@tag_router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    tag_repository: TagRepository = Depends(get_tag_repository),
):
    """Delete a tag"""
    success = tag_repository.delete(tag_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found",
        )
    return None
