# Cashflow Forecasting + Liquidity Stress Pipeline — Implementation Plan

> **For agentic workers:** Implement this plan task-by-task using the steps below. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Python ML pipeline that ingests Account Aggregator bank data, produces 12-month cashflow forecasts with confidence bands, shortfall probabilities, and runs liquidity stress tests — outputting a structured bundle per entity for bank underwriting consumption.

**Architecture:** Feature engineering module transforms raw AA transactions into monthly aggregates and lag features. A Prophet + LightGBM ensemble produces the base forecast curve, Monte Carlo simulation derives shortfall probabilities, and a stress engine applies five adverse scenarios to measure resilience. All outputs are bundled into a structured dict per entity.

**Tech Stack:** Python 3.10+, pandas, numpy, prophet, lightgbm, scikit-learn, shap, scipy, pytest, joblib

---

## File Structure

```
cashflow_pipeline/
├── data/
│   └── sample_aa_transactions.csv       # synthetic test data
├── src/
│   ├── __init__.py
│   ├── ingestor.py                      # parse + normalize raw AA JSON/CSV
│   ├── feature_engineer.py              # monthly aggregates + lag features
│   ├── transaction_categorizer.py       # rule-based narration classifier
│   ├── forecaster.py                    # Prophet + LightGBM ensemble
│   ├── monte_carlo.py                   # shortfall probability via simulation
│   ├── stress_engine.py                 # 5 stress scenarios + metrics
│   ├── ews_rules.py                     # rule-based early warning triggers
│   ├── output_bundler.py                # assembles final output dict
│   └── pipeline.py                      # end-to-end runner
├── tests/
│   ├── test_ingestor.py
│   ├── test_feature_engineer.py
│   ├── test_transaction_categorizer.py
│   ├── test_forecaster.py
│   ├── test_monte_carlo.py
│   ├── test_stress_engine.py
│   ├── test_ews_rules.py
│   └── test_pipeline.py
├── benchmarks/
│   └── benchmark_runner.py              # MAPE, RMSE, AUC-ROC, walk-forward CV
├── requirements.txt
└── README.md
```

---

## Task 0: Project Setup

**Files:**
- Create: `requirements.txt`
- Create: `src/__init__.py`
- Create: `data/sample_aa_transactions.csv`

- [ ] **Step 1: Create requirements.txt**

```
pandas>=2.0.0
numpy>=1.24.0
prophet>=1.1.4
lightgbm>=4.0.0
scikit-learn>=1.3.0
shap>=0.43.0
scipy>=1.11.0
pytest>=7.4.0
joblib>=1.3.0
```

- [ ] **Step 2: Install dependencies**

```bash
pip install -r requirements.txt
```

Expected: all packages install cleanly. Prophet may take 30–60s.

- [ ] **Step 3: Create empty src/__init__.py**

```python
# cashflow_pipeline
```

- [ ] **Step 4: Generate synthetic AA transaction data**

Create `data/sample_aa_transactions.csv` with this script (run once):

```python
import pandas as pd
import numpy as np

np.random.seed(42)
dates = pd.date_range("2022-01-01", "2024-06-30", freq="D")
rows = []
for d in dates:
    # 2-5 credits per day
    for _ in range(np.random.randint(1, 4)):
        rows.append({
            "entity_id": "E001",
            "date": d,
            "amount": np.random.lognormal(9, 0.8),  # ~8k avg credit
            "type": "credit",
            "narration": np.random.choice([
                "NEFT/SALES PAYMENT", "UPI/CUSTOMER PAY",
                "RTGS/INVOICE 1234", "IMPS/RENT RECEIVED"
            ])
        })
    # 1-3 debits per day
    for _ in range(np.random.randint(1, 3)):
        rows.append({
            "entity_id": "E001",
            "date": d,
            "amount": np.random.lognormal(8.5, 0.7),
            "type": "debit",
            "narration": np.random.choice([
                "EMI/HDFC LOAN", "UPI/VENDOR PAY",
                "NEFT/SALARY", "GST PAYMENT", "RENT/OFFICE"
            ])
        })

df = pd.DataFrame(rows)
df.to_csv("data/sample_aa_transactions.csv", index=False)
print(f"Generated {len(df)} rows")
```

Run: `python -c "exec(open('data/generate.py').read())"` after saving above as `data/generate.py`

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: project scaffold and synthetic data"
```

---

## Task 1: Ingestor

**Files:**
- Create: `src/ingestor.py`
- Create: `tests/test_ingestor.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_ingestor.py
import pandas as pd
import pytest
from src.ingestor import load_transactions, validate_schema

def test_load_transactions_returns_dataframe():
    df = load_transactions("data/sample_aa_transactions.csv")
    assert isinstance(df, pd.DataFrame)

def test_required_columns_present():
    df = load_transactions("data/sample_aa_transactions.csv")
    required = {"entity_id", "date", "amount", "type", "narration"}
    assert required.issubset(set(df.columns))

def test_date_column_is_datetime():
    df = load_transactions("data/sample_aa_transactions.csv")
    assert pd.api.types.is_datetime64_any_dtype(df["date"])

def test_amount_is_positive():
    df = load_transactions("data/sample_aa_transactions.csv")
    assert (df["amount"] > 0).all()

def test_type_column_only_credit_debit():
    df = load_transactions("data/sample_aa_transactions.csv")
    assert set(df["type"].unique()).issubset({"credit", "debit"})

def test_validate_schema_raises_on_missing_column():
    df = pd.DataFrame({"entity_id": ["E001"], "date": ["2023-01-01"]})
    with pytest.raises(ValueError, match="Missing columns"):
        validate_schema(df)
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_ingestor.py -v
```

Expected: `ImportError` or `ModuleNotFoundError` — ingestor doesn't exist yet.

- [ ] **Step 3: Implement ingestor**

```python
# src/ingestor.py
import pandas as pd

REQUIRED_COLUMNS = {"entity_id", "date", "amount", "type", "narration"}

def validate_schema(df: pd.DataFrame) -> None:
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {missing}")

