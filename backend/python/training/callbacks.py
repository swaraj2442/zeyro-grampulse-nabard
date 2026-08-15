"""XGBoost training callbacks.

Custom callbacks for the sklearn XGBoost API (XGBClassifier / XGBRegressor).
All callbacks inherit from xgboost.callback.TrainingCallback so they work
with XGBoost >= 1.3 and are compatible with the sklearn `.fit()` interface.
"""

from __future__ import annotations

import logging
from pathlib import Path

from xgboost.callback import TrainingCallback

try:
    from tqdm.auto import tqdm
    _TQDM_AVAILABLE = True
except ImportError:
    _TQDM_AVAILABLE = False

logger = logging.getLogger(__name__)


class CheckpointCallback(TrainingCallback):
    """
    Save a model checkpoint every N boosting rounds.

    Checkpoints are saved as XGBoost UBJ (binary JSON) files named
    `checkpoint_round_NNNN.ubj` inside the provided directory.

    The final best model is still saved by the training script after
    `.fit()` completes. Checkpoints are for recovery / analysis only.

    Args:
        output_dir: Directory to write checkpoint files into.
        interval: Save every this many boosting rounds (default: 100).
    """

    def __init__(self, output_dir: Path, interval: int = 100) -> None:
        super().__init__()
        self.output_dir = Path(output_dir)
        self.interval = interval
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def after_iteration(self, model, epoch: int, evals_log: dict) -> bool:
        """Called by XGBoost after every boosting round."""
        round_number = epoch + 1  # epoch is 0-indexed
        if round_number % self.interval == 0:
            path = self.output_dir / f"checkpoint_round_{round_number:04d}.ubj"
            model.save_model(str(path))
            logger.debug("Checkpoint saved: %s", path.name)
        return False  # False = continue training; True = early stop


class EpochLogCallback(TrainingCallback):
    """
    Log training metrics at a configurable verbosity interval.

    Replaces XGBoost's default verbose=N printing with structured
    logging so output appears in the standard logging stream rather
    than directly to stdout.

    Args:
        log_every: Log metrics every N rounds (default: 50).
        logger_name: Logger name to write to.
    """

    def __init__(self, log_every: int = 50, logger_name: str = __name__) -> None:
        super().__init__()
        self.log_every = log_every
        self._logger = logging.getLogger(logger_name)

    def after_iteration(self, model, epoch: int, evals_log: dict) -> bool:
        round_number = epoch + 1
        if round_number % self.log_every == 0:
            parts = []
            for dataset, metrics in evals_log.items():
                for metric_name, values in metrics.items():
                    parts.append(f"{dataset}/{metric_name}={values[-1]:.4f}")
            self._logger.info("Round %4d | %s", round_number, "  ".join(parts))
        return False


class TqdmCallback(TrainingCallback):
    """
    XGBoost callback to render a tqdm progress bar with ETA.
    
    Args:
        total_epochs: Total number of boosting rounds (e.g. n_estimators)
        desc: Progress bar description text
    """

    def __init__(self, total_epochs: int, desc: str = "Training", leave: bool = True) -> None:
        super().__init__()
        self.total_epochs = total_epochs
        self.desc = desc
        self.leave = leave
        self.pbar = None

    def before_training(self, model):
        if _TQDM_AVAILABLE:
            self.pbar = tqdm(total=self.total_epochs, desc=self.desc, leave=self.leave)
        return model

    def after_iteration(self, model, epoch: int, evals_log: dict) -> bool:
        if self.pbar is not None:
            self.pbar.update(1)
            # Optionally show the latest validation metric in the progress bar
            if evals_log:
                postfix = {}
                for dataset, metrics in evals_log.items():
                    # Just grab the first metric from validation set to keep it clean
                    for metric_name, values in metrics.items():
                        postfix[f"{dataset}-{metric_name}"] = f"{values[-1]:.4f}"
                self.pbar.set_postfix(postfix)
        return False

    def after_training(self, model):
        if self.pbar is not None:
            self.pbar.close()
        return model
