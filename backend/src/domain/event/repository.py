from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import List, Optional
from geoalchemy2.functions import ST_GeomFromText
from geoalchemy2.shape import to_shape

from src.domain.event.model import Event
from src.domain.event.dto import EventCreate, EventUpdate
from src.domain.user.model import User


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self, event_data: EventCreate, current_user: Optional[User] = None
    ) -> Event:
        """Create a new event"""
        # Convert location coordinates to WKT point format
        wkt_point = None
        if event_data.location and len(event_data.location) >= 2:
            lon, lat = event_data.location[0], event_data.location[1]
            wkt_point = f"POINT({lon} {lat})"

        db_event = Event(
            name=event_data.name,
            description=event_data.description,
            location=ST_GeomFromText(wkt_point),
            tag_id=event_data.tag_id,
            vehicle_id=event_data.vehicle_id,
            created_by=current_user.id,
        )

        self.db.add(db_event)
        self.db.commit()
        self.db.refresh(db_event)
        return db_event

    def get_by_id(self, event_id: int) -> Optional[Event]:
        """Get an event by its ID"""
        query = select(Event).where(Event.id == event_id)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_all(self) -> List[Event]:
        """Get all events"""
        query = select(Event)
        result = self.db.execute(query).scalars().all()
        return result

    def get_by_user(self, user_id: int) -> List[Event]:
        """Get all events created by a specific user"""
        query = select(Event).where(Event.created_by == user_id)
        result = self.db.execute(query).scalars().all()
        return result

    def get_by_tag(self, tag_id: int) -> List[Event]:
        """Get all events with a specific tag"""
        query = select(Event).where(Event.tag_id == tag_id)
        result = self.db.execute(query).scalars().all()
        return result

    def get_by_vehicle(self, vehicle_id: int) -> List[Event]:
        """Get all events with a specific vehicle type"""
        query = select(Event).where(Event.vehicle_id == vehicle_id)
        result = self.db.execute(query).scalars().all()
        return result

    def update(self, event_id: int, event_data: EventUpdate) -> Optional[Event]:
        """Update an event"""
        # First check if the event exists
        db_event = self.get_by_id(event_id)
        if not db_event:
            return None

        # Prepare update data
        update_data = {}
        if event_data.name is not None:
            update_data["name"] = event_data.name
        if event_data.description is not None:
            update_data["description"] = event_data.description
        if event_data.tag_id is not None:
            update_data["tag_id"] = event_data.tag_id
        if event_data.vehicle_id is not None:
            update_data["vehicle_id"] = event_data.vehicle_id

        # Handle location update
        if event_data.location is not None:
            if len(event_data.location) >= 2:
                lon, lat = event_data.location[0], event_data.location[1]
                wkt_point = f"POINT({lon} {lat})"
                update_data["location"] = ST_GeomFromText(wkt_point)
            else:
                update_data["location"] = None

        # Execute update if there's data to update
        if update_data:
            stmt = update(Event).where(Event.id == event_id).values(**update_data)
            self.db.execute(stmt)
            self.db.commit()

            # Refresh the event object
            return self.get_by_id(event_id)
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

    def get_location_coordinates(self, event: Event) -> Optional[List[float]]:
        """Extract coordinates from a geometry point"""
        if event.location is None:
            return None

        point = to_shape(event.location)
        return [point.x, point.y]
