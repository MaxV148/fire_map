from fastapi import FastAPI
from fastapi.params import Depends

from src.domain.user.routes import user_router
from src.domain.role.routes import role_router
from src.domain.event.routes import event_router
from src.domain.tag.routes import tag_router
from src.domain.vehicletype.routes import vehicle_router
from src.domain.issue.routes import issue_router
from src.domain.invite.routes import invite_router
from fastapi.middleware.cors import CORSMiddleware
import sys
import logging
from loguru import logger

for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)


class InterceptHandler(logging.Handler):
    def emit(self, record):
        # Get corresponding Loguru level
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller to get correct stack depth
        frame, depth = logging.currentframe(), 2
        while frame.f_back and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


# Intercept standard logging
logging.basicConfig(handlers=[InterceptHandler()], level=logging.INFO)

logger.add(
    "logs/application.log",
    rotation="500 MB",
    compression="zip",
    level="INFO",
    backtrace=True,
    diagnose=True,
)

loggers = (
    "uvicorn",
    "uvicorn.access",
    "uvicorn.error",
    "fastapi",
    "asyncio",
    "starlette",
)

for logger_name in loggers:
    logging_logger = logging.getLogger(logger_name)
    logging_logger.handlers = []
    logging_logger.propagate = True

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
app.include_router(invite_router, prefix="/v1")
