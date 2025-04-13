from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Annotated
from sqlalchemy.orm import Session
from datetime import datetime

from src.infrastructure.postgresql.db import get_db
from src.domain.user.dependency import get_current_user, is_admin
from src.domain.user.model import User
from src.domain.event.repository import EventRepository
from src.domain.event.dto import EventCreate, EventUpdate, EventResponse, EventFilter

# Create router
event_router = APIRouter(prefix="/event")


@event_router.post(
    "", response_model=EventResponse, status_code=status.HTTP_201_CREATED
)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new event"""

    repository = EventRepository(db)
    event = repository.create(event_data, current_user)

    # Convert the location from WKBElement to a list of coordinates
    if event.location is not None:
        event.location = repository.get_location_coordinates(event)

    return event


@event_router.get("", response_model=List[EventResponse])
def get_all_events(
    filters: Annotated[EventFilter, Query()],
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get all events with optional filtering"""
    repository = EventRepository(db)

    # Verwende die Datenbankfilterung für effizientere Abfragen
    events = repository.get_filtered_events(filters)

    # Convert the location from WKBElement to a list of coordinates for each event
    for event in events:
        if event.location is not None:
            event.location = repository.get_location_coordinates(event)

    return events


@event_router.get("/user/{user_id}", response_model=List[EventResponse])
def get_events_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all events created by a specific user"""
    repository = EventRepository(db)
    events = repository.get_by_user(user_id)

    # Convert the location from WKBElement to a list of coordinates for each event
    for event in events:
        if event.location is not None:
            event.location = repository.get_location_coordinates(event)

    return events


@event_router.get("/tag/{tag_id}", response_model=List[EventResponse])
def get_events_by_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all events with a specific tag"""
    repository = EventRepository(db)
    events = repository.get_by_tag(tag_id)

    # Convert the location from WKBElement to a list of coordinates for each event
    for event in events:
        if event.location is not None:
            event.location = repository.get_location_coordinates(event)

    return events


@event_router.get("/vehicle/{vehicle_id}", response_model=List[EventResponse])
def get_events_by_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all events with a specific vehicle type"""
    repository = EventRepository(db)
    events = repository.get_by_vehicle(vehicle_id)

    # Convert the location from WKBElement to a list of coordinates for each event
    for event in events:
        if event.location is not None:
            event.location = repository.get_location_coordinates(event)

    return events


@event_router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    if event.location is not None:
        event.location = repository.get_location_coordinates(event)

    return event


@event_router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    # Event aktualisieren
    updated_event = repository.update(event_id, event_data)

    # Convert the location from WKBElement to a list of coordinates
    if updated_event.location is not None:
        updated_event.location = repository.get_location_coordinates(updated_event)

    return updated_event


@event_router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an event"""
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
            detail="Sie haben keine Berechtigung, dieses Event zu löschen",
        )

    # Event löschen
    repository.delete(event_id)
    return None
