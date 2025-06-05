import loguru
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

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

config = get_config()
app = FastAPI()


@app.middleware("http")
async def session_middleware(request: Request, call_next):
    path = request.url.path
    loguru.logger.debug(f"Path: {path}")
    if path == "/api/v1/user/2fa/verify":
        session_id = request.cookies.get(config.temp_session_cookie_id)
        loguru.logger.debug(f"Session-ID TEMP: {session_id}")
        if not session_id:
            return JSONResponse(
                status_code=401, content={"detail": "Not authenticated"}
            )
        session = session_manager.get_temp_session(session_id)
        if not session:
            return JSONResponse(
                status_code=401, content={"detail": "Invalid Temp session"}
            )
        user_id = session.get(config.session_user_id_key)
        setattr(request.state, config.session_user_id_key, user_id)
        response = await call_next(request)
        return response

    if (
        path == "/api/v1/auth/login"
        or path == "/api/v1/auth/register"
        or path == "/docs"
        or path == "/openapi.json"
    ):
        return await call_next(request)
    session_id = request.cookies.get(config.session_cookie_id)
    if not session_id:
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
    session = session_manager.get_session(session_id)
    if not session:
        return JSONResponse(status_code=401, content={"detail": "Invalid session"})
    user_id = session.get(config.session_user_id_key)
    setattr(request.state, config.session_user_id_key, user_id)
    response = await call_next(request)
    return response


app.include_router(user_router, prefix=config.api_prefix)
app.include_router(auth_router, prefix=config.api_prefix)
app.include_router(role_router, prefix=config.api_prefix)
app.include_router(event_router, prefix=config.api_prefix)
app.include_router(tag_router, prefix=config.api_prefix)
app.include_router(vehicle_router, prefix=config.api_prefix)
app.include_router(issue_router, prefix=config.api_prefix)
app.include_router(invite_router, prefix=config.api_prefix)
