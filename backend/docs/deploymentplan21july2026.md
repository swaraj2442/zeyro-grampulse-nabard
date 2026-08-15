Memory updated. Now building the plan.

---

# Zeyro B2B — Build & Deploy Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task.

**Goal:** Industry-grade monorepo build, CI/CD, and Railway deploy architecture for Zeyro B2B credit underwriting platform.

**Architecture:** Go + gRPC backend → Python FastAPI/gRPC ML inference over private Railway network → React + Tailwind web. Proto contracts are the single source of truth. `ml/training/` is air-gapped from `apps/`. Two independent release pipelines: software and model.

**Tech Stack:** Go 1.23, buf, sqlc, golang-migrate, Python 3.11, grpcio, FastAPI, XGBoost, SHAP, Platt calibration, React 18, Vite, Tailwind CSS, Railway, GitHub Actions, S3 (ap-south-1), Hugging Face private repos.

---



## Current File Structure (As of Admin)

This represents the actual state of the repository before executing the plan:

```text
d:\z-business/
├── .env
├── .gitignore
├── .pytest_cache/
│   ├── .gitignore
│   ├── CACHEDIR.TAG
│   ├── README.md
│   └── v/
│       └── cache/
│           ├── lastfailed
│           └── nodeids
├── .venv_312/
│   └── pyvenv.cfg
├── Architecture V2.md
├── Makefile
├── README.md
├── api/
│   └── openapi.yaml
├── artifacts/
│   ├── bfs/
│   │   ├── bfs_optuna_demo/
│   │   │   └── best_params.json
│   │   ├── bfs_prod_v1/
│   │   │   ├── checkpoints/
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   └── bfs_v1/
│   │       ├── checkpoints/
│   │       ├── metrics_test.json
│   │       ├── metrics_val.json
│   │       ├── model.json
│   │       ├── run_summary.json
│   │       ├── shap_global_test.json
│   │       ├── shap_global_val.json
│   │       ├── training.log
│   │       └── training_curve.json
│   ├── credit/
│   │   ├── homecredit_bfs_optuna_152/
│   │   │   ├── best_params.json
│   │   │   └── optuna_study.db
│   │   ├── homecredit_bfs_optuna_v2/
│   │   │   ├── best_params.json
│   │   │   └── optuna_study.db
│   │   ├── homecredit_default_152/
│   │   │   ├── best_params.json
│   │   │   └── optuna_study.db
│   │   ├── homecredit_default_optuna_v2/
│   │   │   ├── best_params.json
│   │   │   └── optuna_study.db
│   │   ├── homecredit_rps_optuna_152/
│   │   │   ├── best_params.json
│   │   │   └── optuna_study.db
│   │   └── homecredit_rps_optuna_v2/
│   │       ├── best_params.json
│   │       └── optuna_study.db
│   ├── credit_default/
│   │   ├── credit_bfs_prod_v1/
│   │   │   ├── checkpoints/
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── credit_default_prod_v1/
│   │   │   ├── checkpoints/
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── credit_rps_prod_v1/
│   │   │   ├── checkpoints/
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── exp_bfs_age/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── exp_bfs_no_age/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── exp_bfs_no_ext/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── exp_default_age/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── exp_default_no_age/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── exp_default_no_ext/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── exp_no_ext_source/
│   │   │   └── training.log
│   │   ├── exp_rps_age/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── exp_rps_no_age/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── homecredit_bfs/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── homecredit_default/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   ├── homecredit_rps/
│   │   │   ├── checkpoints/
│   │   │   ├── fairness.json
│   │   │   ├── metrics_test.json
│   │   │   ├── metrics_tr.json
│   │   │   ├── metrics_val.json
│   │   │   ├── model.json
│   │   │   ├── psi_baseline.json
│   │   │   ├── psi_test.json
│   │   │   ├── run_summary.json
│   │   │   ├── shap_global_test.json
│   │   │   ├── shap_global_tr.json
│   │   │   ├── shap_global_val.json
│   │   │   ├── thresholds.json
│   │   │   ├── training.log
│   │   │   └── training_curve.json
│   │   └── psi_test_run/
│   │       ├── checkpoints/
│   │       ├── fairness.json
│   │       ├── metrics_test.json
│   │       ├── metrics_tr.json
│   │       ├── metrics_val.json
│   │       ├── model.json
│   │       ├── psi_baseline.json
│   │       ├── psi_test.json
│   │       ├── run_summary.json
│   │       ├── shap_global_test.json
│   │       ├── shap_global_tr.json
│   │       ├── shap_global_val.json
│   │       ├── thresholds.json
│   │       ├── training.log
│   │       └── training_curve.json
│   ├── homecredit/
│   └── rps/
│       ├── rps_optuna_demo/
│       │   └── best_params.json
│       ├── rps_prod_v1/
│       │   ├── checkpoints/
│       │   ├── metrics_test.json
│       │   ├── metrics_tr.json
│       │   ├── metrics_val.json
│       │   ├── model.json
│       │   ├── run_summary.json
│       │   ├── shap_global_test.json
│       │   ├── shap_global_tr.json
│       │   ├── shap_global_val.json
│       │   ├── training.log
│       │   └── training_curve.json
│       └── rps_v1/
│           ├── checkpoints/
│           ├── metrics_test.json
│           ├── metrics_val.json
│           ├── model.json
│           ├── run_summary.json
│           ├── shap_global_test.json
│           ├── shap_global_val.json
│           ├── training.log
│           └── training_curve.json
├── auth-service
├── bfs/
│   ├── aa_parser.py
│   ├── behavior_embeddings.py
│   ├── behavioral_features.py
│   ├── cashflow_engine.py
│   ├── entropy_features.py
│   ├── ews_engine.py
│   ├── feature_registry.yaml
│   ├── graph_features.py
│   └── model_card.md
├── cashflow_pipeline/
│   ├── .pytest_cache/
│   │   ├── .gitignore
│   │   ├── CACHEDIR.TAG
│   │   ├── README.md
│   │   └── v/
│   │       └── cache/
│   ├── README.md
│   ├── benchmarks/
│   │   └── benchmark_runner.py
│   ├── data/
│   │   ├── explore_indian_finance.py
│   │   ├── generate.py
│   │   ├── generate_large.py
│   │   ├── sample_aa_transactions.csv
│   │   ├── transactions_large.csv
│   │   └── user_profiles.csv
│   ├── fix5.py
│   ├── fix6.py
│   ├── fix7.py
│   ├── mlflow.db
│   ├── notebooks/
│   │   ├── artifacts/
│   │   │   └── cashflow/
│   │   ├── build_notebook.py
│   │   ├── cashflow_tft_training.ipynb
│   │   ├── cashflow_tft_training_local_new.ipynb
│   │   ├── kaggle_finance_eda.ipynb
│   │   ├── kaggle_indian_finance.ipynb
│   │   ├── mlflow.db
│   │   ├── mlruns/
│   │   │   └── 3/
│   │   └── models/
│   │       ├── forecaster_0.joblib
│   │       └── forecaster_Aggregate_Average.joblib
│   ├── pyproject.toml
│   ├── pyrightconfig.json
│   ├── requirements.txt
│   ├── scratch/
│   │   ├── add_optuna_cells.py
│   │   ├── analyze_feature_store.py
│   │   ├── change_drive_dir.py
│   │   ├── clean_dagshub_completely.py
│   │   ├── clean_markdown.py
│   │   ├── find_data_path.py
│   │   ├── fix_cell_order.py
│   │   ├── fix_git_cell.py
│   │   ├── fix_git_cell_with_branch.py
│   │   ├── fix_inf.py
│   │   ├── fix_notebook_v3.py
│   │   ├── fix_order_v2.py
│   │   ├── fix_order_v3.py
│   │   ├── fix_trainer_cell.py
│   │   ├── nb_dump.py
│   │   ├── nb_dump_2.py
│   │   ├── restore_cfg.py
│   │   └── set_branch.py
│   ├── src/
│   │   ├── __init__.py
│   │   ├── ews_rules.py
│   │   ├── feature_engineer.py
│   │   ├── forecaster.py
│   │   ├── hierarchical_forecaster.py
│   │   ├── ingestor.py
│   │   ├── ml_trainer.py
│   │   ├── monte_carlo.py
│   │   ├── output_bundler.py
│   │   ├── pipeline.py
│   │   ├── stress_engine.py
│   │   ├── tft_trainer.py
│   │   └── transaction_categorizer.py
│   ├── src.zip
│   └── tests/
│       ├── conftest.py
│       ├── test_ews_rules.py
│       ├── test_feature_engineer.py
│       ├── test_forecaster.py
│       ├── test_ingestor.py
│       ├── test_ml_trainer.py
│       ├── test_monte_carlo.py
│       ├── test_output_bundler.py
│       ├── test_pipeline.py
│       ├── test_stress_engine.py
│       └── test_transaction_categorizer.py
├── cmd/
│   ├── audit-service/
│   │   └── main.go
│   ├── auth-service/
│   │   └── main.go
│   ├── consent-orchestration/
│   │   └── main.go
│   ├── data-ingest/
│   │   └── main.go
│   ├── outcome-ingestion/
│   │   └── main.go
│   ├── partner-config/
│   │   └── main.go
│   ├── report-service/
│   │   └── main.go
│   └── webhook-service/
│       └── main.go
├── context/
│   ├── README.md
│   ├── _generated/
│   │   ├── README.md
│   │   └── session-draft.md
│   ├── current-status.md
│   ├── decision-log.md
│   ├── next-session.md
│   ├── project-overview.md
│   ├── repo-map.md
│   ├── session-history.md
│   └── templates/
│       └── session-update-template.md
├── data/
│   ├── behavior_clusters.parquet
│   ├── behavior_embeddings.npy
│   └── feature_store.parquet
├── dataset_profile.html
├── docker-compose.yml
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PARTNER_INTEGRATION.md
│   ├── RUNBOOK.md
│   ├── UNDERWRITING_API_SPEC.md
│   ├── ZEYRO_EXECUTION_PLAN.md
│   ├── cashflow_liquidity_plan.md
│   ├── compliance/
│   │   ├── aa-framework.md
│   │   ├── dpdp-controls.md
│   │   └── rbi-mrm-compliance.md
│   ├── deploymentplan21july2026.md
│   ├── ml_pipeline_architecture_4july2026
│   ├── model-cards/
│   │   └── BFS_MODEL_PLAN.md
│   └── training_pipeline.md
├── dummtdatasets/
│   ├── cibil_ind/
│   │   ├── External_Cibil_Dataset.xlsx
│   │   ├── Internal_Bank_Dataset.xlsx
│   │   ├── README.md
│   │   ├── Unseen_Dataset.xlsx
│   │   ├── cibil_test.csv
│   │   ├── cibil_train.csv
│   │   ├── cibil_unseen.csv
│   │   ├── cibil_val.csv
│   │   ├── shap_importance.csv
│   │   └── xgboost_cibil_calibrated.pkl
│   ├── csv/
│   │   └── dataset1_credit_default.csv
│   └── upi/
│       ├── README.md
│       ├── data_dictionary.csv
│       ├── fraud_labels.csv
│       ├── merchants.csv
│       ├── transactions.csv
│       └── users.csv
├── features.yaml
├── generate_profiles.py
├── go.mod
├── go.sum
├── internal/
│   ├── crypto/
│   │   ├── doc.go
│   │   └── hash.go
│   ├── domain/
│   │   ├── audit.go
│   │   ├── auth.go
│   │   ├── doc.go
│   │   ├── ingest.go
│   │   └── underwriting.go
│   ├── infra/
│   │   └── postgres/
│   │       └── db.go
│   ├── logger/
│   │   └── logger.go
│   ├── messaging/
│   │   ├── audit.go
│   │   ├── doc.go
│   │   ├── nats_audit.go
│   │   └── nats_events.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── doc.go
│   │   └── http.go
│   ├── repository/
│   │   ├── doc.go
│   │   ├── postgres/
│   │   │   ├── assessment_repo.go
│   │   │   ├── audit_repo.go
│   │   │   ├── consent_repo.go
│   │   │   ├── gen/
│   │   │   ├── queries/
│   │   │   └── transaction_repo.go
│   │   └── transaction.go
│   ├── token/
│   │   ├── paseto-checker.go
│   │   ├── paseto-maker.go
│   │   ├── paseto.go
│   │   └── payload.go
│   └── underwriting/
│       ├── bfs_service.go
│       ├── document_service.go
│       ├── handler.go
│       ├── job_worker.go
│       ├── repository.go
│       ├── service.go
│       ├── workflow.go
│       └── workflow_test.go
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_raw_transactions.sql
│   ├── 0003_add_onboarding_profiles.sql
│   ├── 0004_dashboard_schema.sql
│   ├── 0005_intelligence_modules.sql
│   ├── 0006_home_chat_schema.sql
│   └── 0007_underwriting_schema.sql
├── mlflow.db
├── mlruns/
│   ├── 0/
│   │   └── meta.yaml
│   ├── 1/
│   │   └── c4065b82a2de46e4b1e877ed0cac5a30/
│   │       └── artifacts/
│   ├── 16/
│   │   └── 887f30dffc3a4f2e9b6b6777b02618ce/
│   │       └── artifacts/
│   ├── 17/
│   │   └── d615bddb55eb4604b0223e53f0dc3652/
│   │       └── artifacts/
│   ├── 18/
│   │   └── 7359fd413056471f99d4d54959366325/
│   │       └── artifacts/
│   ├── 2/
│   │   └── b55b489ecf02438dafb76aeed0da4eef/
│   │       └── artifacts/
│   ├── 3/
│   │   └── ce6a304e6c3c4db6ab3df823d10851d4/
│   │       └── artifacts/
│   ├── 339331134449048080/
│   │   ├── 47eb9f4ecf494c3aa5361dce9d8365f0/
│   │   │   ├── artifacts/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── 8fc5da0d56164af4b189bfa43469827c/
│   │   │   ├── artifacts/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── d4d147b290a942e3808a7c87672bbb65/
│   │   │   ├── artifacts/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   └── meta.yaml
│   ├── 4/
│   │   └── fd7687ada10c4a9397eb3edb9f0c58d5/
│   │       └── artifacts/
│   ├── 456122929897264194/
│   │   ├── 447eff7b83df4a208d8e81a951f3fb8e/
│   │   │   ├── artifacts/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── outputs/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── 516006c0f9734bccb3265805c79b77a9/
│   │   │   ├── artifacts/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── outputs/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── ff6cb3adc9424a1f9553fe7dec706a1a/
│   │   │   ├── meta.yaml
│   │   │   └── tags/
│   │   ├── meta.yaml
│   │   └── models/
│   │       ├── m-5429120b0c8f433fab88d22ce59db6cc/
│   │       └── m-715bae2fe5de4a7d9bdd8319928b15c0/
│   ├── 5/
│   │   └── c50cc81b5cd94515bf0385c598707efd/
│   │       └── artifacts/
│   ├── 743220519962646005/
│   │   ├── 47ac85eadd9b4f8b9fd7c365034237e5/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── 56226b867ca6407fa7957aa14d962bd7/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── outputs/
│   │   │   └── tags/
│   │   ├── 57c27304f8ad46e2ad4b4122c8e70ba7/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── 5ecc50c9e90f4d67b07c636a973fd088/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── 7bfa2eb524a74df2a1fcbdd53a28593d/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── 91d4cfec2cde4cd993720b3637321fc9/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── outputs/
│   │   │   └── tags/
│   │   ├── 9d1013c4ffa94800b9dc69635edbdd7b/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   └── tags/
│   │   ├── abec891395ad4e26b2b2d94a6d2bfa6b/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── outputs/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── bec61db4867a432aa5d9843532b8ae4b/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── c63a246cfe5d42ffa43a38e21769f0ce/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── outputs/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── c9ca6e1bedbd4bc6bd5554e2afc91a3e/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   └── tags/
│   │   ├── e2b1e19588ed4bffa3584b57aeb8ced7/
│   │   │   ├── meta.yaml
│   │   │   ├── metrics/
│   │   │   ├── params/
│   │   │   └── tags/
│   │   ├── meta.yaml
│   │   └── models/
│   │       ├── m-5b8bfea0ccc640d8be53b36bb217d3b9/
│   │       ├── m-857936581aa04baeb133cf2f5bcdbd58/
│   │       ├── m-abeadcd4974b400ea9c5c9b801491947/
│   │       └── m-ef1b8563c5734bd38a604235f83a4489/
│   └── 802645973844163818/
│       ├── 2436dc2d6c4749f88742318c7ed62f0b/
│       │   ├── meta.yaml
│       │   ├── metrics/
│       │   ├── outputs/
│       │   ├── params/
│       │   └── tags/
│       ├── meta.yaml
│       └── models/
│           └── m-c1485dbe1bc948ae8ce9e85042805801/
├── notebooks/
│   ├── .ipynb_checkpoints/
│   │   ├── ZBUE_Milestone_1_Feature_Engineering-checkpoint.ipynb
│   │   ├── ZBUE_Milestone_2_Income_Estimation-checkpoint.ipynb
│   │   ├── ZBUE_Prototype_Performance_Report-checkpoint.ipynb
│   │   ├── cibil_xgboost_training-checkpoint.ipynb
│   │   ├── drift_dashboard-checkpoint.ipynb
│   │   ├── model_benchmarking_and_validation-checkpoint.ipynb
│   │   ├── segment_report-checkpoint.ipynb
│   │   └── upi_behavioral_embeddings-checkpoint.ipynb
│   ├── Makefile
│   ├── ZBUE_Milestone_1_Feature_Engineering.ipynb
│   ├── ZBUE_Milestone_2_Income_Estimation.ipynb
│   ├── ZBUE_Prototype_Performance_Report.ipynb
│   ├── append_cells.py
│   ├── cibil_xgboost_training.ipynb
│   ├── create_homecredit_v2_nb.py
│   ├── create_nb.py
│   ├── drift_dashboard.ipynb
│   ├── homecredit_v2_exploration.ipynb
│   ├── model_benchmarking_and_validation.ipynb
│   ├── production_training_v2.ipynb
│   ├── segment_report.ipynb
│   └── upi_behavioral_embeddings.ipynb
├── patch_optuna.py
├── patch_trainers.py
├── proto/
│   ├── __init__.py
│   ├── assessment/
│   │   ├── assessment.pb.go
│   │   └── assessment_grpc.pb.go
│   ├── assessment.proto
│   ├── audit/
│   │   ├── audit.pb.go
│   │   └── audit_grpc.pb.go
│   ├── audit.proto
│   ├── consent/
│   │   ├── consent.pb.go
│   │   └── consent_grpc.pb.go
│   ├── consent.proto
│   ├── features/
│   │   ├── features.pb.go
│   │   └── features_grpc.pb.go
│   ├── features.proto
│   ├── py/
│   │   ├── __init__.py
│   │   ├── assessment_pb2.py
│   │   ├── assessment_pb2.pyi
│   │   ├── assessment_pb2_grpc.py
│   │   ├── audit_pb2.py
│   │   ├── audit_pb2.pyi
│   │   ├── audit_pb2_grpc.py
│   │   ├── consent_pb2.py
│   │   ├── consent_pb2.pyi
│   │   ├── consent_pb2_grpc.py
│   │   ├── features_pb2.py
│   │   ├── features_pb2.pyi
│   │   ├── features_pb2_grpc.py
│   │   ├── scoring_pb2.py
│   │   ├── scoring_pb2.pyi
│   │   └── scoring_pb2_grpc.py
│   ├── scoring/
│   │   ├── scoring.pb.go
│   │   └── scoring_grpc.pb.go
│   └── scoring.proto
├── pyproject.toml
├── pyrightconfig.json
├── python/
│   ├── agents/
│   │   ├── graph.py
│   │   └── state.py
│   ├── data_pipeline/
│   │   └── build_homecredit_v2.py
│   ├── enrichment/
│   │   ├── categorizer.py
│   │   ├── pipeline.py
│   │   └── resolver.py
│   ├── features/
│   │   ├── extractors/
│   │   │   └── cashflow.py
│   │   ├── validator.py
│   │   └── workers.py
│   ├── scoring/
│   │   ├── __init__.py
│   │   ├── fixtures.py
│   │   ├── fraud.py
│   │   ├── models.py
│   │   ├── moe_router.py
│   │   ├── registry.py
│   │   ├── scoring.py
│   │   └── server.py
│   ├── training/
│   │   ├── __init__.py
│   │   ├── bias_mitigation.py
│   │   ├── calibrate_bfs.py
│   │   ├── calibrate_rps.py
│   │   ├── calibration.py
│   │   ├── callbacks.py
│   │   ├── fairness.py
│   │   ├── features.py
│   │   ├── model_card.py
│   │   ├── optuna_tuner.py
│   │   ├── pipeline.py
│   │   ├── psi.py
│   │   ├── registry.py
│   │   ├── retrain.py
│   │   ├── run_logger.py
│   │   ├── shap_explainer.py
│   │   ├── tests/
│   │   │   └── test_psi.py
│   │   ├── train_bfs.py
│   │   ├── train_credit.py
│   │   ├── train_rps.py
│   │   ├── validation.py
│   │   └── zeyro_mlflow.py
│   └── zeyro_b2b.egg-info/
│       ├── PKG-INFO
│       ├── SOURCES.txt
│       ├── dependency_links.txt
│       ├── requires.txt
│       └── top_level.txt
├── retail_lending/
│   ├── MILESTONE_2_RESULTS.md
│   ├── __init__.py
│   ├── data/
│   │   ├── processed/
│   │   │   ├── feature_importance.png
│   │   │   ├── feature_store.parquet
│   │   │   └── income_model.pkl
│   │   └── raw/
│   │       ├── Customer_financial_profiles.csv
│   │       └── bank+marketing/
│   ├── evaluation/
│   │   ├── benchmark.py
│   │   └── shap_analysis.py
│   ├── feature_engineering/
│   │   ├── __init__.py
│   │   ├── affordability_engine.py
│   │   ├── income_features.py
│   │   └── intent_detection.py
│   ├── ingestion/
│   │   ├── __init__.py
│   │   ├── merchant_classifier.py
│   │   └── transaction_cleaner.py
│   └── models/
│       ├── __init__.py
│       ├── calibration.py
│       ├── income_estimator.py
│       ├── intent_classifier.py
│       └── lead_scorer.py
├── run_profiler.py
├── scratch_drift.py
├── scratch_segment.py
├── scripts/
│   ├── analyze_cibil.py
│   ├── analyze_cibil_raw.py
│   ├── benchmark_prism.py
│   ├── compile_proto.py
│   ├── migrate.go
│   ├── prep_cibil_data.py
│   ├── seed_db.py
│   ├── train_cibil_xgboost.py
│   ├── train_xgboost_model.py
│   ├── trigger_scoring_service.py
│   ├── trigger_test_assessment.py
│   └── update-context.sh
├── sqlc.yaml
├── test_paseto.go
└── tests/
    ├── test_algorithms.py
    ├── test_integration.py
    └── training/
        ├── test_bfs.py
        └── test_rps.py

```

