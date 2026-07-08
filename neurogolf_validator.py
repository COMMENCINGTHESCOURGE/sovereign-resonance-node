import onnx
import onnxruntime as ort
import numpy as np
import os
import math

# Banned Operators per Kaggle NeuroGolf Rules
BANNED_OPS = {"Loop", "Scan", "NonZero", "Unique", "Script", "Function"}
MAX_FILE_SIZE = 1.44 * 1024 * 1024 # 1.44 MB

def validate_onnx_model(onnx_path):
    print(f"\n--- Validating: {os.path.basename(onnx_path)} ---")
    
    # 1. File Size Constraint
    file_size = os.path.getsize(onnx_path)
    print(f"File Size: {file_size} bytes")
    if file_size > MAX_FILE_SIZE:
        print("[FAIL] File size exceeds 1.44MB constraint.")
        return False

    # 2. Load Model
    model = onnx.load(onnx_path)
    
    # 3. Parameter Count & Banned Ops Check
    param_count = 0
    for init in model.graph.initializer:
        param_count += np.prod(init.dims)
        
    print(f"Parameter Count: {param_count}")
    
    for node in model.graph.node:
        if node.op_type in BANNED_OPS:
            print(f"[FAIL] Banned operator found: {node.op_type}")
            return False
            
    # 4. Calculate Kaggle Score
    cost = param_count + file_size
    score = max(1, 25 - math.log(cost)) if cost > 0 else 25
    print(f"[SCORE] NeuroGolf Official Metric: {score:.4f}")
    
    # 5. Inference Test
    try:
        session = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
        
        # Test shape (1, 10, 5, 5) to simulate a 5x5 ARC grid with 10 colors
        dummy_input = np.zeros((1, 10, 5, 5), dtype=np.float32)
        input_name = session.get_inputs()[0].name
        
        out = session.run(None, {input_name: dummy_input})
        print("[PASS] ONNX Runtime Inference Successful.")
        return True
    except Exception as e:
        print(f"[FAIL] ONNX Runtime execution error: {e}")
        return False

if __name__ == "__main__":
    test_path = "C:/Users/dasha/HACKATHON_SUBMISSION/SUBMISSION_ONNX/task000_TEST.onnx"
    if os.path.exists(test_path):
        validate_onnx_model(test_path)
    else:
        print("Run ARC_ONNX_GENERATOR_V3.py first to generate the test model.")
