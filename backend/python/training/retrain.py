"""RetrainManager — orchestrates incremental retraining on new data.

Handles the full lifecycle of a retraining run:
  1. Pre-training snapshot: records PSI vs the training distribution of the
     current production model to detect drift before retraining.
  2. Runs the appropriate training script with the new data.
  3. Post-training snapshot: records metrics delta (new vs production).
  4. Writes a structured retrain report (retrain_report.md) that compares
     before/after weights, metrics, and SHAP importance.
  5. Registers the new version in ModelRegistry.
  6. Optionally auto-promotes if gates pass and PSI < threshold.

Usage from a notebook:
    from training import RetrainManager
    from training.registry import ModelRegistry

    reg = ModelRegistry("bfs")
    manager = RetrainManager(registry=reg, model_type="bfs")
    result = manager.retrain(
        df_new=df,
        training_rows=len(df),
        target_rate=df["defaulted_within_90d"].mean(),
        auto_promote=True,
        notes="Batch 2026-Q2 — 8k new observations added",
    )
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from typing import cast

from .calibration import calibrate
from .features import (
    BFS_FEATURES, BFS_TARGET,
    RPS_FEATURES, RPS_TARGET,
    prepare_features,
)
from .registry import ModelRegistry, _format_shap_diff
from .train_bfs import run as _run_bfs
from .train_rps import run as _run_rps
from .validation import psi

logger = logging.getLogger(__name__)

# PSI threshold above which we flag drift before auto-promoting
_PSI_WARN_THRESHOLD: float = 0.10
_PSI_BLOCK_THRESHOLD: float = 0.20

_TRAIN_FN_MAP = {
    "bfs": _run_bfs,
    "rps": _run_rps,
}

_FEATURES_MAP = {
    "bfs": (BFS_FEATURES, BFS_TARGET),
    "rps": (RPS_FEATURES, RPS_TARGET),
}


class RetrainManager:
    """
    Manages incremental retraining with before/after snapshotting.

    Args:
        registry: Initialised ModelRegistry for this model type.
        model_type: One of "bfs", "rps".
        psi_warn_threshold: PSI above this triggers a console warning.
        psi_block_threshold: PSI above this blocks auto-promotion.
    """

    def __init__(
        self,
        registry: ModelRegistry,
        model_type: str,
        psi_warn_threshold: float = _PSI_WARN_THRESHOLD,
        psi_block_threshold: float = _PSI_BLOCK_THRESHOLD,
    ) -> None:
        if model_type not in _TRAIN_FN_MAP:
            raise ValueError(f"Unknown model_type '{model_type}'. Choose from {list(_TRAIN_FN_MAP)}.")
        self.registry = registry
        self.model_type = model_type
        self.psi_warn = psi_warn_threshold
        self.psi_block = psi_block_threshold

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------

    def retrain(
        self,
        df_new: pd.DataFrame,
        training_rows: int,
        target_rate: float,
        run_name: str | None = None,
        xgb_params: dict | None = None,
        auto_promote: bool = False,
        notes: str = "",
    ) -> dict:
        """
        Run a full retraining cycle with pre/post snapshotting.

        Args:
            df_new: Cleaned, labelled DataFrame with new + historical data.
            training_rows: Total rows used (for the registry record).
            target_rate: Positive-class rate in df_new.
            run_name: Override the auto-generated run name.
            xgb_params: Override default XGBoost hyper-parameters.
            auto_promote: If True, promotes the new version if all gates pass
                          and PSI is below the block threshold.
            notes: Free-text notes attached to the registry entry.

        Returns:
            Dict with keys: version, result, psi_scores, promoted, report_path.
        """
        new_version_number = self.registry._state.latest_version + 1
        effective_run_name = run_name or f"{self.model_type}_v{new_version_number}"

        # ------------------------------------------------------------------
        # 1. Pre-training snapshot
        # ------------------------------------------------------------------
        pre_snapshot = self._pre_snapshot(df_new)
        psi_scores = pre_snapshot.get("psi_scores", {})

        drift_warning = any(v >= self.psi_warn for v in psi_scores.values())
        drift_blocked = any(v >= self.psi_block for v in psi_scores.values())

        if drift_warning:
            logger.warning(
                "[%s] ⚠️  PSI drift detected before retraining: %s",
                self.model_type.upper(), psi_scores,
            )
        if drift_blocked:
            logger.warning(
                "[%s] 🚨 PSI > %.2f on %d feature(s) — auto-promote will be blocked.",
                self.model_type.upper(), self.psi_block,
                sum(1 for v in psi_scores.values() if v >= self.psi_block),
            )

        # ------------------------------------------------------------------
        # 2. Train
        # ------------------------------------------------------------------
        train_fn = _TRAIN_FN_MAP[self.model_type]
        result = train_fn(
            df_new,
            run_name=effective_run_name,
            xgb_params=xgb_params,
        )

        # ------------------------------------------------------------------
        # 3. Register
        # ------------------------------------------------------------------
        version = self.registry.register(
            result,
            training_rows=training_rows,
            target_rate=target_rate,
            notes=notes,
        )

        # ------------------------------------------------------------------
        # 4. Post-training snapshot + retrain report
        # ------------------------------------------------------------------
        report_path = self._write_retrain_report(
            result=result,
            version=version,
            pre_snapshot=pre_snapshot,
            psi_scores=psi_scores,
            notes=notes,
        )

        # ------------------------------------------------------------------
        # 5. Optional auto-promote
        # ------------------------------------------------------------------
        promoted = False
        if auto_promote:
            if drift_blocked:
                logger.warning(
                    "[%s] Auto-promote skipped — PSI too high. Promote manually after review.",
                    self.model_type.upper(),
                )
            else:
                try:
                    self.registry.promote(version)
                    promoted = True
                except ValueError as exc:
                    logger.warning("[%s] Auto-promote failed: %s", self.model_type.upper(), exc)

        return {
            "version": version,
            "run_name": effective_run_name,
            "result": result,
            "psi_scores": psi_scores,
            "drift_warning": drift_warning,
            "drift_blocked": drift_blocked,
            "promoted": promoted,
            "report_path": str(report_path),
        }

    # ------------------------------------------------------------------
    # Snapshot helpers
    # ------------------------------------------------------------------

    def _pre_snapshot(self, df_new: pd.DataFrame) -> dict:
        """
        Compute PSI for key features comparing current production data
        distribution to the new training batch.

        Returns a dict with 'psi_scores' and optionally 'production_metrics'.
        """
        prod_path = self.registry.production_path()

        if prod_path is None:
            # No production model yet
            return {"psi_scores": {}, "production_metrics": None}

        features, target = _FEATURES_MAP[self.model_type]

        # Load PSI reference distribution from training snapshot, if present
        ref_path = prod_path / "training_distribution.json"
        if not ref_path.exists():
            # No reference recorded — skip PSI
            return {"psi_scores": {}, "production_metrics": None}

        try:
            reference = json.loads(ref_path.read_text())
        except json.JSONDecodeError:
            return {"psi_scores": {}, "production_metrics": None}

        X_new = prepare_features(df_new, features)
        psi_scores: dict[str, float] = {}

        for feat in features[:5]:  # check top-5 features for speed
            if feat in reference and feat in X_new.columns:
                ref_arr = np.array(reference[feat])
                cur_arr = np.asarray(X_new[feat])
                psi_scores[feat] = psi(ref_arr, cur_arr)

        prod_metrics_path = prod_path / "metrics.json"
        prod_metrics = None
        if prod_metrics_path.exists():
            try:
                prod_metrics = json.loads(prod_metrics_path.read_text())
            except json.JSONDecodeError:
                pass

        return {"psi_scores": psi_scores, "production_metrics": prod_metrics}

    def save_training_distribution(
        self,
        df: pd.DataFrame,
        run_name: str,
        n_samples: int = 1000,
    ) -> None:
        """
        Persist a sample of the training feature distribution for future PSI checks.

        Should be called after training completes, before registering.

        Args:
            df: Training DataFrame.
            run_name: The run name (determines output directory).
            n_samples: How many rows to sample for the reference distribution.
        """
        if self.model_type not in _FEATURES_MAP:
            return

        features, _ = _FEATURES_MAP[self.model_type]
        X = prepare_features(df, features)
        sample = X.sample(min(n_samples, len(X)), random_state=42)

        dist: dict[str, list[float]] = {col: cast(list[float], sample[col].tolist()) for col in features[:5]}

        out_path = self.registry.root / run_name / "training_distribution.json"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(dist, indent=2))
        logger.debug("Training distribution snapshot saved to %s", out_path)

    # ------------------------------------------------------------------
    # Report writer
    # ------------------------------------------------------------------

    def _write_retrain_report(
        self,
        result: dict,
        version: int,
        pre_snapshot: dict,
        psi_scores: dict[str, float],
        notes: str,
    ) -> Path:
        """
        Write retrain_report.md in the new run's artefact directory.
        Includes before/after metrics, SHAP weight diff, and PSI scores.
        """
        run_dir = self.registry.root / result.get("run_name", f"v{version}")
        run_dir.mkdir(parents=True, exist_ok=True)

        prod_metrics = pre_snapshot.get("production_metrics") or {}
        new_metrics = result.get("metrics", {})

        # Extract calibrated metrics from both
        prod_cal = prod_metrics.get("calibrated", prod_metrics)
        new_cal = new_metrics.get("calibrated", new_metrics)

        prod_auc = prod_cal.get("auc", "N/A")
        new_auc = new_cal.get("auc", "N/A")
        prod_brier = prod_cal.get("brier", "N/A")
        new_brier = new_cal.get("brier", "N/A")

        # SHAP diff
        prev_shap = self.registry._get_previous_shap()
        curr_shap = result.get("shap_importance", {})
        shap_diff = _format_shap_diff(prev_shap, curr_shap)

        # PSI table
        psi_rows = "\n".join(
            f"| `{feat}` | {val:.4f} | {'⚠️ WARN' if val >= self.psi_warn else '✅ OK'} |"
            for feat, val in psi_scores.items()
        ) or "| — | No prior distribution to compare | — |"

        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        report = f"""# Retrain Report — {self.model_type.upper()} v{version}

