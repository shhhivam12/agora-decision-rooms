"""Shared-room lifecycle and access control, without cloud credentials."""
import asyncio

import pytest
from fastapi import HTTPException

from voice_rooms import VoiceRooms


class FakeAgent:
    def __init__(self):
        self.starts = []
        self.stops = []
        self.fail_stop = False

    async def start(self, channel, agent_uid, host_uid, **kwargs):
        await asyncio.sleep(0)
        self.starts.append((channel, agent_uid, host_uid, kwargs))
        return {"agent_id": "agent-" + str(len(self.starts))}

    async def stop(self, agent_id):
        if self.fail_stop:
            raise RuntimeError("temporary cloud outage")
        self.stops.append(agent_id)


def service():
    agent = FakeAgent()
    rooms = VoiceRooms(lambda: agent, lambda channel, uid, agent_uid: {
        "channelName": channel, "uid": uid, "agentUid": agent_uid,
        "token": "test-token-" + uid,
    })
    return rooms, agent


def test_two_devices_share_channel_with_distinct_identities():
    async def scenario():
        rooms, _ = service()
        host = await rooms.create("Host")
        guest = await rooms.join(host["room"]["code"], "Guest")
        assert host["config"]["channelName"] == guest["config"]["channelName"]
        assert host["config"]["agentUid"] == guest["config"]["agentUid"]
        assert host["config"]["uid"] != guest["config"]["uid"]
        assert host["memberSecret"] != guest["memberSecret"]
        assert len(guest["room"]["members"]) == 2
        status = rooms.status(host["room"]["code"], host["memberSecret"])
        assert "secret" not in str(status).lower()
        assert "token" not in str(status).lower()
    asyncio.run(scenario())


def test_concurrent_host_start_is_idempotent_and_listens_to_everyone():
    async def scenario():
        rooms, agent = service()
        host = await rooms.create("Host")
        await asyncio.gather(*[
            rooms.start(host["room"]["code"], host["memberSecret"]) for _ in range(3)
        ])
        assert len(agent.starts) == 1
        assert agent.starts[0][3] == {"listen_to_all": True, "language": "multi"}
    asyncio.run(scenario())


def test_guest_cannot_start_assistant_and_leaving_keeps_host_live():
    async def scenario():
        rooms, agent = service()
        host = await rooms.create("Host")
        guest = await rooms.join(host["room"]["code"], "Guest")
        with pytest.raises(HTTPException) as error:
            await rooms.start(host["room"]["code"], guest["memberSecret"])
        assert error.value.status_code == 403
        await rooms.start(host["room"]["code"], host["memberSecret"])
        result = await rooms.leave(host["room"]["code"], guest["memberSecret"])
        assert not result["room"]["closed"]
        assert result["room"]["assistantStarted"]
        assert agent.stops == []
        with pytest.raises(HTTPException):
            rooms.status(host["room"]["code"], guest["memberSecret"])
    asyncio.run(scenario())


def test_host_end_stops_cloud_session_and_guest_sees_closed():
    async def scenario():
        rooms, agent = service()
        host = await rooms.create("Host")
        guest = await rooms.join(host["room"]["code"], "Guest")
        await rooms.start(host["room"]["code"], host["memberSecret"])
        await rooms.leave(host["room"]["code"], host["memberSecret"])
        assert agent.stops == ["agent-1"]
        assert rooms.status(host["room"]["code"], guest["memberSecret"])["room"]["closed"]
        with pytest.raises(HTTPException) as error:
            await rooms.join(host["room"]["code"], "Late visitor")
        assert error.value.status_code == 410
    asyncio.run(scenario())


def test_expired_or_abandoned_host_is_reaped_and_failed_stop_retries():
    async def scenario():
        rooms, agent = service()
        host = await rooms.create("Host")
        await rooms.start(host["room"]["code"], host["memberSecret"])
        room = rooms.rooms[host["room"]["code"]]
        room.members[room.host_uid].last_seen -= 121
        agent.fail_stop = True
        with pytest.raises(RuntimeError):
            await rooms.reap()
        assert room.closed and room.agent_id == "agent-1"
        agent.fail_stop = False
        await rooms.reap()
        assert agent.stops == ["agent-1"] and room.agent_id is None
    asyncio.run(scenario())


def test_room_capacity_and_invalid_membership_are_enforced():
    async def scenario():
        rooms, _ = service()
        host = await rooms.create("Host")
        code = host["room"]["code"]
        for _ in range(3):
            await rooms.join(code, "Guest")
        with pytest.raises(HTTPException) as error:
            await rooms.join(code, "Too many")
        assert error.value.status_code == 409
        with pytest.raises(HTTPException) as error:
            await rooms.leave(code, "wrong secret")
        assert error.value.status_code == 403
        assert not rooms.rooms[code].closed
    asyncio.run(scenario())


@pytest.mark.parametrize("language", ["en", "hi", "multi"])
def test_host_language_is_shared_with_guests_and_the_assistant(language):
    async def scenario():
        rooms, agent = service()
        host = await rooms.create("Host", language)
        guest = await rooms.join(host["room"]["code"], "Guest")
        assert host["room"]["language"] == guest["room"]["language"] == language
        await rooms.start(host["room"]["code"], host["memberSecret"])
        assert agent.starts[0][3]["language"] == language
        await rooms.shutdown()
    asyncio.run(scenario())
