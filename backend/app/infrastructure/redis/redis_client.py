import loguru
import redis
import json
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from config.config_provider import get_config

config = get_config()

# Redis Client Configuration
client = redis.Redis(
    host=config.redis_host,
    port=config.redis_port,
    db=config.redis_db,
    decode_responses=True,
)


class RedisSessionManager:
    """Redis Session Manager für die Verwaltung von Benutzersitzungen"""

    def __init__(self, redis_client: redis.Redis = client):
        self.redis = redis_client
        self.session_prefix = "session:"
        self.temp_session_prefix = "temp_session:"
        self.user_session_prefix = "user_sessions:"
        self.user_temp_session_prefix = "user_temp_sessions:"
        self.default_expire_time = config.session_expire_seconds

    def create_temp_session(self, user_id: int) -> str:
        session_id = secrets.token_urlsafe(32)
        session_key = f"{self.temp_session_prefix}{session_id}"

        data = {
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "last_accessed": datetime.now().isoformat(),
            "state": "2fa_pending",
        }
        self.redis.setex(
            session_key, config.temp_session_expire_seconds, json.dumps(data)
        )

        user_temp_sessions_key = f"{self.user_temp_session_prefix}{user_id}"
        self.redis.sadd(user_temp_sessions_key, session_id)
        self.redis.expire(user_temp_sessions_key, config.temp_session_expire_seconds)
        return session_id

    def create_session(
        self, user_id: int, session_data: Optional[Dict[str, Any]] = None
    ) -> str:
        session_id = secrets.token_urlsafe(32)
        session_key = f"{self.session_prefix}{session_id}"

        data = {
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "last_accessed": datetime.now().isoformat(),
            "state": "active",
        }

        if session_data:
            data.update(session_data)

        expire = self.default_expire_time
        self.redis.setex(session_key, expire, json.dumps(data))

        # Session zur Benutzerliste hinzufügen
        user_sessions_key = f"{self.user_session_prefix}{user_id}"
        self.redis.sadd(user_sessions_key, session_id)
        self.redis.expire(user_sessions_key, expire)

        return session_id

    def get_temp_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        session_key = f"{self.temp_session_prefix}{session_id}"
        session_data = self.redis.get(session_key)
        loguru.logger.debug(f"Session-Daten: {session_data}")
        if not session_data:
            return None

        try:
            data = json.loads(session_data)

            # Letzten Zugriff aktualisieren
            data["last_accessed"] = datetime.now().isoformat()

            # TTL der Session beibehalten
            ttl = self.redis.ttl(session_key)
            if ttl > 0:
                self.redis.setex(session_key, ttl, json.dumps(data))

            return data
        except json.JSONDecodeError:
            return None

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Ruft Session-Daten ab und aktualisiert den letzten Zugriff

        Args:
            session_id: Die Session-ID

        Returns:
            Session-Daten oder None wenn nicht gefunden/abgelaufen
        """
        session_key = f"{self.session_prefix}{session_id}"
        session_data = self.redis.get(session_key)

        if not session_data:
            return None

        try:
            data = json.loads(session_data)

            # Letzten Zugriff aktualisieren
            data["last_accessed"] = datetime.now().isoformat()

            # TTL der Session beibehalten
            ttl = self.redis.ttl(session_key)
            if ttl > 0:
                self.redis.setex(session_key, ttl, json.dumps(data))

            return data
        except json.JSONDecodeError:
            return None

    def delete_temp_session(self, session_id: str):
        session_key = f"{self.temp_session_prefix}{session_id}"
        session_data = self.redis.get(session_key)
        if session_data:
            try:
                data = json.loads(session_data)
                user_id = data.get("user_id")
                result = self.redis.delete(session_key)
                if user_id:
                    user_temp_sessions_key = f"{self.user_temp_session_prefix}{user_id}"
                    self.redis.srem(user_temp_sessions_key, session_id)
                    return result > 0
            except json.JSONDecodeError:
                pass
        return False

    def delete_session(self, session_id: str) -> bool:
        """
        Löscht eine Session

        Args:
            session_id: Die Session-ID

        Returns:
            True wenn erfolgreich gelöscht
        """
        session_key = f"{self.session_prefix}{session_id}"
        session_data = self.redis.get(session_key)

        if session_data:
            try:
                data = json.loads(session_data)
                user_id = data.get("user_id")

                # Session löschen
                result = self.redis.delete(session_key)

                # Session aus Benutzerliste entfernen
                if user_id:
                    user_sessions_key = f"{self.user_session_prefix}{user_id}"
                    self.redis.srem(user_sessions_key, session_id)

                return result > 0
            except json.JSONDecodeError:
                pass

        return False


session_manager = RedisSessionManager()
