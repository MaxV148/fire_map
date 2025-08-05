"""Geocoding infrastructure module"""

from .nominatim import NominatimService, GeocodeResult, get_nominatim_service

__all__ = ["NominatimService", "GeocodeResult", "get_nominatim_service"]