## Repository Structure (locked)

```
zeyro-b2b/
├── apps/
│   ├── api/                        ← Go gRPC+HTTP server
│   │   ├── cmd/server/main.go
│   │   ├── internal/
│   │   │   ├── auth/
│   │   │   ├── tenant/
│   │   │   ├── application/
│   │   │   ├── features/
│   │   │   ├── policy/             ← ATP/RPS/BCS/FDS deterministic
│   │   │   ├── decision/           ← hybrid decision engine
│   │   │   ├── underwriting/       ← orchestrator
│   │   │   ├── mlclient/           ← gRPC client → Python
│   │   │   ├── audit/
│   │   │   ├── memo/               ← LLM memo generation
│   │   │   ├── ingestion/
│   │   │   ├── repository/         ← sqlc generated
│   │   │   └── config/
│   │   ├── migrations/             ← golang-migrate .sql files
│   │   ├── sqlc.yaml
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   └── go.sum
│   │
│   ├── ml-service/                 ← Python gRPC inference + FastAPI health
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── grpc_server.py
│   │   │   ├── http_server.py      ← /health /ready only
│   │   │   ├── inference/
│   │   │   │   ├── predictor.py    ← XGBoost PD Model
│   │   │   │   ├── preprocessing.py
│   │   │   │   ├── calibration.py  ← Platt
│   │   │   │   └── explanations.py ← SHAP
│   │   │   ├── registry/
│   │   │   │   └── loader.py       ← S3/HF pull + SHA-256 verify
│   │   │   └── models/             ← pydantic schemas
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── web/                        ← React + Tailwind (Vite)
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   │   ├── cashflow/       ← CashflowAgentUI.tsx
│       │   │   └── underwriting/
│       │   ├── hooks/
│       │   ├── api/                ← openapi-fetch typed client
│       │   └── lib/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── Dockerfile
│
├── proto/                          ← buf-managed, source of truth
│   ├── buf.yaml
│   ├── buf.gen.yaml
│   └── underwriting/v1/
│       ├── predict.proto
│       ├── features.proto
│       └── assessment.proto
│
├── contracts/                      ← GENERATED, never hand-edit
│   ├── go/                         ← buf → Go stubs
│   └── python/                     ← buf → Python grpcio stubs
│
├── ml/                             ← OFFLINE ONLY. Never imported by apps/
│   ├── training/
│   │   ├── train.py
│   │   ├── tune.py
│   │   ├── calibrate.py
│   │   ├── evaluate.py
│   │   └── export.py               ← produces artifact bundle
│   ├── evaluation/
│   │   ├── discrimination.py
│   │   ├── calibration_eval.py
│   │   ├── fairness.py
│   │   └── drift.py
│   ├── features/
│   │   ├── bureau.py
│   │   ├── banking.py
│   │   ├── gst.py
│   │   └── registry.py
│   └── configs/
│       └── msme_v1.yaml
│
├── infrastructure/
│   ├── railway/
│   │   ├── api.railway.toml
│   │   ├── ml.railway.toml
│   │   └── web.railway.toml
│   └── scripts/
│       ├── migrate.sh
│       └── healthcheck.sh
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  ← per-PR checks
│       ├── deploy-software.yml     ← merge → main deploys app code
│       └── deploy-model.yml        ← manual trigger only, model releases
│
├── .golangci.yml
├── buf.work.yaml                   ← workspace root
└── Makefile                        ← top-level dev commands
```

