import asyncio
import time
from datetime import date, timedelta

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from live_stage import extract_preferences, requested_tool
from spoken_plan import extract_meeting
from planning_tools import PlanningError, PlanningTools
from voice_rooms import VoiceRooms, make_router

VENUE = {"id": "node/123", "name": "A real listing", "lat": 12.97, "lon": 77.59,
         "source": "https://www.openstreetmap.org/node/123", "price": None,
         "vegetarian": "unknown", "website": None}


class Providers:
    def __init__(self):
        self.calls = []
        self.wait = None

    async def run(self, tool, plan, venue):
        self.calls.append((tool, plan, venue))
        if self.wait:
            await self.wait.wait()
        return {"summary": "Checked", "source": "https://open-meteo.com/", "provider": "Test provider",
                **({"venues": [VENUE]} if tool == "venues" else {})}


class Agent:
    def __init__(self): self.delivered = []
    async def start(self, *args, **kwargs): return {"agent_id": "agent-id"}
    async def stop(self, *args): pass
    async def deliver_stage(self, agent_id, data): self.delivered.append((agent_id, data))


def service():
    provider, agent = Providers(), Agent()
    rooms = VoiceRooms(lambda: agent, lambda c, u, a: {"uid": u}, planning_tools=provider)
    return rooms, provider, agent


async def send(rooms, access, **command):
    room = rooms.rooms[access["room"]["code"]]
    member = rooms._member(room, access["memberSecret"])
    await rooms.stage_service.command(room, member, command, rooms._ready())
    return room.stage


@pytest.mark.parametrize("text,expected", [
    ("My budget is 700 and I am vegetarian", {"budget": 700, "diet": "Vegetarian"}),
    ("मेरा बजट सात सौ रुपये है, शाकाहारी खाना चाहिए", {"budget": 700, "diet": "Vegetarian"}),
    ("Budget ९००, indoor please", {"budget": 900, "setting": "Indoors preferred"}),
    ("I am not vegetarian", {"diet": "No vegetarian requirement"}),
])
def test_bilingual_preferences(text, expected):
    assert extract_preferences(text) == expected


@pytest.mark.parametrize("text,tool", [("Is reservation available?", "reservations"),
    ("रेस्तरां खोजो", "venues"), ("बारिश होगी?", "weather"), ("कितना समय लगेगा?", "travel")])
def test_bilingual_read_requests(text, tool):
    assert requested_tool(text) == tool


def test_own_votes_version_checks_and_host_approval_are_authoritative():
    async def scenario():
        rooms, _, _ = service()
        host = await rooms.create("Host")
        guest = await rooms.join(host["room"]["code"], "Guest")
        stage = await send(rooms, host, action="check", tool="venues")
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        await send(rooms, host, action="select", venueId=VENUE["id"])
        version = stage["decisionVersion"]
        await send(rooms, host, action="vote", support=True, version=version)
        with pytest.raises(HTTPException) as error:
            await send(rooms, host, action="approve", version=version)
        assert error.value.status_code == 409
        await send(rooms, guest, action="vote", support=True, version=version)
        with pytest.raises(HTTPException) as error:
            await send(rooms, guest, action="approve", version=version)
        assert error.value.status_code == 403
        await send(rooms, host, action="approve", version=version)
        assert stage["approved"]["bookingMade"] is False
        assert len(stage["approved"]["participants"]) == 2
        guest_view = rooms.status(host["room"]["code"], guest["memberSecret"])["room"]["stage"]
        assert guest_view == stage
        await send(rooms, host, action="preference", preference={"budget": 700})
        assert not stage["votes"] and not stage["approved"]
        with pytest.raises(HTTPException) as error:
            await send(rooms, guest, action="vote", support=True, version=version)
        assert error.value.status_code == 409
        await rooms.shutdown()
    asyncio.run(scenario())


