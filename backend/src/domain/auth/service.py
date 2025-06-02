from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import Response
import bcrypt


def hash_password(password: str) -> str:
    """
    Hasht ein Passwort mit bcrypt.

    Args:
        password: Das zu hashende Passwort als String

    Returns:
        str: Das gehashte Passwort als String
    """
    if not password:
        raise ValueError("Passwort darf nicht leer sein")

    # Konvertiere das Passwort zu bytes
    password_bytes = password.encode("utf-8")

    # Generiere ein Salt und hashe das Passwort
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)

    # Konvertiere zurück zu String für die Speicherung
    return hashed_password.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifiziert ein Passwort gegen einen Hash.

    Args:
        plain_password: Das Klartext-Passwort
        hashed_password: Der gehashte Passwort-Hash

    Returns:
        bool: True wenn das Passwort korrekt ist, False sonst
    """
    if not plain_password or not hashed_password:
        return False

    try:
        # Konvertiere beide zu bytes für bcrypt
        plain_password_bytes = plain_password.encode("utf-8")
        hashed_password_bytes = hashed_password.encode("utf-8")

        # Verifiziere das Passwort
        return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)
    except Exception:
        # Bei jedem Fehler (z.B. ungültiger Hash) gib False zurück
        return False


def gen_auth_cookie(sid: str):
    res = Response()
    res.set_cookie(key="sid", value=sid, httponly=True, secure=True, max_age=3600)
    return res
