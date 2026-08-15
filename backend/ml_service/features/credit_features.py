import pandas as pd

def apply_credit_features(out: pd.DataFrame) -> pd.DataFrame:
    if "scheduled_emi" in out.columns and "scheduled_loan_repayment" in out.columns and "net_operating_cashflow" in out.columns:
        out["cash_after_debt_service"] = out["net_operating_cashflow"] - out["scheduled_emi"] - out["scheduled_loan_repayment"]
        out["forecast_dscr"] = out["net_operating_cashflow"] / (out["scheduled_emi"] + out["scheduled_loan_repayment"]).clip(lower=1.0)
        out["debt_service_burden"] = (out["scheduled_emi"] + out["scheduled_loan_repayment"]) / out.get("operating_inflow", pd.Series(1, index=out.index)).clip(lower=1.0)
    
    feature_blocks = {}
    sources = ["days_past_due", "loan_outstanding"]
    for col in sources:
        if col not in out.columns: continue
        grouped = out.groupby("entity_id", sort=False)[col]
        for lag in (1, 3, 6): feature_blocks[f"{col}_lag{lag}"] = grouped.shift(lag)
        shifted = grouped.shift(1)
        grouped_shifted = shifted.groupby(out["entity_id"], sort=False)
        for window in (3, 6):
            feature_blocks[f"{col}_roll{window}"] = grouped_shifted.transform(lambda values, w=window: values.rolling(w, min_periods=1).mean())
            
    feature_frame = pd.DataFrame(feature_blocks, index=out.index)
    return pd.concat([out, feature_frame], axis=1)
