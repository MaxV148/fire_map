import loguru
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from typing import List, Optional, Annotated
from sqlalchemy.orm import Session
from datetime import datetime
from geoalchemy2.elements import WKBElement, WKTElement

from infrastructure.postgresql.db import get_db
from domain.user.dependency import is_admin
from domain.user.model import User
from domain.event.repository import EventRepository
from dependencies.repository_dependencies import (
    get_event_repository,
    get_user_repository,
)
from domain.event.dto import EventCreate, EventUpdate, EventResponse, EventFilter, PaginatedEventResponse

from domain.user.repository import UserRepository

# Create router
event_router = APIRouter(prefix="/event")


@event_router.post(
    "", response_model=EventResponse, status_code=status.HTTP_201_CREATED
)
def create_event(
    event_data: EventCreate,
    request: Request,
    event_repository: EventRepository = Depends(get_event_repository),
    user_repository: UserRepository = Depends(get_user_repository),
):
    current_user = user_repository.get_user_by_id(request.state.user_id)
    event = event_repository.create(event_data, current_user)
    return event


@event_router.get("", response_model=PaginatedEventResponse)
async def get_all_events(
    filters: Annotated[EventFilter, Query()],
    event_repository: EventRepository = Depends(get_event_repository),
):
    """Get all events with optional filtering and pagination"""

    # Verwende die Datenbankfilterung für effizientere Abfragen mit Paginierung
    events, total_count = await event_repository.get_filtered_events(filters)

    # Paginierungsmetadaten berechnen
    total_pages = (total_count + filters.limit - 1) // filters.limit

    return PaginatedEventResponse(
        events=events,
        total_count=total_count,
        page=filters.page,
        limit=filters.limit,
        total_pages=total_pages,
    )


@event_router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    event_repository: EventRepository = Depends(get_event_repository),
):
    """Get an event by ID"""
    event = event_repository.get_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} not found",
        )

    # Convert the location from WKBElement to a list of coordinates
    # if event.location is not None and isinstance(event.location, (WKBElement, WKTElement)):
    #    event.location = repository.get_location_coordinates(event)

    return event


@event_router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_data: EventUpdate,
    request: Request,
    event_repository: EventRepository = Depends(get_event_repository),
    user_repository: UserRepository = Depends(get_user_repository),
):
    current_user = user_repository.get_user_by_id(request.state.user_id)

    event = event_repository.get_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} not found",
        )

    if event.created_by != current_user.id and not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sie haben keine Berechtigung, dieses Event zu bearbeiten",
        )

    updated_event = event_repository.update(event_id, event_data)

    return updated_event


@event_router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    request: Request,
    event_repository: EventRepository = Depends(get_event_repository),
    user_repository: UserRepository = Depends(get_user_repository),
):
    current_user = user_repository.get_user_by_id(request.state.user_id)

    event = event_repository.get_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} not found",
        )

    if event.created_by != current_user.id and not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sie haben keine Berechtigung, dieses Event zu löschen",
        )

    event_repository.delete(event_id)
    return None