def test_final_speech_dedup_and_result_delivery_to_room_agent():
    async def scenario():
        rooms, provider, agent = service()
        host = await rooms.create("Host")
        await rooms.start(host["room"]["code"], host["memberSecret"])
        for _ in range(3):
            stage = await send(rooms, host, action="utterance", turnId="12", text="My budget is 700. Find restaurants.")
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        assert len(provider.calls) == 1
        assert stage["preferences"][host["config"]["uid"]]["budget"] == 700
        assert stage["checks"]["venues"]["status"] == "ready"
        assert len(agent.delivered) == 1
        assert '"price": null' in agent.delivered[0][1]
        assert stage["voiceDelivery"] == "sent"
        await rooms.shutdown()
    asyncio.run(scenario())


def test_slow_checks_cannot_replace_results_after_context_changes():
    async def scenario():
        rooms, provider, _ = service()
        provider.wait = asyncio.Event()
        host = await rooms.create("Host")
        await send(rooms, host, action="plan", plan={"city": "Delhi", "origin": "Delhi", "date": "", "time": "18:00"})
        stage = await send(rooms, host, action="check", tool="venues")
        await asyncio.sleep(0)
        old_job = list(rooms.stage_service.tasks.values())[0]
        await send(rooms, host, action="plan", plan={"city": "Chennai", "origin": "Chennai", "date": "", "time": "18:00"})
        provider.wait.set()
        await old_job
        assert not stage["venues"] and not stage["checks"]
        await rooms.shutdown()
    asyncio.run(scenario())


def test_membership_changes_reset_consensus():
    async def scenario():
        rooms, _, _ = service()
        host = await rooms.create("Host")
        stage = rooms.rooms[host["room"]["code"]].stage
        stage["venues"] = [VENUE]
        await send(rooms, host, action="select", venueId=VENUE["id"])
        await send(rooms, host, action="vote", support=True, version=stage["decisionVersion"])
        guest = await rooms.join(host["room"]["code"], "Guest")
        assert not stage["votes"]
        stage["votes"][guest["config"]["uid"]] = VENUE["id"]
        await rooms.leave(host["room"]["code"], guest["memberSecret"])
        assert not stage["votes"]
        await rooms.shutdown()
    asyncio.run(scenario())


def test_stage_route_authentication_and_input_validation():
    rooms, _, _ = service()
    app = FastAPI()
    app.include_router(make_router(rooms))
    with TestClient(app) as client:
        host = client.post("/api/voice/rooms", json={"name": "Host"}).json()
        url = "/api/voice/rooms/" + host["room"]["code"] + "/stage"
        assert client.post(url, json={"action": "approve", "version": 0}).status_code == 403
        headers = {"X-Room-Member": host["memberSecret"]}
        for payload in ({"action": "check"}, {"action": "utterance", "text": "Hi"},
                        {"action": "plan", "plan": {"date": "2026-02-31"}},
                        {"action": "preference", "preference": {"budget": -1}}):
            assert client.post(url, json=payload, headers=headers).status_code == 422


def test_new_preferences_do_not_cancel_a_location_only_venue_lookup():
    async def scenario():
        rooms, provider, _ = service()
        provider.wait = asyncio.Event()
        host = await rooms.create("Host")
        stage = await send(rooms, host, action="check", tool="venues")
        await asyncio.sleep(0)
        pending = list(rooms.stage_service.tasks.values())[0]
        await send(rooms, host, action="preference", preference={"budget": 700})
        provider.wait.set()
        await pending
        assert stage["checks"]["venues"]["status"] == "ready" and stage["venues"]
        assert stage["preferences"][host["config"]["uid"]]["budget"] == 700
        await rooms.shutdown()
    asyncio.run(scenario())


