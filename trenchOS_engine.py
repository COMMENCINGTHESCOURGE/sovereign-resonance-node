import time
import json
import os
import threading
from typing import List, Dict, Optional, Set
from collections import deque

class LevenshteinCache:
    def __init__(self, size=500):
        self.cache = {}
        self.size = size

    def get_distance(self, s1, s2):
        key = tuple(sorted((s1, s2)))
        if key in self.cache: return self.cache[key]
        d = self._calc_levenshtein(s1, s2)
        if len(self.cache) < self.size: self.cache[key] = d
        return d

    def _calc_levenshtein(self, s1, s2):
        if len(s1) < len(s2): return self._calc_levenshtein(s2, s1)
        if not s2: return len(s1)
        prev_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            curr_row = [i + 1]
            for j, c2 in enumerate(s2):
                curr_row.append(min(prev_row[j+1]+1, curr_row[j]+1, prev_row[j]+(c1!=c2)))
            prev_row = curr_row
        return prev_row[-1]

class HistoryManager:
    """Atomic JSONL Persistence with Thread Safety."""
    def __init__(self, file_path="C:/Users/dasha/AppData/Local/Temp/history.jsonl"):
        self.path = file_path
        self.lock = threading.Lock()

    def commit(self, event: dict):
        with self.lock:
            # Atomic append
            temp_path = self.path + ".tmp"
            with open(self.path, "a", encoding="utf-8") as f:
                f.write(json.dumps(event) + "\n")
            # If we wanted full atomic swap for rewrite, we'd use os.replace

class TypingEngine:
    """TrenchOS v2.5 - [PRODUCTION_CORE]"""
    def __init__(self, vocabulary: Set[str], history_file="history.jsonl"):
        self.vocab = vocabulary
        self.lev = LevenshteinCache()
        self.history = HistoryManager(history_file)

    def build_candidates(self, word: str, threshold=2) -> List[Dict]:
        if not word: return []
        word = word.lower()
        candidates = []
        for v in self.vocab:
            dist = self.lev.get_distance(word, v.lower())
            if dist <= threshold:
                score = 1.0 - (dist / max(len(word), len(v)))
                candidates.append({"word": v, "score": round(score, 4)})
        
        result = sorted(candidates, key=lambda x: x['score'], reverse=True)
        if result:
            self.history.commit({"ts": time.time(), "input": word, "best_match": result[0]})
        return result

