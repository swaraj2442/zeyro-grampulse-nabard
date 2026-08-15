import json

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

new_cell_source = [
    "import sys, os\n",
    "\n",
    "# If running locally, this adds the root folder to the path.\n",
    "# If running in Colab, just upload the 'src' folder to the Files tab on the left!\n",
    "if os.path.exists('../src'):\n",
    "    sys.path.insert(0, os.path.abspath('..'))\n",
    "elif os.path.exists('./src'):\n",
    "    sys.path.insert(0, os.path.abspath('.'))\n",
    "elif os.path.exists('/content/src'):\n",
    "    sys.path.insert(0, '/content')\n",
    "else:\n",
    "    print(\"Warning: Could not find 'src' directory. Please upload your 'src' folder if you are on Colab!\")\n",
    "\n",
    "print(\"Path setup complete.\")\n"
]

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = "".join(cell['source'])
        if "GITHUB_REPO" in source and "subprocess.run(['git'" in source:
            cell['source'] = new_cell_source

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
