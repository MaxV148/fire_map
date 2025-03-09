from fastapi import FastAPI
from src.domain.user.routes import user_router
from src.domain.exercises.routes import exercises_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


origins = [
    "http://localhost:5173",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/v1")
app.include_router(exercises_router, prefix="/v1")
