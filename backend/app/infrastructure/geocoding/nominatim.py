"""
Nominatim Geocoding Service für die Umwandlung von Städtenamen zu Koordinaten
Verwendet die kostenlose OpenStreetMap Nominatim API
"""

import httpx
import loguru
from typing import Optional, List, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass
class GeocodeResult:
    """Ergebnis einer Geocoding-Anfrage"""
    latitude: float
    longitude: float
    display_name: str
    city: Optional[str] = None
    country: Optional[str] = None


class NominatimService:
    """Service für Geocoding mit der Nominatim API"""
    
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org"
        self.session = httpx.AsyncClient(
            timeout=10.0,
            headers={
                "User-Agent": "FireMapApp/1.0 (Backend Service)"
            }
        )
        # Einfacher Cache für häufige Anfragen
        self._cache = {}
        self._cache_timeout = timedelta(hours=24)
    
    async def geocode_city(self, city_name: str) -> Optional[GeocodeResult]:
        """
        Konvertiert einen Stadtnamen zu Koordinaten
        
        Args:
            city_name: Name der Stadt
            
        Returns:
            GeocodeResult oder None wenn nicht gefunden
        """
        if not city_name or not city_name.strip():
            return None
            
        city_name = city_name.strip()
        
        # Cache prüfen
        cache_key = f"geocode_{city_name.lower()}"
        if cache_key in self._cache:
            cached_result, timestamp = self._cache[cache_key]
            if datetime.now() - timestamp < self._cache_timeout:
                loguru.logger.debug(f"Geocoding Cache Hit für: {city_name}")
                return cached_result
        
        try:
            params = {
                "q": city_name,
                "format": "json",
                "addressdetails": "1",
                "limit": "1",  # Nur das beste Ergebnis
                "countrycodes": "de,at,ch",  # Fokus auf DACH-Region
                "accept-language": "de"
            }
            
            loguru.logger.info(f"Geocoding Anfrage für Stadt: {city_name}")
            response = await self.session.get(f"{self.base_url}/search", params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if not data or len(data) == 0:
                loguru.logger.warning(f"Keine Geocoding-Ergebnisse für: {city_name}")
                return None
            
            result_data = data[0]
            
            result = GeocodeResult(
                latitude=float(result_data["lat"]),
                longitude=float(result_data["lon"]),
                display_name=result_data["display_name"],
                city=result_data.get("address", {}).get("city") or 
                     result_data.get("address", {}).get("town") or 
                     result_data.get("address", {}).get("village"),
                country=result_data.get("address", {}).get("country")
            )
            
            # Ergebnis cachen
            self._cache[cache_key] = (result, datetime.now())
            
            loguru.logger.info(f"Geocoding erfolgreich: {city_name} -> {result.latitude}, {result.longitude}")
            return result
            
        except httpx.TimeoutException:
            loguru.logger.error(f"Geocoding Timeout für: {city_name}")
            return None
        except httpx.HTTPStatusError as e:
            loguru.logger.error(f"Geocoding HTTP Fehler für {city_name}: {e.response.status_code}")
            return None
        except Exception as e:
            loguru.logger.error(f"Geocoding Fehler für {city_name}: {str(e)}")
            return None
    
    async def reverse_geocode(self, latitude: float, longitude: float) -> Optional[GeocodeResult]:
        """
        Reverse Geocoding: Koordinaten zu Adresse
        
        Args:
            latitude: Breitengrad
            longitude: Längengrad
            
        Returns:
            GeocodeResult oder None wenn nicht gefunden
        """
        try:
            params = {
                "lat": str(latitude),
                "lon": str(longitude),
                "format": "json",
                "addressdetails": "1",
                "accept-language": "de"
            }
            
            response = await self.session.get(f"{self.base_url}/reverse", params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if not data:
                return None
            
            return GeocodeResult(
                latitude=latitude,
                longitude=longitude,
                display_name=data["display_name"],
                city=data.get("address", {}).get("city") or 
                     data.get("address", {}).get("town") or 
                     data.get("address", {}).get("village"),
                country=data.get("address", {}).get("country")
            )
            
        except Exception as e:
            loguru.logger.error(f"Reverse Geocoding Fehler für {latitude}, {longitude}: {str(e)}")
            return None
    
    async def close(self):
        """Schließt die HTTP-Session"""
        await self.session.aclose()


# Singleton-Instanz
_nominatim_service: Optional[NominatimService] = None


def get_nominatim_service() -> NominatimService:
    """Dependency Injection für den Nominatim Service"""
    global _nominatim_service
    if _nominatim_service is None:
        _nominatim_service = NominatimService()
    return _nominatim_service