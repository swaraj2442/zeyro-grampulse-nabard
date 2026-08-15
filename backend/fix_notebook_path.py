import json

with open('notebooks/cashflow_nabard_tft.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Check if path injection is already there
already_has_path = False
for cell in nb['cells']:
    if cell['cell_type'] == 'code' and 'sys.path.append' in "".join(cell['source']) and 'dummtdatasets' in "".join(cell['source']):
        already_has_path = True
        break

if not already_has_path:
    path_cell = {
       "cell_type": "code",
       "execution_count": None,
       "metadata": {},
       "outputs": [],
       "source": [
        "import sys\n",
        "import os\n",
        "from pathlib import Path\n",
        "\n",
        "# Automatically add the repository root to sys.path so we can import 'dummtdatasets'\n",
        "try:\n",
        "    # If running on Kaggle with github sync, the repo is usually in the working directory\n",
        "    repo_root = Path(os.getcwd())\n",
        "    if not (repo_root / 'dummtdatasets').exists():\n",
        "        if (repo_root.parent / 'dummtdatasets').exists():\n",
        "            repo_root = repo_root.parent\n",
        "        elif (repo_root / 'z-b2b' / 'dummtdatasets').exists():\n",
        "            repo_root = repo_root / 'z-b2b'\n",
        "            \n",
        "    if str(repo_root) not in sys.path:\n",
        "        sys.path.insert(0, str(repo_root))\n",
        "        print(f\"Added {repo_root} to Python path.\")\n",
        "except Exception as e:\n",
        "    print(f\"Could not automatically resolve path: {e}\")\n"
       ]
    }
    nb['cells'].insert(0, path_cell)

    with open('notebooks/cashflow_nabard_tft.ipynb', 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)
