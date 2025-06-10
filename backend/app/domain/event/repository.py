import loguru
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete, and_
from typing import List, Optional
from geoalchemy2.functions import ST_GeomFromText
from geoalchemy2.shape import to_shape
from geoalchemy2.elements import WKBElement
from datetime import datetime

from domain.event.model import Event
from domain.event.dto import EventCreate, EventUpdate, EventFilter
from domain.user.model import User
from domain.tag.model import Tag
from domain.vehicletype.model import VehicleType


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, event_data: EventCreate, current_user: User) -> Event:
        """Create a new event"""
        # Convert location coordinates to WKT point format
        wkt_point = None
        if event_data.location and len(event_data.location) >= 2:
            lon, lat = event_data.location[0], event_data.location[1]
            wkt_point = f"POINT({lon} {lat})"

        # Create event without tags and vehicles first
        db_event = Event(
            name=event_data.name,
            description=event_data.description,
            location=ST_GeomFromText(wkt_point) if wkt_point else None,
            created_by=current_user.id,
        )

        # Add tags
        if event_data.tag_ids:
            tags = (
                self.db.execute(select(Tag).where(Tag.id.in_(event_data.tag_ids)))
                .scalars()
                .all()
            )
            db_event.tags = tags

        # Add vehicles
        if event_data.vehicle_ids:
            vehicles = (
                self.db.execute(
                    select(VehicleType).where(
                        VehicleType.id.in_(event_data.vehicle_ids)
                    )
                )
                .scalars()
                .all()
            )
            db_event.vehicles = vehicles

        self.db.add(db_event)
        self.db.commit()
        self.db.refresh(db_event)
        return db_event

    def get_by_id(self, event_id: int) -> Optional[Event]:
        """Get an event by its ID"""
        query = select(Event).where(Event.id == event_id)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_filtered_events(self, filters: EventFilter):
        """Get events with database-side filtering"""
        # Basis-Query erstellen
        query = select(Event).distinct()

        # Filter für Fahrzeugtypen anwenden
        if filters.vehicle_ids:
            query = query.join(Event.vehicles).where(
                VehicleType.id.in_(filters.vehicle_ids)
            )

        # Filter für Tags anwenden
        if filters.tag_ids:
            query = query.join(Event.tags).where(Tag.id.in_(filters.tag_ids))

        # Filter für Zeitraum anwenden
        conditions = []
        if filters.start_date:
            conditions.append(Event.created_at >= filters.start_date)
        if filters.end_date:
            conditions.append(Event.created_at <= filters.end_date)

        # Filter für Name anwenden (case-insensitive LIKE)
        if filters.name:
            conditions.append(Event.name.ilike(f"%{filters.name}%"))

        # Filter für Beschreibung anwenden (case-insensitive LIKE)
        if filters.description:
            conditions.append(Event.description.ilike(f"%{filters.description}%"))

        if conditions:
            query = query.where(and_(*conditions))

        result = self.db.execute(query).scalars().all()
        return result

    def get_by_user(self, user_id: int) -> List[Event]:
        """Get all events created by a specific user"""
        query = select(Event).where(Event.created_by == user_id)
        result = self.db.execute(query).scalars().all()
        return result

    def update(self, event_id: int, event_data: EventUpdate) -> Optional[Event]:
        """Update an event"""
        # First check if the event exists
        db_event = self.get_by_id(event_id)
        if not db_event:
            return None

        # Update basic fields
        if event_data.name is not None:
            db_event.name = event_data.name
        if event_data.description is not None:
            db_event.description = event_data.description

        # Handle location update
        if event_data.location is not None:
            if len(event_data.location) >= 2:
                lon, lat = event_data.location[0], event_data.location[1]
                wkt_point = f"POINT({lon} {lat})"
                db_event.location = ST_GeomFromText(wkt_point)
            else:
                db_event.location = None

        # Update tags
        if event_data.tag_ids is not None:
            tags = (
                self.db.execute(select(Tag).where(Tag.id.in_(event_data.tag_ids)))
                .scalars()
                .all()
            )
            db_event.tags = tags

        # Update vehicles
        if event_data.vehicle_ids is not None:
            vehicles = (
                self.db.execute(
                    select(VehicleType).where(
                        VehicleType.id.in_(event_data.vehicle_ids)
                    )
                )
                .scalars()
                .all()
            )
            db_event.vehicles = vehicles

        self.db.commit()
        self.db.refresh(db_event)
        return db_event

    def delete(self, event_id: int) -> bool:
        """Delete an event"""
        # First check if the event exists
        db_event = self.get_by_id(event_id)
        if not db_event:
            return False

        # Execute delete
        stmt = delete(Event).where(Event.id == event_id)
        self.db.execute(stmt)
        self.db.commit()
        return True

    # def get_location_coordinates(self, event: Event) -> Optional[List[float]]:
    #    """Extract coordinates from a geometry point"""
    #    if event.location is None:
    #        return None
    #
    #    point = to_shape(event.location)
    #    return [point.x, point.y]
