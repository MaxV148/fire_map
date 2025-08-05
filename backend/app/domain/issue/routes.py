from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from typing import List, Annotated
from sqlalchemy.orm import Session

from infrastructure.postgresql.db import get_db
from domain.user.model import User
from domain.issue.repository import IssueRepository
from domain.issue.dto import IssueCreate, IssueUpdate, IssueResponse, IssueFilter, PaginatedIssueResponse
from dependencies.repository_dependencies import (
    get_issue_repository,
    get_user_repository,
)
from domain.user.repository import UserRepository

# Create router
issue_router = APIRouter(prefix="/issue")


@issue_router.post(
    "", response_model=IssueResponse, status_code=status.HTTP_201_CREATED
)
def create_issue(
    issue_data: IssueCreate,
    request: Request,
    issue_repository: IssueRepository = Depends(get_issue_repository),
    user_repository: UserRepository = Depends(get_user_repository),
):
    """Create a new issue"""
    current_user = user_repository.get_user_by_id(request.state.user_id)
    return issue_repository.create(issue_data, current_user)


@issue_router.get("", response_model=PaginatedIssueResponse)
def get_all_issues(
    filters: Annotated[IssueFilter, Query()],
    issue_repository: IssueRepository = Depends(get_issue_repository),
):
    """Get all issues with optional filtering and pagination"""
    
    # Verwende die Datenbankfilterung für effizientere Abfragen mit Paginierung
    issues, total_count = issue_repository.get_filtered_issues(filters)
    
    # Paginierungsmetadaten berechnen
    total_pages = (total_count + filters.limit - 1) // filters.limit
    
    return PaginatedIssueResponse(
        issues=issues,
        total_count=total_count,
        page=filters.page,
        limit=filters.limit,
        total_pages=total_pages,
    )


@issue_router.get("/{issue_id}", response_model=IssueResponse)
def get_issue(
    issue_id: int,
    issue_repository: IssueRepository = Depends(get_issue_repository),
):
    """Get an issue by ID"""
    issue = issue_repository.get_by_id(issue_id)
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
    issue_repository: IssueRepository = Depends(get_issue_repository),
):
    """Update an issue"""
    updated_issue = issue_repository.update(issue_id, issue_data)
    if not updated_issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {issue_id} not found",
        )
    return updated_issue


@issue_router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int,
    issue_repository: IssueRepository = Depends(get_issue_repository),
):
    """Delete an issue"""
    success = issue_repository.delete(issue_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {issue_id} not found",
        )
    return None
