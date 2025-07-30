from fastapi_mail import ConnectionConfig, FastMail, MessageSchema


__mail_config = ConnectionConfig(
    MAIL_USERNAME="user",
    MAIL_PASSWORD="test",
    MAIL_FROM="mail@mail.com",
    MAIL_PORT=1025,
    MAIL_SERVER="mailserver",
    MAIL_FROM_NAME="Fire Map",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=False,
    VALIDATE_CERTS=False,
)

__fm = FastMail(__mail_config)


def get_mail_client() -> FastMail:
    """
    Dependency to inject FastMail client
    """
    return __fm
