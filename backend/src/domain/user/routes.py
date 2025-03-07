from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.domain.user.dto import UserCreate,TokenResponse,UserLogin
from src.infrastructure.postgresql.db import get_db
from src.domain.user.model import User
from starlette import status
from src.domain.user.service import hash_password, create_access_token, verify_password
from src.domain.user.dependency import get_current_user


user_router = APIRouter(prefix="/user")


@user_router.post("/register", response_model=TokenResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

    hashed_password = hash_password(user_data.password)
    new_user = User(username=user_data.username, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token({"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@user_router.post("/login", response_model=TokenResponse)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    # Generate JWT token
    access_token = create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@user_router.get("/me")
def get_user_details(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username, "created_at": current_user.created_at}
