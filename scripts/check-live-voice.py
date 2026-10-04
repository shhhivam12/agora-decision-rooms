"""Check real Agora room start/stop; never print tokens or member secrets."""
import argparse
import json
from urllib.request import Request, urlopen


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    args = parser.parse_args()

    def request(path, body=None, access=None):
        headers = {"Content-Type": "application/json"}
        if access:
            headers["X-Room-Member"] = access["memberSecret"]
        req = Request(args.url + path, headers=headers,
                      data=json.dumps(body).encode() if body is not None else None)
        with urlopen(req, timeout=70) as response:
            return json.load(response)

    host = guest = None
    code = None
    try:
        assert request("/api/health")["configured"]
        host = request("/api/voice/rooms", {"name": "Demo check host"})
        code = host["room"]["code"]
        path = "/api/voice/rooms/" + code
        guest = request(path + "/join", {"name": "Demo check guest"})
        assert host["config"]["channelName"] == guest["config"]["channelName"]
        assert host["config"]["uid"] != guest["config"]["uid"]
        print("PASS: two members receive distinct identities in the same Agora channel", flush=True)
        result = request(path + "/assistant", {}, host)
        assert result["room"]["assistantStarted"]
        print("PASS: real Agora Conversational AI session started", flush=True)
        request(path + "/leave", {}, guest)
        guest = None
        assert request(path, access=host)["room"]["assistantStarted"]
        print("PASS: guest leaves without ending the host session", flush=True)
    finally:
        if code:
            path = "/api/voice/rooms/" + code
            if guest:
                request(path + "/leave", {}, guest)
            if host:
                result = request(path + "/leave", {}, host)
                assert result["room"]["closed"]
                print("PASS: host ends the room and stops the assistant", flush=True)


if __name__ == "__main__":
    main()
