"""Authoritative, ephemeral shared decisions and speech-triggered read checks."""
import asyncio
import copy
import json
import logging
import re
import time

from fastapi import HTTPException

from planning_tools import PlanningError, PlanningTools
from spoken_plan import extract_meeting

logger = logging.getLogger("uvicorn.error")
TOOLS = ("venues", "reservations", "weather", "travel")


def extract_preferences(text):
    """Small transparent bilingual parser. Unrecognised speech remains in captions."""
    lower = text.lower()
    result = {}
    budget = re.search(r'(?:budget|बजट|₹|rs\.?|rupees?)\s*(?:is|of|hai|है|मेरा|:|under|तक|up to)?\s*([\d,]+)', lower)
    if not budget:
        budget = re.search(r'([\d,]+)\s*(?:rupees?|रुपये|रुपए|रुपयों)', lower)
    if budget:
        value = int(budget.group(1).replace(",", ""))
        if 0 < value <= 100000:
            result["budget"] = value
    for word, value in (("सात सौ", 700), ("पांच सौ", 500), ("पाँच सौ", 500), ("नौ सौ", 900), ("एक हजार", 1000),
                        ("seven hundred", 700), ("five hundred", 500), ("nine hundred", 900)):
        if word in lower and any(w in lower for w in ("budget", "बजट", "rupees", "रुपये")):
            result["budget"] = value
    if any(w in lower for w in ("not vegetarian", "non vegetarian", "non-vegetarian", "non-veg", "non veg", "nonveg", "नॉन वेज", "मांसाहारी")):
        result["diet"] = "No vegetarian requirement"
    elif any(w in lower for w in ("vegetarian", "veg only", "only veg", "शाकाहारी", "वेज चाहिए", "वेज ही")):
        result["diet"] = "Vegetarian"
    if any(w in lower for w in ("indoors", "indoor", "अंदर", "इनडोर")):
        result["setting"] = "Indoors preferred"
    if any(w in lower for w in ("outdoors", "outdoor", "खुले में", "आउटडोर")):
        result["setting"] = "Outdoors preferred"
    if any(w in lower for w in ("home by", "be home", "back by", "घर पहुँचना", "घर पहुंचना", "घर जाना", "वापस", "hours", "घंटे", "घण्टे")):
        result["note"] = text[:160]
    return result


def requested_tool(text):
    lower = text.lower()
    if any(w in lower for w in ("reservation", "reserve", "booking", "table available", "book a table", "open now", "opening hour", "are they open", "खुला", "खुले", "बुकिंग", "रिजर्व", "आरक्षण")):
        return "reservations"
    if any(w in lower for w in ("weather", "rain", "forecast", "मौसम", "बारिश")):
        return "weather"
    if any(w in lower for w in ("travel", "route", "drive", "how far", "how long to get", "traffic", "distance", "कितनी दूर", "कितना समय", "रास्ता", "ट्रैफिक")):
        return "travel"
    if any(w in lower for w in ("find", "search", "suggest", "ढूंढ", "ढूँढ", "खोज", "सुझा")) and any(w in lower for w in ("restaurant", "cafe", "venue", "place", "food", "रेस्तरां", "कैफे", "जगह")):
        return "venues"
    return None


