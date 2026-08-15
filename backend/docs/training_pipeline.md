# Machine Learning Training Pipeline

This document provides a detailed overview of the training pipeline architecture for the Zeyro machine learning models, specifically covering the **Behavioural Finance Score (BFS)** and the **Repayment Probability Score (RPS)**. 

The pipeline is entirely contained within `python/training/` and follows strict senior ML engineering patterns: immutable updates, stateless functional components where possible, strict static typing (Pyright), and robust experiment tracking.

---

## 🏗 Pipeline Architecture

The pipeline is split into distinct logical layers:
1. **Orchestration & Retraining**: High-level managers for running multiple pipelines, snapshotting data distributions, and generating retrain reports.
2. **Core Training**: XGBoost execution, Hyperparameter tuning (Optuna), and evaluation.
3. **Evaluation & Explainability**: Statistical validation (KS, AUC, PSI) and SHAP tree explainers.
4. **Registry**: Artefact storage and version control.

*(Note: ATP and Fraud models have been transitioned to deterministic, rules-based scorecards and are completely independent of this XGBoost ML training pipeline.)*

---

## 📁 File Responsibilities

Below is an exhaustive breakdown of every module in the `python/training/` directory and its purpose.

### 1. Orchestration & Retraining
*These files manage the high-level workflow, often invoked from Jupyter Notebooks or Airflow/Prefect pipelines.*

* **`pipeline.py`**
  The top-level orchestrator. Provides `run_all(df_bfs, df_rps)` which sequentially executes the full BFS and RPS pipelines. Useful for clean, one-shot notebook execution.
  
* **`retrain.py`**
  The `RetrainManager`. Orchestrates incremental retraining on new data batches. It is responsible for:
  - Performing **Pre-training snapshots** (calculating Population Stability Index / PSI against the production model to detect drift).
  - Executing the training script.
  - Generating a **Post-training snapshot** and creating a Markdown `retrain_report.md` (comparing old vs. new AUC, Brier, SHAP importance).
  - Auto-promoting the new model if PSI drift thresholds are not violated.

### 2. Core Training Scripts
*The execution engines for model building.*

* **`train_bfs.py`**
  The dedicated script for training the **Behavioural Finance Score (BFS)** model. Handles standardizing features, training an XGBoost classifier, computing SHAP values, metrics, and persisting everything to the ModelRegistry.

* **`train_rps.py`**
  The dedicated script for training the **Repayment Probability Score (RPS)** model. Operates similarly to `train_bfs.py` but targets Repayment-specific data spaces and hyperparameters.

* **`optuna_tuner.py`**
  Hyperparameter tuning engine. Uses Optuna to find optimal XGBoost parameters (learning rate, max depth, subsample, colsample_bytree, etc.) by optimising for a custom objective (typically a combination of ROC AUC and Brier Score).

### 3. Data Processing & Calibration
*Transforming raw data and calibrating raw model outputs into probabilities.*

* **`features.py`**
  The single source of truth for feature mappings. Defines `BFS_FEATURES`, `RPS_FEATURES`, and their respective targets. Contains helpers for imputing nulls, casting strictly to `float32`, and preprocessing functions (e.g., `clip_and_log_inr` for heavy-tailed currency values).

* **`calibration.py`**
  Implements probability calibration (typically Isotonic Regression). Ensures that the raw output probabilities from XGBoost reflect actual real-world default probabilities.

* **`calibrate_bfs.py` & `calibrate_rps.py`**
  Wrappers mapping the core `calibration.py` logic strictly to the outputs of the BFS and RPS models respectively.

### 4. Evaluation, Validation & Explainability
*Ensuring the model is safe, performant, and interpretable.*

* **`validation.py`**
  The mathematical validation suite. Implements functions to calculate Kolmogorov-Smirnov (KS) statistics, Brier Scores, Precision/Recall, Confusion Matrices, and Population Stability Index (PSI). 

* **`shap_explainer.py`**
  Explainability engine. Wraps `shap.TreeExplainer` to extract both:
  - **Global SHAP**: Which features matter most across the cohort.
  - **Local SHAP**: Exact per-observation contributions (pushing probabilities up or down). Also maps SHAP feature impacts to human-readable **Adverse Action Codes** for regulatory compliance.

### 5. Utilities & Tracking
*Logging and Artefact management.*

* **`registry.py`**
  The local `ModelRegistry`. Handles saving models, calibrators, threshold metadata, and feature distributions safely to disk. Also generates a `MANIFEST.md` for the entire versioned artifact folder.

* **`model_card.py`**
  Generates a Markdown-based "Model Card" (following industry-standard transparent reporting) detailing the model's purpose, training parameters, final evaluation metrics, and SHAP feature importance.

* **`run_logger.py`**
  A stylized, structured console logger (using `rich` or standard logging). Standardises the terminal output format into distinct "Phases" (e.g., `[Phase 1] Data Prep`, `[Phase 2] Optuna`, `[Phase 3] SHAP`) for easier debugging and cleaner CI/CD logs.

* **`callbacks.py`**
  XGBoost-specific callbacks (e.g., early stopping or custom evaluation metric tracking) injected into the XGBoost `.fit()` or `.train()` loop.

---

## 🔄 End-to-End Retraining Flow Example

If new repayment data arrives, the recommended ML pipeline flow is:

1. **Invoke Retrain Manager**: `manager = RetrainManager(registry, "rps")`
2. **Pre-flight Check**: Manager calculates **PSI** on the incoming dataset against the recorded `training_distribution.json` of the current production model. If PSI > `0.20`, execution halts or warns (preventing silent drift training).
3. **Tune & Train**: `train_rps.py` delegates to `optuna_tuner.py` to find parameters, trains `XGBClassifier`, and fits `IsotonicRegression` (via `calibrate_rps.py`).
4. **Evaluate & Explain**: `validation.py` evaluates on the hold-out test set. `shap_explainer.py` builds the global feature importance rankings.
5. **Register**: `registry.py` writes artifacts and `model_card.py` generates the README. `retrain_report.md` is appended, comparing v1 to v2.
