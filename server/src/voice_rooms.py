"""Short-lived shared voice rooms. Secrets stay server-side; clients receive scoped tokens."""
import asyncio
import secrets
import time
import copy
from collections import OrderedDict
from dataclasses import dataclass, field
from datetime import date
from typing import Callable, Literal

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field, field_validator, model_validator
from live_stage import LiveStage


@dataclass
class Member:
    uid: str
    name: str
    secret: str
    last_seen: float


@dataclass
class Room:
    code: str
    channel: str
    agent_uid: str
    host_uid: str
    expires_at: float
    language: str = "multi"
    members: dict[str, Member] = field(default_factory=dict)
    agent_id: str | None = None
    closed: bool = False
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    stage: dict = field(default_factory=LiveStage.empty)
    stage_seen: OrderedDict = field(default_factory=OrderedDict)


class VoiceRooms:
    def __init__(self, agent_getter: Callable, token_factory: Callable, ttl=900, max_rooms=4, planning_tools=None):
        self.agent_getter = agent_getter
        self.token_factory = token_factory
        self.ttl = ttl
        self.max_rooms = max_rooms
        self.rooms: dict[str, Room] = {}
        self.lock = asyncio.Lock()
        self.stage_service = LiveStage(planning_tools)

    def _ready(self):
        agent = self.agent_getter()
        if agent is None:
            raise HTTPException(503, "The voice service needs its Agora project configured.")
        return agent

    def _room(self, code):
        room = self.rooms.get(code.upper().strip())
        if room is None:
            raise HTTPException(404, "Room not found. Check the room code.")
        return room

    def _member(self, room, secret):
        member = next((m for m in room.members.values() if secrets.compare_digest(m.secret, secret)), None)
        if member is None:
            raise HTTPException(403, "Your room access has expired. Join the room again.")
        member.last_seen = time.time()
        return member

    def snapshot(self, room):
        return {
            "code": room.code, "hostUid": room.host_uid,
            "expiresAt": int(room.expires_at), "closed": room.closed,
            "assistantStarted": bool(room.agent_id) and not room.closed,
            "language": room.language,
            "stage": copy.deepcopy(room.stage),
            "members": [{"uid": m.uid, "name": m.name, "host": m.uid == room.host_uid}
                        for m in room.members.values()],
        }

    def _issue(self, room, member):
        config = self.token_factory(room.channel, member.uid, room.agent_uid)
        return {"config": config, "memberSecret": member.secret, "room": self.snapshot(room)}

    async def create(self, name, language="multi"):
        self._ready()
        if language not in ("en", "hi", "multi"):
            raise HTTPException(422, "Choose English, Hindi or both languages.")
        async with self.lock:
            active = [r for r in self.rooms.values() if not r.closed and r.expires_at > time.time()]
            if len(active) >= self.max_rooms:
                raise HTTPException(429, "All demo rooms are in use. Try again after a room ends.")
            code = secrets.token_hex(4).upper()
            while code in self.rooms:
                code = secrets.token_hex(4).upper()
            uid = str(secrets.randbelow(9_000_000) + 1000)
            host = Member(uid, name.strip() or "Room host", secrets.token_urlsafe(24), time.time())
            room = Room(code, "decision-" + secrets.token_hex(12),
                        str(secrets.randbelow(80_000_000) + 10_000_000), uid, time.time() + self.ttl,
                        language=language)
            room.members[uid] = host
            result = self._issue(room, host)
            self.rooms[code] = room
            return result

    async def join(self, code, name):
        self._ready()
        room = self._room(code)
        async with room.lock:
            if room.closed or room.expires_at <= time.time():
                raise HTTPException(410, "This room has ended. Ask the host to create a new one.")
            if len(room.members) >= 4:
                raise HTTPException(409, "This demo room supports up to four people.")
            uid = str(secrets.randbelow(9_000_000) + 1000)
            while uid in room.members:
                uid = str(secrets.randbelow(9_000_000) + 1000)
            member = Member(uid, name.strip() or "Guest", secrets.token_urlsafe(24), time.time())
            result = self._issue(room, member)
            room.members[uid] = member
            self.stage_service.revise(room)
            result["room"] = self.snapshot(room)
            return result

    async def start(self, code, secret):
        room = self._room(code)
        async with room.lock:
            member = self._member(room, secret)
            if member.uid != room.host_uid:
                raise HTTPException(403, "Only the host can invite the room assistant.")
            if room.closed or room.expires_at <= time.time():
                raise HTTPException(410, "This room has ended.")
            if not room.agent_id:
                result = await self._ready().start(
                    room.channel, int(room.agent_uid), int(room.host_uid),
                    listen_to_all=True, language=room.language)
                room.agent_id = result["agent_id"]
            return {"room": self.snapshot(room)}

    def status(self, code, secret):
        room = self._room(code)
        self._member(room, secret)
        if room.expires_at <= time.time():
            room.closed = True
        return {"room": self.snapshot(room)}

    async def _close(self, room):
        room.closed = True
        self.stage_service.cancel(room)
        if room.agent_id:
            await self._ready().stop(room.agent_id)
            room.agent_id = None

    async def leave(self, code, secret):
        room = self._room(code)
        async with room.lock:
            member = self._member(room, secret)
            if member.uid == room.host_uid:
                await self._close(room)
            room.members.pop(member.uid, None)
            room.stage["preferences"].pop(member.uid, None)
            self.stage_service.revise(room)
            return {"room": self.snapshot(room)}

    async def reap(self):
        now = time.time()
        for room in list(self.rooms.values()):
            async with room.lock:
                host = room.members.get(room.host_uid)
                if room.closed or now >= room.expires_at or not host or now - host.last_seen > 120:
                    await self._close(room)
                else:
                    old_members = set(room.members)
                    room.members = {uid: m for uid, m in room.members.items()
                                    if now - m.last_seen <= 120}
                    if old_members != set(room.members):
                        self.stage_service.revise(room)
                        room.stage["preferences"] = {uid: p for uid, p in room.stage["preferences"].items() if uid in room.members}
                if room.closed and not room.agent_id and now > room.expires_at + 120:
                    self.rooms.pop(room.code, None)

    async def shutdown(self):
        for room in list(self.rooms.values()):
            async with room.lock:
                await self._close(room)