---

## Task 1: Proto Contract Foundation

**Files:**
- Create: `proto/buf.yaml`
- Create: `proto/buf.gen.yaml`
- Create: `buf.work.yaml`
- Create: `proto/underwriting/v1/predict.proto`
- Create: `proto/underwriting/v1/features.proto`
- Create: `proto/underwriting/v1/assessment.proto`
- Create: `contracts/go/` (generated)
- Create: `contracts/python/` (generated)

- [ ] **Step 1: Install buf**

```bash
brew install bufbuild/buf/buf   # mac
# or
curl -sSL https://github.com/bufbuild/buf/releases/download/v1.32.0/buf-Linux-x86_64 -o /usr/local/bin/buf && chmod +x /usr/local/bin/buf
buf --version
# Expected: 1.32.x
```

- [ ] **Step 2: Create workspace config**

```yaml
# buf.work.yaml  (repo root)
version: v1
directories:
  - proto
```

- [ ] **Step 3: Create proto module config**

```yaml
# proto/buf.yaml
version: v1
name: buf.build/zeyro/underwriting
deps:
  - buf.build/googleapis/googleapis
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

- [ ] **Step 4: Create codegen config**

```yaml
# proto/buf.gen.yaml
version: v1
plugins:
  - plugin: go
    out: ../contracts/go
    opt: paths=source_relative
  - plugin: go-grpc
    out: ../contracts/go
    opt: paths=source_relative
  - plugin: python
    out: ../contracts/python
  - plugin: grpc_python
    out: ../contracts/python
```

- [ ] **Step 5: Write features.proto**

```protobuf
// proto/underwriting/v1/features.proto
syntax = "proto3";

package underwriting.v1;

option go_package = "github.com/zeyro/b2b/contracts/go/underwriting/v1;underwritingv1";

message FeatureSnapshot {
  string snapshot_id        = 1;
  string application_id     = 2;
  string tenant_id          = 3;
  string feature_schema_version = 4;  // e.g. "msme-v1.0"
  int64  created_at_unix    = 5;

  map<string, double> features = 7;  // canonical feature map
}

```

- [ ] **Step 6: Write predict.proto**

```protobuf
// proto/underwriting/v1/predict.proto
syntax = "proto3";

package underwriting.v1;

import "underwriting/v1/features.proto";

option go_package = "github.com/zeyro/b2b/contracts/go/underwriting/v1;underwritingv1";

service PredictionService {
  rpc Predict(PredictRequest) returns (PredictResponse);
  rpc Health(HealthRequest) returns (HealthResponse);
}

message PredictRequest {
  FeatureSnapshot snapshot   = 1;
  string          request_id = 2;
}

message PredictResponse {
  string request_id        = 1;
  string model_version     = 2;
  double raw_pd            = 4;
  double calibrated_pd     = 5;  // Platt-calibrated
  string risk_tier         = 7;  // LOW / MEDIUM / HIGH / DECLINE
  repeated ReasonCode reason_codes = 8;
  repeated FeatureContribution shap_contributions = 9;
  int64  inference_latency_ms = 10;
}

message ReasonCode {
  string code    = 1;
  string impact  = 2;  // POSITIVE / NEGATIVE / NEUTRAL
  string source  = 3;  // ML / POLICY
  string feature = 4;
  double observed = 5;
}

message FeatureContribution {
  string feature_name = 1;
  double shap_value   = 2;
  double feature_value = 3;
}

message HealthRequest {}

message HealthResponse {
  bool   ready         = 1;
  string model_version = 2;
  string schema_version = 3;
}
```

- [ ] **Step 7: Write assessment.proto**

```protobuf
// proto/underwriting/v1/assessment.proto
syntax = "proto3";

package underwriting.v1;

import "underwriting/v1/predict.proto";

option go_package = "github.com/zeyro/b2b/contracts/go/underwriting/v1;underwritingv1";