def load_transactions(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    validate_schema(df)
    df["date"] = pd.to_datetime(df["date"])
    df["amount"] = df["amount"].astype(float).abs()
    df["type"] = df["type"].str.lower().str.strip()
    assert set(df["type"].unique()).issubset({"credit", "debit"}), \
        "type column must contain only 'credit' or 'debit'"
    return df.sort_values("date").reset_index(drop=True)
```

- [ ] **Step 4: Run to verify passing**

```bash
pytest tests/test_ingestor.py -v
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/ingestor.py tests/test_ingestor.py
git commit -m "feat: ingestor with schema validation"
```

---

## Task 2: Transaction Categorizer

**Files:**
- Create: `src/transaction_categorizer.py`
- Create: `tests/test_transaction_categorizer.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_transaction_categorizer.py
import pandas as pd
from src.transaction_categorizer import categorize_transactions

def test_emi_narration_categorized_as_emi():
    df = pd.DataFrame({
        "narration": ["EMI/HDFC LOAN", "UPI/CUSTOMER PAY"],
        "type": ["debit", "credit"]
    })
    result = categorize_transactions(df)
    assert result.loc[0, "category"] == "emi"

def test_salary_narration_categorized_as_salary():
    df = pd.DataFrame({
        "narration": ["NEFT/SALARY TRANSFER"],
        "type": ["debit"]
    })
    result = categorize_transactions(df)
    assert result.loc[0, "category"] == "salary"

def test_gst_narration_categorized_as_gst():
    df = pd.DataFrame({
        "narration": ["GST PAYMENT Q3"],
        "type": ["debit"]
    })
    result = categorize_transactions(df)
    assert result.loc[0, "category"] == "gst"

def test_unknown_narration_gets_other():
    df = pd.DataFrame({
        "narration": ["RANDOM XYZABC 9999"],
        "type": ["debit"]
    })
    result = categorize_transactions(df)
    assert result.loc[0, "category"] == "other"

def test_category_column_always_present():
    df = pd.DataFrame({
        "narration": ["NEFT/SALES PAYMENT", "RENT/OFFICE"],
        "type": ["credit", "debit"]
    })
    result = categorize_transactions(df)
    assert "category" in result.columns
    assert result["category"].notna().all()
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_transaction_categorizer.py -v
```

Expected: ImportError.

- [ ] **Step 3: Implement categorizer**

```python
# src/transaction_categorizer.py
import pandas as pd
import re

CATEGORY_RULES = [
    ("emi",      r"EMI|LOAN\s*INST|HOME\s*LOAN|VEHICLE\s*LOAN"),
    ("salary",   r"SALARY|SAL\s*TRANS|PAYROLL"),
    ("gst",      r"GST|IGST|CGST|SGST"),
    ("rent",     r"RENT|LEASE"),
    ("upi_in",   r"UPI.*PAY|PHONEPE|GPAY|PAYTM"),
    ("vendor",   r"VENDOR|SUPPLIER|PURCHASE"),
    ("sales",    r"SALES|INVOICE|NEFT.*SALES|RTGS.*INVOICE"),
    ("transfer", r"NEFT|RTGS|IMPS|TRANSFER"),
    ("tax",      r"TDS|ADVANCE\s*TAX|INCOME\s*TAX"),
    ("utility",  r"ELECTRICITY|WATER|BROADBAND|MOBILE\s*BILL"),
]

def _match_category(narration: str) -> str:
    narration_upper = str(narration).upper()
    for category, pattern in CATEGORY_RULES:
        if re.search(pattern, narration_upper):
            return category
    return "other"

def categorize_transactions(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["category"] = df["narration"].apply(_match_category)
    return df
```

- [ ] **Step 4: Run to verify passing**

```bash
pytest tests/test_transaction_categorizer.py -v
```

Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/transaction_categorizer.py tests/test_transaction_categorizer.py
git commit -m "feat: rule-based transaction categorizer"
```

---

## Task 3: Feature Engineer

**Files:**
- Create: `src/feature_engineer.py`
- Create: `tests/test_feature_engineer.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_feature_engineer.py
import pandas as pd
import numpy as np
from src.feature_engineer import build_monthly_features

def _make_transactions():
    dates = pd.date_range("2022-01-01", "2023-12-31", freq="D")
    rows = []
    for d in dates:
        rows.append({"entity_id": "E001", "date": d,
                     "amount": 50000, "type": "credit",
                     "narration": "NEFT/SALES", "category": "sales"})
        rows.append({"entity_id": "E001", "date": d,
                     "amount": 30000, "type": "debit",
                     "narration": "EMI/HDFC", "category": "emi"})
    return pd.DataFrame(rows)

def test_returns_dataframe():
    df = _make_transactions()
    result = build_monthly_features(df, entity_id="E001")
    assert isinstance(result, pd.DataFrame)

def test_monthly_granularity():
    df = _make_transactions()
    result = build_monthly_features(df, entity_id="E001")
    assert result["period"].dt.to_period("M").nunique() == result.shape[0]

def test_net_cashflow_column_exists():
    df = _make_transactions()
    result = build_monthly_features(df, entity_id="E001")
    assert "net_cashflow" in result.columns

def test_net_cashflow_positive_when_credits_exceed_debits():
    df = _make_transactions()
    result = build_monthly_features(df, entity_id="E001")
    assert (result["net_cashflow"] > 0).all()

def test_lag_columns_exist():
    df = _make_transactions()
    result = build_monthly_features(df, entity_id="E001")
    for lag in [1, 3, 6]:
        assert f"net_cashflow_lag{lag}" in result.columns

def test_rolling_mean_columns_exist():
    df = _make_transactions()
    result = build_monthly_features(df, entity_id="E001")
    assert "net_cashflow_roll3" in result.columns
    assert "net_cashflow_roll6" in result.columns

def test_emi_to_inflow_ratio_bounded():
    df = _make_transactions()
    result = build_monthly_features(df, entity_id="E001")
    valid = result["emi_to_inflow_ratio"].dropna()
    assert (valid >= 0).all() and (valid <= 1).all()

def test_inflow_concentration_bounded():
    df = _make_transactions()
    result = build_monthly_features(df, entity_id="E001")
    valid = result["inflow_concentration"].dropna()
    assert (valid >= 0).all() and (valid <= 1).all()

def test_minimum_12_months_required():
    import pytest
    short_df = _make_transactions().head(100)
    with pytest.raises(ValueError, match="minimum 12 months"):
        build_monthly_features(short_df, entity_id="E001")
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_feature_engineer.py -v
```

Expected: ImportError.

- [ ] **Step 3: Implement feature engineer**

```python
# src/feature_engineer.py
import pandas as pd
import numpy as np
from typing import Optional

def build_monthly_features(df: pd.DataFrame, entity_id: str) -> pd.DataFrame:
    df = df[df["entity_id"] == entity_id].copy()
    df["period"] = df["date"].dt.to_period("M").dt.to_timestamp()

    n_months = df["period"].nunique()
    if n_months < 12:
        raise ValueError(
            f"Entity {entity_id} has {n_months} months of data; minimum 12 months required."
        )

    monthly = (
        df.groupby(["period", "type"])["amount"]
        .sum()
        .unstack(fill_value=0)
        .reset_index()
    )
    monthly.columns.name = None
    if "credit" not in monthly.columns:
        monthly["credit"] = 0.0
    if "debit" not in monthly.columns:
        monthly["debit"] = 0.0
    monthly = monthly.rename(columns={"credit": "total_inflow", "debit": "total_outflow"})
    monthly["net_cashflow"] = monthly["total_inflow"] - monthly["total_outflow"]

    # EMI amount per month
    emi_monthly = (
        df[df["category"] == "emi"]
        .groupby("period")["amount"]
        .sum()
        .reset_index()
        .rename(columns={"amount": "emi_amount"})
    )
    monthly = monthly.merge(emi_monthly, on="period", how="left")
    monthly["emi_amount"] = monthly["emi_amount"].fillna(0)

    # Top counterparty concentration (inflows only)
    inflows = df[df["type"] == "credit"].copy()
    concentration = (
        inflows.groupby("period")
        .apply(lambda g: g.groupby("narration")["amount"].sum().max() / g["amount"].sum()
               if g["amount"].sum() > 0 else 0)
        .reset_index()
        .rename(columns={0: "inflow_concentration"})
    )
    monthly = monthly.merge(concentration, on="period", how="left")

    # Lag features
    monthly = monthly.sort_values("period").reset_index(drop=True)
    for lag in [1, 3, 6]:
        monthly[f"net_cashflow_lag{lag}"] = monthly["net_cashflow"].shift(lag)

    # Rolling mean features
    monthly["net_cashflow_roll3"] = monthly["net_cashflow"].shift(1).rolling(3).mean()
    monthly["net_cashflow_roll6"] = monthly["net_cashflow"].shift(1).rolling(6).mean()

    # Inflow trend slope (linear regression over last 6 months, rolling)
    def _slope(series):
        if series.isna().any() or len(series) < 3:
            return np.nan
        x = np.arange(len(series))
        return np.polyfit(x, series.values, 1)[0]

    monthly["inflow_trend_slope6"] = (
        monthly["total_inflow"].shift(1).rolling(6).apply(_slope, raw=False)
    )

    # EMI-to-inflow ratio
    monthly["emi_to_inflow_ratio"] = np.where(
        monthly["total_inflow"] > 0,
        (monthly["emi_amount"] / monthly["total_inflow"]).clip(0, 1),
        np.nan
    )

    # Revenue volatility (rolling 6-month std of inflows)
    monthly["inflow_volatility6"] = monthly["total_inflow"].shift(1).rolling(6).std()

    # Month-of-year for seasonality
    monthly["month"] = monthly["period"].dt.month

    # Inflow MoM change
    monthly["inflow_mom_change"] = monthly["total_inflow"].pct_change()

    monthly["entity_id"] = entity_id
    return monthly
```

- [ ] **Step 4: Run to verify passing**

```bash
pytest tests/test_feature_engineer.py -v
```

Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add src/feature_engineer.py tests/test_feature_engineer.py
git commit -m "feat: monthly feature engineering with lags, ratios, and rolling stats"
```

---

## Task 4: Cashflow Forecaster (Prophet + LightGBM Ensemble)

**Files:**
- Create: `src/forecaster.py`
- Create: `tests/test_forecaster.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_forecaster.py
import pandas as pd
import numpy as np
import pytest
from src.forecaster import CashflowForecaster

def _make_features():
    periods = pd.date_range("2022-01-01", periods=24, freq="MS")
    np.random.seed(0)
    df = pd.DataFrame({
        "period": periods,
        "net_cashflow": np.random.normal(20000, 5000, 24),
        "total_inflow": np.random.normal(50000, 8000, 24),
        "total_outflow": np.random.normal(30000, 4000, 24),
        "emi_to_inflow_ratio": np.random.uniform(0.2, 0.4, 24),
        "inflow_concentration": np.random.uniform(0.3, 0.7, 24),
        "net_cashflow_lag1": np.random.normal(20000, 5000, 24),
        "net_cashflow_lag3": np.random.normal(20000, 5000, 24),
        "net_cashflow_lag6": np.random.normal(20000, 5000, 24),
        "net_cashflow_roll3": np.random.normal(20000, 4000, 24),
        "net_cashflow_roll6": np.random.normal(20000, 4000, 24),
        "inflow_trend_slope6": np.random.normal(100, 50, 24),
        "inflow_volatility6": np.random.normal(5000, 1000, 24),
        "month": [p.month for p in periods],
        "inflow_mom_change": np.random.normal(0, 0.1, 24),
    })
    return df

def test_fit_predict_returns_12_rows():
    fc = CashflowForecaster()
    df = _make_features()
    fc.fit(df)
    result = fc.predict(horizon=12)
    assert len(result) == 12

def test_output_has_required_columns():
    fc = CashflowForecaster()
    fc.fit(_make_features())
    result = fc.predict(horizon=12)
    required = {"period", "forecast", "lower_p10", "upper_p90"}
    assert required.issubset(set(result.columns))

def test_confidence_band_ordering():
    fc = CashflowForecaster()
    fc.fit(_make_features())
    result = fc.predict(horizon=12)
    assert (result["lower_p10"] <= result["forecast"]).all()
    assert (result["forecast"] <= result["upper_p90"]).all()

def test_predict_before_fit_raises():
    fc = CashflowForecaster()
    with pytest.raises(RuntimeError, match="must call fit"):
        fc.predict(horizon=12)

def test_prophet_weight_and_lgbm_weight_sum_to_one():
    fc = CashflowForecaster(prophet_weight=0.4, lgbm_weight=0.6)
    assert abs(fc.prophet_weight + fc.lgbm_weight - 1.0) < 1e-9
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_forecaster.py -v
```

Expected: ImportError.

- [ ] **Step 3: Implement forecaster**

```python
# src/forecaster.py
import pandas as pd
import numpy as np
from prophet import Prophet
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit
import warnings
warnings.filterwarnings("ignore")

LGBM_FEATURES = [
    "net_cashflow_lag1", "net_cashflow_lag3", "net_cashflow_lag6",
    "net_cashflow_roll3", "net_cashflow_roll6",
    "emi_to_inflow_ratio", "inflow_concentration",
    "inflow_trend_slope6", "inflow_volatility6",
    "month", "inflow_mom_change",
    "total_inflow", "total_outflow",
]

class CashflowForecaster:
    def __init__(self, prophet_weight: float = 0.5, lgbm_weight: float = 0.5):
        assert abs(prophet_weight + lgbm_weight - 1.0) < 1e-9, \
            "prophet_weight + lgbm_weight must equal 1.0"
        self.prophet_weight = prophet_weight
        self.lgbm_weight = lgbm_weight
        self._prophet = None
        self._lgbm = None
        self._history_df = None
        self._fitted = False

    def fit(self, df: pd.DataFrame) -> "CashflowForecaster":
        df = df.copy().sort_values("period").reset_index(drop=True)
        self._history_df = df

        # Prophet expects ds + y columns
        prophet_df = df[["period", "net_cashflow"]].rename(
            columns={"period": "ds", "net_cashflow": "y"}
        )
        self._prophet = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.8,
        )
        self._prophet.fit(prophet_df)

        # LightGBM on tabular features
        available_features = [f for f in LGBM_FEATURES if f in df.columns]
        X = df[available_features].fillna(0)
        y = df["net_cashflow"]

        self._lgbm_features = available_features
        self._lgbm = lgb.LGBMRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=4,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbose=-1,
        )
        self._lgbm.fit(X, y)
        self._fitted = True
        return self

    def predict(self, horizon: int = 12) -> pd.DataFrame:
        if not self._fitted:
            raise RuntimeError("CashflowForecaster: must call fit() before predict()")

        last_period = self._history_df["period"].max()
        future_periods = pd.date_range(
            start=last_period + pd.offsets.MonthBegin(1),
            periods=horizon,
            freq="MS"
        )

        # Prophet forecast
        future_df = pd.DataFrame({"ds": future_periods})
        prophet_forecast = self._prophet.predict(future_df)
        prophet_vals = prophet_forecast["yhat"].values
        prophet_lower = prophet_forecast["yhat_lower"].values
        prophet_upper = prophet_forecast["yhat_upper"].values

        # LightGBM forecast (recursive — use lagged actuals + previous predictions)
        history_vals = list(self._history_df["net_cashflow"].values)
        history_inflows = list(self._history_df["total_inflow"].values)
        history_outflows = list(self._history_df["total_outflow"].values)
        lgbm_vals = []

        avg_emi_ratio = self._history_df["emi_to_inflow_ratio"].mean()
        avg_concentration = self._history_df["inflow_concentration"].mean()
        avg_slope = self._history_df.get("inflow_trend_slope6", pd.Series([0])).mean()
        avg_volatility = self._history_df.get("inflow_volatility6", pd.Series([5000])).mean()
        avg_inflow = self._history_df["total_inflow"].mean()
        avg_outflow = self._history_df["total_outflow"].mean()

        for i, period in enumerate(future_periods):
            all_vals = history_vals + lgbm_vals
            lag1 = all_vals[-1] if len(all_vals) >= 1 else 0
            lag3 = all_vals[-3] if len(all_vals) >= 3 else lag1
            lag6 = all_vals[-6] if len(all_vals) >= 6 else lag1
            roll3 = np.mean(all_vals[-3:]) if len(all_vals) >= 3 else lag1
            roll6 = np.mean(all_vals[-6:]) if len(all_vals) >= 6 else lag1
            mom_change = (lag1 - lag3) / (abs(lag3) + 1e-9)

            X_row = pd.DataFrame([{
                "net_cashflow_lag1": lag1,
                "net_cashflow_lag3": lag3,
                "net_cashflow_lag6": lag6,
                "net_cashflow_roll3": roll3,
                "net_cashflow_roll6": roll6,
                "emi_to_inflow_ratio": avg_emi_ratio,
                "inflow_concentration": avg_concentration,
                "inflow_trend_slope6": avg_slope,
                "inflow_volatility6": avg_volatility,
                "month": period.month,
                "inflow_mom_change": mom_change,
                "total_inflow": avg_inflow,
                "total_outflow": avg_outflow,
            }])[self._lgbm_features]

            pred = self._lgbm.predict(X_row)[0]
            lgbm_vals.append(pred)

        lgbm_arr = np.array(lgbm_vals)

        # Ensemble
        ensemble = self.prophet_weight * prophet_vals + self.lgbm_weight * lgbm_arr

        # Confidence bands: blend Prophet intervals with residual std
        residuals = self._history_df["net_cashflow"].values - \
                    self._prophet.predict(
                        pd.DataFrame({"ds": self._history_df["period"]})
                    )["yhat"].values
        residual_std = np.std(residuals)
        lower = ensemble - 1.28 * residual_std   # P10
        upper = ensemble + 1.28 * residual_std   # P90

        return pd.DataFrame({
            "period": future_periods,
            "forecast": ensemble,
            "lower_p10": lower,
            "upper_p90": upper,
            "prophet_forecast": prophet_vals,
            "lgbm_forecast": lgbm_arr,
        })
