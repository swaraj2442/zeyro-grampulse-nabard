import json

nb_path = 'notebooks/cashflow_tft_training_local.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

cell_index = -1
for i, cell in enumerate(nb.get('cells', [])):
    if cell['cell_type'] == 'code':
        source_list = cell['source']
        if isinstance(source_list, list):
            source = "".join(source_list)
        else:
            source = source_list
            
        if "mlflow_logger = MLFlowLogger(" in source and "experiment_name" in source:
            cell_index = i
            break

if cell_index != -1:
    new_source = """import lightning.pytorch as pl
from pytorch_lightning.loggers import MLFlowLogger
from pytorch_lightning.callbacks import EarlyStopping, ModelCheckpoint

# ── Callbacks ────────────────────────────────────────────────────────────────
checkpoint_path = f"{MODEL_DIR}/tft_checkpoints"

checkpoint_callback = ModelCheckpoint(
    dirpath=checkpoint_path,
    filename="tft-{epoch:02d}-{val_loss:.4f}",
    monitor="val_loss",
    mode="min",
    save_top_k=1,
)

callbacks = [
    EarlyStopping(monitor="val_loss", patience=8, mode="min", verbose=True),
    checkpoint_callback,
]

# ── MLflow Logger ────────────────────────────────────────────────────────────
mlflow_logger = MLFlowLogger(
    experiment_name=CFG['experiment_name'],
    tracking_uri="sqlite:///mlflow.db",
)

# ── PyTorch Lightning Trainer ────────────────────────────────────────────────
trainer = pl.Trainer(
    max_epochs=CFG['max_epochs'],
    accelerator="auto",
    devices=1,
    gradient_clip_val=0.1,
    callbacks=callbacks,
    logger=mlflow_logger,
    enable_progress_bar=True,
)

print(f'\\n✅ Trainer configured')
print(f'   Accelerator : {trainer.accelerator}')
print(f'   Max epochs  : {CFG["max_epochs"]} (early stopping at patience=8)')
print(f'   Checkpoints : {checkpoint_path}')"""

    nb['cells'][cell_index]['source'] = [line + '\n' for line in new_source.splitlines()]
    # Remove the last newline
    if nb['cells'][cell_index]['source']:
        nb['cells'][cell_index]['source'][-1] = nb['cells'][cell_index]['source'][-1].rstrip('\n')

    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    
    print(f"Successfully updated cell index {cell_index}!")
else:
    print("Could not find the MLFlowLogger cell!")