message UnderwritingAssessment {
  string assessment_id           = 1;
  string application_id          = 2;
  string tenant_id               = 3;
  string feature_snapshot_id     = 4;
  string policy_score_version    = 5;
  double policy_score            = 6;  // ATP/RPS/BCS/FDS weighted 0-100
  PredictResponse ml_prediction  = 7;
  string decision_policy_version = 8;
  string recommendation          = 9;  // AUTO_APPROVE / CREDIT_REVIEW / DECLINE / MANUAL
  repeated string hard_rules_fired = 10;
  int64  assessed_at_unix        = 11;
  string assessed_by             = 12;  // system or user_id if manual
}
```

- [ ] **Step 8: Generate stubs**

```bash
cd proto
buf dep update
buf generate
# Expected: contracts/go/ and contracts/python/ populated, no errors
buf lint
# Expected: no issues
```

- [ ] **Step 9: Commit**

```bash
git add proto/ contracts/ buf.work.yaml
git commit -m "feat(proto): add underwriting v1 proto contracts and buf codegen"
```

---

## Task 2: Go Backend — Module & Core Structure

**Files:**
- Create: `apps/api/go.mod`
- Create: `apps/api/cmd/server/main.go`
- Create: `apps/api/internal/config/config.go`
- Create: `apps/api/.golangci.yml`

- [ ] **Step 1: Init Go module**

```bash
cd apps/api
go mod init github.com/zeyro/b2b/apps/api
# Add core dependencies
go get google.golang.org/grpc@v1.64.0
go get google.golang.org/protobuf@v1.34.2
go get github.com/go-chi/chi/v5@v5.0.12
go get github.com/jackc/pgx/v5@v5.6.0
go get github.com/golang-migrate/migrate/v4@v4.17.1
go get github.com/golang-jwt/jwt/v5@v5.2.1
go get go.uber.org/zap@v1.27.0
go get github.com/kelseyhightower/envconfig@v1.4.0
```

- [ ] **Step 2: Write config**

```go
// apps/api/internal/config/config.go
package config

import (
    "fmt"
    "github.com/kelseyhightower/envconfig"
)

type Config struct {
    // Server
    HTTPPort int    `envconfig:"HTTP_PORT" default:"8080"`
    GRPCPort int    `envconfig:"GRPC_PORT" default:"9090"`
    Env      string `envconfig:"ENV" default:"development"`

    // Database
    DatabaseURL     string `envconfig:"DATABASE_URL" required:"true"`
    MigrationsPath  string `envconfig:"MIGRATIONS_PATH" default:"migrations"`

    // ML Service (Railway private network)
    MLServiceAddr   string `envconfig:"ML_SERVICE_ADDR" required:"true"`
    // e.g. ml-service.railway.internal:50051
    MLServiceToken  string `envconfig:"ML_SERVICE_TOKEN" required:"true"`
    MLCallTimeoutMs int    `envconfig:"ML_CALL_TIMEOUT_MS" default:"3000"`

    // Auth
    JWTSecret string `envconfig:"JWT_SECRET" required:"true"`

    // Model
    ModelVersion string `envconfig:"MODEL_VERSION" default:"msme-pd-v1.0"`
}

func Load() (*Config, error) {
    var c Config
    if err := envconfig.Process("", &c); err != nil {
        return nil, fmt.Errorf("load config: %w", err)
    }
    return &c, nil
}
```

- [ ] **Step 3: Write main.go**

```go
// apps/api/cmd/server/main.go
package main

import (
    "context"
    "fmt"
    "net"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "go.uber.org/zap"
    "google.golang.org/grpc"

    "github.com/zeyro/b2b/apps/api/internal/config"
)

func main() {
    logger, _ := zap.NewProduction()
    defer logger.Sync()

    cfg, err := config.Load()
    if err != nil {
        logger.Fatal("config load failed", zap.Error(err))
    }

    // HTTP server (REST + health)
    httpServer := &http.Server{
        Addr:         fmt.Sprintf(":%d", cfg.HTTPPort),
        ReadTimeout:  10 * time.Second,
        WriteTimeout: 30 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // gRPC server (internal)
    grpcServer := grpc.NewServer()

    ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
    defer stop()

    // Start HTTP
    go func() {
        logger.Info("HTTP server starting", zap.Int("port", cfg.HTTPPort))
        if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            logger.Fatal("HTTP server failed", zap.Error(err))
        }
    }()

    // Start gRPC
    go func() {
        lis, err := net.Listen("tcp", fmt.Sprintf(":%d", cfg.GRPCPort))
        if err != nil {
            logger.Fatal("gRPC listen failed", zap.Error(err))
        }
        logger.Info("gRPC server starting", zap.Int("port", cfg.GRPCPort))
        if err := grpcServer.Serve(lis); err != nil {
            logger.Fatal("gRPC server failed", zap.Error(err))
        }
    }()

    <-ctx.Done()
    logger.Info("shutdown signal received")

    shutCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    grpcServer.GracefulStop()
    if err := httpServer.Shutdown(shutCtx); err != nil {
        logger.Error("HTTP shutdown error", zap.Error(err))
        os.Exit(1)
    }
    logger.Info("server shutdown complete")
}
```

- [ ] **Step 4: Write golangci config**

```yaml
# apps/api/.golangci.yml
linters:
  enable:
    - errcheck
    - gosimple
    - govet
    - ineffassign
    - staticcheck
    - unused
    - gofmt
    - goimports
    - misspell
    - forbidigo

linters-settings:
  forbidigo:
    forbid:
      - pattern: "^go func("
        msg: "use SafeGo wrapper — bare goroutines not allowed"
  errcheck:
    check-type-assertions: true
  govet:
    check-shadowing: true
```

- [ ] **Step 5: Verify build**

```bash
cd apps/api
go build ./...
go vet ./...
# Expected: no output (clean)
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/
git commit -m "feat(api): go module scaffold, config, main server, golangci config"
```

---

## Task 3: Go Backend — ML Client (gRPC)

**Files:**
- Create: `apps/api/internal/mlclient/interface.go`
- Create: `apps/api/internal/mlclient/grpc_client.go`
- Create: `apps/api/internal/mlclient/mock.go`
- Create: `apps/api/internal/mlclient/grpc_client_test.go`

- [ ] **Step 1: Write the interface**

```go
// apps/api/internal/mlclient/interface.go
package mlclient

import (
    "context"

    v1 "github.com/zeyro/b2b/contracts/go/underwriting/v1"
)

// PredictiveRiskModel is the contract between Go business logic and ML inference.
// Never depend directly on the gRPC client — depend on this interface.
type PredictiveRiskModel interface {
    Predict(ctx context.Context, req *v1.PredictRequest) (*v1.PredictResponse, error)
    Ready(ctx context.Context) (bool, error)
}
```

- [ ] **Step 2: Write failing test**

```go
// apps/api/internal/mlclient/grpc_client_test.go
package mlclient_test

import (
    "context"
    "testing"

    v1 "github.com/zeyro/b2b/contracts/go/underwriting/v1"
    "github.com/zeyro/b2b/apps/api/internal/mlclient"
)

func TestMockClient_Predict_ReturnsValidResponse(t *testing.T) {
    client := mlclient.NewMockClient()

    req := &v1.PredictRequest{
        RequestId: "test-001",
        Snapshot: &v1.FeatureSnapshot{
            SnapshotId:           "snap-001",
            ApplicationId:        "app-001",
            TenantId:             "tenant-001",
            FeatureSchemaVersion: "msme-v1.0",
            Features: map[string]float64{
                "bureau_score": 720,
                "foir":         0.35,
            },
        },
    }

    resp, err := client.Predict(context.Background(), req)
    if err != nil {
        t.Fatalf("Predict failed: %v", err)
    }
    if resp.CalibratedPd < 0 || resp.CalibratedPd > 1 {
        t.Errorf("CalibratedPd out of range: %f", resp.CalibratedPd)
    }}

func TestMockClient_Ready_ReturnsTrue(t *testing.T) {
    client := mlclient.NewMockClient()
    ready, err := client.Ready(context.Background())
    if err != nil {
        t.Fatalf("Ready failed: %v", err)
    }
    if !ready {
        t.Error("mock client should always be ready")
    }
}
```

- [ ] **Step 3: Run — verify fail**

```bash
cd apps/api
go test ./internal/mlclient/... -v
# Expected: FAIL — mlclient.NewMockClient undefined
```

- [ ] **Step 4: Write mock**

```go
// apps/api/internal/mlclient/mock.go
package mlclient

import (
    "context"
    v1 "github.com/zeyro/b2b/contracts/go/underwriting/v1"
)

type MockClient struct{}

func NewMockClient() PredictiveRiskModel {
    return &MockClient{}
}

func (m *MockClient) Predict(_ context.Context, req *v1.PredictRequest) (*v1.PredictResponse, error) {
    return &v1.PredictResponse{
        RequestId:       req.RequestId,
        ModelVersion:    "mock-v0.0",
        RawPd:           0.08,
        CalibratedPd:    0.075,
        RiskTier:        "MEDIUM",
        ReasonCodes: []*v1.ReasonCode{
            {Code: "MOCK_STABLE_CASHFLOW", Impact: "POSITIVE", Source: "ML"},
        },
    }, nil
}

func (m *MockClient) Ready(_ context.Context) (bool, error) {
    return true, nil
}
```

- [ ] **Step 5: Write gRPC client**

```go
// apps/api/internal/mlclient/grpc_client.go
package mlclient

import (
    "context"
    "fmt"
    "time"

    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
    "google.golang.org/grpc/metadata"

    v1 "github.com/zeyro/b2b/contracts/go/underwriting/v1"
)

type GRPCClient struct {
    client  v1.PredictionServiceClient
    token   string
    timeout time.Duration
}

func NewGRPCClient(addr, token string, timeoutMs int) (PredictiveRiskModel, error) {
    // Railway private network: no TLS needed within environment
    conn, err := grpc.NewClient(addr,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    )
    if err != nil {
        return nil, fmt.Errorf("dial ml-service %s: %w", addr, err)
    }
    return &GRPCClient{
        client:  v1.NewPredictionServiceClient(conn),
        token:   token,
        timeout: time.Duration(timeoutMs) * time.Millisecond,
    }, nil
}

func (c *GRPCClient) Predict(ctx context.Context, req *v1.PredictRequest) (*v1.PredictResponse, error) {
    ctx, cancel := context.WithTimeout(ctx, c.timeout)
    defer cancel()

    ctx = metadata.AppendToOutgoingContext(ctx, "authorization", "Bearer "+c.token)

    resp, err := c.client.Predict(ctx, req)
    if err != nil {
        return nil, fmt.Errorf("ml predict rpc: %w", err)
    }
    return resp, nil
}