```

- [ ] **Step 4: Run to verify passing**

```bash
pytest tests/test_forecaster.py -v
```

Expected: 5 passed. (Prophet may take 5–10s to fit.)

- [ ] **Step 5: Commit**

```bash
git add src/forecaster.py tests/test_forecaster.py
git commit -m "feat: Prophet + LightGBM ensemble cashflow forecaster"
```

---

## Task 5: Monte Carlo Shortfall Probability

**Files:**
- Create: `src/monte_carlo.py`
- Create: `tests/test_monte_carlo.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_monte_carlo.py
import pandas as pd
import numpy as np
import pytest
from src.monte_carlo import compute_shortfall_probabilities

def _make_forecast():
    periods = pd.date_range("2024-01-01", periods=12, freq="MS")
    return pd.DataFrame({
        "period": periods,
        "forecast": np.random.normal(10000, 3000, 12),
        "lower_p10": np.random.normal(3000, 1000, 12),
        "upper_p90": np.random.normal(17000, 1000, 12),
    })

def test_returns_dataframe_with_12_rows():
    fc = _make_forecast()
    result = compute_shortfall_probabilities(fc, n_simulations=500)
    assert len(result) == 12

def test_shortfall_probability_column_exists():
    fc = _make_forecast()
    result = compute_shortfall_probabilities(fc, n_simulations=500)
    assert "shortfall_probability" in result.columns

