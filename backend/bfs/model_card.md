# Model Card: BFS v0.5 (Behavioral Finance Score Benchmark)

## 1. Model Details
- **Architecture**: XGBoost Classifier (v2.x) with native categorical support.
- **Optimization**: Optuna hyperparameter study (AUC maximization).
- **Calibration**: Isotonic Regression (Scikit-Learn `CalibratedClassifierCV`).
- **Score Mapping**: `BFS = 600 - (72 * log(PD / (1 - PD)))`, bounded between [300, 900].
- **Constraints**: Explicit monotonic constraints applied to prevent contradictory risk logic (e.g., higher delinquency strictly mapped to higher risk; higher positive credit velocity strictly mapped to lower risk).
- **Status**: Pre-Production (Internal Baseline).

## 2. Intended Use
- **Primary Use Case**: Establishing a highly calibrated, bureau-driven baseline for the risk engineering team.
- **Out of Scope Use**: **Not for live production underwriting.** This model acts as a reference point for future iterations that will ingest cashflow, UPI, and Account Aggregator (AA) signals.

## 3. Training Data & Assumptions
- **Dataset**: `cibil_ind` (Synthetic/Dummy Bureau Data).
- **Target Variable (`Approved_Flag`)**: Mapped to binary risk (P1/P2 = 0/Good, P3/P4 = 1/Bad).
- **Critical Assumption (Leakage Mitigation)**: Because this is a synthetic dataset, variables like `Credit_Score`, direct borrower identifiers (`PROSPECTID`), and post-decision loan flags (`CC_Flag`) were exceptionally predictive of the target (AUC > 0.99). These were aggressively stripped out to simulate true behavioral underwriting and force the model to learn underlying patterns rather than overfitted proxies.

## 4. Evaluation Metrics (Test Split)
Evaluated on a 15% out-of-sample holdout (`cibil_test.csv`):
- **ROC-AUC**: `0.7903`
- **KS Statistic**: `0.4443`
- **Brier Score**: `0.1501`
- **Expected Calibration Error (ECE)**: `0.0181`

*Assessment: Metrics fall precisely within acceptable industry standards for a bureau-only baseline model (AUC 0.75-0.85, KS > 0.35, ECE < 0.05).*

## 5. Limitations
- **Proxy Labels**: The model is trained on a proxy approval bucket (`Approved_Flag`) rather than true historical defaults (e.g., DPD90, Charge-offs). It lacks actual repayment histories.
- **Temporal Validation**: The dataset lacks timestamps; validation relies on random sampling rather than out-of-time (OOT) holdouts.
- **Reject Inference**: No reject inference techniques have been applied since the labels are proxy approvals rather than realized defaults.

## 6. Fairness & Bias
- **Monitoring**: Ongoing segment analysis is required (see `bfs/monitoring/segment_report.ipynb`).
- **Vulnerable Cohorts**: Special attention must be paid to "thin file" borrowers (e.g., `Total_TL < 2`) and high-utilization borrowers to ensure equitable risk distribution without disproportionate rejection rates that do not correlate to actual default propensity.
