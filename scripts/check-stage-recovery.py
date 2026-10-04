"""Replay the reported Hindi turns through the real local Stage API, not microphone ASR."""
import argparse
import json
import sys
import time
from pathlib import Path

import requests

sys.stdout.reconfigure(encoding="utf-8")
parser = argparse.ArgumentParser()
parser.add_argument("--voice", action="store_true")
args = parser.parse_args()
base = "http://127.0.0.1:8000/api/voice/rooms"
accesses = []


def request(path="", body=None, access=None):
    headers = {"X-Room-Member": access["memberSecret"]} if access else {}
    response = requests.post(base + path, json=body, headers=headers, timeout=65) if body is not None else requests.get(base + path, headers=headers, timeout=12)
    response.raise_for_status()
    return response.json()


def command(access, **body):
    return request("/" + access["room"]["code"] + "/stage", body, access)["room"]["stage"]


def stage(access):
    return request("/" + access["room"]["code"], access=access)["room"]["stage"]


def settled(access):
    deadline = time.time() + 75
    while time.time() < deadline:
        value = stage(access)
        check = value["checks"].get("weather")
        if check and check["status"] != "checking" and (not args.voice or value["voiceDelivery"] in ("sent", "failed")):
            return value
        time.sleep(1)
    raise AssertionError("Weather did not settle before the deadline")


try:
    host = request(body={"name": "Recovery test", "language": "multi"})
    accesses.append(host)
    guest = request("/" + host["room"]["code"] + "/join", {"name": "Second view"})
    accesses.append(guest)
    if args.voice:
        request("/" + host["room"]["code"] + "/assistant", {}, host)
    note = "मुझे रात के दसबजे तक घर पहुंचना है और मेरे पास सिर्फ पांच घंटे का time है"
    command(host, action="utterance", text=note, turnId="recovery-1")
    command(host, action="utterance", text="क्या कल बारिश होगी?", turnId="recovery-2")
    missing = settled(host)
    assert missing["checks"]["weather"]["needs"] == ["city"]
    requested_date = missing["plan"]["date"]
    command(host, action="utterance", text="हाँ येदिल्ली शाद्रा", turnId="recovery-3")
    recovered = settled(host)
    check = recovered["checks"]["weather"]
    assert recovered["plan"]["city"] == "Shahdara, Delhi"
    assert check["status"] == "ready", check["summary"]
    assert check["date"] == requested_date and recovered["plan"]["date"] == requested_date
    assert recovered["preferences"][host["config"]["uid"]]["note"] == note
    assert not recovered["pendingChecks"]
    assert stage(guest) == recovered
    if args.voice:
        assert recovered["voiceDelivery"] == "sent"
    evidence = {"verifiedAt": int(time.time()), "transport": "Authenticated final-utterance API replay; physical ASR/audio not tested",
                "missingCityPrompt": True, "automaticRetry": True, "tomorrowPreserved": requested_date,
                "curfewNoteCaptured": True, "sharedViewsMatch": True, "check": check,
                "agoraResultDelivery": recovered["voiceDelivery"], "physicalRehearsal": "Pending laptop/Android test"}
    target = Path(__file__).resolve().parents[1] / "docs/verification/stage-recovery-2026-10-04.json"
    target.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": check["status"], "city": recovered["plan"]["city"], "date": requested_date,
                      "summary": check["summary"], "detail": check["detail"], "delivery": recovered["voiceDelivery"]}, ensure_ascii=False))
finally:
    for access in reversed(accesses):
        try:
            request("/" + access["room"]["code"] + "/leave", {}, access)
        except requests.RequestException:
            pass