def test_probability_bounded_0_1():
    fc = _make_forecast()
    result = compute_shortfall_probabilities(fc, n_simulations=500)
    assert (result["shortfall_probability"] >= 0).all()
    assert (result["shortfall_probability"] <= 1).all()

def test_negative_forecast_has_high_shortfall_prob():
    periods = pd.date_range("2024-01-01", periods=3, freq="MS")
    fc = pd.DataFrame({
        "period": periods,
        "forecast": [-5000, -10000, -8000],
        "lower_p10": [-12000, -18000, -15000],
        "upper_p90": [2000, -2000, -1000],
    })
    result = compute_shortfall_probabilities(fc, n_simulations=1000)
    # All months with negative forecast should have P(shortfall) > 0.5
    assert (result["shortfall_probability"] > 0.5).all()

def test_positive_forecast_low_shortfall_prob():
    periods = pd.date_range("2024-01-01", periods=3, freq="MS")
    fc = pd.DataFrame({
        "period": periods,
        "forecast": [100000, 120000, 110000],
        "lower_p10": [80000, 95000, 88000],
        "upper_p90": [120000, 145000, 132000],
    })
    result = compute_shortfall_probabilities(fc, n_simulations=1000)
    assert (result["shortfall_probability"] < 0.1).all()
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_monte_carlo.py -v
```

Expected: ImportError.

- [ ] **Step 3: Implement Monte Carlo module**

```python
# src/monte_carlo.py
import pandas as pd
import numpy as np

def compute_shortfall_probabilities(
    forecast_df: pd.DataFrame,
    n_simulations: int = 1000,
    shortfall_threshold: float = 0.0,
) -> pd.DataFrame:
    """
    For each forecast month, simulate n_simulations draws from a normal
    distribution parameterised by (forecast, std derived from P10/P90 band).
    Shortfall probability = fraction of draws below shortfall_threshold.

    Args:
        forecast_df: DataFrame with columns [period, forecast, lower_p10, upper_p90]
        n_simulations: number of Monte Carlo draws per month
        shortfall_threshold: cashflow level considered a shortfall (default 0)

    Returns:
        forecast_df with added columns: shortfall_probability, simulated_p10, simulated_p90
    """
    df = forecast_df.copy()

    # Derive std from the P10/P90 band: P10 = mean - 1.28*std, P90 = mean + 1.28*std
    band_width = df["upper_p90"] - df["lower_p10"]
    sigma = (band_width / (2 * 1.28)).clip(lower=1.0)  # avoid zero std

    rng = np.random.default_rng(seed=42)
    shortfall_probs = []
    sim_p10s = []
    sim_p90s = []

    for _, row in df.iterrows():
        draws = rng.normal(loc=row["forecast"], scale=sigma.loc[row.name], size=n_simulations)
        shortfall_probs.append((draws < shortfall_threshold).mean())
        sim_p10s.append(np.percentile(draws, 10))
        sim_p90s.append(np.percentile(draws, 90))

    df["shortfall_probability"] = shortfall_probs
    df["simulated_p10"] = sim_p10s
    df["simulated_p90"] = sim_p90s
    return df
