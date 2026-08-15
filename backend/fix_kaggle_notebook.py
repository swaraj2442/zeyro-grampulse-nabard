import json

with open('notebooks/cashflow_nabard_tft.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Remove any old path injection cells I might have added previously
nb['cells'] = [cell for cell in nb['cells'] if not (cell['cell_type'] == 'code' and 'sys.path' in "".join(cell['source']) and 'dummtdatasets' in "".join(cell['source']))]

# Pure python robust setup cell
setup_code = """import sys
import os
import shutil
from pathlib import Path

# 1. Create the expected directory structure in Kaggle's working folder
base_dir = Path("/kaggle/working/dummtdatasets/cashflow")
base_dir.mkdir(parents=True, exist_ok=True)
(Path("/kaggle/working/dummtdatasets") / "__init__.py").touch(exist_ok=True)
(base_dir / "__init__.py").touch(exist_ok=True)

# 2. Search Kaggle input folder for the uploaded scripts
input_dir = Path("/kaggle/input")
if input_dir.exists():
    for py_file in input_dir.rglob("*.py"):
        if py_file.name in ["multihead_generate_nabard.py", "nabard_cashflow_utils.py"]:
            shutil.copy2(py_file, base_dir / py_file.name)
            print(f"Copied {py_file.name} to {base_dir}")

# 3. Add the working directory to the Python path
if "/kaggle/working" not in sys.path:
    sys.path.insert(0, "/kaggle/working")
    print("✅ Files copied and path configured!")
"""

setup_cell = {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [line + '\n' for line in setup_code.split('\n')]
}

nb['cells'].insert(0, setup_cell)

with open('notebooks/cashflow_nabard_tft.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