Generated: {timestamp}
Notes: {notes or "—"}

## Before vs After Metrics

| Metric | Production (prev) | New v{version} | Δ |
|--------|-------------------|----------------|---|
| AUC | {prod_auc} | {new_auc} | {_delta_str(prod_auc, new_auc)} |
| Brier | {prod_brier} | {new_brier} | {_delta_str(prod_brier, new_brier, lower_is_better=True)} |
| Calibration | — | {"✅ PASS" if result.get("calibration_passed", True) else "❌ FAIL"} | — |

## Population Stability Index (Pre-Training Drift Check)

| Feature | PSI | Status |
|---------|-----|--------|
{psi_rows}

> PSI < {self.psi_warn} = stable  ·  PSI {self.psi_warn}–{self.psi_block} = warn  ·  PSI > {self.psi_block} = retrain blocked

{shap_diff}
"""

        report_path = run_dir / "retrain_report.md"
        report_path.write_text(report)
        logger.info("[%s] Retrain report written to %s", self.model_type.upper(), report_path)
        return report_path


# ---------------------------------------------------------------------------
# Formatting helpers
# ---------------------------------------------------------------------------

def _delta_str(
    before,
    after,
    lower_is_better: bool = False,
) -> str:
    """Format a before/after numeric delta with directional emoji."""
    try:
        b = float(before)
        a = float(after)
    except (TypeError, ValueError):
        return "—"

    delta = a - b
    if abs(delta) < 1e-6:
        return "– (no change)"

    improved = (delta > 0 and not lower_is_better) or (delta < 0 and lower_is_better)
    sign = "+" if delta > 0 else ""
    arrow = "▲" if improved else "▼"
    color = "✅" if improved else "⚠️"
    return f"{color} {arrow} {sign}{delta:.4f}"