```

- [ ] **Step 4: Run to verify passing**

```bash
pytest tests/test_monte_carlo.py -v
```

Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/monte_carlo.py tests/test_monte_carlo.py
git commit -m "feat: Monte Carlo shortfall probability engine"
```

---

## Task 6: Liquidity Stress Engine

**Files:**
- Create: `src/stress_engine.py`
- Create: `tests/test_stress_engine.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_stress_engine.py
import pandas as pd
import numpy as np
import pytest
from src.stress_engine import StressEngine, SCENARIOS

def _make_forecast():
    periods = pd.date_range("2024-01-01", periods=12, freq="MS")
    return pd.DataFrame({
        "period": periods,
        "forecast": [20000] * 12,
        "total_inflow": [50000] * 12,
        "total_outflow": [30000] * 12,
        "lower_p10": [12000] * 12,
        "upper_p90": [28000] * 12,
    })

def test_run_returns_dict_with_all_scenarios():
    engine = StressEngine()
    result = engine.run(_make_forecast())
    for scenario_name in SCENARIOS:
        assert scenario_name in result, f"Missing scenario: {scenario_name}"

def test_each_scenario_has_required_keys():
    engine = StressEngine()
    result = engine.run(_make_forecast())
    required_keys = {
        "stressed_cashflow", "months_to_zero_balance",
        "minimum_cashflow_month", "stress_survival_score"
    }
    for scenario_name, metrics in result.items():
        assert required_keys.issubset(set(metrics.keys())), \
            f"Scenario {scenario_name} missing keys"

def test_severe_revenue_stress_reduces_cashflow():
    engine = StressEngine()
    base = _make_forecast()
    result = engine.run(base)
    base_mean = base["forecast"].mean()
    stressed_mean = np.mean(result["revenue_severe"]["stressed_cashflow"])
    assert stressed_mean < base_mean

def test_survival_score_bounded_0_100():
    engine = StressEngine()
    result = engine.run(_make_forecast())
    for scenario_name, metrics in result.items():
        score = metrics["stress_survival_score"]
        assert 0 <= score <= 100, f"Score out of range for {scenario_name}: {score}"

def test_healthy_business_has_high_survival_score():
    periods = pd.date_range("2024-01-01", periods=12, freq="MS")
    healthy = pd.DataFrame({
        "period": periods,
        "forecast": [100000] * 12,
        "total_inflow": [200000] * 12,
        "total_outflow": [100000] * 12,
        "lower_p10": [80000] * 12,
        "upper_p90": [120000] * 12,
    })
    engine = StressEngine()
    result = engine.run(healthy)
    assert result["revenue_mild"]["stress_survival_score"] > 70

def test_months_to_zero_is_none_when_never_goes_negative():
    periods = pd.date_range("2024-01-01", periods=12, freq="MS")
    strong = pd.DataFrame({
        "period": periods,
        "forecast": [500000] * 12,
        "total_inflow": [800000] * 12,
        "total_outflow": [300000] * 12,
        "lower_p10": [400000] * 12,
        "upper_p90": [600000] * 12,
    })
    engine = StressEngine()
    result = engine.run(strong)
    assert result["revenue_mild"]["months_to_zero_balance"] is None
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_stress_engine.py -v
```

Expected: ImportError.

- [ ] **Step 3: Implement stress engine**

```python
# src/stress_engine.py
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

# Scenario definitions: (inflow_shock, outflow_shock)
# Shocks are multipliers applied to inflow/outflow components
SCENARIOS = {
    "revenue_mild":     {"inflow_shock": 0.85, "outflow_shock": 1.00},
    "revenue_moderate": {"inflow_shock": 0.70, "outflow_shock": 1.00},
    "revenue_severe":   {"inflow_shock": 0.50, "outflow_shock": 1.00},
    "expense_moderate": {"inflow_shock": 1.00, "outflow_shock": 1.20},
    "combined_shock":   {"inflow_shock": 0.70, "outflow_shock": 1.20},
}

class StressEngine:
    def run(self, forecast_df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
        """
        Apply each scenario to the forecast and compute resilience metrics.

        Args:
            forecast_df: DataFrame with columns [period, forecast, total_inflow, total_outflow]

        Returns:
            Dict mapping scenario_name -> metrics dict
        """
        results = {}
        for scenario_name, params in SCENARIOS.items():
            results[scenario_name] = self._apply_scenario(
                forecast_df,
                inflow_shock=params["inflow_shock"],
                outflow_shock=params["outflow_shock"],
                scenario_name=scenario_name,
            )
        return results

    def _apply_scenario(
        self,
        df: pd.DataFrame,
        inflow_shock: float,
        outflow_shock: float,
        scenario_name: str,
    ) -> Dict[str, Any]:
        df = df.copy()

        stressed_inflow = df["total_inflow"] * inflow_shock
        stressed_outflow = df["total_outflow"] * outflow_shock
        stressed_cashflow = (stressed_inflow - stressed_outflow).tolist()

        # Running balance starting at 0 (relative)
        running_balance = np.cumsum(stressed_cashflow)

        # Month index (1-based) when running balance first goes negative
        negative_months = [i + 1 for i, b in enumerate(running_balance) if b < 0]
        months_to_zero: Optional[int] = negative_months[0] if negative_months else None

        minimum_cashflow_month = int(np.argmin(stressed_cashflow)) + 1

        # Survival score: 0-100
        # Based on: what fraction of months remain positive + how deep the negative goes
        n_positive = sum(1 for c in stressed_cashflow if c >= 0)
        fraction_positive = n_positive / len(stressed_cashflow)

        min_cf = min(stressed_cashflow)
        mean_cf = np.mean(stressed_cashflow)
        depth_penalty = max(0, -min_cf / (abs(mean_cf) + 1e-9)) * 10  # 0-10 penalty
        raw_score = fraction_positive * 100 - depth_penalty
        stress_survival_score = float(np.clip(raw_score, 0, 100))

        return {
            "stressed_cashflow": stressed_cashflow,
            "months_to_zero_balance": months_to_zero,
            "minimum_cashflow_month": minimum_cashflow_month,
            "stress_survival_score": round(stress_survival_score, 2),
            "inflow_shock_applied": inflow_shock,
            "outflow_shock_applied": outflow_shock,
        }
```

- [ ] **Step 4: Run to verify passing**

```bash
pytest tests/test_stress_engine.py -v
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/stress_engine.py tests/test_stress_engine.py
git commit -m "feat: liquidity stress engine with 5 scenarios and survival scoring"
```

---

## Task 7: EWS Rule Layer

