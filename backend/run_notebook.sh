#!/bin/bash
docker run --rm --network host -v $(pwd):/workspace -w /workspace python:3.11-slim bash -c "\
pip install --default-timeout=1000 -q pandas numpy scikit-learn catboost pytorch-forecasting lightning optuna mlflow matplotlib jupyter nbconvert && \
jupyter nbconvert --execute notebooks/cashflow_nabard_tft.ipynb --to notebook --inplace"
