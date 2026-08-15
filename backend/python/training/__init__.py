"""Zeyro training package.

Exports the top-level entry points so notebooks can call:

    from training import run_bfs, run_rps, run_all
    from training import calibrate_bfs, calibrate_rps
    from training import ModelRegistry, RetrainManager

Fairness & Explainability:

    from training import fairness_report, print_fairness_report
    from training import optimize_thresholds, apply_group_thresholds
    from training import mitigation_report, print_mitigation_report
    from training import plot_confusion_matrix_pair
"""

from __future__ import annotations

from .calibrate_bfs import run as calibrate_bfs
from .calibrate_rps import run as calibrate_rps
from .pipeline import run_all, run_bfs, run_rps
from .registry import ModelRegistry
from .retrain import RetrainManager

# Fairness audit (pure computation — no I/O)
from .fairness import (
    fairness_metrics_by_group,
    fairness_report,
    disparate_impact,
    equal_opportunity_difference,
    equalized_odds_difference,
    demographic_parity_difference,
    print_fairness_report,
)

# Bias mitigation (pure computation — no I/O)
from .bias_mitigation import (
    compute_fairness_weights,
    optimize_thresholds,
    apply_group_thresholds,
    apply_global_threshold,
    save_thresholds,
    load_thresholds,
    mitigation_report,
    print_thresholds,
    print_mitigation_report,
    print_pipeline_summary,
)

# Confusion matrix visualisations
from .shap_explainer import (
    plot_confusion_matrix,
    plot_confusion_matrix_normalized,
    plot_confusion_matrix_pair,
)

__all__ = [
    # Training
    "run_all",
    "run_bfs",
    "run_rps",
    # Post-hoc calibration (run after real outcomes land)
    "calibrate_bfs",
    "calibrate_rps",
    # Registry & retraining
    "ModelRegistry",
    "RetrainManager",
    # Fairness audit
    "fairness_metrics_by_group",
    "fairness_report",
    "disparate_impact",
    "equal_opportunity_difference",
    "equalized_odds_difference",
    "demographic_parity_difference",
    "print_fairness_report",
    # Bias mitigation
    "compute_fairness_weights",
    "optimize_thresholds",
    "apply_group_thresholds",
    "apply_global_threshold",
    "save_thresholds",
    "load_thresholds",
    "mitigation_report",
    "print_thresholds",
    "print_mitigation_report",
    "print_pipeline_summary",
    # Confusion matrix plots
    "plot_confusion_matrix",
    "plot_confusion_matrix_normalized",
    "plot_confusion_matrix_pair",
]

