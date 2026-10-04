# -*- coding: utf-8 -*-
"""
Agora Agent & Token Service — SwiftUI Quickstart Recipe

HTTP APIs:
- GET  /get_config     -> Generate connection config
- POST /startAgent     -> Start the agent
- POST /stopAgent      -> Stop agent
"""
import logging
import asyncio
from contextlib import asynccontextmanager, suppress
import os
import random
import time
from typing import Any, Dict, Optional, Literal
from dotenv import load_dotenv

# Load environment variables from .env.local or .env
_base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(_base_dir, '.env.local'), override=True)
load_dotenv(os.path.join(_base_dir, '.env'), override=True)

from fastapi import APIRouter, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from agora_agent.agentkit.token import generate_convo_ai_token
from agent import Agent
from voice_rooms import VoiceRooms, make_router

logger = logging.getLogger("uvicorn.error")


def _log_route_error(route: str, exc: Exception, **context) -> None:
    """Log route failures with safe request context and a traceback."""
    safe_context = {key: value for key, value in context.items() if value is not None}
    logger.exception(
        "Request failed route=%s context=%s error_type=%s error=%s",
        route,
        safe_context,
        type(exc).__name__,
        exc,
    )


def _to_http_error(exc: Exception) -> HTTPException:
    """Convert SDK exceptions to HTTP errors"""
    if isinstance(exc, ValueError):
        return HTTPException(status_code=400, detail=str(exc))
    if isinstance(exc, RuntimeError):
        return HTTPException(status_code=500, detail=str(exc))
    return HTTPException(status_code=500, detail=f"Internal error: {exc}")

try:
    agent = Agent()
except ValueError as e:
    logger.exception(
        "Failed to initialize Agent. Check environment variables: %s", e,
    )
    agent = None


# Shared browser rooms reuse the same project and scoped RTC+RTM token generator.
def voice_config(channel, uid, agent_uid):
    app_id = os.getenv("AGORA_APP_ID")
    token = generate_convo_ai_token(
        app_id=app_id, app_certificate=os.getenv("AGORA_APP_CERTIFICATE"),
        channel_name=channel, uid=int(uid), token_expire=1800)
    return {"appId": app_id, "token": token, "uid": uid,
            "channelName": channel, "agentUid": agent_uid}


voice_rooms = VoiceRooms(lambda: agent, voice_config)


@asynccontextmanager
async def lifespan(app):
    async def cleanup():
        while True:
            await asyncio.sleep(20)
            try:
                await voice_rooms.reap()
            except Exception:
                logger.warning("Voice room cleanup will retry.")
    task = asyncio.create_task(cleanup())
    yield
    task.cancel()
    with suppress(asyncio.CancelledError):
        await task
    try:
        await voice_rooms.shutdown()
    except Exception:
        logger.warning("Voice room shutdown failed; Agora idle expiry remains active.")


# FastAPI application
app = FastAPI(
    lifespan=lifespan,
    title="Agora Decision Rooms Voice Service",
    version="1.0.0",
    description="Agora Decision Rooms — Agora RTC tokens and Conversational AI agent lifecycle",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()


@router.get('/health')
@router.get('/api/health')
async def health():
    return {'service': 'agora-decision-rooms', 'configured': agent is not None, 'voice_pipeline': 'Agora Conversational AI + RTC + RTM'}


# Request models
class StartAgentRequest(BaseModel):
    """Request body for POST /startAgent"""
    channelName: str
    rtcUid: int
    userUid: int
    parameters: Optional[Dict[str, Any]] = None
    language: Literal["en", "hi", "multi"] = "multi"


class StopAgentRequest(BaseModel):
    """Request body for POST /stopAgent"""
    agentId: str


# The browser uses bounded rooms; native quickstart routes can be disabled on a hosted demo.
def _require_native_api():
    if os.getenv("ENABLE_NATIVE_API", "true").lower() != "true":
        raise HTTPException(404, "Native quickstart API is disabled.")


# API endpoints
def _generate_channel_name() -> str:
    return f"rn-quickstart-{int(time.time())}-{random.randint(1000, 9999)}"


@router.get("/get_config")
async def get_config(
    channel: Optional[str] = Query(default=None),
    uid: Optional[int] = Query(default=None),
):
    """Generate connection configuration"""
    _require_native_api()
    if agent is None:
        raise HTTPException(
            status_code=500,
            detail="Service not properly configured. Please check environment variables.",
        )

    try:
        user_uid = random.randint(1000, 9999999) if uid is None or uid <= 0 else uid
        agent_uid = str(random.randint(10000000, 99999999))
        channel_name = channel or _generate_channel_name()

        app_id = os.getenv("AGORA_APP_ID")
        app_certificate = os.getenv("AGORA_APP_CERTIFICATE")

        token = generate_convo_ai_token(
            app_id=app_id,
            app_certificate=app_certificate,
            channel_name=channel_name,
            uid=user_uid,
            token_expire=3600,
        )

        config_data = {
            "app_id": app_id,
            "token": token,
            "uid": str(user_uid),
            "channel_name": channel_name,
            "agent_uid": agent_uid,
        }

        return {
            "code": 0,
            "data": config_data,
            "msg": "success",
        }
    except Exception as e:
        _log_route_error("/get_config", e, channel=channel, uid=uid)
        raise _to_http_error(e)


@router.post("/startAgent")
async def start_agent(request: StartAgentRequest):
    """Start the agent in a channel"""
    _require_native_api()
    if agent is None:
        raise HTTPException(
            status_code=500,
            detail="Service not properly configured. Please check environment variables.",
        )

    try:
        output_audio_codec = None
        if request.parameters:
            output_audio_codec = request.parameters.get("output_audio_codec")

        result = await agent.start(
            channel_name=request.channelName,
            agent_uid=request.rtcUid,
            user_uid=request.userUid,
            output_audio_codec=output_audio_codec,
            language=request.language,
        )
        return {"code": 0, "msg": "success", "data": result}
    except Exception as e:
        _log_route_error(
            "/startAgent",
            e,
            channelName=request.channelName,
            rtcUid=request.rtcUid,
            userUid=request.userUid,
        )
        raise _to_http_error(e)


@router.post("/stopAgent")
async def stop_agent(request: StopAgentRequest):
    """Stop agent by ID"""
    _require_native_api()
    if agent is None:
        raise HTTPException(
            status_code=500,
            detail="Service not properly configured. Please check environment variables.",
        )

    try:
        await agent.stop(request.agentId)
        return {"code": 0, "msg": "success"}
    except Exception as e:
        _log_route_error("/stopAgent", e, agentId=request.agentId)
        raise _to_http_error(e)


app.include_router(router)
app.include_router(make_router(voice_rooms))

# Optional single-origin production build. API routes remain ahead of static assets.
_web_dist = os.getenv("WEB_DIST_DIR", os.path.join(_base_dir, "..", "mobile", "dist-web"))
if os.path.isfile(os.path.join(_web_dist, "index.html")):
    app.mount("/", StaticFiles(directory=_web_dist, html=True), name="web")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=os.getenv("HOST", "127.0.0.1"), port=port)
