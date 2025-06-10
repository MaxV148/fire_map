from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str


class UserLogin(BaseModel):
    email: str
    password: str


class Authresponse(BaseModel):
    access_token: str
    token_type: str


class MeResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    created_at: datetime
    otp_configured: bool
    role: str


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
    email: str
    first_name: str
    last_name: str
    security_settings: Optional[SecuritySettingsResponse] = None

    model_config = ConfigDict(from_attributes=True)


class OtpVerify(BaseModel):
    code: str


class OtpDisable(BaseModel):
    code: str
    confirm: bool = False


class JWTPayload(BaseModel):
    sub: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    created_at: str
    role: str
    deactivated: bool


class RoleUpdate(BaseModel):
    role_name: Literal["user", "admin"] = Field(...)


class DeactivateUser(BaseModel):
    deactivate: bool