def test_reservation_policy_is_never_a_bookable_slot():
    async def scenario():
        tools = PlanningTools()
        async def response(*args):
            return {"elements": [{"tags": {"reservation": "yes", "opening_hours": "Mo-Su 10:00-22:00", "website": "javascript:alert(1)"}}]}
        tools.get = response
        result = await tools.reservations({}, VENUE)
        assert result["policy"] == "yes" and result["slotsVerified"] is False
        assert "unverified" in result["summary"]
        assert result["website"] is None
    asyncio.run(scenario())


def test_forecast_is_for_requested_window_and_does_not_imply_actual_rain():
    async def scenario():
        tools = PlanningTools()
        async def location(*args): return {"name": "City", "lat": 1, "lon": 2}
        async def response(*args): return {"timezone": "Asia/Kolkata", "hourly": {
            "time": ["2026-10-04T17:00", "2026-10-04T18:00", "2026-10-04T19:00", "2026-10-04T20:00"],
            "precipitation_probability": [95, 10, 30, 40], "temperature_2m": [24, 23, 22, 21]}}
        tools.location, tools.get = location, response
        result = await tools.weather({"city": "City", "date": "2026-10-04", "time": "18:30"})
        assert result["rainProbability"] == 40
        assert "not a guarantee" in result["detail"]
    asyncio.run(scenario())


def test_overloaded_venue_server_recovers_with_a_real_alternate_and_rejects_partial_data():
    async def scenario():
        tools, calls = PlanningTools(), []
        async def response(url, params):
            calls.append(url)
            if len(calls) == 1:
                return {"remark": "Query timed out", "elements": []}
            return {"elements": [{"id": 1}]}
        tools.get = response
        result = await tools.overpass("bounded query")
        assert len(calls) == 2 and len(result["elements"]) == 1
        async def unavailable(*args): raise PlanningError("Busy")
        tools.get = unavailable
        with pytest.raises(PlanningError): await tools.overpass("bounded query")
    asyncio.run(scenario())


def test_hindi_followup_preserves_tomorrow_and_recovers_the_original_weather_request():
    async def scenario():
        rooms, provider, _ = service()
        async def weather(tool, plan, venue):
            provider.calls.append((tool, plan, venue))
            if not plan['city']:
                raise PlanningError('Set the city or meeting town in the group plan first.', ['city'])
            return {'summary': 'Real provider would run for this city and date.'}
        provider.run = weather
        host = await rooms.create('Shivam')
        note = 'मुझे रात के दसबजे तक घर पहुंचना है और मेरे पास सिर्फ पांच घंटे का time है'
        stage = await send(rooms, host, action='utterance', turnId='1', text=note)
        assert stage['preferences'][host['config']['uid']]['note'] == note
        await send(rooms, host, action='utterance', turnId='2', text='क्या कल बारिश होगी?')
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        tomorrow = extract_meeting('tomorrow')['date']
        assert stage['plan']['date'] == tomorrow
        assert stage['checks']['weather']['needs'] == ['city']
        await send(rooms, host, action='utterance', turnId='3', text='हाँ येदिल्ली शाद्रा')
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        assert stage['plan']['city'] == 'Shahdara, Delhi'
        assert stage['plan']['date'] == tomorrow and stage['plan']['time'] == '18:00'
        assert stage['checks']['weather']['status'] == 'ready'
        assert not stage['pendingChecks'] and len(provider.calls) == 2
        assert provider.calls[-1][1]['date'] == tomorrow
        await send(rooms, host, action='utterance', turnId='4', text='STAGE_READ_RESULT {"tool":"weather"}')
        assert len(provider.calls) == 2
        await rooms.shutdown()
    asyncio.run(scenario())


