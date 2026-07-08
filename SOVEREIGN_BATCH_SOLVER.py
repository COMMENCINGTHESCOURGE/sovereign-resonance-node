# -*- coding: utf-8 -*-
import json
import requests
import os
import time
import numpy as np

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Check environment for ASUS network IP broadcast or default to localhost
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "localhost")
OLLAMA_URL = f"http://{OLLAMA_HOST}:11434/api/generate"

DATASET_PATH = os.environ.get("ARC_DATASET_PATH", str(BASE_DIR / "KAGGLE_ARC_DATASET.jsonl"))
OUTPUT_DIR = os.environ.get("ARC_OUTPUT_DIR", str(BASE_DIR / "BATCH_RESULTS"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

CHAR_MAP = {' ':0, '\u235f':1, '\u238a':2, '\u232c':3, '\u2394':4, '\u1686':5, '\u229a':6, '\u2625':7, '\u1694':8, '\u23e3':9}

def grid_to_matrix(grid_str):
    return [[CHAR_MAP.get(c, 0) for c in line] for line in grid_str.strip().split('\n')]

def solve_task(task_id, input_m, output_m):
    prompt = f"""### ARC SOVEREIGN SOLVER [TASK {task_id}]
Input Matrix: {json.dumps(input_m)}
Output Matrix: {json.dumps(output_m)}

### INSTRUCTION
1. Compute the output grid dimensions as a mathematical function of the input grid.
2. Implement the `transform(input_grid)` function by constructing the output RIGHT to LEFT (backwards).
3. Use deterministic logic (tiling, mirroring, or object isolation).
Start your response with \"def transform(input_grid):\" and provide ONLY the code.
"""
    payload = {"model": "gemma4:2b", "prompt": prompt, "stream": False, "options": {"temperature": 0}}
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=300)
        r.raise_for_status()
        return r.json().get("response", "").strip()
    except requests.exceptions.Timeout:
        print("[NETWORK] Bounded timeout reached (300s). Node offline.")
        return "ERROR_TIMEOUT"
    except requests.exceptions.ConnectionError:
        print(f"[NETWORK] Cannot reach ASUS endpoint: {OLLAMA_URL}")
        return "ERROR_CONNECTION"
    except Exception as e:
        print(f"[NETWORK] Unhandled exception: {e}")
        return "ERROR"

def verify(code, input_m, expected_m):
    try:
        # Bounded execution environment (preventing arbitrary system calls)
        namespace = {'__builtins__': {}} 
        exec(code, namespace)
        if 'transform' not in namespace: return False
        return namespace['transform'](input_m) == expected_m
    except Exception as e:
        # Catch and bound all generated syntax errors
        return False

def run_excavation(limit=100):
    print(f"--- SOVEREIGN EXCAVATION INITIATED: 0 to {limit} ---")
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= limit: break
            task = json.loads(line)
            tid = task['id']
            print(f"[TASK {tid}] Processing...")
            
            input_m = grid_to_matrix(task['frames'][0])
            expected_m = grid_to_matrix(task['frames'][1])
            
            code = solve_task(tid, input_m, expected_m)
            success = verify(code, input_m, expected_m)
            
            status = "SUCCESS" if success else "LOGIC_BREACH"
            print(f"  -> Result: {status}")
            
            # Commit to Research Record
            with open(os.path.join(OUTPUT_DIR, "excavation_log.jsonl"), "a") as log:
                log.write(json.dumps({"id": tid, "status": status, "code": code}) + "\n")

if __name__ == "__main__":
    run_excavation(100)