class LiveStage:
    def __init__(self, providers=None):
        self.providers = providers or PlanningTools()
        self.tasks = {}
        self.last_good = {}

    @staticmethod
    def empty():
        return {"revision": 0, "decisionVersion": 0, "contextVersion": 0,
                "plan": {"city": "", "origin": "", "date": "", "time": "18:00"},
                "preferences": {}, "venues": [], "selectedId": None,
                "checks": {}, "votes": {}, "approved": None, "notice": "Set the city, then ask the assistant to find venues.",
                "voiceDelivery": "idle", "pendingChecks": {}, "suggestedPlan": None}

    def update_plan(self, room, updates):
        stage = room.stage
        plan = {**stage["plan"], **updates}
        if plan == stage["plan"]:
            return False
        location_changed = plan["city"] != stage["plan"]["city"]
        stage["plan"] = plan
        self.revise(room, context=True)
        stage["checks"] = {}
        stage["suggestedPlan"] = None
        if location_changed:
            stage["venues"] = []
            stage["selectedId"] = None
        return True

    def resume_pending(self, room, member, agent):
        for tool, pending in list(room.stage["pendingChecks"].items()):
            venue = room.stage["selectedId"]
            if all(venue if need == "venue" else room.stage["plan"].get(need)
                   for need in pending["needs"]):
                self.launch(room, member, tool, agent, force=True, overrides=pending.get("plan"))

    @staticmethod
    def revise(room, context=False):
        stage = room.stage
        stage["revision"] += 1
        stage["decisionVersion"] += 1
        stage["votes"] = {}
        stage["approved"] = None
        if context:
            stage["contextVersion"] += 1
            for check in stage["checks"].values():
                if check["status"] == "checking":
                    check.update(status="error", summary="The group plan changed. Run this check again.")

    async def command(self, room, member, body, agent):
        async with room.lock:
            if room.closed or room.expires_at <= time.time():
                raise HTTPException(410, "This room has ended.")
            if member.uid not in room.members:
                raise HTTPException(403, "Your room access has expired. Join again.")
            stage = room.stage
            action = body["action"]
            if action in ("vote", "approve") and body.get("version") != stage["decisionVersion"]:
                raise HTTPException(409, "The plan changed. Review the latest Stage and vote again.")
            if action == "plan":
                if member.uid != room.host_uid:
                    raise HTTPException(403, "Only the host can edit the meeting details.")
                self.update_plan(room, body.get("plan", {}))
                stage["notice"] = "Meeting details updated. Everyone sees the same plan."
                self.resume_pending(room, member, agent)
            elif action == "preference":
                preference = body.get("preference", {})
                if preference != stage["preferences"].get(member.uid):
                    stage["preferences"][member.uid] = preference
                    self.revise(room)
                stage["notice"] = "Your preferences are shared. Venue prices and suitability still need confirmation."
            elif action in ("utterance", "request"):
                text = body["text"].strip()
                # Internal voice injections must never recursively trigger checks.
                if re.match(r"^STAGE_READ_RESULT\b", text, re.I):
                    return
                if action == "utterance":
                    key = member.uid + ":" + body["turnId"]
                    if key in room.stage_seen:
                        return
                    room.stage_seen[key] = True
                    if len(room.stage_seen) > 800:
                        room.stage_seen.popitem(last=False)
                preference = extract_preferences(text)
                if preference:
                    current = stage["preferences"].get(member.uid, {})
                    updated = {**current, **preference}
                    if current != updated:
                        stage["preferences"][member.uid] = updated
                        self.revise(room)
                    stage["notice"] = "Preferences captured from speech. Check or edit them before deciding."
                tool = requested_tool(text)
                awaiting_city = any("city" in p["needs"] for p in stage["pendingChecks"].values())
                updates = extract_meeting(text, awaiting_city=awaiting_city and not tool and not preference)
                if updates:
                    if member.uid == room.host_uid:
                        self.update_plan(room, updates)
                        stage["notice"] = "Meeting details captured. Check or edit them before deciding."
                        self.resume_pending(room, member, agent)
                    else:
                        previous = stage.get("suggestedPlan")
                        base = previous["plan"] if previous and previous.get("uid") == member.uid else stage["plan"]
                        stage["suggestedPlan"] = {"plan": {**base, **updates}, "name": member.name, "uid": member.uid}
                        stage["notice"] = "Meeting details suggested. The host can apply them from Plan."
                if tool:
                    self.launch(room, member, tool, agent, overrides={"date": updates["date"]} if tool == "weather" and "date" in updates else None)
                elif action == "request" and not preference and not updates:
                    stage["notice"] = "Try: find restaurants, check reservations, check weather, or check travel time."
            elif action == "check":
                self.launch(room, member, body["tool"], agent)
            elif action == "select":
                if not any(v["id"] == body.get("venueId") for v in stage["venues"]):
                    raise HTTPException(422, "Choose a venue from the current results.")
                if stage["selectedId"] != body["venueId"]:
                    stage["selectedId"] = body["venueId"]
                    self.revise(room, context=True)
                    stage["checks"].pop("reservations", None)
                    stage["checks"].pop("travel", None)
                stage["notice"] = "A venue is proposed. Check the details, then each participant votes."
                self.resume_pending(room, member, agent)
            elif action == "vote":
                if not stage["selectedId"]:
                    raise HTTPException(409, "Propose a venue before voting.")
                if any(c["status"] == "checking" for c in stage["checks"].values()):
                    raise HTTPException(409, "Wait for the current checks before voting.")
                stage["votes"][member.uid] = stage["selectedId"] if body.get("support") else "changes"
                stage["approved"] = None
                stage["notice"] = "Your vote is shared with the group."
            elif action == "approve":
                if member.uid != room.host_uid:
                    raise HTTPException(403, "Only the host can confirm the group's plan.")
                if not stage["selectedId"] or any(stage["votes"].get(uid) != stage["selectedId"] for uid in room.members):
                    raise HTTPException(409, "Every current participant must support this venue before the host confirms.")
                if any(c["status"] == "checking" for c in stage["checks"].values()):
                    raise HTTPException(409, "Wait for the current checks before confirming.")
                if not stage["approved"]:
                    venue = next(v for v in stage["venues"] if v["id"] == stage["selectedId"])
                    stage["approved"] = {"id": "PLAN-" + room.code + "-" + str(stage["decisionVersion"]),
                                         "venue": copy.deepcopy(venue), "plan": copy.deepcopy(stage["plan"]),
                                         "participants": [{"uid": uid, "name": m.name} for uid, m in room.members.items()],
                                         "approvedAt": int(time.time()), "bookingMade": False}
                stage["notice"] = "Group plan confirmed. No booking has been made."
            stage["revision"] += 1

    def launch(self, room, member, tool, agent, force=False, overrides=None):
        if tool not in TOOLS:
            raise HTTPException(422, "Choose a supported planning check.")
        key = (room.code, tool)
        stage = room.stage
        plan = {**copy.deepcopy(stage["plan"]), **(overrides or {})}
        previous = stage["checks"].get(tool)
        same_request = previous and previous.get("meetingDetails") == plan
        if previous and previous["status"] == "checking" and same_request:
            return
        if previous and previous["status"] == "ready" and same_request and not force and time.time() - previous.get("checkedAt", 0) < 10:
            room.stage["notice"] = "That check just ran. Review its result or try again in a few seconds."
            return
        previous_task = self.tasks.get(key)
        if previous_task and not previous_task.done():
            previous_task.cancel()
        self.revise(room)
        request_id = stage["revision"]
        stage["checks"][tool] = {"tool": tool, "status": "checking", "summary": "Checking…", "checkedAt": int(time.time()),
                                  "requestedBy": member.name, "meetingDetails": plan, "requestId": request_id}
        stage["notice"] = "The assistant is checking the source for your group."
        venue = next((copy.deepcopy(v) for v in stage["venues"] if v["id"] == stage["selectedId"]), None)
        needs = (["city"] if tool in ("weather", "venues") and not plan["city"] else [])
        if tool in ("reservations", "travel") and not venue:
            needs.append("venue")
        if tool == "travel" and not plan["origin"]:
            needs.append("origin")
        if needs:
            stage["pendingChecks"][tool] = {"tool": tool, "needs": needs, "plan": overrides or {}}
        else:
            stage["pendingChecks"].pop(tool, None)
        task = asyncio.create_task(self.complete(room, tool, plan, venue, stage["contextVersion"], agent, request_id))
        self.tasks[key] = task
        task.add_done_callback(lambda done: self.tasks.pop(key, None) if self.tasks.get(key) is done else None)

    async def complete(self, room, tool, plan, venue, context, agent, request_id):
        async def read_with_retry():
            for attempt in range(2):
                try:
                    return await self.providers.run(tool, plan, venue)
                except PlanningError as error:
                    if error.needs or attempt:
                        raise
                    await asyncio.sleep(1)
        try:
            result = await asyncio.wait_for(read_with_retry(), 60)
            status = "ready"
        except TimeoutError:
            result, status = {"summary": "The provider took too long. Please try this check again."}, "error"
        except PlanningError as error:
            result, status = {"summary": str(error), "needs": error.needs}, "error"
        except asyncio.CancelledError:
            return
        except Exception:
            logger.exception("Planning provider failed tool=%s", tool)
            result, status = {"summary": "The provider check failed. Please try again."}, "error"
        async with room.lock:
            current = room.stage["checks"].get(tool)
            if room.closed or context != room.stage["contextVersion"] or not current or current.get("requestId") != request_id:
                return
            self.revise(room)
            check = {**room.stage["checks"][tool], **result, "status": status, "checkedAt": int(time.time())}
            key = (room.code, tool)
            if status == "ready":
                self.last_good[key] = (context, copy.deepcopy(check))
                room.stage["pendingChecks"].pop(tool, None)
            else:
                if result.get("needs"):
                    room.stage["pendingChecks"][tool] = {**room.stage["pendingChecks"].get(tool, {}), "tool": tool, "needs": result["needs"],
                                                         "plan": {"date": plan["date"]} if tool == "weather" and plan["date"] else {}}
                cached = self.last_good.get(key)
                if cached and cached[0] == context and cached[1].get("meetingDetails") == plan and time.time() - cached[1]["checkedAt"] < 900:
                    check["previousResult"] = {k: cached[1].get(k) for k in ("summary", "summaryHi", "checkedAt", "provider", "source")}
            room.stage["checks"][tool] = check
            if tool == "venues" and status == "ready":
                room.stage["venues"] = result["venues"]
                room.stage["selectedId"] = None
                room.stage["contextVersion"] += 1
                for other, pending in room.stage["checks"].items():
                    if other != tool and pending["status"] == "checking":
                        pending.update(status="error", summary="The venue list changed. Run this check again.")
                for other in ("reservations", "travel"):
                    room.stage["checks"].pop(other, None)
            room.stage["notice"] = "Source checked. Review the result together." if status == "ready" else result["summary"]
            delivery_id = (tool, request_id, context)
            room.stage["voiceDeliveryId"] = delivery_id
            agent_id = room.agent_id
            payload = {"tool": tool, "status": status, "summary": result["summary"], "detail": result.get("detail", ""),
                       "provider": result.get("provider", ""), "source": result.get("source", ""),
                       "checkedAt": check["checkedAt"], "noBookingMade": True,
                       "meetingDetails": copy.deepcopy(plan),
                       "groupPreferences": [{"name": m.name, **room.stage["preferences"].get(uid, {})} for uid, m in room.members.items()],
                       "needs": result.get("needs", []), "previousResult": check.get("previousResult")}
            if tool == "venues" and status == "ready":
                payload["venues"] = [{"id": v["id"], "name": v["name"], "vegetarian": v["vegetarian"], "price": None} for v in result["venues"]]
            room.stage["voiceDelivery"] = "sending" if agent_id else "not-started"
        if agent_id:
            try:
                await asyncio.wait_for(agent.deliver_stage(agent_id, json.dumps(payload, ensure_ascii=False)), 10)
                delivery = "sent"
            except asyncio.CancelledError:
                return
            except Exception:
                logger.warning("Stage result is visible but voice delivery failed", exc_info=False)
                delivery = "failed"
            async with room.lock:
                if not room.closed and room.stage.get("voiceDeliveryId") == delivery_id:
                    room.stage["voiceDelivery"] = delivery
                    room.stage["revision"] += 1

    def cancel(self, room):
        for key in list(self.last_good):
            if key[0] == room.code:
                self.last_good.pop(key, None)
        for (code, _), task in list(self.tasks.items()):
            if code == room.code:
                task.cancel()
