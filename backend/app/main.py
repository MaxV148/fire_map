import loguru
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from domain.user.routes import user_router
from domain.role.routes import role_router
from domain.event.routes import event_router
from domain.tag.routes import tag_router
from domain.vehicletype.routes import vehicle_router
from domain.issue.routes import issue_router
from domain.auth.routes import auth_router
from domain.invite.routes import invite_router
from config.config_provider import get_config
from infrastructure.redis.redis_client import session_manager
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from starlette.requests import Request
from starlette.types import ASGIApp

config = get_config()


# async def setup_initial_admin():
#     """Setup initial admin user if it doesn't exist"""
#     db = SessionLocal()
#     try:
#         user_repo = UserRepository(db)
#         role_repo = RoleRepository(db)
#
#         # Check if admin user already exists
#         existing_admin = user_repo.get_user_by_email(config.initial_admin_email)
#         if existing_admin:
#             loguru.logger.info("Admin user already exists")
#             return
#
#         # Check if admin role exists, create if not
#         admin_role = role_repo.get_by_name("admin")
#         if not admin_role:
#             loguru.logger.info("Creating admin role")
#             from domain.role.dto import RoleCreate
#             admin_role_data = RoleCreate(
#                 name="admin",
#                 description="Administrator role with full access"
#             )
#             admin_role = role_repo.create(admin_role_data)
#         # Check if user role exists, create if not
#         user_role = role_repo.get_by_name("user")
#         if not user_role:
#             loguru.logger.info("Creating user role")
#             user_role_data = RoleCreate(
#                 name="user",
#                 description="Standard user role with limited access"
#             )
#             user_role = role_repo.create(user_role_data)
#
#         # Create admin user
#         loguru.logger.info(f"Creating initial admin user: {config.initial_admin_email}")
#         hashed_password = hash_password(config.initial_admin_password)
#
#         admin_user = User(
#             email=config.initial_admin_email,
#             first_name="Admin",
#             last_name="User",
#             password=hashed_password,
#             role_id=admin_role.id
#         )
#
#         user_repo.create_user(admin_user)
#         loguru.logger.info("Initial admin user created successfully")
#
#     except Exception as e:
#         loguru.logger.error(f"Error setting up initial admin: {e}")
#         db.rollback()
#         raise
#     finally:
#         db.close()


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup
#     loguru.logger.info("Starting application...")
#     await setup_initial_admin()
#     yield
#     # Shutdown
#     loguru.logger.info("Shutting down application...")


app = FastAPI()

PUBLIC_ROUTES = ["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/status"]
PUBLIC_ROUTES_DEV = ["/docs", "/openapi.json"]

##Initial setup


class SessionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, session_manager, config, public_routes: list, public_routes_dev: list):
        super().__init__(app)
        self.session_manager = session_manager
        self.config = config
        self.public_routes = public_routes
        self.public_routes_dev = public_routes_dev

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        loguru.logger.debug(f"Path: {path}")
        if request.method == "OPTIONS":
            return await call_next(request)

        # Sonderfall: 2FA temp session
        if path == "/api/v1/user/2fa/verify":
            session_id = request.cookies.get(self.config.temp_session_cookie_id)
            loguru.logger.debug(f"Session-ID TEMP: {session_id}")
            if not session_id:
                return self._unauthorized("Not authenticated (temp)")
            session = self.session_manager.get_temp_session(session_id)
            if not session:
                return self._unauthorized("Invalid Temp session")
            user_id = session.get(self.config.session_user_id_key)
            setattr(request.state, self.config.session_user_id_key, user_id)
            return await call_next(request)

        # Öffentliche Routen
        if path in self.public_routes + self.public_routes_dev:
            return await call_next(request)

        # Normale Sessionprüfung
        session_id = request.cookies.get(self.config.session_cookie_id)
        if not session_id:
            return self._unauthorized("Not authenticated")
        session = self.session_manager.get_session(session_id)
        if not session:
            return self._unauthorized("Invalid session")
        user_id = session.get(self.config.session_user_id_key)
        setattr(request.state, self.config.session_user_id_key, user_id)
        return await call_next(request)

    def _unauthorized(self, detail: str):
        response = JSONResponse(status_code=401, content={"detail": detail})
        # Manuell CORS setzen, falls nötig
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response


# Set origins based on environment
if config.env == "prod":
    origins = ["https://api.flamora.online/"]
else:
    origins = [
        "http://localhost:5173",
        "http://localhost:8000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, session_manager=session_manager, config=config,
                   public_routes=PUBLIC_ROUTES, public_routes_dev=PUBLIC_ROUTES_DEV)


# @app.middleware("http")
# async def session_middleware(request: Request, call_next):
#     path = request.url.path
#     loguru.logger.debug(f"Path: {path}")
#     if path == "/api/v1/user/2fa/verify":
#         session_id = request.cookies.get(config.temp_session_cookie_id)
#         loguru.logger.debug(f"Session-ID TEMP: {session_id}")
#         if not session_id:
#             return JSONResponse(
#                 status_code=401, content={"detail": "Not authenticated"}
#             )
#         session = session_manager.get_temp_session(session_id)
#         if not session:
#             return JSONResponse(
#                 status_code=401, content={"detail": "Invalid Temp session"}
#             )
#         user_id = session.get(config.session_user_id_key)
#         setattr(request.state, config.session_user_id_key, user_id)
#         response = await call_next(request)
#         return response

#     if path in PUBLIC_ROUTES + PUBLIC_ROUTES_DEV:
#         return await call_next(request)
#     session_id = request.cookies.get(config.session_cookie_id)
#     if not session_id:
#         return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
#     session = session_manager.get_session(session_id)
#     if not session:
#         return JSONResponse(status_code=401, content={"detail": "Invalid session"})
#     user_id = session.get(config.session_user_id_key)
#     setattr(request.state, config.session_user_id_key, user_id)
#     response = await call_next(request)
#     return response


app.include_router(user_router, prefix=config.api_prefix)
app.include_router(auth_router, prefix=config.api_prefix)
app.include_router(role_router, prefix=config.api_prefix)
app.include_router(event_router, prefix=config.api_prefix)
app.include_router(tag_router, prefix=config.api_prefix)
app.include_router(vehicle_router, prefix=config.api_prefix)
app.include_router(issue_router, prefix=config.api_prefix)
app.include_router(invite_router, prefix=config.api_prefix)
