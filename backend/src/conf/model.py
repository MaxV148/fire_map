from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    log_level: str
    wss_endpoint: str
    dev_wss_endpoint: str
    http_endpoint: str
    dev_http_endpoint: str
    wallet: str
    dev_wallet: str
    db_host: str
    db_port: str
    db_user: str
    db_password: str
    db_name: str
