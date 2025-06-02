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
from domain.event.dto import EventCreate, EventUpdate, EventResponse, EventFilter

from domain.user.repository import UserRepository

# Create router
event_router = APIRouter(prefix="/event")


@event_router.post(
    "", response_model=EventResponse, status_code=status.HTTP_201_CREATED
)
def create_event(
    event_data: EventCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    repository = EventRepository(db)
    loguru.logger.info(f"Event data: {request.state.user.first_name}")
    event = repository.create(event_data, request.state.user)
    return event


@event_router.get("", response_model=List[EventResponse])
def get_all_events(
    filters: Annotated[EventFilter, Query()],
    db: Session = Depends(get_db),
):
    """Get all events with optional filtering"""
    repository = EventRepository(db)

    # Verwende die Datenbankfilterung für effizientere Abfragen
    events = repository.get_filtered_events(filters)

    return events


@event_router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    """Get an event by ID"""
    repository = EventRepository(db)
    event = repository.get_by_id(event_id)
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
    db: Session = Depends(get_db),
):
    current_user = request.state.user
    """Update an event"""
    repository = EventRepository(db)

    # Zuerst prüfen, ob das Event existiert
    event = repository.get_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} not found",
        )

    # Prüfen, ob der Benutzer berechtigt ist (Ersteller oder Admin)
    if event.created_by != current_user.id and not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sie haben keine Berechtigung, dieses Event zu bearbeiten",
        )

    updated_event = repository.update(event_id, event_data)

    return updated_event


@event_router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """Delete an event"""
    repository = EventRepository(db)
    user_repo = UserRepository(db)
    current_user = user_repo.get_user_by_id(request.state.user_id)

    # Zuerst prüfen, ob das Event existiert
    event = repository.get_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} not found",
        )

    # Prüfen, ob der Benutzer berechtigt ist (Ersteller oder Admin)
    if event.created_by != current_user.id and not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sie haben keine Berechtigung, dieses Event zu löschen",
        )

    # Event löschen
    repository.delete(event_id)
    return None
