"""Real local API + public read-provider check. Never prints room secrets or tokens."""
import argparse
import json
import time
import sys
from pathlib import Path

import requests

sys.stdout.reconfigure(encoding="utf-8")

parser = argparse.ArgumentParser()
parser.add_argument("--city", default="Bengaluru")
parser.add_argument("--voice", action="store_true", help="Also start/stop the actual Agora assistant and test tool-result delivery")
args = parser.parse_args()
base = "http://127.0.0.1:8000/api/voice/rooms"
accesses = []
evidence = {"city": args.city, "date": time.strftime("%Y-%m-%d"), "checks": {}, "voiceRequested": args.voice}


def request(url, body=None, access=None):
    headers = {"X-Room-Member": access["memberSecret"]} if access else {}
    response = requests.post(url, json=body, headers=headers, timeout=65) if body is not None else requests.get(url, headers=headers, timeout=12)
    response.raise_for_status()
    return response.json()


def command(access, **body):
    return request(base + "/" + access["room"]["code"] + "/stage", body, access)["room"]["stage"]


def snapshot(access):
    return request(base + "/" + access["room"]["code"], access=access)["room"]["stage"]


try:
    host = request(base, {"name": "Verification host", "language": "multi"})
    accesses.append(host)
    guest = request(base + "/" + host["room"]["code"] + "/join", {"name": "Verification guest"})
    accesses.append(guest)
    if args.voice:
        request(base + "/" + host["room"]["code"] + "/assistant", {}, host)
    command(host, action="plan", plan={"city": args.city, "origin": args.city, "date": "", "time": "18:00"})
    command(host, action="utterance", text="My budget is seven hundred rupees.", turnId="verification-host")
    command(guest, action="utterance", text="मुझे शाकाहारी खाना चाहिए।", turnId="verification-guest")
    for tool in ("venues", "reservations", "weather", "travel"):
        command(host, action="check", tool=tool)
        deadline = time.time() + 75
        while time.time() < deadline:
            stage = snapshot(host)
            check = stage["checks"][tool]
            if check["status"] != "checking" and (not args.voice or stage["voiceDelivery"] in ("sent", "failed")):
                break
            time.sleep(1)
        assert check["status"] == "ready", tool + ": " + check["summary"]
        evidence["checks"][tool] = {"status": check["status"], "provider": check.get("provider"),
                                    "summary": check["summary"], "source": check.get("source"), "checkedAt": check["checkedAt"],
                                    "voiceDelivery": stage["voiceDelivery"]}
        print(tool + ": " + check["summary"])
        if args.voice:
            assert stage["voiceDelivery"] == "sent", "Actual Agora think request was not accepted"
        if tool == "venues":
            command(host, action="select", venueId=stage["venues"][0]["id"])
    stage = snapshot(host)
    assert stage == snapshot(guest), "The two authenticated room views diverged"
    command(host, action="vote", support=True, version=stage["decisionVersion"])
    response = requests.post(base + "/" + host["room"]["code"] + "/stage",
        json={"action": "approve", "version": stage["decisionVersion"]}, headers={"X-Room-Member": host["memberSecret"]}, timeout=12)
    assert response.status_code == 409, "Host confirmed without the guest's vote"
    command(guest, action="vote", support=True, version=stage["decisionVersion"])
    approved = command(host, action="approve", version=stage["decisionVersion"])["approved"]
    assert approved and not approved["bookingMade"] and len(approved["participants"]) == 2
    assert snapshot(host) == snapshot(guest)
    evidence.update(sharedViewsMatch=True, earlyApprovalRejected=True, realMemberConsensus=True, noBookingMade=True,
                    physicalSpeechAndAudibility="Pending laptop/Android user test")
    target = Path(__file__).resolve().parents[1] / "docs" / "verification" / "live-smart-stage-2026-10-04.json"
    target.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Shared results, two actual member votes and host confirmation passed.")
finally:
    for access in reversed(accesses):
        try: request(base + "/" + access["room"]["code"] + "/leave", {}, access)
        except requests.RequestException: pass
