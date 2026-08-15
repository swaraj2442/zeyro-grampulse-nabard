"""Cashflow feature extraction logic."""

from datetime import datetime, timedelta
import json
from typing import List, Dict, Any

def _mean(values: List[float]) -> float:
    return sum(values) / len(values) if values else 0.0

def _std(values: List[float]) -> float:
    if not values:
        return 0.0
    m = _mean(values)
    variance = sum((x - m) ** 2 for x in values) / len(values)
    return variance ** 0.5

def _slope(x: List[float], y: List[float]) -> float:
    if len(x) <= 1:
        return 0.0
    mean_x = _mean(x)
    mean_y = _mean(y)
    num = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(len(x)))
    den = sum((x[i] - mean_x) ** 2 for i in range(len(x)))
    return num / den if den > 0 else 0.0

def extract_all_features(user_ref_hash: str, txns: List[Dict[str, Any]], window_days: int = 90) -> Dict[str, Dict[str, Any]]:
    """Extract 11 groups of features from enriched transactions for a given window."""
    
    # Filter transactions within the window
    now = datetime.now()
    window_start = now - timedelta(days=window_days)
    
    # Ensure txn timestamps are datetime objects
    for t in txns:
        if isinstance(t['txn_timestamp'], str):
            # Parse ISO timestamp
            try:
                t['txn_timestamp'] = datetime.fromisoformat(t['txn_timestamp'].replace('Z', '+00:00'))
            except Exception:
                t['txn_timestamp'] = datetime.now()
                
    w_txns = [t for t in txns if t['txn_timestamp'] >= window_start]
    
    # Sort transactions by timestamp ascending for balance reconstruction
    w_txns.sort(key=lambda x: x['txn_timestamp'])
    
    # Initialize groups
    features = {
        "income": {},
        "expense": {},
        "emi": {},
        "cashflow": {},
        "savings": {},
        "behavior": {},
        "network": {},
        "rail": {},
        "volatility": {},
        "temporal": {},
        "quality": {}
    }
    
    # --- Group 11: Data Quality Signals (Base for others) ---
    coverage_days = 0
    if txns:
        all_timestamps = [t['txn_timestamp'] for t in txns]
        coverage_days = (max(all_timestamps) - min(all_timestamps)).days
    
    # Data gap count (gaps > 7 days)
    data_gap_count = 0
    if len(w_txns) > 1:
        for i in range(1, len(w_txns)):
            gap = (w_txns[i]['txn_timestamp'] - w_txns[i-1]['txn_timestamp']).days
            if gap > 7:
                data_gap_count += 1
                
    thin_file = 1 if (coverage_days < 60 or len(txns) < 30) else 0
    
    features["quality"] = {
        "data_coverage_days": float(coverage_days),
        "data_gap_count": float(data_gap_count),
        "thin_file_flag": float(thin_file),
        "source_diversity_code": 1.0  # Default to UPI+AA (1.0) or UPI (0.0)
    }
    
    # If thin file or no transactions, return basic features
    if not w_txns:
        features["income"] = {
            "avg_monthly_credit_inr": 0.0,
            "income_regularity_score": 0.0,
            "income_trend_90d": 0.0,
            "credit_to_debit_ratio": 0.0
        }
        features["expense"] = {
            "fixed_obligation_inr": 0.0,
            "fixed_obligation_ratio": 0.0,
            "discretionary_spend_ratio": 0.0
        }
        features["emi"] = {
            "count_active": 0.0,
            "total_monthly_exposure_inr": 0.0,
            "emi_to_income_ratio": 0.0,
            "missed_emi_signals_count": 0.0,
            "loan_stacking_signals": 0.0
        }
        features["cashflow"] = {
            "end_of_month_stress_score": 0.5,
            "avg_days_to_near_zero": 15.0,
            "min_balance_30d_inr": 1000.0,
            "balance_trend_slope": 0.0
        }
        features["savings"] = {
            "recurring_sip_detected": 0.0,
            "savings_to_income_ratio": 0.0
        }
        features["behavior"] = {
            "unique_merchant_count_30d": 0.0,
            "round_amount_transfer_ratio": 0.0
        }
        features["network"] = {
            "unique_p2p_recipients_30d": 0.0,
            "p2p_transfer_ratio": 0.0,
            "new_vpa_ratio_30d": 0.0
        }
        features["volatility"] = {
            "spend_coefficient_variation_30d": 0.0,
            "sudden_behavior_change_score": 0.0
        }
        features["temporal"] = {
            "active_days_ratio_30d": 0.0,
            "longest_inactive_streak_days": 30.0
        }
        features["rail"] = {
            "upi_as_pct_of_total_txns": 1.0
        }
        return features

    # Helper aggregates
    credits = [t for t in w_txns if t['direction'] == 'CREDIT']
    debits = [t for t in w_txns if t['direction'] == 'DEBIT']
    
    total_credit_val = sum(float(t['amount_inr']) for t in credits)
    total_debit_val = sum(float(t['amount_inr']) for t in debits)
    
    num_months = max(1.0, window_days / 30.0)
    
    # --- Group 1: Income Signals ---
    avg_monthly_credit = total_credit_val / num_months
    
    # Income Regularity: variance of monthly credits
    # Group credits by month
    monthly_credits = {}
    for c in credits:
        m_key = c['txn_timestamp'].strftime("%Y-%m")
        monthly_credits[m_key] = monthly_credits.get(m_key, 0.0) + float(c['amount_inr'])
    
    # Std dev of monthly credits divided by mean (coefficient of variation)
    if len(monthly_credits) > 1:
        vals = list(monthly_credits.values())
        mean_val = _mean(vals)
        cv = _std(vals) / mean_val if mean_val > 0 else 1.0
        income_regularity = max(0.0, min(1.0, 1.0 - cv))
    else:
        income_regularity = 0.5 if credits else 0.0
        
    # Income Trend 90d: credits in last 30d vs previous 60d
    last_30d_start = now - timedelta(days=30)
    credits_last_30d = sum(float(t['amount_inr']) for t in credits if t['txn_timestamp'] >= last_30d_start)
    credits_prev_60d = sum(float(t['amount_inr']) for t in credits if t['txn_timestamp'] < last_30d_start)
    prev_monthly_avg = credits_prev_60d / max(1.0, (window_days - 30) / 30.0)
    
    income_trend = (credits_last_30d - prev_monthly_avg) / prev_monthly_avg if prev_monthly_avg > 0 else 0.0
    credit_to_debit = total_credit_val / total_debit_val if total_debit_val > 0 else float('inf')
    
    features["income"] = {
        "avg_monthly_credit_inr": float(avg_monthly_credit),
        "income_regularity_score": float(income_regularity),
        "income_trend_90d": float(income_trend),
        "credit_to_debit_ratio": float(credit_to_debit)
    }
    
    # --- Group 2 & 3: Expense & EMI Structure ---
    # Parse fixed obligations (loans, rent, EMIs)
    fixed_obs = []
    emi_txns = []
    savings_txns = []
    
    for d in debits:
        b_type = (d.get('business_type') or '').upper()
        vpa = (d.get('counterparty_vpa_enc') or '').lower()
        
        # Inferred EMI
        if b_type == 'EMI' or 'loan' in vpa or 'finance' in vpa:
            fixed_obs.append(d)
            emi_txns.append(d)
        elif b_type in ('RENT', 'UTILITY') or 'rent' in vpa or 'electricity' in vpa:
            fixed_obs.append(d)
        
        # Savings indicators (SIPs, investments)
        if b_type == 'INVESTMENT' or 'zerodha' in vpa or 'groww' in vpa or 'mutual' in vpa:
            savings_txns.append(d)
            
    total_fixed_val = sum(float(t['amount_inr']) for t in fixed_obs)
    avg_monthly_fixed = total_fixed_val / num_months
    fixed_ratio = total_fixed_val / total_debit_val if total_debit_val > 0 else 0.0
    
    discretionary_spend_ratio = 1.0 - fixed_ratio
    
    features["expense"] = {
        "fixed_obligation_inr": float(avg_monthly_fixed),
        "fixed_obligation_ratio": float(fixed_ratio),
        "discretionary_spend_ratio": float(discretionary_spend_ratio)
    }
    
    # EMIs
    total_emi_val = sum(float(t['amount_inr']) for t in emi_txns)
    avg_monthly_emi = total_emi_val / num_months
    emi_ratio = avg_monthly_emi / avg_monthly_credit if avg_monthly_credit > 0 else 0.0
    
    # Count unique active EMIs in last 30 days (by merchant name/VPA)
    emi_last_30d = [e for e in emi_txns if e['txn_timestamp'] >= last_30d_start]
    unique_providers = set(e.get('merchant_name') or e.get('counterparty_vpa_enc') or 'unknown' for e in emi_last_30d)
    count_active = len(unique_providers)
    
    # Loan stacking: if multiple new providers transacted with in last 30d
    loan_stacking = 1.0 if count_active > 2 else 0.0
    
    # Missed EMI signals (gaps in recurring EMI dates)
    missed_emi_count = 0.0
    # Dummy missed EMI calculation: if user has active EMIs but no payment in the last 30 days
    if count_active > 0 and len(emi_last_30d) == 0:
        missed_emi_count = 1.0
        
    features["emi"] = {
        "count_active": float(count_active),
        "total_monthly_exposure_inr": float(avg_monthly_emi),
        "emi_to_income_ratio": float(emi_ratio),
        "missed_emi_signals_count": float(missed_emi_count),
        "loan_stacking_signals": float(loan_stacking),
        "bnpl_activity_detected": 1.0 if any('slice' in (t.get('counterparty_vpa_enc') or '').lower() or 'lazypay' in (t.get('counterparty_vpa_enc') or '').lower() for t in w_txns) else 0.0
    }
    
    # --- Group 4: Cash Flow Stress ---
    # Reconstruct running balance proxy
    # Start balance from credit index
    balance_history = []
    current_bal = 10000.0  # Base assumption
    
    for t in w_txns:
        amt = float(t['amount_inr'])
        if t['direction'] == 'CREDIT':
            current_bal += amt
        else:
            current_bal -= amt
        balance_history.append((t['txn_timestamp'], current_bal))
        
    balances_30d = [b[1] for b in balance_history if b[0] >= last_30d_start]
    min_bal_30d = min(balances_30d) if balances_30d else current_bal
    
    # EOM stress score: ratio of days balance was < 1000 in last 30 days
    days_stressed = 0
    if len(balances_30d) > 0:
        low_bal_count = sum(1 for b in balances_30d if b < 1000.0)
        eom_stress = low_bal_count / len(balances_30d)
    else:
        eom_stress = 0.2
        
    # Avg days to near zero: count days after payday until balance drops < 20% of payday balance
    days_to_zero_list = []
    # Identify paydays (credits > 15,000 INR)
    paydays = [t for t in credits if float(t['amount_inr']) >= 15000.0]
    for pd in paydays:
        pd_time = pd['txn_timestamp']
        # Find subsequent balance trajectory
        subsequent = [b for b in balance_history if b[0] > pd_time]
        pd_bal = next((b[1] for b in balance_history if b[0] == pd_time), None)
        if pd_bal and subsequent:
            limit = pd_bal * 0.20
            zero_day_time = next((b[0] for b in subsequent if b[1] < limit), None)
            if zero_day_time:
                days_to_zero_list.append(float((zero_day_time - pd_time).days))
                
    avg_days_to_zero = _mean(days_to_zero_list) if days_to_zero_list else 20.0
    
    # Balance trend slope: simple linear regression slope of balance over time
    if len(balance_history) > 1:
        x = [float((b[0] - balance_history[0][0]).days) for b in balance_history]
        y = [b[1] for b in balance_history]
        slope = _slope(x, y)
    else:
        slope = 0.0
        
    features["cashflow"] = {
        "end_of_month_stress_score": float(eom_stress),
        "avg_days_to_near_zero": float(avg_days_to_zero),
        "min_balance_30d_inr": float(min_bal_30d),
        "balance_trend_slope": float(slope)
    }
    
    # --- Group 5: Savings & Investments ---
    total_savings_val = sum(float(t['amount_inr']) for t in savings_txns)
    savings_to_income = total_savings_val / total_credit_val if total_credit_val > 0 else 0.0
    
    # Recurring SIP: multiple savings transactions in last 90 days to same entity
    savings_providers = [s.get('merchant_name') or s.get('counterparty_vpa_enc') or 'unknown' for s in savings_txns]
    recurring_sip = 1.0 if len(savings_txns) >= 3 and len(set(savings_providers)) <= 2 else 0.0
    
    features["savings"] = {
        "recurring_sip_detected": float(recurring_sip),
        "savings_to_income_ratio": float(savings_to_income)
    }
    
    # --- Group 6 & 7: Behavior & Network ---
    txns_30d = [t for t in w_txns if t['txn_timestamp'] >= last_30d_start]
    debits_30d = [t for t in txns_30d if t['direction'] == 'DEBIT']
    
    unique_merchants = set(t.get('merchant_entity_id') or t.get('merchant_name') or 'unknown' for t in txns_30d if t.get('merchant_name'))
    
    # Round amount transfers (e.g. 500, 1000, 2000, 5000, 10000)
    round_amts = [500, 1000, 2000, 5000, 10000, 15000, 20000, 50000]
    p2p_debits = [t for t in debits if not t.get('merchant_name')]
    p2p_round_count = sum(1 for t in p2p_debits if int(float(t['amount_inr'])) in round_amts)
    round_ratio = p2p_round_count / len(p2p_debits) if p2p_debits else 0.0
    
    features["behavior"] = {
        "unique_merchant_count_30d": float(len(unique_merchants)),
        "round_amount_transfer_ratio": float(round_ratio)
    }
    
    # Network
    p2p_debits_30d = [t for t in debits_30d if not t.get('merchant_name')]
    unique_recipients = set(t.get('counterparty_vpa_enc') or 'unknown' for t in p2p_debits_30d)
    
    total_debits_30d_val = sum(float(t['amount_inr']) for t in debits_30d)
    total_p2p_debits_30d_val = sum(float(t['amount_inr']) for t in p2p_debits_30d)
    p2p_ratio = total_p2p_debits_30d_val / total_debits_30d_val if total_debits_30d_val > 0 else 0.0
    
    # New VPA ratio: count VPAs transacted within last 30d vs historical
    historical_vpas = set(t.get('counterparty_vpa_enc') or 'unknown' for t in w_txns if t['txn_timestamp'] < last_30d_start)
    recent_vpas = set(t.get('counterparty_vpa_enc') or 'unknown' for t in txns_30d)
    new_vpas = recent_vpas - historical_vpas
    new_vpa_ratio = len(new_vpas) / len(recent_vpas) if recent_vpas else 0.0
    
    features["network"] = {
        "unique_p2p_recipients_30d": float(len(unique_recipients)),
        "p2p_transfer_ratio": float(p2p_ratio),
        "new_vpa_ratio_30d": float(new_vpa_ratio)
    }
    
    # --- Group 9 & 10: Volatility & Temporal ---
    # daily spending standard deviation / daily spending mean
    daily_spends = {}
    for d in debits_30d:
        day_key = d['txn_timestamp'].strftime("%Y-%m-%d")
        daily_spends[day_key] = daily_spends.get(day_key, 0.0) + float(d['amount_inr'])
        
    if len(daily_spends) > 1:
        vals = list(daily_spends.values())
        mean_s = _mean(vals)
        spend_cv = _std(vals) / mean_s if mean_s > 0 else 0.0
    else:
        spend_cv = 0.5 if debits_30d else 0.0
        
    # Sudden behavior change: z-score of spends in last 7 days vs prior 23 days
    last_7d_start = now - timedelta(days=7)
    spends_7d = [v for k, v in daily_spends.items() if datetime.strptime(k, "%Y-%m-%d") >= last_7d_start]
    spends_prior = [v for k, v in daily_spends.items() if datetime.strptime(k, "%Y-%m-%d") < last_7d_start]
    
    if spends_prior and spends_7d:
        mean_p = _mean(spends_prior)
        std_p = _std(spends_prior)
        mean_7 = _mean(spends_7d)
        behavior_change = abs(mean_7 - mean_p) / std_p if std_p > 0 else 0.0
        behavior_change = min(1.0, behavior_change / 3.0)  # Normalize
    else:
        behavior_change = 0.1
        
    features["volatility"] = {
        "spend_coefficient_variation_30d": float(spend_cv),
        "sudden_behavior_change_score": float(behavior_change)
    }
    
    # Temporal
    unique_active_days = set(t['txn_timestamp'].strftime("%Y-%m-%d") for t in txns_30d)
    active_days_ratio = len(unique_active_days) / 30.0
    
    # Longest inactive streak
    longest_streak = 0
    if len(w_txns) > 1:
        streaks = []
        for i in range(1, len(w_txns)):
            days = (w_txns[i]['txn_timestamp'] - w_txns[i-1]['txn_timestamp']).days
            streaks.append(days)
        longest_streak = max(streaks) if streaks else 0
        
    features["temporal"] = {
        "active_days_ratio_30d": float(active_days_ratio),
        "longest_inactive_streak_days": float(longest_streak)
    }
    
    # --- Group 8: Rail ---
    features["rail"] = {
        "upi_as_pct_of_total_txns": 1.0  # Default for UPI monorepo demo
    }
    
    return features