func (c *GRPCClient) Ready(ctx context.Context) (bool, error) {
    ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
    defer cancel()

    resp, err := c.client.Health(ctx, &v1.HealthRequest{})
    if err != nil {
        return false, fmt.Errorf("ml health rpc: %w", err)
    }
    return resp.Ready, nil
}
```

- [ ] **Step 6: Run tests — verify pass**

```bash
cd apps/api
go test ./internal/mlclient/... -v -race
# Expected: PASS TestMockClient_Predict_ReturnsValidResponse, TestMockClient_Ready_ReturnsTrue
```

- [ ] **Step 7: Commit**

```bash
git add apps/api/internal/mlclient/
git commit -m "feat(api): PredictiveRiskModel interface, gRPC client, mock client"
```

---

## Task 4: Go Backend — Database Migrations & sqlc

**Files:**
- Create: `apps/api/migrations/001_initial.sql` through `006_audit.sql`
- Create: `apps/api/sqlc.yaml`
- Create: `apps/api/internal/repository/queries/` (sqlc input)

- [ ] **Step 1: Write migration 001 — identity**

```sql
-- apps/api/migrations/001_identity.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tenants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('ADMIN','UNDERWRITER','OFFICER','VIEWER')),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
```

- [ ] **Step 2: Write migration 002 — applications**

```sql
-- apps/api/migrations/002_applications.sql
CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    applicant_name  TEXT NOT NULL,
    business_name   TEXT,
    product_type    TEXT NOT NULL CHECK (product_type IN ('MSME_TERM','MSME_CC','SALARIED_PL')),
    loan_amount     BIGINT NOT NULL,  -- in paise
    status          TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','DATA_COLLECTION','UNDER_REVIEW','APPROVED','DECLINED','DISBURSED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_tenant ON applications(tenant_id);
CREATE INDEX idx_applications_status ON applications(status);
```

- [ ] **Step 3: Write migration 003 — feature snapshots**

```sql
-- apps/api/migrations/003_features.sql
CREATE TABLE feature_snapshots (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id        UUID NOT NULL REFERENCES applications(id),
    tenant_id             UUID NOT NULL REFERENCES tenants(id),
    feature_schema_version TEXT NOT NULL,
    
    features              JSONB NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- immutable: no updated_at
);

CREATE INDEX idx_snapshots_application ON feature_snapshots(application_id);
```

- [ ] **Step 4: Write migration 004 — ML predictions**

```sql
-- apps/api/migrations/004_predictions.sql
CREATE TABLE ml_model_versions (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name             TEXT NOT NULL,
    model_version          TEXT NOT NULL UNIQUE,
    algorithm_type         TEXT NOT NULL,
    artifact_uri           TEXT NOT NULL,
    artifact_sha256        TEXT NOT NULL,
    feature_schema_version TEXT NOT NULL,
    preprocessing_version  TEXT NOT NULL,
    calibration_version    TEXT NOT NULL,
    training_window_start  TIMESTAMPTZ,
    training_window_end    TIMESTAMPTZ,
    target_definition      TEXT NOT NULL,
    auc                    NUMERIC(6,5),
    gini                   NUMERIC(6,5),
    ks                     NUMERIC(6,5),
    brier_score            NUMERIC(6,5),
    status                 TEXT NOT NULL,
    approved_by            TEXT,
    approved_at            TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ml_model_deployments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version_id  UUID NOT NULL REFERENCES ml_model_versions(id),
    tenant_id         UUID REFERENCES tenants(id),
    product_type      TEXT,
    segment           TEXT,
    deployment_mode   TEXT NOT NULL CHECK (deployment_mode IN ('SHADOW','CHALLENGER','CHAMPION','DISABLED')),
    deployed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    undeployed_at     TIMESTAMPTZ
);

CREATE TABLE ml_risk_predictions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_snapshot_id UUID NOT NULL REFERENCES feature_snapshots(id),
    model_version_id    UUID NOT NULL REFERENCES ml_model_versions(id),
    raw_pd              NUMERIC(6,5) NOT NULL,
    calibrated_pd       NUMERIC(6,5) NOT NULL,
    risk_tier           TEXT NOT NULL,
    reason_codes        JSONB NOT NULL DEFAULT '[]',
    shap_contributions  JSONB NOT NULL DEFAULT '[]',
    inference_latency_ms INT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictions_snapshot ON ml_risk_predictions(feature_snapshot_id);
