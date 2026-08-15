import os
import re

files_to_patch = [
    ('python/training/train_credit.py', 'CREDIT_DEFAULT'),
    ('python/training/train_bfs.py', 'BFS'),
    ('python/training/train_rps.py', 'RPS')
]

for filepath, model_target in files_to_patch:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, does not exist.")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. Imports
    if 'import mlflow' not in content:
        content = content.replace(
            'from xgboost import XGBClassifier',
            'from xgboost import XGBClassifier\nimport mlflow\nfrom .zeyro_mlflow import start_training_run'
        )
        
    # 2. Function signature
    if 'data_source: str' not in content:
        content = content.replace(
            'artifact_dir: Path | None = None,',
            'artifact_dir: Path | None = None,\n    data_source: str = "proxy_homecredit",'
        )
        
    # 3. Indent and wrap everything from TRAIN to the end
    # Find the start of the TRAIN phase
    parts = content.split('    with log.phase("TRAIN"):')
    if len(parts) == 2:
        pre_train = parts[0]
        post_train = '    with log.phase("TRAIN"):'+ parts[1]
        
        # We need to split post_train right before the return statement so we can close the context
        ret_parts = post_train.rsplit('    return {', 1)
        if len(ret_parts) == 2:
            body = ret_parts[0]
            ret = '    return {' + ret_parts[1]
            
            # Add mlflow metric logging at the end of the body
            mlflow_log = f"""
    # MLflow explicit logging
    mlflow.log_metrics({{
        "auc_test": metrics_test["auc"],
        "gini_test": metrics_test["gini"],
        "brier_test": metrics_test["brier"],
    }})
    if fairness_result:
        mlflow.log_metrics({{
            "disparate_impact": fairness_result["disparate_impact"]["ratio"]
        }})
    # Log all JSON artifacts to S3
    mlflow.log_artifacts(str(out_dir))
"""
            # Insert mlflow_log before log.finish()
            body = body.replace('    log.finish()', mlflow_log + '    log.finish()')
            
            # Indent the body
            indented_body = '\n'.join('    ' + line if line.strip() else line for line in body.split('\n'))
            
            # Wrap
            wrapper = f"""    with start_training_run(
        run_name=run_name,
        model_target="{model_target}",
        data_source=data_source,
    ):
"""
            new_content = pre_train + wrapper + indented_body + ret
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Successfully patched {filepath}')
        else:
            print(f'Could not find return statement in {filepath}')
    else:
        print(f'Could not find TRAIN phase or already patched in {filepath}')