**Files:**
- Create: `src/ews_rules.py`
- Create: `tests/test_ews_rules.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_ews_rules.py
import pandas as pd
import numpy as np
from src.ews_rules import evaluate_ews_rules, EWS_TIER

def _make_healthy_features():
    periods = pd.date_range("2022-01-01", periods=24, freq="MS")
    return pd.DataFrame({
        "period": periods,
        "net_cashflow": [30000] * 24,
        "total_inflow": [80000] * 24,
        "total_outflow": [50000] * 24,
        "emi_to_inflow_ratio": [0.15] * 24,
        "inflow_concentration": [0.30] * 24,
        "inflow_mom_change": [0.02] * 24,
    })

def test_healthy_entity_returns_green():
    df = _make_healthy_features()
    result = evaluate_ews_rules(df)
    assert result["tier"] == EWS_TIER.GREEN

def test_high_emi_ratio_triggers_watch():
    df = _make_healthy_features()
    df["emi_to_inflow_ratio"] = 0.45
    result = evaluate_ews_rules(df)
    assert result["tier"] in (EWS_TIER.AMBER, EWS_TIER.RED)

def test_very_high_emi_ratio_triggers_alert():
    df = _make_healthy_features()
    df["emi_to_inflow_ratio"] = 0.65
    result = evaluate_ews_rules(df)
    assert result["tier"] == EWS_TIER.RED

def test_sustained_inflow_decline_triggers_watch():
    df = _make_healthy_features()
    # Last 2 months: -25% MoM
    df.loc[22, "inflow_mom_change"] = -0.25
    df.loc[23, "inflow_mom_change"] = -0.25
    result = evaluate_ews_rules(df)
    assert result["tier"] in (EWS_TIER.AMBER, EWS_TIER.RED)

def test_result_has_triggers_list():
    df = _make_healthy_features()
    result = evaluate_ews_rules(df)
    assert "triggers" in result
    assert isinstance(result["triggers"], list)

def test_result_has_trigger_count():
    df = _make_healthy_features()
    df["emi_to_inflow_ratio"] = 0.65
    result = evaluate_ews_rules(df)
    assert result["trigger_count"] >= 1
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_ews_rules.py -v
```

Expected: ImportError.

- [ ] **Step 3: Implement EWS rules**

```python
# src/ews_rules.py
import pandas as pd
import numpy as np
from enum import Enum
from typing import Dict, Any, List

class EWS_TIER(str, Enum):
    GREEN = "GREEN"
    AMBER = "AMBER"
    RED   = "RED"

def evaluate_ews_rules(features_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Evaluate rule-based early warning signals on the entity's feature history.
    Uses the most recent data for ratio-based rules and trailing windows for trend rules.

    Returns:
        dict with keys: tier (EWS_TIER), triggers (list of str), trigger_count (int)
    """
    df = features_df.copy().sort_values("period").reset_index(drop=True)
    last = df.iloc[-1]
    triggers: List[str] = []
    red_flags: List[str] = []

    # Rule 1: EMI-to-inflow ratio
    emi_ratio = last.get("emi_to_inflow_ratio", 0)
    if emi_ratio > 0.6:
        red_flags.append("emi_to_inflow_ratio > 0.60 (critical debt burden)")
    elif emi_ratio > 0.4:
        triggers.append("emi_to_inflow_ratio > 0.40 (elevated debt burden)")

    # Rule 2: Inflow concentration
    concentration = last.get("inflow_concentration", 0)
    if concentration > 0.7:
        triggers.append("inflow_concentration > 0.70 (single customer dependency)")

    # Rule 3: Sustained inflow decline (2 consecutive months > -20%)
    if len(df) >= 2:
        recent_changes = df["inflow_mom_change"].iloc[-2:].values
        if all(c < -0.35 for c in recent_changes if not np.isnan(c)):
            red_flags.append("inflow MoM decline > -35% for 2 consecutive months")
        elif all(c < -0.20 for c in recent_changes if not np.isnan(c)):
            triggers.append("inflow MoM decline > -20% for 2 consecutive months")

    # Rule 4: Net cashflow negative
    net_cf = last.get("net_cashflow", 0)
    if net_cf < 0:
        red_flags.append("net_cashflow negative in latest month")

    # Rule 5: Rolling 3-month cashflow trend sharply negative
    if len(df) >= 3:
        recent_cf = df["net_cashflow"].iloc[-3:].values
        if len(recent_cf) == 3:
            slope = np.polyfit([0, 1, 2], recent_cf, 1)[0]
            mean_cf = np.mean(recent_cf)
            if mean_cf != 0 and slope / abs(mean_cf) < -0.2:
                triggers.append("net_cashflow 3-month slope strongly negative")

    # Rule 6: Outflow spike (if total_outflow available)
    if "total_outflow" in df.columns and len(df) >= 2:
        outflow_change = (
            df["total_outflow"].iloc[-1] / (df["total_outflow"].iloc[-2] + 1e-9) - 1
        )
        if outflow_change > 0.30:
            triggers.append(f"total_outflow spike +{outflow_change:.0%} MoM")

    # Determine tier
    all_triggers = triggers + red_flags
    if red_flags:
        tier = EWS_TIER.RED
    elif len(triggers) >= 2:
        tier = EWS_TIER.AMBER
    elif len(triggers) == 1:
        tier = EWS_TIER.AMBER
    else:
        tier = EWS_TIER.GREEN

    return {
        "tier": tier,
        "triggers": all_triggers,
        "trigger_count": len(all_triggers),
        "red_flag_count": len(red_flags),
        "watch_flag_count": len(triggers),
    }
```

- [ ] **Step 4: Run to verify passing**

```bash
pytest tests/test_ews_rules.py -v
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/ews_rules.py tests/test_ews_rules.py
git commit -m "feat: rule-based EWS layer with GREEN/AMBER/RED tiering"
```

---

## Task 8: Output Bundler

**Files:**
- Create: `src/output_bundler.py`
- Create: `tests/test_output_bundler.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_output_bundler.py
import pandas as pd
import numpy as np
from src.output_bundler import build_output_bundle

def _make_forecast():
    periods = pd.date_range("2024-01-01", periods=12, freq="MS")
    return pd.DataFrame({
        "period": periods,
        "forecast": [20000.0] * 12,
        "lower_p10": [12000.0] * 12,
        "upper_p90": [28000.0] * 12,
        "shortfall_probability": [0.1] * 12,
        "total_inflow": [50000.0] * 12,
        "total_outflow": [30000.0] * 12,
    })

def _make_stress_results():
    return {
        "revenue_mild": {
            "stressed_cashflow": [15000.0] * 12,
            "months_to_zero_balance": None,
            "minimum_cashflow_month": 1,
            "stress_survival_score": 95.0,
            "inflow_shock_applied": 0.85,
            "outflow_shock_applied": 1.0,
        }
    }

def _make_ews_result():
    from src.ews_rules import EWS_TIER
    return {
        "tier": EWS_TIER.GREEN,
        "triggers": [],
        "trigger_count": 0,
        "red_flag_count": 0,
        "watch_flag_count": 0,
    }

def test_bundle_has_all_top_level_keys():
    bundle = build_output_bundle(
        entity_id="E001",
        forecast_df=_make_forecast(),
        stress_results=_make_stress_results(),
        ews_result=_make_ews_result(),
    )
    required = {
        "entity_id", "cashflow_forecast_12m", "shortfall_probability_12m",
        "confidence_band", "stress_results", "ews_tier", "ews_triggers",
        "generated_at",
    }
    assert required.issubset(set(bundle.keys()))

def test_cashflow_forecast_is_list_of_12():
    bundle = build_output_bundle(
        entity_id="E001",
        forecast_df=_make_forecast(),
        stress_results=_make_stress_results(),
        ews_result=_make_ews_result(),
    )
    assert len(bundle["cashflow_forecast_12m"]) == 12

def test_ews_tier_is_string():
    bundle = build_output_bundle(
        entity_id="E001",
        forecast_df=_make_forecast(),
        stress_results=_make_stress_results(),
        ews_result=_make_ews_result(),
    )
    assert isinstance(bundle["ews_tier"], str)
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_output_bundler.py -v
```