class NameRequest(BaseModel):
    name: str = Field(default="You", min_length=1, max_length=24)


class CreateRoomRequest(NameRequest):
    language: Literal["en", "hi", "multi"] = "multi"


class MeetingPlan(BaseModel):
    city: str = Field(default="", max_length=80)
    origin: str = Field(default="", max_length=80)
    date: str = Field(default="", max_length=10)
    time: str = Field(default="18:00", pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$")

    @field_validator("date")
    @classmethod
    def valid_date(cls, value):
        if value:
            date.fromisoformat(value)
        return value


class Preference(BaseModel):
    budget: int | None = Field(default=None, ge=1, le=100000)
    diet: Literal["Vegetarian", "No vegetarian requirement", ""] = ""
    setting: Literal["Indoors preferred", "Outdoors preferred", ""] = ""
    note: str = Field(default="", max_length=160)


class StageCommand(BaseModel):
    action: Literal["plan", "preference", "utterance", "request", "check", "select", "vote", "approve"]
    plan: MeetingPlan | None = None
    preference: Preference | None = None
    text: str = Field(default="", max_length=1500)
    turnId: str = Field(default="", max_length=80)
    tool: Literal["venues", "reservations", "weather", "travel"] | None = None
    venueId: str = Field(default="", max_length=50)
    support: bool = False
    version: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def required_fields(self):
        if self.action in ("utterance", "request") and not self.text.strip():
            raise ValueError("A request needs text")
        if self.action == "utterance" and not self.turnId:
            raise ValueError("A final speech turn needs an ID")
        if self.action == "check" and not self.tool:
            raise ValueError("Choose a planning tool")
        if self.action == "plan" and not self.plan:
            raise ValueError("Meeting details are required")
        if self.action == "preference" and not self.preference:
            raise ValueError("Preferences are required")
        return self


def make_router(service):
    router = APIRouter(prefix="/api/voice")

    @router.post("/rooms")
    async def create(body: CreateRoomRequest):
        return await service.create(body.name, body.language)

    @router.post("/rooms/{code}/join")
    async def join(code: str, body: NameRequest):
        return await service.join(code, body.name)

    @router.post("/rooms/{code}/assistant")
    async def start(code: str, x_room_member: str = Header(default="")):
        return await service.start(code, x_room_member)

    @router.get("/rooms/{code}")
    async def status(code: str, x_room_member: str = Header(default="")):
        return service.status(code, x_room_member)

    @router.post("/rooms/{code}/leave")
    async def leave(code: str, x_room_member: str = Header(default="")):
        return await service.leave(code, x_room_member)

    @router.post("/rooms/{code}/stage")
    async def stage(code: str, body: StageCommand, x_room_member: str = Header(default="")):
        room = service._room(code)
        member = service._member(room, x_room_member)
        await service.stage_service.command(room, member, body.model_dump(exclude_none=True), service._ready())
        return {"room": service.snapshot(room)}

    return router
