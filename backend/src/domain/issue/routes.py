from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from typing import List, Annotated
from sqlalchemy.orm import Session

from infrastructure.postgresql.db import get_db
from domain.user.model import User
from domain.issue.repository import IssueRepository
from domain.issue.dto import IssueCreate, IssueUpdate, IssueResponse, IssueFilter

# Create router
issue_router = APIRouter(prefix="/issue")


@issue_router.post(
    "", response_model=IssueResponse, status_code=status.HTTP_201_CREATED
)
def create_issue(
    issue_data: IssueCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Create a new issue"""
    repository = IssueRepository(db)
    current_user = request.state.user
    return repository.create(issue_data, current_user)


@issue_router.get("", response_model=List[IssueResponse])
def get_all_issues(
    filters: Annotated[IssueFilter, Query()],
    db: Session = Depends(get_db),
):
    repository = IssueRepository(db)
    return repository.get_filtered_issues(filters)


@issue_router.get("/{issue_id}", response_model=IssueResponse)
def get_issue(
    issue_id: int,
    db: Session = Depends(get_db),
):
    """Get an issue by ID"""
    repository = IssueRepository(db)
    issue = repository.get_by_id(issue_id)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {issue_id} not found",
        )
    return issue


@issue_router.put("/{issue_id}", response_model=IssueResponse)
def update_issue(
    issue_id: int,
    issue_data: IssueUpdate,
    db: Session = Depends(get_db),
):
    """Update an issue"""
    repository = IssueRepository(db)
    updated_issue = repository.update(issue_id, issue_data)
    if not updated_issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {issue_id} not found",
        )
    return updated_issue


@issue_router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db),
):
    """Delete an issue"""
    repository = IssueRepository(db)
    success = repository.delete(issue_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {issue_id} not found",
        )
    return None