Expected: ImportError.

- [ ] **Step 3: Implement output bundler**

```python
# src/output_bundler.py
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, Any

def build_output_bundle(
    entity_id: str,
    forecast_df: pd.DataFrame,
    stress_results: Dict[str, Dict],
    ews_result: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Assemble the final structured output bundle for a single entity.
    This dict is what downstream bank underwriting systems consume.
    """
    fc = forecast_df.copy().sort_values("period").reset_index(drop=True)

    cashflow_forecast = [
        {"period": str(row["period"])[:7], "value": round(float(row["forecast"]), 2)}
        for _, row in fc.iterrows()
    ]

    shortfall_prob = [
        {"period": str(row["period"])[:7], "probability": round(float(row["shortfall_probability"]), 4)}
        for _, row in fc.iterrows()
    ]

    confidence_band = [
        {
            "period": str(row["period"])[:7],
            "p10": round(float(row["lower_p10"]), 2),
            "p90": round(float(row["upper_p90"]), 2),
        }
        for _, row in fc.iterrows()
    ]

    # Flatten stress results (remove raw cashflow array for brevity in bundle)
    stress_summary = {}
    for scenario, metrics in stress_results.items():
        stress_summary[scenario] = {
            k: v for k, v in metrics.items() if k != "stressed_cashflow"
        }

    return {
        "entity_id": entity_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "cashflow_forecast_12m": cashflow_forecast,
        "shortfall_probability_12m": shortfall_prob,
        "confidence_band": confidence_band,
        "stress_results": stress_summary,
        "ews_tier": str(ews_result["tier"].value if hasattr(ews_result["tier"], "value") else ews_result["tier"]),
        "ews_triggers": ews_result.get("triggers", []),
        "ews_trigger_count": ews_result.get("trigger_count", 0),
    }
```

- [ ] **Step 4: Run to verify passing**

```bash
pytest tests/test_output_bundler.py -v
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/output_bundler.py tests/test_output_bundler.py
git commit -m "feat: output bundler — assembles final entity bundle"
```

---

## Task 9: End-to-End Pipeline Runner

**Files:**
- Create: `src/pipeline.py`
- Create: `tests/test_pipeline.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_pipeline.py
import pytest
from src.pipeline import run_pipeline

def test_pipeline_returns_bundle_for_entity():
    result = run_pipeline(
        transactions_path="data/sample_aa_transactions.csv",
        entity_id="E001",
    )
    assert result["entity_id"] == "E001"
    assert len(result["cashflow_forecast_12m"]) == 12
    assert len(result["shortfall_probability_12m"]) == 12
    assert "stress_results" in result
    assert "ews_tier" in result

def test_pipeline_ews_tier_valid():
    result = run_pipeline(
        transactions_path="data/sample_aa_transactions.csv",
        entity_id="E001",
    )
    assert result["ews_tier"] in ("GREEN", "AMBER", "RED")

def test_pipeline_all_stress_scenarios_present():
    from src.stress_engine import SCENARIOS
    result = run_pipeline(
        transactions_path="data/sample_aa_transactions.csv",
        entity_id="E001",
    )
    for scenario in SCENARIOS:
        assert scenario in result["stress_results"]

def test_pipeline_raises_for_unknown_entity():
    with pytest.raises(ValueError, match="No data found"):
        run_pipeline(
            transactions_path="data/sample_aa_transactions.csv",
            entity_id="UNKNOWN_ENTITY_XYZ",
        )
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_pipeline.py -v
```

Expected: ImportError.

- [ ] **Step 3: Implement pipeline runner**

```python
# src/pipeline.py
import pandas as pd
from typing import Dict, Any

from src.ingestor import load_transactions
from src.transaction_categorizer import categorize_transactions
from src.feature_engineer import build_monthly_features
from src.forecaster import CashflowForecaster
from src.monte_carlo import compute_shortfall_probabilities
from src.stress_engine import StressEngine
from src.ews_rules import evaluate_ews_rules
from src.output_bundler import build_output_bundle

def run_pipeline(
    transactions_path: str,
    entity_id: str,
    forecast_horizon: int = 12,
    prophet_weight: float = 0.5,
    lgbm_weight: float = 0.5,
    n_mc_simulations: int = 1000,
) -> Dict[str, Any]:
    """
    End-to-end pipeline: raw AA transactions → output bundle.

    Args:
        transactions_path: path to CSV of AA transactions
        entity_id: which entity to run for
        forecast_horizon: months ahead to forecast (default 12)
        prophet_weight: ensemble weight for Prophet (lgbm_weight = 1 - prophet_weight)
        lgbm_weight: ensemble weight for LightGBM
        n_mc_simulations: Monte Carlo draws for shortfall probability

    Returns:
        structured output bundle dict
    """
    # 1. Ingest
    raw_df = load_transactions(transactions_path)

    if entity_id not in raw_df["entity_id"].unique():
        raise ValueError(f"No data found for entity_id='{entity_id}'")

    # 2. Categorize
    categorized_df = categorize_transactions(raw_df)

    # 3. Feature engineering
    features_df = build_monthly_features(categorized_df, entity_id=entity_id)

    # 4. Forecast
    forecaster = CashflowForecaster(
        prophet_weight=prophet_weight,
        lgbm_weight=lgbm_weight,
    )
    forecaster.fit(features_df)
    forecast_df = forecaster.predict(horizon=forecast_horizon)

    # Attach inflow/outflow projections for stress engine (use historical means)
    forecast_df["total_inflow"] = features_df["total_inflow"].mean()
    forecast_df["total_outflow"] = features_df["total_outflow"].mean()

    # 5. Shortfall probabilities
    forecast_with_probs = compute_shortfall_probabilities(
        forecast_df, n_simulations=n_mc_simulations
    )

    # 6. Stress testing
    stress_engine = StressEngine()
    stress_results = stress_engine.run(forecast_with_probs)

    # 7. EWS rules
    ews_result = evaluate_ews_rules(features_df)

    # 8. Bundle
    return build_output_bundle(
        entity_id=entity_id,
        forecast_df=forecast_with_probs,
        stress_results=stress_results,
        ews_result=ews_result,
    )
```

- [ ] **Step 4: Run to verify passing**

```bash
pytest tests/test_pipeline.py -v
```

Expected: 4 passed. (Will take ~10s due to Prophet fitting.)

- [ ] **Step 5: Run full test suite**

```bash
pytest tests/ -v
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pipeline.py tests/test_pipeline.py
git commit -m "feat: end-to-end pipeline runner"
```

---

## Task 10: Benchmarking Module

**Files:**
- Create: `benchmarks/benchmark_runner.py`

- [ ] **Step 1: Implement benchmark runner**

