import json

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

new_cell_source = [
    "import subprocess, sys, os\n",
    "\n",
    "GITHUB_REPO   = 'https://github.com/swaraj2442/z-business.git'  # ← change this to your repo\n",
    "GITHUB_BRANCH = 'main'  # ← change this to your specific branch\n",
    "REPO_DIR      = '/content/cashflow_pipeline'\n",
    "\n",
    "if 'google.colab' in sys.modules:\n",
    "    if os.path.exists(REPO_DIR):\n",
    "        print(f'Repo exists. Pulling latest from {GITHUB_BRANCH}...')\n",
    "        subprocess.run(['git', '-C', REPO_DIR, 'fetch'], capture_output=True)\n",
    "        subprocess.run(['git', '-C', REPO_DIR, 'checkout', GITHUB_BRANCH], capture_output=True)\n",
    "        result = subprocess.run(['git', '-C', REPO_DIR, 'pull', 'origin', GITHUB_BRANCH], capture_output=True, text=True)\n",
    "        print(f'Pulled latest: {result.stdout.strip()}')\n",
    "    else:\n",
    "        print(f'Cloning {GITHUB_BRANCH} branch from {GITHUB_REPO}...')\n",
    "        result = subprocess.run(['git', 'clone', '-b', GITHUB_BRANCH, GITHUB_REPO, REPO_DIR], capture_output=True, text=True)\n",
    "        print(f'Cloned: {result.stdout.strip() or result.stderr.strip()}')\n",
    "\n",
    "    if REPO_DIR not in sys.path:\n",
    "        sys.path.insert(0, REPO_DIR)\n",
    "    print(f'✅ Repo ready at {REPO_DIR}')\n",
    "else:\n",
    "    if os.path.exists('../src'):\n",
    "        sys.path.insert(0, os.path.abspath('..'))\n",
    "    elif os.path.exists('./src'):\n",
    "        sys.path.insert(0, os.path.abspath('.'))\n",
    "    print('✅ Running locally. Using local files instead of cloning GitHub.')\n"
]

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = "".join(cell['source'])
        if "GITHUB_REPO" in source and "subprocess.run(['git'" in source:
            cell['source'] = new_cell_source

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
