import pytest
import os
import tempfile
from trenchOS_engine import TypingEngine

def test_engine_history_persistence():
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jsonl") as tmp:
        h_file = tmp.name
    
    engine = TypingEngine(set(["brady"]), history_file=h_file)
    engine.build_candidates("brady")
    
    with open(h_file, "r") as f:
        line = f.readline()
        assert "brady" in line
    os.remove(h_file)

def test_engine_case_insensitivity():
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jsonl") as tmp:
        h_file = tmp.name
    engine = TypingEngine(set(["BRADY"]), history_file=h_file)
    res = engine.build_candidates("brady")
    assert res[0]["word"] == "BRADY"
    os.remove(h_file)