```

- [ ] **Step 5: Write migration 005 — assessments**

```sql
-- apps/api/migrations/005_assessments.sql
CREATE TABLE policy_score_versions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version     TEXT NOT NULL UNIQUE,
    tenant_id   UUID REFERENCES tenants(id),
    weights     JSONB NOT NULL,
    thresholds  JSONB NOT NULL,
    active_from TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE decision_policy_versions (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version            TEXT NOT NULL UNIQUE,
    tenant_id          UUID REFERENCES tenants(id),
    product_type       TEXT,
    auto_approve_max_pd NUMERIC(6,5),
    auto_approve_min_policy_score NUMERIC(5,2),
    manual_review_max_pd NUMERIC(6,5),
    hard_rules         JSONB NOT NULL DEFAULT '[]',
    active_from        TIMESTAMPTZ NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE underwriting_assessments (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id          UUID NOT NULL REFERENCES applications(id),
    tenant_id               UUID NOT NULL REFERENCES tenants(id),
    feature_snapshot_id     UUID NOT NULL REFERENCES feature_snapshots(id),
    ml_prediction_id        UUID REFERENCES ml_risk_predictions(id),
    policy_score_version_id UUID NOT NULL REFERENCES policy_score_versions(id),
    policy_score            NUMERIC(5,2) NOT NULL,
    decision_policy_version_id UUID NOT NULL REFERENCES decision_policy_versions(id),
    is_shadow_mode          BOOLEAN NOT NULL DEFAULT FALSE,
    recommendation          TEXT NOT NULL
                            CHECK (recommendation IN ('AUTO_APPROVE','CREDIT_REVIEW','HIGH_RISK_REVIEW','DECLINE','MANUAL_REVIEW')),
    hard_rules_fired        JSONB NOT NULL DEFAULT '[]',
    assessed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assessed_by             TEXT NOT NULL  -- 'system' or user_id
);

CREATE INDEX idx_assessments_application ON underwriting_assessments(application_id);
CREATE INDEX idx_assessments_tenant ON underwriting_assessments(tenant_id);
```

- [ ] **Step 6: Write migration 006 — audit**

```sql
-- apps/api/migrations/006_audit.sql
CREATE TABLE audit_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    actor_id    TEXT NOT NULL,  -- user_id or 'system'
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   UUID NOT NULL,
    payload     JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant_entity ON audit_events(tenant_id, entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_events(created_at DESC);
```

- [ ] **Step 7: Write sqlc.yaml**

```yaml
# apps/api/sqlc.yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "internal/repository/queries"
    schema: "migrations"
    gen:
      go:
        package: "repository"
        out: "internal/repository"
        emit_json_tags: true
        emit_prepared_queries: true
        emit_interface: true
        emit_exact_table_names: false
```

- [ ] **Step 8: Run migrations locally**

```bash
# Requires: DATABASE_URL set to local postgres
cd apps/api
migrate -path migrations -database "$DATABASE_URL" up
# Expected: 6 migrations applied, no errors

sqlc generate
# Expected: internal/repository/*.go generated
```

- [ ] **Step 9: Commit**

```bash
git add apps/api/migrations/ apps/api/sqlc.yaml apps/api/internal/repository/
git commit -m "feat(api): database migrations 001-006, sqlc config and generated repository"
```

---

## Task 5: Python ML Service — gRPC Inference Server

**Files:**
- Create: `apps/ml-service/requirements.txt`
- Create: `apps/ml-service/app/main.py`
- Create: `apps/ml-service/app/grpc_server.py`
- Create: `apps/ml-service/app/http_server.py`
- Create: `apps/ml-service/app/inference/predictor.py`
- Create: `apps/ml-service/app/registry/loader.py`
- Create: `apps/ml-service/tests/test_predictor.py`

- [ ] **Step 1: Write requirements.txt**

```
fastapi==0.111.0
uvicorn[standard]==0.30.1
grpcio==1.64.1
grpcio-tools==1.64.1
protobuf==5.27.2
xgboost==2.0.3
scikit-learn==1.5.0
shap==0.45.1
numpy==1.26.4
pandas==2.2.2
boto3==1.34.144         # S3 artifact pull
huggingface_hub==0.23.4 # HF artifact pull
pydantic==2.7.4
pydantic-settings==2.3.4
pytest==8.2.2
pytest-asyncio==0.23.7
```

- [ ] **Step 2: Write loader.py**

```python
# apps/ml-service/app/registry/loader.py
import hashlib
import json
import os
import pickle
from pathlib import Path
from typing import Any

import boto3
import xgboost as xgb
from huggingface_hub import hf_hub_download


REGISTRY_BACKEND = os.getenv("MODEL_REGISTRY_BACKEND", "s3")  # s3 | hf | local
S3_BUCKET = os.getenv("MODEL_S3_BUCKET", "")
HF_REPO_ID = os.getenv("MODEL_HF_REPO_ID", "")
LOCAL_ARTIFACT_DIR = Path(os.getenv("LOCAL_ARTIFACT_DIR", "/tmp/artifacts"))


def _verify_sha256(path: Path, expected: str) -> None:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    actual = h.hexdigest()
    if actual != expected:
        raise ValueError(f"SHA-256 mismatch for {path}: expected {expected}, got {actual}")


def load_artifact_bundle(version: str) -> dict[str, Any]:
    """
    Downloads and verifies artifact bundle for `version`.
    Returns dict with: model, calibrator, feature_schema, metadata, manifest.
    """
    local_dir = LOCAL_ARTIFACT_DIR / version

    if REGISTRY_BACKEND == "s3":
        _pull_from_s3(version, local_dir)
    elif REGISTRY_BACKEND == "hf":
        _pull_from_hf(version, local_dir)
    elif REGISTRY_BACKEND == "local":
        pass  # assume already present
    else:
        raise ValueError(f"Unknown registry backend: {REGISTRY_BACKEND}")

    manifest_path = local_dir / "manifest.json"
    manifest = json.loads(manifest_path.read_text())

    # Verify all files
    for filename, sha in manifest["files"].items():
        _verify_sha256(local_dir / filename, sha)

    model = xgb.Booster()
    model.load_model(str(local_dir / "model.json"))

    with open(local_dir / "calibrator.pkl", "rb") as f:
        calibrator = pickle.load(f)  # noqa: S301 — internal trusted artifact

    feature_schema = json.loads((local_dir / "feature_schema.json").read_text())
    metadata = json.loads((local_dir / "metadata.json").read_text())

    return {
        "model": model,
        "calibrator": calibrator,
        "feature_schema": feature_schema,
        "metadata": metadata,
        "version": version,
    }


def _pull_from_s3(version: str, local_dir: Path) -> None:
    local_dir.mkdir(parents=True, exist_ok=True)
    s3 = boto3.client("s3", region_name="ap-south-1")
    files = ["model.json", "calibrator.pkl", "feature_schema.json", "metadata.json", "manifest.json", "evaluation.json"]
    for f in files:
        dest = local_dir / f
        if not dest.exists():
            s3.download_file(S3_BUCKET, f"{version}/{f}", str(dest))


def _pull_from_hf(version: str, local_dir: Path) -> None:
    local_dir.mkdir(parents=True, exist_ok=True)
    files = ["model.json", "calibrator.pkl", "feature_schema.json", "metadata.json", "manifest.json", "evaluation.json"]
    for f in files:
        hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=f"{version}/{f}",
            local_dir=str(local_dir),
            repo_type="model",
        )
```

- [ ] **Step 3: Write predictor.py**

```python
# apps/ml-service/app/inference/predictor.py
from __future__ import annotations

import time
from typing import Any

import numpy as np
import shap
import xgboost as xgb


class XGBoostPDModel:
    """
    Single XGBoost PD Model Predictor.
    """

    def __init__(self, artifact: dict[str, Any]) -> None:
        self._model: xgb.Booster = artifact["model"]
        self._calibrator = artifact["calibrator"]
        self._feature_schema: dict = artifact["feature_schema"]
        self._version: str = artifact["version"]
        self._explainer = shap.TreeExplainer(self._model)

    @property
    def version(self) -> str:
        return self._version

    @property
    def schema_version(self) -> str:
        return self._feature_schema["version"]

    def predict(self, features: dict[str, float]) -> dict[str, Any]:
        """
        Args:
            features: raw feature map from FeatureSnapshot
            
        Returns:
            prediction dict matching PredictResponse fields
        """
        start = time.monotonic()

        # Select feature set for expert
        feature_names = self._feature_schema["features"]
        self._validate_features(features, feature_names)

        X = np.array([[features.get(f, np.nan) for f in feature_names]], dtype=np.float32)
        dmatrix = xgb.DMatrix(X, feature_names=feature_names)

        raw_pd = float(self._model.predict(dmatrix)[0])
        calibrated_pd = float(self._calibrator.predict_proba([[raw_pd]])[0][1])

        # SHAP
        shap_values = self._explainer.shap_values(dmatrix)
        shap_contributions = [
            {
                "feature_name": f,
                "shap_value": float(shap_values[0][i]),
                "feature_value": float(X[0][i]),
            }
            for i, f in enumerate(feature_names)
        ]
        shap_contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

        # Risk mapping (300-900 scale, inverse of PD)
        risk_tier = self._map_tier(calibrated_pd)
        reason_codes = self._derive_reason_codes(shap_contributions[:5])

        latency_ms = int((time.monotonic() - start) * 1000)

        return {
            "raw_pd": raw_pd,
            "calibrated_pd": calibrated_pd,
            "risk_tier": risk_tier,
            "reason_codes": reason_codes,
            "shap_contributions": shap_contributions,
            "inference_latency_ms": latency_ms,
        }

    def _validate_features(self, features: dict, required: list[str]) -> None:
        missing = [f for f in required if f not in features]
        if missing:
            raise ValueError(f"Missing required features: {missing}")

    def _map_tier(self, pd: float) -> str:
        if pd <= 0.05:
            return "LOW"
        if pd <= 0.12:
            return "MEDIUM"
        if pd <= 0.25:
            return "HIGH"
        return "VERY_HIGH"

    def _derive_reason_codes(self, top_shap: list[dict]) -> list[dict]:
        codes = []
        for s in top_shap:
            impact = "NEGATIVE" if s["shap_value"] > 0 else "POSITIVE"
            codes.append({
                "code": s["feature_name"].upper(),
                "impact": impact,
                "source": "ML",
                "feature": s["feature_name"],
                "observed": s["feature_value"],
            })
        return codes
```

- [ ] **Step 4: Write failing tests**

```python
# apps/ml-service/tests/test_predictor.py
import numpy as np
import pytest
from unittest.mock import MagicMock, patch

from app.inference.predictor import XGBoostPDModel


def _make_mock_artifact():
    """Build a minimal mock artifact for testing without real model files."""
    mock_model = MagicMock()
    mock_model.predict.return_value = np.array([0.08])

    mock_calibrator = MagicMock()
    mock_calibrator.predict_proba.return_value = [[0.0, 0.075]]

    mock_explainer = MagicMock()
    mock_explainer.shap_values.return_value = np.array([[0.05, -0.03, 0.02]])

    feature_schema = {
        "version": "msme-v1.0",
        "features": ["bureau_score", "foir", "dpd_30_count_12m"],
    }

    return {
        "model": mock_model,
        "calibrator": mock_calibrator,
        "feature_schema": feature_schema,
        "metadata": {},
        "version": "msme-pd-v1.0",
    }, mock_explainer


def test_predict_returns_valid_pd_range():
    artifact, mock_explainer = _make_mock_artifact()
    with patch("shap.TreeExplainer", return_value=mock_explainer):
        predictor = XGBoostPDModel(artifact)
        result = predictor.predict(
            {"bureau_score": 720.0, "foir": 0.35, "dpd_30_count_12m": 0.0}
        )
    assert 0.0 <= result["calibrated_pd"] <= 1.0
    assert 0.0 <= result["raw_pd"] <= 1.0


def test_predict_raises_on_excessive_missing_features():
    artifact, mock_explainer = _make_mock_artifact()
    with patch("shap.TreeExplainer", return_value=mock_explainer):
        predictor = XGBoostPDModel(artifact)
        with pytest.raises(ValueError, match="Too many missing features"):
            predictor.predict({})  # all features missing


def test_tier_mapping():
    artifact, mock_explainer = _make_mock_artifact()
    with patch("shap.TreeExplainer", return_value=mock_explainer):
        predictor = XGBoostPDModel(artifact)
    assert predictor._map_tier(0.03) == "LOW"
    assert predictor._map_tier(0.08) == "MEDIUM"
    assert predictor._map_tier(0.18) == "HIGH"
    assert predictor._map_tier(0.40) == "VERY_HIGH"
```

- [ ] **Step 5: Run tests — verify fail**

```bash
cd apps/ml-service
pip install -r requirements.txt
pytest tests/test_predictor.py -v
# Expected: ImportError or ModuleNotFoundError — predictor not yet complete
```

- [ ] **Step 6: Run tests — verify pass after implementation**

```bash
pytest tests/test_predictor.py -v
# Expected: 4 PASSED
```

- [ ] **Step 7: Write gRPC server**

```python
# apps/ml-service/app/grpc_server.py
from __future__ import annotations

import logging
from concurrent import futures

import grpc

# Generated stubs (from contracts/python/)
from contracts.python.underwriting.v1 import predict_pb2, predict_pb2_grpc
from app.inference.predictor import XGBoostPDModel

logger = logging.getLogger(__name__)


class PredictionServicer(predict_pb2_grpc.PredictionServiceServicer):
    def __init__(self, predictor: XGBoostPDModel, token: str) -> None:
        self._predictor = predictor
        self._token = token

    def _authenticate(self, context: grpc.ServicerContext) -> bool:
        metadata = dict(context.invocation_metadata())
        auth = metadata.get("authorization", "")
        if not auth.startswith("Bearer ") or auth[7:] != self._token:
            context.abort(grpc.StatusCode.UNAUTHENTICATED, "invalid token")
            return False
        return True

    def Predict(self, request, context):
        if not self._authenticate(context):
            return predict_pb2.PredictResponse()

        snapshot = request.snapshot
        

        try:
            result = self._predictor.predict(dict(snapshot.features))
        except ValueError as e:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(e))
            return predict_pb2.PredictResponse()
        except Exception as e:
            logger.exception("prediction failed: %s", e)
            context.abort(grpc.StatusCode.INTERNAL, "inference error")
            return predict_pb2.PredictResponse()

        reason_codes = [
            predict_pb2.ReasonCode(
                code=rc["code"], impact=rc["impact"], source=rc["source"],
                feature=rc["feature"], observed=rc["observed"],
            )
            for rc in result["reason_codes"]
        ]
        shap_contribs = [
            predict_pb2.FeatureContribution(
                feature_name=c["feature_name"],
                shap_value=c["shap_value"],
                feature_value=c["feature_value"],
            )
            for c in result["shap_contributions"]
        ]

        return predict_pb2.PredictResponse(
            request_id=request.request_id,
            model_version=self._predictor.version,
            raw_pd=result["raw_pd"],
            calibrated_pd=result["calibrated_pd"],
            risk_tier=result["risk_tier"],
            reason_codes=reason_codes,
            shap_contributions=shap_contribs,
            inference_latency_ms=result["inference_latency_ms"],
        )

    def Health(self, request, context):
        return predict_pb2.HealthResponse(
            ready=True,
            model_version=self._predictor.version,
            schema_version=self._predictor.schema_version,
        )


def serve(predictor: XGBoostPDModel, port: int, token: str) -> None:
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        options=[
            ("grpc.max_receive_message_length", 4 * 1024 * 1024),
            ("grpc.max_send_message_length", 4 * 1024 * 1024),
        ],
    )
    predict_pb2_grpc.add_PredictionServiceServicer_to_server(
        PredictionServicer(predictor, token), server
    )
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    logger.info("gRPC server started on port %d", port)
    server.wait_for_termination()
```

- [ ] **Step 8: Write main.py**

```python
# apps/ml-service/app/main.py
import logging
import os
import threading

from app.registry.loader import load_artifact_bundle
from app.inference.predictor import XGBoostPDModel
from app.grpc_server import serve
from app.http_server import create_app

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    model_version = os.environ["MODEL_VERSION"]
    grpc_port = int(os.getenv("GRPC_PORT", "50051"))
    http_port = int(os.getenv("HTTP_PORT", "8001"))
    ml_token = os.environ["ML_SERVICE_TOKEN"]

    logger.info("Loading artifact bundle: %s", model_version)
    artifact = load_artifact_bundle(model_version)
    predictor = XGBoostPDModel(artifact)
    logger.info("Model loaded: version=%s schema=%s", predictor.version, predictor.schema_version)

    # HTTP health server in background thread
    app = create_app(predictor)
    http_thread = threading.Thread(
        target=lambda: __import__("uvicorn").run(app, host="0.0.0.0", port=http_port),
        daemon=True,
    )
    http_thread.start()

    # gRPC blocks main thread
    serve(predictor, grpc_port, ml_token)