def test_guest_location_is_a_host_reviewed_suggestion_and_manual_plan_resumes_pending_check():
    async def scenario():
        rooms, provider, _ = service()
        async def read(tool, plan, venue):
            if not plan['city']: raise PlanningError('City needed', ['city'])
            provider.calls.append(plan)
            return {'summary': 'Checked'}
        provider.run = read
        host = await rooms.create('Host')
        guest = await rooms.join(host['room']['code'], 'Guest')
        stage = await send(rooms, guest, action='request', text='Check weather tomorrow')
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        await send(rooms, guest, action='utterance', turnId='1', text='Delhi')
        assert not stage['plan']['city'] and stage['suggestedPlan']['plan']['city'] == 'Delhi'
        # Preserve the guest's date suggestion when the host applies it.
        plan = stage['suggestedPlan']['plan']
        assert plan['date'] == extract_meeting('tomorrow')['date']
        await send(rooms, host, action='plan', plan=plan)
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        assert stage['checks']['weather']['status'] == 'ready' and len(provider.calls) == 1
        await rooms.shutdown()
    asyncio.run(scenario())


def test_transient_provider_failure_retries_once_and_retains_an_explicit_old_result():
    async def scenario():
        rooms, provider, _ = service()
        host = await rooms.create('Host')
        stage = await send(rooms, host, action='check', tool='weather')
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        count = 0
        async def fail(*args):
            nonlocal count
            count += 1
            raise PlanningError('Provider unavailable')
        provider.run = fail
        stage['checks']['weather']['checkedAt'] -= 11
        await send(rooms, host, action='check', tool='weather')
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        assert count == 2 and stage['checks']['weather']['status'] == 'error'
        assert stage['checks']['weather']['previousResult']['summary'] == 'Checked'
        await rooms.shutdown()
    asyncio.run(scenario())


@pytest.mark.parametrize('text,expected', [
    ('हाँ येदिल्ली शाद्रा', {'city': 'Shahdara, Delhi'}),
    ('Weather in Delhi tomorrow?', {'city': 'Delhi', 'date': '2026-10-05'}),
    ('Meet in Mumbai at 6 pm', {'city': 'Mumbai', 'time': '18:00'}),
    ('Delhi or Mumbai?', {}), ('Not in Delhi', {}),
    ('I need to be home by 10 pm', {}),
    ('क्या कल बारिश हुई थी?', {}),
])
def test_spoken_meeting_details(text, expected):
    assert extract_meeting(text, today=date(2026, 10, 4)) == expected


def test_locality_geocoding_falls_back_to_city_with_an_explicit_scope_note():
    async def scenario():
        tools, names = PlanningTools(), []
        async def get(url, params):
            names.append(params['name'])
            return {'results': []} if params['name'] == 'Shahdara' else {'results': [
                {'name': 'Delhi', 'admin1': 'Delhi', 'country_code': 'IN', 'country': 'India', 'latitude': 28.65, 'longitude': 77.23}]}
        tools.get = get
        location = await tools.location('दिल्ली शाद्रा')
        assert names == ['Shahdara', 'Delhi'] and 'not the exact neighbourhood' in location['scopeNote']
    asyncio.run(scenario())


def test_guest_weather_date_is_not_blocked_by_cooldown_or_replaced_by_another_dates_cached_result():
    async def scenario():
        rooms, provider, _ = service()
        host = await rooms.create('Host')
        guest = await rooms.join(host['room']['code'], 'Guest')
        stage = await send(rooms, host, action='plan', plan={'city': 'Delhi', 'date': '2026-10-04', 'time': '18:00', 'origin': ''})
        await send(rooms, host, action='check', tool='weather')
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        async def unavailable(*args): raise PlanningError('Unavailable')
        provider.run = unavailable
        await send(rooms, guest, action='request', text='Check weather 2026-10-05')
        await asyncio.gather(*list(rooms.stage_service.tasks.values()))
        assert stage['plan']['date'] == '2026-10-04'
        assert stage['checks']['weather']['meetingDetails']['date'] == '2026-10-05'
        assert stage['checks']['weather']['status'] == 'error'
        assert 'previousResult' not in stage['checks']['weather']
        await rooms.shutdown()
    asyncio.run(scenario())
