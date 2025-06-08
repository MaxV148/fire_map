import pytest
import hmac
import hashlib
import base64
from unittest.mock import patch

from backend.src.misc.sign import (
    sign_invitation_id,
    verify_invitation_signature,
    create_signed_invitation_token,
    verify_signed_invitation_token,
)


class TestSignInvitationId:
    """Tests für die sign_invitation_id Funktion"""

    def test_sign_invitation_id_basic(self):
        """Test grundlegende Signatur-Erstellung"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        signature = sign_invitation_id(invite_uuid, secret)

        # Prüfe dass eine Signatur zurückgegeben wird
        assert signature is not None
        assert isinstance(signature, str)
        assert len(signature) > 0

    def test_sign_invitation_id_consistency(self):
        """Test dass gleiche Eingaben gleiche Signaturen erzeugen"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        signature1 = sign_invitation_id(invite_uuid, secret)
        signature2 = sign_invitation_id(invite_uuid, secret)

        assert signature1 == signature2

    def test_sign_invitation_id_different_secrets(self):
        """Test dass verschiedene Secrets verschiedene Signaturen erzeugen"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret1 = "secret_key_1"
        secret2 = "secret_key_2"

        signature1 = sign_invitation_id(invite_uuid, secret1)
        signature2 = sign_invitation_id(invite_uuid, secret2)

        assert signature1 != signature2

    def test_sign_invitation_id_different_uuids(self):
        """Test dass verschiedene UUIDs verschiedene Signaturen erzeugen"""
        invite_uuid1 = "123e4567-e89b-12d3-a456-426614174000"
        invite_uuid2 = "987fcdeb-51a2-43d7-8f9e-123456789abc"
        secret = "test_secret_key"

        signature1 = sign_invitation_id(invite_uuid1, secret)
        signature2 = sign_invitation_id(invite_uuid2, secret)

        assert signature1 != signature2

    def test_sign_invitation_id_empty_uuid(self):
        """Test Verhalten mit leerer UUID"""
        invite_uuid = ""
        secret = "test_secret_key"

        signature = sign_invitation_id(invite_uuid, secret)

        assert signature is not None
        assert isinstance(signature, str)

    def test_sign_invitation_id_empty_secret(self):
        """Test Verhalten mit leerem Secret"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret = ""

        signature = sign_invitation_id(invite_uuid, secret)

        assert signature is not None
        assert isinstance(signature, str)

    def test_sign_invitation_id_unicode_handling(self):
        """Test Umgang mit Unicode-Zeichen"""
        invite_uuid = "üöä-test-123"
        secret = "test_sëcret_kéy"

        signature = sign_invitation_id(invite_uuid, secret)

        assert signature is not None
        assert isinstance(signature, str)

    def test_sign_invitation_id_long_inputs(self):
        """Test mit sehr langen Eingaben"""
        invite_uuid = "a" * 1000
        secret = "b" * 500

        signature = sign_invitation_id(invite_uuid, secret)

        assert signature is not None
        assert isinstance(signature, str)

    def test_sign_invitation_id_url_safe_encoding(self):
        """Test dass die Signatur URL-safe Base64 verwendet"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        signature = sign_invitation_id(invite_uuid, secret)

        # URL-safe Base64 sollte keine +, / oder = enthalten
        assert "+" not in signature
        assert "/" not in signature
        assert "=" not in signature

    def test_sign_invitation_id_manual_verification(self):
        """Test durch manuelle HMAC-Berechnung"""
        invite_uuid = "test_uuid"
        secret = "test_secret"

        # Manuelle HMAC-Berechnung
        message = str(invite_uuid).encode("utf-8")
        secret_bytes = secret.encode("utf-8")
        expected_sig = hmac.new(secret_bytes, message, hashlib.sha256).digest()
        expected_signature = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")

        actual_signature = sign_invitation_id(invite_uuid, secret)

        assert actual_signature == expected_signature


class TestVerifyInvitationSignature:
    """Tests für die verify_invitation_signature Funktion"""

    def test_verify_invitation_signature_valid_signature(self):
        """Test mit gültiger Signatur"""
        invitation_id = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        # Erstelle eine gültige Signatur
        valid_signature = sign_invitation_id(invitation_id, secret)

        # Test dass die Verifikation erfolgreich ist
        result = verify_invitation_signature(invitation_id, valid_signature, secret)
        assert result is True

    def test_verify_invitation_signature_invalid_signature(self):
        """Test mit ungültiger Signatur"""
        invitation_id = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"
        invalid_signature = "invalid_signature"

        result = verify_invitation_signature(invitation_id, invalid_signature, secret)
        assert result is False

    def test_verify_invitation_signature_wrong_secret(self):
        """Test mit falschem Secret"""
        invitation_id = "123e4567-e89b-12d3-a456-426614174000"
        correct_secret = "correct_secret"
        wrong_secret = "wrong_secret"

        # Erstelle Signatur mit korrektem Secret
        signature = sign_invitation_id(invitation_id, correct_secret)

        # Verifikation mit falschem Secret sollte fehlschlagen
        result = verify_invitation_signature(invitation_id, signature, wrong_secret)
        assert result is False

    def test_verify_invitation_signature_empty_inputs(self):
        """Test mit leeren Eingaben"""
        # Erstelle die erwartete Signatur für leere Eingaben
        expected_signature = sign_invitation_id("", "")
        result = verify_invitation_signature("", expected_signature, "")
        assert result is True  # Leere Eingaben mit korrekter Signatur

    def test_verify_invitation_signature_timing_attack_resistance(self):
        """Test dass hmac.compare_digest verwendet wird (Timing-Attack-Schutz)"""
        invitation_id = "test_id"
        secret = "test_secret"
        signature = "test_sig"

        with patch("hmac.compare_digest") as mock_compare:
            mock_compare.return_value = True

            verify_invitation_signature(invitation_id, signature, secret)

            # Prüfe dass hmac.compare_digest aufgerufen wurde
            mock_compare.assert_called_once()

    def test_verify_invitation_signature_consistency(self):
        """Test dass mehrfache Verifikation konsistent ist"""
        invitation_id = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        signature = sign_invitation_id(invitation_id, secret)

        # Mehrfache Verifikation sollte immer das gleiche Ergebnis liefern
        result1 = verify_invitation_signature(invitation_id, signature, secret)
        result2 = verify_invitation_signature(invitation_id, signature, secret)
        result3 = verify_invitation_signature(invitation_id, signature, secret)

        assert result1 == result2 == result3 == True


class TestIntegration:
    """Integrationstests für beide Funktionen zusammen"""

    def test_sign_and_verify_integration_with_correct_secret(self):
        """Test vollständiger Zyklus mit korrektem Secret"""
        invitation_id = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        # Erstelle Signatur
        signature = sign_invitation_id(invitation_id, secret)

        # Test dass Verifikation erfolgreich ist
        result = verify_invitation_signature(invitation_id, signature, secret)
        assert result is True

    def test_sign_and_verify_integration_with_wrong_secret(self):
        """Test vollständiger Zyklus mit falschem Secret"""
        invitation_id = "123e4567-e89b-12d3-a456-426614174000"
        correct_secret = "correct_secret"
        wrong_secret = "wrong_secret"

        # Erstelle Signatur mit korrektem Secret
        signature = sign_invitation_id(invitation_id, correct_secret)

        # Test dass Verifikation mit falschem Secret fehlschlägt
        result = verify_invitation_signature(invitation_id, signature, wrong_secret)
        assert result is False

    def test_sign_and_verify_multiple_combinations(self):
        """Test mit verschiedenen Kombinationen von IDs und Secrets"""
        test_cases = [
            ("uuid1", "secret1"),
            ("uuid2", "secret2"),
            ("short", "s"),
            ("very-long-uuid-with-many-characters", "very-long-secret-key"),
            ("", "empty_uuid_test"),
            ("empty_secret_test", ""),
        ]

        for invitation_id, secret in test_cases:
            # Erstelle und verifiziere Signatur
            signature = sign_invitation_id(invitation_id, secret)
            result = verify_invitation_signature(invitation_id, signature, secret)
            assert result is True, (
                f"Failed for invitation_id='{invitation_id}', secret='{secret}'"
            )


class TestEdgeCases:
    """Tests für Edge Cases und Fehlerbehandlung"""

    def test_type_validation(self):
        """Test mit verschiedenen Datentypen"""
        # None-Werte im UUID werden zu "None" String konvertiert
        signature1 = sign_invitation_id(None, "secret")
        signature2 = sign_invitation_id("None", "secret")

        # Beide sollten identisch sein, da str(None) = "None"
        assert signature1 == signature2

        # Test mit None als Secret sollte einen AttributeError auslösen
        with pytest.raises(AttributeError):
            sign_invitation_id("uuid", None)

    def test_numeric_inputs(self):
        """Test mit numerischen Eingaben (werden zu String konvertiert)"""
        invite_uuid = 123456
        secret = "test_secret"

        signature = sign_invitation_id(invite_uuid, secret)

        assert signature is not None
        assert isinstance(signature, str)

    def test_signature_format_validation(self):
        """Test dass Signaturen das erwartete Format haben"""
        invite_uuid = "test_uuid"
        secret = "test_secret"

        signature = sign_invitation_id(invite_uuid, secret)

        # Base64 URL-safe ohne Padding sollte nur diese Zeichen enthalten
        valid_chars = set(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        )
        signature_chars = set(signature)

        assert signature_chars.issubset(valid_chars)

    def test_signature_length_consistency(self):
        """Test dass Signaturen konsistente Länge haben"""
        signatures = []

        for i in range(10):
            uuid = f"test_uuid_{i}"
            secret = f"test_secret_{i}"
            signature = sign_invitation_id(uuid, secret)
            signatures.append(signature)

        # Alle Signaturen sollten die gleiche Länge haben (SHA256 -> 32 Bytes -> 43 Zeichen ohne Padding)
        lengths = [len(sig) for sig in signatures]
        assert len(set(lengths)) == 1  # Alle Längen sind gleich
        assert lengths[0] == 43  # SHA256 in Base64 ohne Padding


class TestSignedInvitationToken:
    """Tests für die kombinierten Invitation Token Funktionen"""

    def test_create_signed_invitation_token_basic(self):
        """Test grundlegende Token-Erstellung"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        token = create_signed_invitation_token(invite_uuid, secret)

        # Token sollte aus UUID und Signatur bestehen, getrennt durch '.'
        assert "." in token
        parts = token.split(".")
        assert len(parts) == 2
        assert parts[0] == invite_uuid

    def test_create_signed_invitation_token_consistency(self):
        """Test dass gleiche Eingaben gleiche Token erzeugen"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        token1 = create_signed_invitation_token(invite_uuid, secret)
        token2 = create_signed_invitation_token(invite_uuid, secret)

        assert token1 == token2

    def test_verify_signed_invitation_token_valid(self):
        """Test Verifizierung eines gültigen Tokens"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        token = create_signed_invitation_token(invite_uuid, secret)
        is_valid, returned_uuid = verify_signed_invitation_token(token, secret)

        assert is_valid is True
        assert returned_uuid == invite_uuid

    def test_verify_signed_invitation_token_invalid_signature(self):
        """Test Verifizierung mit manipulierter Signatur"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret = "test_secret_key"

        token = create_signed_invitation_token(invite_uuid, secret)
        # Manipuliere die Signatur
        manipulated_token = token[:-5] + "XXXXX"

        is_valid, returned_uuid = verify_signed_invitation_token(
            manipulated_token, secret
        )

        assert is_valid is False
        assert returned_uuid is None

    def test_verify_signed_invitation_token_wrong_secret(self):
        """Test Verifizierung mit falschem Secret"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        correct_secret = "correct_secret"
        wrong_secret = "wrong_secret"

        token = create_signed_invitation_token(invite_uuid, correct_secret)
        is_valid, returned_uuid = verify_signed_invitation_token(token, wrong_secret)

        assert is_valid is False
        assert returned_uuid is None

    def test_verify_signed_invitation_token_malformed_token(self):
        """Test mit malformierten Token"""
        secret = "test_secret_key"

        # Token ohne Punkt
        is_valid, returned_uuid = verify_signed_invitation_token("no_dot_token", secret)
        assert is_valid is False
        assert returned_uuid is None

        # Leerer Token
        is_valid, returned_uuid = verify_signed_invitation_token("", secret)
        assert is_valid is False
        assert returned_uuid is None

        # Token nur mit Punkt
        is_valid, returned_uuid = verify_signed_invitation_token(".", secret)
        assert is_valid is False
        assert returned_uuid is None

    def test_verify_signed_invitation_token_multiple_dots(self):
        """Test mit Token der mehrere Punkte enthält"""
        invite_uuid = "uuid.with.dots"
        secret = "test_secret_key"

        token = create_signed_invitation_token(invite_uuid, secret)
        is_valid, returned_uuid = verify_signed_invitation_token(token, secret)

        # Sollte funktionieren, da rsplit mit maxsplit=1 verwendet wird
        assert is_valid is True
        assert returned_uuid == invite_uuid

    def test_signed_token_integration_full_cycle(self):
        """Test vollständiger Zyklus: Erstellen -> Verifizieren"""
        test_cases = [
            ("simple-uuid", "simple-secret"),
            ("123e4567-e89b-12d3-a456-426614174000", "complex_secret_key_123"),
            ("", "empty_uuid_test"),
            ("unicode-üöä", "unicode-sëcret"),
        ]

        for invite_uuid, secret in test_cases:
            token = create_signed_invitation_token(invite_uuid, secret)
            is_valid, returned_uuid = verify_signed_invitation_token(token, secret)

            assert is_valid is True
            assert returned_uuid == invite_uuid

    def test_signed_token_cross_verification(self):
        """Test dass Token mit verschiedenen Secrets nicht kreuz-verifiziert werden können"""
        invite_uuid = "123e4567-e89b-12d3-a456-426614174000"
        secret1 = "secret1"
        secret2 = "secret2"

        token1 = create_signed_invitation_token(invite_uuid, secret1)
        token2 = create_signed_invitation_token(invite_uuid, secret2)

        # Token sollten unterschiedlich sein
        assert token1 != token2

        # Token1 sollte nicht mit secret2 verifizierbar sein
        is_valid, _ = verify_signed_invitation_token(token1, secret2)
        assert is_valid is False

        # Token2 sollte nicht mit secret1 verifizierbar sein
        is_valid, _ = verify_signed_invitation_token(token2, secret1)
        assert is_valid is False
