# Makefile to manage and run JupyterLab and Notebooks locally

.PHONY: run install clean

# Default port for JupyterLab
PORT ?= 8888

# Boot JupyterLab using the dedicated ML virtual environment
run:
	@echo "Starting JupyterLab on port $(PORT)..."
	../.venv_sys/bin/jupyter lab --port=$(PORT) --notebook-dir=.

# Register the dedicated ML environment as an ipykernel so it appears in existing JupyterLabs
register-kernel:
	@echo "Registering .venv_sys as an ipykernel..."
	../.venv_sys/bin/python -m ipykernel install --user --name=venv_sys --display-name "Python (CIBIL XGBoost)"

# Clean up cached ipynb checkpoints
clean:
	@echo "Cleaning checkpoint files..."
	rm -rf .ipynb_checkpoints/

# Programmatically execute the CIBIL training notebook using the dedicated ML environment
run-cibil:
	@echo "Executing cibil_xgboost_training.ipynb..."
	../.venv_sys/bin/jupyter nbconvert --to notebook --execute --inplace cibil_xgboost_training.ipynb
