import os

filepath = 'python/training/optuna_tuner.py'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update tune functions signature to accept data_source
for func in ['tune_bfs', 'tune_rps', 'tune_credit', '_run_optimization']:
    content = content.replace(
        f'def {func}(\n',
        f'def {func}(\n'
    )
    # We will just add data_source: str = "proxy_homecredit" before artifact_dir
    content = content.replace(
        'artifact_dir: Path | None = None,\n) -> dict:',
        'artifact_dir: Path | None = None,\n    data_source: str = "proxy_homecredit",\n) -> dict:'
    )
    
# 2. Pass data_source into _run_optimization calls
for base in ['bfs', 'rps', 'credit']:
    content = content.replace(
        f'artifact_dir=base_dir,\n    )',
        f'artifact_dir=base_dir,\n        data_source=data_source,\n    )'
    )
    
# 3. Add MLflowCallback setup before study creation
# Find pruner setup
pruner_code = """    pruner = (
        optuna.pruners.MedianPruner(n_startup_trials=5, n_warmup_steps=2)"""

mlflow_cb_setup = """    import mlflow
    from optuna.integration.mlflow import MLflowCallback
    from .zeyro_mlflow import TRACKING_URI, get_git_sha
    
    mlflow.set_tracking_uri(TRACKING_URI)
    
    mlflow_cb = MLflowCallback(
        tracking_uri=TRACKING_URI,
        metric_name="cv_mean_auc",
        create_experiment=True,
        mlflow_kwargs={
            "nested": True,
            "tags": {
                "data_source": data_source,
                "git_sha": get_git_sha(),
                "model_target": "OPTUNA_TUNING"
            }
        },
    )

    pruner = ("""
content = content.replace(pruner_code, mlflow_cb_setup)

# 4. Change study_name
content = content.replace('study_name=run_name,', 'study_name=f"{run_name}_tuning",')

# 5. Add callback to study.optimize
content = content.replace(
    'study.optimize(objective, n_trials=remaining, show_progress_bar=True)',
    'study.optimize(objective, n_trials=remaining, show_progress_bar=True, callbacks=[mlflow_cb])'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully patched optuna_tuner.py")