```python
# benchmarks/benchmark_runner.py
"""
Benchmarking harness for the cashflow pipeline.

Metrics computed:
  Forecast:  MAPE, RMSE, confidence band coverage (% actuals inside P10-P90)
  Stress:    Scenario back-test (did stressed cashflow predict real stress months?)

Run with: python benchmarks/benchmark_runner.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit

from src.ingestor import load_transactions
from src.transaction_categorizer import categorize_transactions
from src.feature_engineer import build_monthly_features
from src.forecaster import CashflowForecaster
from src.monte_carlo import compute_shortfall_probabilities

TRANSACTIONS_PATH = "data/sample_aa_transactions.csv"
ENTITY_ID = "E001"
N_SPLITS = 3       # walk-forward CV folds
MIN_TRAIN_MONTHS = 18

def mape(actual: np.ndarray, predicted: np.ndarray) -> float:
    mask = actual != 0
    return float(np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100)

def rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    return float(np.sqrt(np.mean((actual - predicted) ** 2)))

def coverage(actual: np.ndarray, lower: np.ndarray, upper: np.ndarray) -> float:
    inside = (actual >= lower) & (actual <= upper)
    return float(inside.mean() * 100)

def run_walk_forward_cv(features_df: pd.DataFrame) -> dict:
    n = len(features_df)
    fold_results = []

    for fold in range(N_SPLITS):
        test_end = n - fold
        test_start = test_end - 3        # predict 3 months ahead
        train_end = test_start

        if train_end < MIN_TRAIN_MONTHS:
            print(f"  Fold {fold+1}: insufficient training data, skipping")
            continue

        train_df = features_df.iloc[:train_end].copy()
        test_df = features_df.iloc[test_start:test_end].copy()

        fc = CashflowForecaster(prophet_weight=0.5, lgbm_weight=0.5)
        fc.fit(train_df)
        pred_df = fc.predict(horizon=3)
        pred_with_probs = compute_shortfall_probabilities(pred_df, n_simulations=500)

        actual = test_df["net_cashflow"].values
        predicted = pred_df["forecast"].values[:len(actual)]
        lower = pred_df["lower_p10"].values[:len(actual)]
        upper = pred_df["upper_p90"].values[:len(actual)]

        fold_result = {
            "fold": fold + 1,
            "train_months": train_end,
            "test_months": len(actual),
            "mape": mape(actual, predicted),
            "rmse": rmse(actual, predicted),
            "coverage_p10_p90": coverage(actual, lower, upper),
        }
        fold_results.append(fold_result)
        print(f"  Fold {fold+1}: MAPE={fold_result['mape']:.1f}%  "
              f"RMSE={fold_result['rmse']:,.0f}  "
              f"Coverage={fold_result['coverage_p10_p90']:.1f}%")

    if not fold_results:
        return {}

    avg = {
        "avg_mape": np.mean([r["mape"] for r in fold_results]),
        "avg_rmse": np.mean([r["rmse"] for r in fold_results]),
        "avg_coverage": np.mean([r["coverage_p10_p90"] for r in fold_results]),
        "n_folds": len(fold_results),
    }
    return avg

def main():
    print("=" * 60)
    print("CASHFLOW PIPELINE BENCHMARK")
    print("=" * 60)

    raw_df = load_transactions(TRANSACTIONS_PATH)
    cat_df = categorize_transactions(raw_df)
    features_df = build_monthly_features(cat_df, entity_id=ENTITY_ID)

    print(f"\nEntity: {ENTITY_ID}")
    print(f"History: {len(features_df)} months")

    print(f"\n--- Walk-Forward Cross-Validation ({N_SPLITS} folds, 3-month horizon) ---")
    cv_results = run_walk_forward_cv(features_df)

    if cv_results:
        print(f"\nSummary:")
        print(f"  Avg MAPE:     {cv_results['avg_mape']:.1f}%")
        print(f"  Avg RMSE:     {cv_results['avg_rmse']:,.0f}")
        print(f"  Band Coverage: {cv_results['avg_coverage']:.1f}%  (target: >70%)")
        print(f"  Folds run:    {cv_results['n_folds']}")

    print("\n" + "=" * 60)
    print("Benchmark complete.")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run benchmark**

```bash
python benchmarks/benchmark_runner.py
```

Expected output (approximate — synthetic data):
```
CASHFLOW PIPELINE BENCHMARK
============================================================
Entity: E001
History: 30 months

--- Walk-Forward Cross-Validation (3 folds, 3-month horizon) ---
  Fold 1: MAPE=XX.X%  RMSE=XX,XXX  Coverage=XX.X%
  Fold 2: MAPE=XX.X%  RMSE=XX,XXX  Coverage=XX.X%
  Fold 3: MAPE=XX.X%  RMSE=XX,XXX  Coverage=XX.X%

Summary:
  Avg MAPE:      XX.X%
  Avg RMSE:      XX,XXX
  Band Coverage: XX.X%  (target: >70%)
  Folds run:     3
```

- [ ] **Step 3: Commit**

```bash
git add benchmarks/benchmark_runner.py
git commit -m "feat: walk-forward CV benchmarking harness with MAPE, RMSE, coverage"
```

---

## Final: Smoke Test Everything

- [ ] **Run full test suite**

```bash
pytest tests/ -v --tb=short
```

Expected: all tests pass across all 8 test files.

- [ ] **Run pipeline end-to-end manually**

```python
# Run in Python REPL or a scratch script
from src.pipeline import run_pipeline
import json

result = run_pipeline("data/sample_aa_transactions.csv", entity_id="E001")
print(json.dumps(result, indent=2, default=str))
```

Verify output has: `cashflow_forecast_12m` (12 items), `shortfall_probability_12m` (12 items), `stress_results` (5 scenarios), `ews_tier` (GREEN/AMBER/RED).

- [ ] **Run benchmark**

```bash
python benchmarks/benchmark_runner.py
```

- [ ] **Final commit**

```bash
git add -A
git commit -m "chore: complete cashflow + liquidity stress pipeline v1"
```

---

## Output Bundle Reference

Every `run_pipeline()` call returns this structure:

```json
{
  "entity_id": "E001",
  "generated_at": "2024-07-15T10:30:00+00:00",
  "cashflow_forecast_12m": [
    {"period": "2024-07", "value": 18420.50},
    ...
  ],
  "shortfall_probability_12m": [
    {"period": "2024-07", "probability": 0.0821},
    ...
  ],
  "confidence_band": [
    {"period": "2024-07", "p10": 11200.0, "p90": 25600.0},
    ...
  ],
  "stress_results": {
    "revenue_mild":     {"stress_survival_score": 88.0, "months_to_zero_balance": null, ...},
    "revenue_moderate": {"stress_survival_score": 61.0, "months_to_zero_balance": 9, ...},
    "revenue_severe":   {"stress_survival_score": 22.0, "months_to_zero_balance": 4, ...},
    "expense_moderate": {"stress_survival_score": 74.0, "months_to_zero_balance": null, ...},
    "combined_shock":   {"stress_survival_score": 45.0, "months_to_zero_balance": 7, ...}
  },
  "ews_tier": "AMBER",
  "ews_triggers": ["emi_to_inflow_ratio > 0.40 (elevated debt burden)"],
  "ews_trigger_count": 1
}
```