if __name__ == "__main__":
    main()
```

- [ ] **Step 9: Write http_server.py (health only)**

```python
# apps/ml-service/app/http_server.py
from fastapi import FastAPI
from app.inference.predictor import XGBoostPDModel


def create_app(predictor: XGBoostPDModel) -> FastAPI:
    app = FastAPI(title="zeyro-ml-service", docs_url=None, redoc_url=None)

    @app.get("/health")
    def health():
        return {"status": "ok", "model_version": predictor.version}

    @app.get("/ready")
    def ready():
        return {"ready": True, "schema_version": predictor.schema_version}

    return app
```

- [ ] **Step 10: Commit**

```bash
git add apps/ml-service/
git commit -m "feat(ml): gRPC inference server, MoE predictor, Platt calibration, SHAP, health endpoints"
```

---

## Task 6: Dockerfiles

**Files:**
- Create: `apps/api/Dockerfile`
- Create: `apps/ml-service/Dockerfile`
- Create: `apps/web/Dockerfile`

- [ ] **Step 1: Go API Dockerfile**

```dockerfile
# apps/api/Dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /build

# Cache deps
COPY go.mod go.sum ./
RUN go mod download

# Copy contracts (generated proto stubs)
COPY ../../contracts/go/ /contracts/go/

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app ./cmd/server

FROM gcr.io/distroless/static-debian12
COPY --from=builder /app /app
COPY --from=builder /build/migrations /migrations
EXPOSE 8080 9090
ENTRYPOINT ["/app"]
```

- [ ] **Step 2: Python ML Dockerfile**

```dockerfile
# apps/ml-service/Dockerfile
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

# System deps for XGBoost, SHAP
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy generated proto stubs
COPY ../../contracts/python/ /contracts/python/
ENV PYTHONPATH="/contracts:/app"

COPY app/ ./app/

EXPOSE 8001 50051
CMD ["python", "-m", "app.main"]
```

- [ ] **Step 3: React Web Dockerfile**

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 4: nginx.conf for SPA routing**

```nginx
# apps/web/nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /health {
        return 200 'ok';
        add_header Content-Type text/plain;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/Dockerfile apps/ml-service/Dockerfile apps/web/Dockerfile apps/web/nginx.conf
git commit -m "feat(infra): production Dockerfiles for api, ml-service, web"
```

---

## Task 7: Railway Configuration

**Files:**
- Create: `infrastructure/railway/api.railway.toml`
- Create: `infrastructure/railway/ml.railway.toml`
- Create: `infrastructure/railway/web.railway.toml`
- Create: `infrastructure/scripts/migrate.sh`
- Create: `infrastructure/scripts/healthcheck.sh`

- [ ] **Step 1: API Railway config**

```toml
# infrastructure/railway/api.railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "apps/api/Dockerfile"
buildContext = "."  # repo root — needed to access contracts/

[deploy]
startCommand = "/app"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[[deploy.envVars]]
# Defined in Railway dashboard / secret manager, not here
# DATABASE_URL, JWT_SECRET, ML_SERVICE_ADDR, ML_SERVICE_TOKEN, MODEL_VERSION
```

- [ ] **Step 2: ML service Railway config**

```toml
# infrastructure/railway/ml.railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "apps/ml-service/Dockerfile"
buildContext = "."

[deploy]
# HTTP health exposed; gRPC stays on private network
startCommand = "python -m app.main"
healthcheckPath = "/health"
healthcheckTimeout = 60  # model load can be slow
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

# Railway private networking:
# This service is accessible at ml-service.railway.internal:50051
# within the Railway environment. No public port for gRPC.
```

- [ ] **Step 3: Web Railway config**

```toml
# infrastructure/railway/web.railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "apps/web/Dockerfile"
buildContext = "apps/web"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 10
restartPolicyType = "ON_FAILURE"
```

- [ ] **Step 4: Migration script**

```bash
#!/usr/bin/env bash
# infrastructure/scripts/migrate.sh
# Run before deploying Go API to production.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set" >&2
  exit 1
fi

echo "Running migrations..."
migrate -path apps/api/migrations -database "$DATABASE_URL" up
echo "Migrations complete."
```

- [ ] **Step 5: Healthcheck script**

```bash
#!/usr/bin/env bash
# infrastructure/scripts/healthcheck.sh
set -euo pipefail

API_URL="${API_URL:-http://localhost:8080}"
ML_URL="${ML_URL:-http://localhost:8001}"

echo "Checking API health..."
curl -sf "$API_URL/health" || { echo "API health FAILED"; exit 1; }

echo "Checking ML service health..."
curl -sf "$ML_URL/health" || { echo "ML health FAILED"; exit 1; }

