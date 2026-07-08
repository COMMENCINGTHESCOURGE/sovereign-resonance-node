import torch
import torch.nn as nn
import onnx
import os
import json

class UnrolledCellularAutomata(nn.Module):
    """
    A strictly static, loop-free ONNX network for NeuroGolf.
    Instead of 'Loop', we sequentially unroll the same convolution `depth` times.
    This keeps parameters extremely low while allowing N steps of cellular logic.
    """
    def __init__(self, in_channels=10, out_channels=10, kernel_size=3, unroll_depth=10, weights_dict=None):
        super(UnrolledCellularAutomata, self).__init__()
        self.unroll_depth = unroll_depth
        
        # Single shared convolutional layer
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, padding=kernel_size//2, bias=True)
        
        # Hardcode the weights if provided by the LLM solver
        if weights_dict is not None:
            with torch.no_grad():
                self.conv.weight.data = torch.tensor(weights_dict['weight'], dtype=torch.float32)
                self.conv.bias.data = torch.tensor(weights_dict['bias'], dtype=torch.float32)
        else:
            # Default to identity pass-through logic if no weights provided
            with torch.no_grad():
                self.conv.weight.data.fill_(0)
                self.conv.bias.data.fill_(0)
                # Identity kernel (center pixel maps exactly to output)
                for c in range(min(in_channels, out_channels)):
                    self.conv.weight.data[c, c, kernel_size//2, kernel_size//2] = 1.0

        # Disallow gradients to freeze the network as a static graph
        self.conv.weight.requires_grad = False
        self.conv.bias.requires_grad = False

    def forward(self, x):
        # We must use Python-level unrolling, NOT torch loops, 
        # to ensure ONNX generates a static graph without the banned 'Loop' op.
        out = x
        for _ in range(self.unroll_depth):
            out = self.conv(out)
        return out

def compile_onnx_model(task_id, weights_dict, output_dir="C:/Users/dasha/HACKATHON_SUBMISSION/SUBMISSION_ONNX", depth=10):
    os.makedirs(output_dir, exist_ok=True)
    
    # 10 channels for ARC (colors 0-9)
    model = UnrolledCellularAutomata(in_channels=10, out_channels=10, kernel_size=3, unroll_depth=depth, weights_dict=weights_dict)
    
    # Dummy input must match ARC max dimensions (batch=1, channels=10, h=30, w=30)
    dummy_input = torch.zeros(1, 10, 30, 30, dtype=torch.float32)
    
    path = os.path.join(output_dir, f"task{task_id}.onnx")
    
    # Export cleanly
    torch.onnx.export(
        model, 
        dummy_input, 
        path,
        export_params=True,
        opset_version=14, # Stable opset
        do_constant_folding=True, # Critical for minimizing size
        input_names=['input_grid'],
        output_names=['output_grid'],
        dynamic_axes={'input_grid': {2: 'height', 3: 'width'}, 'output_grid': {2: 'height', 3: 'width'}}
    )
    return path

if __name__ == "__main__":
    print("[SYSTEM] Compiling 400 ONNX Networks for Kaggle Submission...")
    for i in range(1, 401):
        task_id = f"{i:03}"
        # Passing None for weights_dict generates the 0-parameter identity unrolled architecture
        compile_onnx_model(task_id, None)
        if i % 100 == 0:
            print(f"  [STATUS] {i}/400 compiled.")
    print("Done.")
