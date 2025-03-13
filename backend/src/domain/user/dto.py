from pydantic import BaseModel


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