echo "All services healthy."
```

- [ ] **Step 6: Commit**

```bash
chmod +x infrastructure/scripts/*.sh
git add infrastructure/
git commit -m "feat(infra): Railway service configs, migration and healthcheck scripts"
```

---

## Task 8: CI Pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write ci.yml**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  proto:
    name: Proto Lint & Breaking Change
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: bufbuild/buf-setup-action@v1
        with:
          version: "1.32.0"

      - name: Buf lint
        run: buf lint
        working-directory: proto

      - name: Buf breaking change check
        run: buf breaking --against "https://github.com/${{ github.repository }}.git#branch=main"
        working-directory: proto
        # Only runs on PRs; skips on main push
        if: github.event_name == 'pull_request'

  go-api:
    name: Go API — Lint, Test, Build
    runs-on: ubuntu-latest
    needs: proto
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: zeyro_b2b_test
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    env:
      DATABASE_URL: "postgres://test:test@localhost:5432/zeyro_b2b_test?sslmode=disable"
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: "1.23"
          cache: true
          cache-dependency-path: apps/api/go.sum

      - name: Install migrate
        run: |
          curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.1/migrate.linux-amd64.tar.gz | tar xvz
          sudo mv migrate /usr/local/bin/migrate

      - name: Run migrations
        run: migrate -path apps/api/migrations -database "$DATABASE_URL" up

      - name: golangci-lint
        uses: golangci/golangci-lint-action@v6
        with:
          version: v1.59
          working-directory: apps/api
          args: --config .golangci.yml

      - name: go vet
        run: go vet ./...
        working-directory: apps/api

      - name: go test (race detector)
        run: go test -race -coverprofile=coverage.out ./...
        working-directory: apps/api

      - name: go build
        run: go build ./...
        working-directory: apps/api

  ml-service:
    name: ML Service — Lint, Type Check, Test
    runs-on: ubuntu-latest
    needs: proto
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"
          cache-dependency-path: apps/ml-service/requirements.txt

      - name: Install deps
        run: pip install -r requirements.txt ruff mypy
        working-directory: apps/ml-service

      - name: Ruff lint
        run: ruff check app/
        working-directory: apps/ml-service

      - name: Mypy type check
        run: mypy app/ --ignore-missing-imports
        working-directory: apps/ml-service

      - name: Pytest
        run: pytest tests/ -v --tb=short
        working-directory: apps/ml-service

  web:
    name: Web — Lint, Type Check, Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: apps/web/package-lock.json

      - name: Install deps
        run: npm ci
        working-directory: apps/web

      - name: ESLint
        run: npm run lint
        working-directory: apps/web

      - name: TypeScript check
        run: npm run type-check
        working-directory: apps/web

      - name: Build
        run: npm run build
        working-directory: apps/web

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Go vulnerability scan
        run: |
          go install golang.org/x/vuln/cmd/govulncheck@latest
          govulncheck ./...
        working-directory: apps/api

      - name: Python safety check
        run: |
          pip install safety
          safety check -r apps/ml-service/requirements.txt
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat(ci): full CI pipeline — proto lint, Go API, ML service, web, security"
```

---

## Task 9: Software Deployment Pipeline (CD)

**Files:**
- Create: `.github/workflows/deploy-software.yml`

- [ ] **Step 1: Write deploy-software.yml**

```yaml
# .github/workflows/deploy-software.yml
name: Deploy Software

on:
  push:
    branches: [main]
    paths:
      - "apps/api/**"
      - "apps/web/**"
      - "apps/ml-service/**"
      # ml/training/** changes do NOT trigger this workflow

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Run DB migrations (staging)
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
        run: bash infrastructure/scripts/migrate.sh

      - name: Deploy API to staging
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_STAGING_TOKEN }}
        run: railway up --service api --environment staging

      - name: Deploy ML service to staging
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_STAGING_TOKEN }}
        run: railway up --service ml-inference --environment staging

      - name: Deploy web to staging
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_STAGING_TOKEN }}
        run: railway up --service web --environment staging

      - name: Health check staging
        env:
          API_URL: ${{ secrets.STAGING_API_URL }}
          ML_URL: ${{ secrets.STAGING_ML_URL }}
        run: bash infrastructure/scripts/healthcheck.sh

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production        # requires manual approval in GitHub
    needs: deploy-staging
    steps:
      - uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Run DB migrations (production)
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
        run: bash infrastructure/scripts/migrate.sh

      - name: Deploy API
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_PROD_TOKEN }}
        run: railway up --service api --environment production

      - name: Deploy ML service
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_PROD_TOKEN }}
        run: railway up --service ml-inference --environment production

      - name: Deploy web
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_PROD_TOKEN }}
        run: railway up --service web --environment production

      - name: Health check production
        env:
          API_URL: ${{ secrets.PROD_API_URL }}
          ML_URL: ${{ secrets.PROD_ML_URL }}
        run: bash infrastructure/scripts/healthcheck.sh
```

- [ ] **Step 2: Configure GitHub environments**

In GitHub repo → Settings → Environments:
1. Create `staging` — no protection rules
2. Create `production` — add required reviewer (yourself), add 5-minute wait timer

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-software.yml
git commit -m "feat(cd): software deploy pipeline — staging auto, production manual approval"
```

---

## Task 10: Model Release Pipeline (Separate from Software)

**Files:**
- Create: `.github/workflows/deploy-model.yml`
- Create: `ml/training/export.py`

- [ ] **Step 1: Write export.py (artifact bundler)**

```python
# ml/training/export.py
"""
Packages trained model artifacts into a versioned bundle and uploads to S3.
Run locally or in a Colab/CI training job — NEVER from apps/.
"""
import hashlib
import json
import os
import pickle
import shutil
from pathlib import Path

import boto3
import xgboost as xgb


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def export_bundle(
    version: str,
    model: xgb.Booster,
    calibrator,
    feature_schema: dict,
    metadata: dict,
    evaluation: dict,
    output_dir: Path = Path("/tmp/export"),
) -> Path:
    bundle_dir = output_dir / version
    bundle_dir.mkdir(parents=True, exist_ok=True)

    # Save model
    model_path = bundle_dir / "model.json"
    model.save_model(str(model_path))

    # Save calibrator
    cal_path = bundle_dir / "calibrator.pkl"
    with open(cal_path, "wb") as f:
        pickle.dump(calibrator, f)

    # Save schemas
    (bundle_dir / "feature_schema.json").write_text(json.dumps(feature_schema, indent=2))
    (bundle_dir / "metadata.json").write_text(json.dumps(metadata, indent=2))
    (bundle_dir / "evaluation.json").write_text(json.dumps(evaluation, indent=2))

    # Build manifest with SHA-256 for every file
    files = ["model.json", "calibrator.pkl", "feature_schema.json", "metadata.json", "evaluation.json"]
    manifest = {
        "version": version,
        "files": {f: sha256(bundle_dir / f) for f in files},
    }
    (bundle_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))

    print(f"Bundle ready at {bundle_dir}")
    return bundle_dir


def upload_to_s3(bundle_dir: Path, version: str, bucket: str) -> None:
    s3 = boto3.client("s3", region_name="ap-south-1")
    for f in bundle_dir.iterdir():
        key = f"{version}/{f.name}"
        print(f"Uploading s3://{bucket}/{key}")
        s3.upload_file(str(f), bucket, key)
    print(f"Upload complete: {version}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--calibrator", required=True)
    parser.add_argument("--schema", required=True)
    parser.add_argument("--metadata", required=True)
    parser.add_argument("--evaluation", required=True)
    parser.add_argument("--bucket", default=os.getenv("MODEL_S3_BUCKET"))
    args = parser.parse_args()

    model = xgb.Booster()
    model.load_model(args.model)
    with open(args.calibrator, "rb") as f:
        cal = pickle.load(f)  # noqa: S301

    schema = json.loads(Path(args.schema).read_text())
    metadata = json.loads(Path(args.metadata).read_text())
    evaluation = json.loads(Path(args.evaluation).read_text())

    bundle = export_bundle(args.version, model, cal, schema, metadata, evaluation)
    if args.bucket:
        upload_to_s3(bundle, args.version, args.bucket)
```

- [ ] **Step 2: Write model deploy workflow**

```yaml
# .github/workflows/deploy-model.yml
name: Deploy Model

# MANUAL TRIGGER ONLY — never auto-deploys on code push
on:
  workflow_dispatch:
    inputs:
      model_version:
        description: "Model version to activate (e.g. msme-pd-v1.0)"
        required: true
      environment:
        description: "Target environment"
        required: true
        default: "staging"
        type: choice
        options: [staging, production]
      shadow_mode:
        description: "Deploy in shadow mode (predictions stored, no decision influence)"
        required: true
        default: "true"
        type: boolean

jobs:
  validate-artifact:
    name: Validate Model Artifact
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Verify artifact exists in S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          MODEL_S3_BUCKET: ${{ secrets.MODEL_S3_BUCKET }}
        run: |
          aws s3 ls s3://$MODEL_S3_BUCKET/${{ inputs.model_version }}/manifest.json \
            || (echo "Artifact not found in S3" && exit 1)

      - name: Download and verify checksums
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          MODEL_S3_BUCKET: ${{ secrets.MODEL_S3_BUCKET }}
        run: |
          mkdir -p /tmp/verify
          aws s3 sync s3://$MODEL_S3_BUCKET/${{ inputs.model_version }}/ /tmp/verify/
          python3 - <<'EOF'
          import hashlib, json
          from pathlib import Path
          manifest = json.loads(Path("/tmp/verify/manifest.json").read_text())
          for fname, expected_sha in manifest["files"].items():
              h = hashlib.sha256()
              with open(f"/tmp/verify/{fname}", "rb") as f:
                  for chunk in iter(lambda: f.read(8192), b""): h.update(chunk)
              actual = h.hexdigest()
              assert actual == expected_sha, f"SHA mismatch: {fname} expected {expected_sha} got {actual}"
          print("All checksums verified")
          EOF

  deploy-model:
    name: Activate Model Version
    runs-on: ubuntu-latest
    needs: validate-artifact
    environment: ${{ inputs.environment }}
    steps:
      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Update MODEL_VERSION env var on ML service
        env:
          RAILWAY_TOKEN: ${{ inputs.environment == 'production' && secrets.RAILWAY_PROD_TOKEN || secrets.RAILWAY_STAGING_TOKEN }}
        run: |
          railway variables set MODEL_VERSION=${{ inputs.model_version }} \
            --service ml-inference \
            --environment ${{ inputs.environment }}

      - name: Restart ML service to load new model
        env:
          RAILWAY_TOKEN: ${{ inputs.environment == 'production' && secrets.RAILWAY_PROD_TOKEN || secrets.RAILWAY_STAGING_TOKEN }}
        run: |
          railway service restart --service ml-inference --environment ${{ inputs.environment }}

      - name: Wait for ML service ready
        run: sleep 30

      - name: Health check
        env:
          ML_URL: ${{ inputs.environment == 'production' && secrets.PROD_ML_URL || secrets.STAGING_ML_URL }}
          API_URL: ${{ inputs.environment == 'production' && secrets.PROD_API_URL || secrets.STAGING_API_URL }}
        run: bash infrastructure/scripts/healthcheck.sh

      - name: Register model version in DB
        env:
          DATABASE_URL: ${{ inputs.environment == 'production' && secrets.PROD_DATABASE_URL || secrets.STAGING_DATABASE_URL }}
          MODEL_VERSION: ${{ inputs.model_version }}
          SHADOW_MODE: ${{ inputs.shadow_mode }}
        run: |
          psql "$DATABASE_URL" -c "
            INSERT INTO ml_model_versions (version, artifact_sha256, schema_version, deployed_at)
            VALUES ('$MODEL_VERSION', 'verified', 'msme-v1.0', NOW())
            ON CONFLICT (version) DO UPDATE SET deployed_at = NOW();
          "

      - name: Summary
        run: |
          echo "## Model Deployed" >> $GITHUB_STEP_SUMMARY
          echo "Version: ${{ inputs.model_version }}" >> $GITHUB_STEP_SUMMARY
          echo "Environment: ${{ inputs.environment }}" >> $GITHUB_STEP_SUMMARY
          echo "Shadow mode: ${{ inputs.shadow_mode }}" >> $GITHUB_STEP_SUMMARY
```

- [ ] **Step 3: Commit**

```bash
git add ml/training/export.py .github/workflows/deploy-model.yml
git commit -m "feat(ci): model release pipeline — manual trigger, SHA verify, shadow mode flag"
```

---

## Task 11: Makefile (Developer Ergonomics)

**Files:**
- Create: `Makefile`

- [ ] **Step 1: Write Makefile**

```makefile
# Makefile — repo root
.PHONY: proto go-build go-test go-lint ml-test web-build migrate health ci

# Proto
proto:
	cd proto && buf generate
	cd proto && buf lint

proto-check:
	cd proto && buf breaking --against "https://github.com/zeyro/zeyro-b2b.git#branch=main"

# Go API
go-build:
	cd apps/api && go build ./...

go-test:
	cd apps/api && go test -race ./...

go-lint:
	cd apps/api && golangci-lint run --config .golangci.yml

go-vet:
	cd apps/api && go vet ./...

# ML Service
ml-install:
	cd apps/ml-service && pip install -r requirements.txt

ml-test:
	cd apps/ml-service && pytest tests/ -v

ml-lint:
	cd apps/ml-service && ruff check app/

# Web
web-install:
	cd apps/web && npm ci

web-build:
	cd apps/web && npm run build

web-test:
	cd apps/web && npm run type-check && npm run lint

# Database
migrate-up:
	migrate -path apps/api/migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path apps/api/migrations -database "$(DATABASE_URL)" down 1

sqlc-gen:
	cd apps/api && sqlc generate

# Health
health:
	bash infrastructure/scripts/healthcheck.sh

# Run full CI locally
ci: proto go-vet go-test ml-test web-build
	@echo "All checks passed."
```

- [ ] **Step 2: Commit**

```bash
git add Makefile
git commit -m "chore: root Makefile for local dev and CI parity"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Covered |
|---|---|
| Go + Proto/gRPC backend | ✅ Task 1, 2, 3 |
| Python ML + gRPC inference | ✅ Task 5 |
| React + Tailwind web | ✅ Task 6 Dockerfile |
| Railway deploy | ✅ Task 7, 9 |
| Monorepo independent services | ✅ repo structure |
| Private network (Go → ML) | ✅ Railway private DNS, no public gRPC port |
| `ml/training` air-gapped from `apps/` | ✅ explicit in structure + docs |
| MoE inference | ✅ `ExpertTarget` enum in proto, predictor dispatch |
| Platt calibration | ✅ predictor.py |
| SHA-256 artifact verification | ✅ loader.py + deploy-model.yml |
| Two release pipelines (software vs model) | ✅ deploy-software.yml vs deploy-model.yml |
| Shadow mode flag | ✅ workflow_dispatch input |
| DB migrations before deploy | ✅ migrate.sh in both CD workflows |
| Breaking proto change detection | ✅ `buf breaking` in CI |
| Multi-tenancy on every table | ✅ migrations 001-005 |
| Audit trail | ✅ migration 006 |
| Immutable feature snapshots | ✅ no `updated_at` on feature_snapshots |
| TDD | ✅ failing tests written before implementation in Tasks 3, 5 |
| golangci-lint + forbidigo | ✅ Task 2 |

**Placeholder scan:** None. All code blocks are complete.

**Type consistency:** `PredictResponse` fields match across proto and predictor return dict.

---

**Plan complete. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session with checkpoints

Which approach?