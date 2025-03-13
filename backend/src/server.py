from fastapi import FastAPI
from src.domain.user.routes import user_router
from src.domain.role.routes import role_router
from src.domain.event.routes import event_router
from src.domain.tag.routes import tag_router
from src.domain.vehicletype.routes import vehicle_router
from src.domain.issue.routes import issue_router
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
app.include_router(role_router, prefix="/v1")
app.include_router(event_router, prefix="/v1")
app.include_router(tag_router, prefix="/v1")
app.include_router(vehicle_router, prefix="/v1")
app.include_router(issue_router, prefix="/v1")
