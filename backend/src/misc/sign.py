import hmac
import hashlib
import base64


def sign_invitation_id(invite_uuid: str, secret: str) -> str:
    message = str(invite_uuid).encode("utf-8")
    secret_bytes = secret.encode("utf-8")
    sig = hmac.new(secret_bytes, message, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(sig).decode().rstrip("=")


def verify_invitation_signature(invitation_id: str, sig: str, secret: str) -> bool:
    expected_sig = sign_invitation_id(invitation_id, secret)
    return hmac.compare_digest(expected_sig, sig)


def create_signed_invitation_token(invite_uuid: str, secret: str) -> str:
    """
    Erstellt einen kombinierten Token aus invite_uuid und HMAC-Signatur.
    Format: {invite_uuid}.{signature}
    """
    signature = sign_invitation_id(invite_uuid, secret)
    return f"{invite_uuid}.{signature}"


def verify_signed_invitation_token(token: str, secret: str) -> tuple[bool, str | None]:
    """
    Verifiziert einen kombinierten Invitation Token.

    Returns:
        tuple[bool, str | None]: (is_valid, invite_uuid)
        - is_valid: True wenn der Token gültig ist
        - invite_uuid: Die invite_uuid wenn gültig, sonst None
    """
    try:
        # Token in UUID und Signatur aufteilen
        if "." not in token:
            return False, None

        invite_uuid, provided_signature = token.rsplit(".", 1)

        # Signatur verifizieren
        is_valid = verify_invitation_signature(invite_uuid, provided_signature, secret)

        return is_valid, invite_uuid if is_valid else None

    except (ValueError, IndexError):
        return False, None
