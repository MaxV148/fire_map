from fastapi import Request, HTTPException, status
from typing import Annotated
from fastapi import Depends


def get_current_user_id(request: Request) -> int:
    """
    Extrahiert die user_id aus dem Request-State.

    Diese Dependency sollte in geschützten Routen verwendet werden,
    um die Benutzer-ID zu erhalten, die von der SessionMiddleware
    im Request-State gesetzt wurde.

    Args:
        request: Der FastAPI Request-Objektv

    Returns:
        int: Die Benutzer-ID

    Raises:
        HTTPException: Wenn keine user_id im Request-State gefunden wurde
    """
    user_id = getattr(request.state, "user_id", None)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Benutzer-ID nicht im Request-State gefunden. Middleware-Fehler.",
        )

    return user_id


# Type alias für die Dependency
CurrentUserId = Annotated[int, Depends(get_current_user_id)]
