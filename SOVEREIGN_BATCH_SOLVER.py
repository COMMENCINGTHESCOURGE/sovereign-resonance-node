# -*- coding: utf-8 -*-
import json
import requests
import os
import time
import numpy as np
import torch

from pathlib import Path
from ARC_ONNX_GENERATOR_V3 import UnrolledCellularAutomata

BASE_DIR = Path(__file__).resolve().parent

# Check environment for ASUS network IP broadcast or default to localhost
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "localhost")
OLLAMA_URL = f"http://{OLLAMA_HOST}:11434/api/generate"

DATASET_PATH = os.environ.get("ARC_DATASET_PATH", str(BASE_DIR / "KAGGLE_DATA"))
OUTPUT_DIR = os.environ.get("ARC_OUTPUT_DIR", str(BASE_DIR / "BATCH_RESULTS"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

CHAR_MAP = {' ':0, '\u235f':1, '\u238a':2, '\u232c':3, '\u2394':4, '\u1686':5, '\u229a':6, '\u2625':7, '\u1694':8, '\u23e3':9}

def grid_to_matrix(grid_str):
    return [[CHAR_MAP.get(c, 0) for c in line] for line in grid_str.strip().split('\n')]

def solve_task(task_id, input_m, output_m):
    prompt = f"""### ARC SOVEREIGN SOLVER [TASK {task_id}]
Input Matrix: {json.dumps(input_m)}
Output Matrix: {json.dumps(output_m)}

### KAGGLE NEUROGOLF ONNX SYNTHESIS INSTRUCTION
1. We are building a Loop-Free Unrolled Cellular Automaton (Conv2d).
2. The network processes a 10-channel grid (one-hot colors 0-9).
3. Compute the required transformation and output EXACTLY ONE JSON block representing the Conv2D kernel weights to execute it.
4. Format:
{{
  "weight": [[[[0.0, ...]]]] (Shape: [10, 10, 3, 3]),
  "bias": [0.0, ...] (Shape: [10])
}}
Provide ONLY valid JSON.
"""
    payload = {"model": "gemma4:2b", "prompt": prompt, "stream": False, "options": {"temperature": 0}}
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=300)
        r.raise_for_status()
        
        resp = r.json().get("response", "")
        if "```json" in resp:
            resp = resp.split("```json")[1].split("```")[0]
        elif "```" in resp:
            resp = resp.split("```")[1].split("```")[0]
            
        try:
            return json.loads(resp)
        except Exception:
            # Fallback to an identity matrix for testing if the LLM output is malformed
            identity_w = [[[[1.0 if c_out == c_in and i == 1 and j == 1 else 0.0 for j in range(3)] for i in range(3)] for c_in in range(10)] for c_out in range(10)]
            identity_b = [0.0] * 10
            return {"weight": identity_w, "bias": identity_b}

    except requests.exceptions.Timeout:
        print("[NETWORK] Bounded timeout reached (300s). Node offline.")
        return "ERROR_TIMEOUT"
    except requests.exceptions.ConnectionError:
        print(f"[NETWORK] Cannot reach ASUS endpoint: {OLLAMA_URL}")
        return "ERROR_CONNECTION"
    except Exception as e:
        print(f"[NETWORK] Unhandled exception: {e}")
        return "ERROR"

def verify(weights_dict, input_m, expected_m):
    if not weights_dict or 'weight' not in weights_dict:
        return False
    try:
        # Convert input matrix to 10-channel one-hot tensor
        h, w = len(input_m), len(input_m[0])
        in_t = torch.zeros(1, 10, h, w, dtype=torch.float32)
        for r in range(h):
            for c in range(w):
                val = input_m[r][c]
                if 0 <= val < 10:
                    in_t[0, val, r, c] = 1.0
                    
        # Simulate the Cellular Automaton in PyTorch
        model = UnrolledCellularAutomata(in_channels=10, out_channels=10, kernel_size=3, unroll_depth=10, weights_dict=weights_dict)
        model.eval()
        
        with torch.no_grad():
            out_t = model(in_t)
            
        # Collapse channels back to a 2D grid via argmax
        pred = out_t.argmax(dim=1).squeeze(0).numpy().tolist()
        return pred == expected_m
    except Exception as e:
        print(f"  [SIMULATOR ERROR] {e}")
        return False

def run_excavation(limit=100):
    print(f"--- SOVEREIGN EXCAVATION INITIATED: 0 to {limit} ---")
    dataset_dir = Path(DATASET_PATH)
    task_files = sorted(list(dataset_dir.glob("task*.json")))
    
    for i, file_path in enumerate(task_files):
        if i >= limit: break
        
        with open(file_path, "r", encoding="utf-8") as f:
            task = json.load(f)
            
        # The new ARC-AGI Kaggle format provides 'train' and 'test' lists. We use the first train example.
        tid = file_path.stem
        print(f"[TASK {tid}] Processing...")
        
        # ARC Kaggle 2026 format mapping
        try:
            train_example = task['train'][0]
            input_m = train_example['input']
            expected_m = train_example['output']
        except KeyError:
            # Fallback for old format if somehow mixed
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
