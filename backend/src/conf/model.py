from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path

# Get the project root directory (2 levels up from this file)
ROOT_DIR = Path(__file__).parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )
    log_level: str
    db_host: str
    db_port: int
    db_user: str
    db_password: str
    db_name: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
