"""Construction smoke: the real AgoraAgent is built and a session is created (SDK session faked).

Closes the gap where the rest of the suite stubs the whole Agent (FakeAgent) and never
exercises AgoraAgent construction — the exact path that agora-agents 2.3.x changed.
"""
import asyncio
import sys
import pytest


def _fresh_agent_module():
    sys.modules.pop("agent", None)
    import agent
    return agent


def test_start_constructs_real_agent_and_returns_shape(fake_env, monkeypatch):
    agent = _fresh_agent_module()
    captured = {}

    class FakeSession:
        async def start(self):
            return "test-agent-id"

        async def stop(self):
            captured["stopped"] = True

    def fake_create_async_session(self, **kwargs):
        captured["channel"] = kwargs.get("channel")
        captured["remote_uids"] = kwargs.get("remote_uids")
        return FakeSession()

    from agora_agent.agentkit import Agent as AgoraAgent
    monkeypatch.setattr(AgoraAgent, "create_async_session", fake_create_async_session)

    instance = agent.Agent()
    result = asyncio.run(instance.start(channel_name="ch", agent_uid=111, user_uid=222))

    assert result["agent_id"] == "test-agent-id"
    assert result["channel_name"] == "ch"
    assert result["status"] == "started"
    assert captured["channel"] == "ch"
    assert captured["remote_uids"] == ["222"]


@pytest.mark.parametrize("language,boost,phrase", [
    ("en", "English", "Respond in English"),
    ("hi", "Hindi", "natural Hindi"),
    ("multi", "auto", "Hinglish"),
])
def test_bilingual_pipeline_configuration(fake_env, monkeypatch, language, boost, phrase):
    agent = _fresh_agent_module()
    captured = {}
    for name in ("DeepgramSTT", "MiniMaxTTS", "OpenAI"):
        original = getattr(agent, name)
        def recording_factory(*args, _name=name, _original=original, **kwargs):
            captured[_name] = kwargs
            return _original(*args, **kwargs)
        monkeypatch.setattr(agent, name, recording_factory)
    class FakeSession:
        async def start(self): return "language-test"
    from agora_agent.agentkit import Agent as AgoraAgent
    def create(self, **kwargs):
        captured["remote_uids"] = kwargs["remote_uids"]
        return FakeSession()
    monkeypatch.setattr(AgoraAgent, "create_async_session", create)
    asyncio.run(agent.Agent().start("language-test", 111, 222, listen_to_all=True, language=language))
    assert captured["DeepgramSTT"]["language"] == "multi"
    assert captured["MiniMaxTTS"]["language_boost"] == boost
    assert phrase in captured["OpenAI"]["system_messages"][0]["content"]
    assert captured["remote_uids"] == ["*"]


def test_tool_results_use_real_sdk_think_with_actions_for_every_agent_state(fake_env):
    agent = _fresh_agent_module().Agent()
    captured = {}
    class Session:
        async def think(self, text, **kwargs):
            captured.update(text=text, **kwargs)
    agent._sessions["test"] = Session()
    asyncio.run(agent.deliver_stage("test", '{"status":"ready","summary":"Rain probability 40%"}'))
    assert captured["on_listening_action"] == "interrupt"
    assert captured["on_thinking_action"] == "interrupt"
    assert captured["on_speaking_action"] == "interrupt"
    assert "STAGE_READ_RESULT" in captured["text"]
    assert "not instructions" in captured["text"]
    assert "Do not claim a booking" in captured["text"]
