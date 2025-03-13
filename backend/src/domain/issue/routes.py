from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from src.infrastructure.postgresql.db import get_db
from src.domain.user.dependency import get_current_user
from src.domain.user.model import User
from src.domain.issue.repository import IssueRepository
from src.domain.issue.dto import IssueCreate, IssueUpdate, IssueResponse

# Create router
issue_router = APIRouter(prefix="/issue")


@issue_router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def create_issue(
    issue_data: IssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new issue"""
    repository = IssueRepository(db)
    return repository.create(issue_data, current_user)


@issue_router.get("", response_model=List[IssueResponse])
def get_all_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all issues"""
    repository = IssueRepository(db)
    return repository.get_all()


@issue_router.get("/user/{user_id}", response_model=List[IssueResponse])
def get_issues_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all issues created by a specific user"""
    repository = IssueRepository(db)
    return repository.get_by_user(user_id)


@issue_router.get("/tag/{tag_id}", response_model=List[IssueResponse])
def get_issues_by_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all issues with a specific tag"""
    repository = IssueRepository(db)
    return repository.get_by_tag(tag_id)


@issue_router.get("/{issue_id}", response_model=IssueResponse)
def get_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get an issue by ID"""
    repository = IssueRepository(db)
    issue = repository.get_by_id(issue_id)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {issue_id} not found"
        )
    return issue


@issue_router.put("/{issue_id}", response_model=IssueResponse)
def update_issue(
    issue_id: int,
    issue_data: IssueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an issue"""
    repository = IssueRepository(db)
    updated_issue = repository.update(issue_id, issue_data)
    if not updated_issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {issue_id} not found"
        )
    return updated_issue


@issue_router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an issue"""
    repository = IssueRepository(db)
    success = repository.delete(issue_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {issue_id} not found"
        )
    return None 