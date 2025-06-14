from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache


class ConfigProvider(BaseSettings):
    log_level: str = Field(default="INFO", description="Log level for the application")

    db_host: str = Field(default="localhost", description="Database host")
    db_port: int = Field(default=5432, description="Database port")
    db_user: str = Field(default="root", description="Database user")
    db_password: str = Field(default="test123", description="Database password")
    db_name: str = Field(default="fire_backend", description="Database name")

    redis_host: str = Field(default="localhost", description="Redis host")
    redis_port: int = Field(default=6379, description="Redis port")
    redis_db: int = Field(default=0, description="Redis database")

    api_prefix: str = Field(default="/api/v1", description="API version")
    api_port: int = Field(default=8000, description="API port")

    session_expire_seconds: int = Field(
        default=3600, description="Session expiration time in seconds"
    )
    temp_session_expire_seconds: int = Field(
        default=240, description="Temp Session expiration time in seconds"
    )
    session_cookie_id: str = Field(default="sid", description="Session cookie name")
    temp_session_cookie_id: str = Field(
        default="tmp_sid", description="Temporary session cookie name"
    )
    session_user_id_key: str = Field(
        default="user_id", description="Session user id key"
    )

    # HMAC Security
    invite_hmac_secret: str = Field(
        default="your-secret-key-change-in-production",
        description="Secret key for HMAC signing of invite tokens",
    )

    # Initial Admin Setup
    initial_admin_email: str = Field(
        default="admin@fire-map.com",
        description="Email for the initial admin user"
    )
    initial_admin_password: str = Field(
        default="admin123",
        description="Password for the initial admin user"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_config():
    return ConfigProvider()
