"""Industry-grade training run logger.

Provides a RunLogger that:
  - Creates a per-run log file under artifacts/<model>/<run>/training.log
  - Mirrors output to the console with colour-safe formatting
  - Logs structured, human-readable phase banners and metric tables
  - Tracks elapsed wall-clock time per phase
  - Writes a machine-readable run_summary.json at the end

Usage:
    from training.run_logger import RunLogger

    log = RunLogger(model_name="BFS", run_name="bfs_v1", out_dir=out_dir)
    log.start(params=params, n_rows=len(df), default_rate=y.mean())

    with log.phase("TRAIN"):
        model.fit(...)

    log.epoch(round_num=50, metrics={"val/auc": 0.7234})
    log.metrics(metrics_dict)
    log.shap_summary(global_importance, top_n=5)
    log.finish(artifact_dir=out_dir)
"""

from __future__ import annotations

import json
import logging
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_SEP_HEAVY = "=" * 80
_SEP_LIGHT = "─" * 80
_INDENT = "  "


class RunLogger:
    """
    Structured logger for a single ML training run.

    Args:
        model_name: Upper-case model tag shown in banners (e.g. "BFS").
        run_name: Unique run identifier (e.g. "bfs_v1").
        out_dir: Artifact directory — log file is written here as training.log.
    """

    def __init__(self, model_name: str, run_name: str, out_dir: Path) -> None:
        self.model_name = model_name.upper()
        self.run_name = run_name
        self.out_dir = Path(out_dir)
        self.out_dir.mkdir(parents=True, exist_ok=True)

        self._started_at: float = time.perf_counter()
        self._phase_start: float = self._started_at
        self._summary: dict[str, Any] = {
            "model": model_name,
            "run_name": run_name,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }

        # Build logger with file + console handlers
        self._log = logging.getLogger(f"training.{model_name.lower()}.{run_name}")
        self._log.setLevel(logging.DEBUG)
        self._log.propagate = False

        if not self._log.handlers:
            fmt = logging.Formatter("%(message)s")

            # Console handler
            ch = logging.StreamHandler()
            ch.setLevel(logging.INFO)
            ch.setFormatter(fmt)
            self._log.addHandler(ch)

            # File handler (captures DEBUG too — every epoch)
            log_path = self.out_dir / "training.log"
            fh = logging.FileHandler(str(log_path), mode="w", encoding="utf-8")
            fh.setLevel(logging.DEBUG)
            fh.setFormatter(fmt)
            self._log.addHandler(fh)

    # ------------------------------------------------------------------
    # Run lifecycle
    # ------------------------------------------------------------------

    def start(
        self,
        params: dict,
        n_rows: int,
        default_rate: float | None = None,
    ) -> None:
        """Log run header with dataset stats and hyper-parameters."""
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        self._log.info(_SEP_HEAVY)
        self._log.info(
            " %s TRAINING RUN | run=%s | %s", self.model_name, self.run_name, ts
        )
        self._log.info(_SEP_HEAVY)

        rate_str = f"{default_rate:.2%}" if default_rate is not None else "N/A"
        self._log.info("[SETUP]  Rows: %d | Target rate: %s", n_rows, rate_str)
        self._log.info("[PARAMS] %s", _fmt_dict(params, sep=" | ", max_items=8))
        self._summary["params"] = params
        self._summary["n_rows"] = n_rows

    def split(self, n_train: int, n_val: int) -> None:
        """Log train/val split sizes."""
        self._log.info(
            "[SPLIT]  Train: %d | Val: %d (%.0f/%.0f)",
            n_train, n_val,
            100 * n_train / (n_train + n_val),
            100 * n_val / (n_train + n_val),
        )

    @contextmanager
    def phase(self, name: str):
        """Context manager that logs phase start/end with elapsed time."""
        self._log.info(_SEP_LIGHT)
        self._log.info("[%-8s] Starting...", name)
        t0 = time.perf_counter()
        try:
            yield
        finally:
            elapsed = time.perf_counter() - t0
            self._log.info("[%-8s] Done in %.1fs", name, elapsed)

    def finish(self) -> None:
        """Log final footer and write run_summary.json."""
        total = time.perf_counter() - self._started_at
        self._summary["total_elapsed_s"] = round(total, 2)
        self._summary["finished_at"] = datetime.now(timezone.utc).isoformat()

        summary_path = self.out_dir / "run_summary.json"
        summary_path.write_text(json.dumps(self._summary, indent=2))

        self._log.info(_SEP_LIGHT)
        self._log.info(
            "[DONE]   Total elapsed: %.1fs | Summary: %s",
            total, summary_path.name,
        )
        self._log.info(_SEP_HEAVY)

        # Explicitly close and remove all handlers to release file locks
        # This is critical for Optuna trials using TemporaryDirectory on Windows
        for handler in list(self._log.handlers):
            handler.close()
            self._log.removeHandler(handler)

    # ------------------------------------------------------------------
    # Epoch logging
    # ------------------------------------------------------------------

    def epoch(self, round_num: int, metrics: dict[str, float]) -> None:
        """Log metrics for a single boosting round (written to file only at DEBUG)."""
        parts = _fmt_dict(metrics, sep=" | ")
        self._log.debug("[EPOCH %4d] %s", round_num, parts)

    def best_round(self, round_num: int) -> None:
        self._log.info("[TRAIN]  Best round: %d", round_num)
        self._summary["best_round"] = round_num

    # ------------------------------------------------------------------
    # Metrics table
    # ------------------------------------------------------------------

    def metrics(self, m: dict, title: str = "METRICS") -> None:
        """Log a formatted metrics table."""
        self._log.info(_SEP_LIGHT)
        self._log.info("[%s]", title)

        # Probabilistic row
        prob_keys = ["auc", "ks", "gini", "brier", "average_precision"]
        prob_vals = {k: m[k] for k in prob_keys if k in m}
        if prob_vals:
            self._log.info(
                "%s%s",
                _INDENT,
                _fmt_metric_row(prob_vals),
            )

        # Threshold row
        thresh_keys = ["accuracy", "precision", "recall", "f1"]
        thresh_vals = {k: m[k] for k in thresh_keys if k in m}
        if thresh_vals:
            threshold = m.get("threshold", 0.5)
            self._log.info(
                "%sThreshold=%.2f  %s",
                _INDENT, threshold,
                _fmt_metric_row(thresh_vals),
            )

        # Confusion matrix row
        cm_keys = ["tp", "tn", "fp", "fn"]
        cm_vals = {k: m[k] for k in cm_keys if k in m}
        if cm_vals:
            self._log.info(
                "%sTP: %-6d  TN: %-6d  FP: %-6d  FN: %-6d",
                _INDENT,
                cm_vals.get("tp", 0), cm_vals.get("tn", 0),
                cm_vals.get("fp", 0), cm_vals.get("fn", 0),
            )

        self._summary["metrics"] = m

    # ------------------------------------------------------------------
    # SHAP summary
    # ------------------------------------------------------------------

    def shap_summary(
        self,
        global_importance: list[dict[str, Any]],
        top_n: int = 4,
    ) -> None:
        """Log top N global SHAP features."""
        self._log.info(_SEP_LIGHT)
        self._log.info("[SHAP]   Global importance (top %d):", top_n)
        
        max_val = max(item["mean_shap"] for item in global_importance) if global_importance else 1.0
        
        for rank, item in enumerate(global_importance[:top_n], 1):
            feat = item["feature"]
            val = item["mean_shap"]
            reason = item.get("reason")
            
            bar = "█" * max(1, int((val / max_val) * 20))
            if reason:
                self._log.info("%s%2d. %-50s %.6f  %s", _INDENT, rank, f"{feat} ({reason})", val, bar)
            else:
                self._log.info("%s%2d. %-50s %.6f  %s", _INDENT, rank, feat, val, bar)

    # ------------------------------------------------------------------
    # Artifact summary
    # ------------------------------------------------------------------

    def artifacts(self, out_dir: Path) -> None:
        """Log the artifact directory."""
        self._log.info(_SEP_LIGHT)
        self._log.info("[OUTPUT] %s", out_dir)


# ---------------------------------------------------------------------------
# Private formatting helpers
# ---------------------------------------------------------------------------

def _fmt_dict(
    d: dict,
    sep: str = " | ",
    max_items: int | None = None,
) -> str:
    items = list(d.items())
    if max_items:
        items = items[:max_items]
    parts = []
    for k, v in items:
        if isinstance(v, float):
            parts.append(f"{k}={v:.4f}")
        else:
            parts.append(f"{k}={v}")
    return sep.join(parts)


def _fmt_metric_row(m: dict) -> str:
    parts = []
    for k, v in m.items():
        if isinstance(v, float):
            parts.append(f"{k.upper()}: {v:.4f}")
        else:
            parts.append(f"{k.upper()}: {v}")
    return "  ".join(parts)
