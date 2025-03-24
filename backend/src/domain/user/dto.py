from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Authresponse(BaseModel):
    access_token: str
    token_type: str
    id: int
    username: str
    requires_2fa: bool = False
    temp_token: Optional[str] = None


class LoginStep2(BaseModel):
    temp_token: str
    code: str


class SecuritySettingsBase(BaseModel):
    otp_configured: bool = False


class SecuritySettingsCreate(SecuritySettingsBase):
    user_id: int
    secret: Optional[str] = None


class SecuritySettingsUpdate(SecuritySettingsBase):
    secret: Optional[str] = None


class SecuritySettings(SecuritySettingsBase):
    id: int
    user_id: int
    secret: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SecuritySettingsResponse(SecuritySettingsBase):
    otp_configured: bool

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: int
    username: str
    security_settings: Optional[SecuritySettingsResponse] = None

    model_config = ConfigDict(from_attributes=True)


class OtpVerify(BaseModel):
    code: str


class OtpDisable(BaseModel):
    code: str
    confirm: bool = False
