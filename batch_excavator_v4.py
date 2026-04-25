import json
import requests
import os

OLLAMA_URL = "http://localhost:11434/api/generate"
DATASET_PATH = r"C:\Users\dasha\KAGGLE_ARC_DATASET.jsonl"
LOG_DIR = r"C:\Users\dasha\KAGGLE_AUDIT_LOGS"

def classify_task(task_id, frames):
    prompt = f"ARC Task {task_id}. Analyze the pattern. Is it TILING, RECOLORING, or OBJECT_MOVE? Respond with ONE word."
    payload = {"model": "gemma4:2b", "prompt": prompt, "stream": False}
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=60)
        return r.json().get("response", "UNKNOWN").strip().upper()
    except: return "ERROR"

def run_batch(limit=10):
    print(f"--- BATCH EXCAVATION START (Limit: {limit}) ---")
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= limit: break
            task = json.loads(line)
            tid = task['id']
            category = classify_task(tid, task['frames'])
            print(f"[TASK {tid}] Category: {category}")
            # Logging classification to start the audit trail
            with open(os.path.join(LOG_DIR, "batch_status.jsonl"), "a") as log:
                log.write(json.dumps({"id": tid, "cat": category}) + "\n")

run_batch(50)
