from fastapi import FastAPI
from src.domain.user.routes import user_router
app = FastAPI()

app.include_router(user_router,prefix="/v1")

