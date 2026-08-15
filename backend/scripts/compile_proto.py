"""Script to compile protobuf definitions for Go and Python."""

import os
import subprocess
import glob

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    proto_dir = os.path.join(root_dir, "proto")
    py_out_dir = os.path.join(proto_dir, "py")
    
    print(f"Root directory: {root_dir}")
    print(f"Proto directory: {proto_dir}")
    
    # 1. Create output directories
    os.makedirs(py_out_dir, exist_ok=True)
    
    # Go directories
    for pkg in ["assessment", "scoring", "features", "consent", "audit"]:
        os.makedirs(os.path.join(proto_dir, pkg), exist_ok=True)
        
    # 2. Clean old generated Python files in proto/ root
    old_py_files = glob.glob(os.path.join(proto_dir, "*_pb2*.py"))
    for f in old_py_files:
        print(f"Removing old python pb file: {f}")
        os.remove(f)
        
    # 3. Compile Go Protobuf
    print("Compiling Go protobuf files...")
    go_path = os.path.expanduser("~/go/bin")
    env = os.environ.copy()
    env["PATH"] = f"{env.get('PATH', '')}:{go_path}"
    
    go_cmd = [
        "protoc",
        "-I.",
        "--go_out=.",
        "--go_opt=module=github.com/arthazeyro/zeyro-b2b",
        "--go-grpc_out=.",
        "--go-grpc_opt=module=github.com/arthazeyro/zeyro-b2b",
    ] + glob.glob("proto/*.proto")
    
    subprocess.run(go_cmd, cwd=root_dir, check=True, env=env)
    print("Go protobuf compiled successfully!")
    
    # 4. Compile Python Protobuf into proto/py
    print("Compiling Python protobuf files into proto/py...")
    # Find active virtualenv python or use system python
    venv_python = os.path.join(root_dir, ".venv", "bin", "python3")
    python_exe = venv_python if os.path.exists(venv_python) else "python3"
    
    py_cmd = [
        python_exe,
        "-m",
        "grpc_tools.protoc",
        "-Iproto",
        "--python_out=proto/py",
        "--pyi_out=proto/py",
        "--grpc_python_out=proto/py",
    ] + [os.path.basename(p) for p in glob.glob("proto/*.proto")]
    
    subprocess.run(py_cmd, cwd=root_dir, check=True)
    print("Python protobuf compiled successfully!")
    
    # 5. Write __init__.py inside proto/py
    init_path = os.path.join(py_out_dir, "__init__.py")
    with open(init_path, "w") as f:
        f.write("# Generated python protobuf package\n")
        
    # 6. Post-process python files to fix relative imports
    print("Post-processing Python grpc files for relative imports...")
    grpc_files = glob.glob(os.path.join(py_out_dir, "*_pb2_grpc.py"))
    for file_path in grpc_files:
        print(f"Post-processing {file_path}")
        with open(file_path, "r") as f:
            content = f.read()
            
        # Replace: import X_pb2 as X__pb2 -> from . import X_pb2 as X__pb2
        # To make it work as a relative import
        lines = content.splitlines()
        for idx, line in enumerate(lines):
            # Check for pattern like: import assessment_pb2 as assessment__pb2
            if line.startswith("import ") and "_pb2 as " in line:
                parts = line.split()
                # parts: ['import', 'assessment_pb2', 'as', 'assessment__pb2']
                pb2_module = parts[1]
                pb2_alias = parts[3]
                lines[idx] = f"from . import {pb2_module} as {pb2_alias}"
                
        with open(file_path, "w") as f:
            f.write("\n".join(lines) + "\n")
            
    print("Protobuf compilation completed successfully!")

if __name__ == "__main__":
    main()
