"""Production single-origin hosting must preserve API routes and disable legacy APIs."""
import importlib
import sys

from fastapi.testclient import TestClient


def test_web_host_and_judge_api(fake_env, monkeypatch, tmp_path):
    (tmp_path / "index.html").write_text("<html>Agora Decision Rooms production demo</html>")
    monkeypatch.setenv("WEB_DIST_DIR", str(tmp_path))
    monkeypatch.setenv("ENABLE_NATIVE_API", "false")
    sys.modules.pop("server", None)
    module = importlib.import_module("server")
    with TestClient(module.app) as client:
        assert "Agora Decision Rooms" in client.get("/").text
        assert client.get("/api/health").json()["configured"]
        assert client.get("/get_config").status_code == 404
        host = client.post("/api/voice/rooms", json={"name": "Judge"}).json()
        assert host["room"]["members"][0]["name"] == "Judge"
        guest = client.post("/api/voice/rooms/" + host["room"]["code"] + "/join", json={"name": "Guest"}).json()
        assert guest["config"]["channelName"] == host["config"]["channelName"]
        response = client.post("/api/voice/rooms/" + host["room"]["code"] + "/leave", headers={"X-Room-Member": host["memberSecret"]})
        assert response.json()["room"]["closed"]
