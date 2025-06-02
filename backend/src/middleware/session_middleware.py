from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import HTTPException, status
from loguru import logger
from infrastructure.redis.redis_client import session_manager


class SessionMiddleware(BaseHTTPMiddleware):
    """
    Session-Middleware für die Überprüfung von Sitzungen aus Cookies.

    Diese Middleware prüft für alle Routen außer Auth-Routen die Session-ID
    aus dem 'sid'-Cookie, validiert diese gegen Redis und setzt die user_id
    im Request-State.
    """

    def __init__(self, app, excluded_paths: list[str] = None):
        super().__init__(app)
        # Standard ausgeschlossene Pfade (Auth-Routen)
        # self.excluded_paths = excluded_paths or ["/v1/auth/", "/docs", "/redoc", "/openapi.json"]

    async def dispatch(self, request: Request, call_next):
        """
        Verarbeitet eingehende Requests und prüft Session-Validität.

        Args:
            request: Der eingehende HTTP-Request
            call_next: Die nächste Middleware/Route in der Pipeline

        Returns:
            Response: Die HTTP-Antwort
        """
        # Überprüfen ob der Pfad ausgeschlossen ist
        # if self._is_excluded_path(request.url.path):
        #     logger.debug(f"Überspringe Session-Prüfung für ausgeschlossenen Pfad: {request.url.path}")
        #     return await call_next(request)

        # Session-ID aus Cookie extrahieren
        session_id = request.cookies.get("sid")

        if not session_id:
            logger.warning(f"Keine Session-ID im Cookie für Pfad: {request.url.path}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Keine gültige Session gefunden. Bitte melden Sie sich an.",
            )

        # Session in Redis validieren
        session_data = session_manager.get_session(session_id)

        if not session_data:
            logger.warning(f"Ungültige oder abgelaufene Session-ID: {session_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session ist ungültig oder abgelaufen. Bitte melden Sie sich erneut an.",
            )

        # User-ID aus Session-Daten extrahieren
        user_id = session_data.get("user_id")

        if not user_id:
            logger.error(f"Session-Daten enthalten keine user_id: {session_data}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Fehlerhafte Session-Daten.",
            )

        # User-ID im Request-State setzen
        request.state.user_id = user_id
        logger.debug(
            f"Session validiert für Benutzer {user_id} auf Pfad {request.url.path}"
        )

        # Weiter zur nächsten Middleware/Route
        response = await call_next(request)

        return response

    def _is_excluded_path(self, path: str) -> bool:
        """
        Prüft ob ein Pfad von der Session-Prüfung ausgeschlossen ist.

        Args:
            path: Der zu prüfende URL-Pfad

        Returns:
            bool: True wenn der Pfad ausgeschlossen ist, False sonst
        """
        return any(path.startswith(excluded) for excluded in self.excluded_paths)
