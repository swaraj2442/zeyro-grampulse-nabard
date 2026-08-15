import pandas as pd
import numpy as np
import sys
import logging
from pathlib import Path
from datasets import Dataset

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from scripts.config import (
    PROCESSED_DIR,
    SYNTHETIC_DIR
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_calibration_data():
    """Load the canonical calibration package."""
    calib_dir = PROCESSED_DIR / "calibration"
    
    enterprise_dist = pd.read_parquet(calib_dir / "enterprise_distributions.parquet")
    credit_dist = pd.read_parquet(calib_dir / "credit_distributions.parquet")
    market_df = pd.read_parquet(calib_dir / "commodity_monthly.parquet")
    climate_obs = pd.read_parquet(calib_dir / "climate_observed_monthly.parquet")
    climate_fcst = pd.read_parquet(calib_dir / "climate_forecast_monthly.parquet")
    
    shocks_df = pd.DataFrame()
    shocks_path = SYNTHETIC_DIR / "shocks.parquet"
    if shocks_path.exists():
        shocks_df = pd.read_parquet(shocks_path)
    
    return enterprise_dist, credit_dist, market_df, climate_obs, climate_fcst, shocks_df

def generate_static_profiles(n_enterprises, enterprise_dist, credit_dist):
    """Generate correlated static variables for each enterprise."""
    profiles = []
    
    sectors = enterprise_dist['sector'].unique()
    
    for i in range(n_enterprises):
        # 1. Sample sector
        sector = np.random.choice(sectors)
        sector_stats = enterprise_dist[enterprise_dist['sector'] == sector].iloc[0]
        credit_stats = credit_dist[credit_dist['sector'] == sector].iloc[0]
        
        # 2. Copula / conditional sampling approximations
        # We assume larger workers -> larger assets -> larger turnover
        size_quantile = np.random.uniform(0, 1)
        
        if size_quantile < 0.25:
            workers = sector_stats['worker_p25']
            base_turnover = sector_stats['receipts_p25']
            loan_outstanding = credit_stats['loan_outstanding_p25']
        elif size_quantile < 0.75:
            workers = sector_stats['worker_median']
            base_turnover = sector_stats['receipts_median']
            loan_outstanding = credit_stats['loan_outstanding_median']
        else:
            workers = sector_stats['worker_p75']
            base_turnover = sector_stats['receipts_p75']
            loan_outstanding = credit_stats['loan_outstanding_p75']
            
        # Assets correlated with turnover
        assets = base_turnover * np.random.uniform(1.2, 2.5)
        
        # Debt parameters
        has_loan = np.random.uniform() < credit_stats['formal_credit_rate']
        loan_amount = loan_outstanding if has_loan else 0
        
        # EMI derived from loan amount (e.g. 24 month term at 12% APR)
        monthly_rate = 0.12 / 12
        term_months = 24
        if has_loan and loan_amount > 0:
            emi = loan_amount * (monthly_rate * (1 + monthly_rate)**term_months) / ((1 + monthly_rate)**term_months - 1)
        else:
            emi = 0
            
        profiles.append({
            "enterprise_id": f"RE-{10000+i}",
            "sector": sector,
            "district": np.random.choice(["Nashik", "Pune", "Aurangabad"]),
            "workers": workers,
            "assets": assets,
            "production_capacity_annual": base_turnover,
            "loan_outstanding": loan_amount,
            "scheduled_emi": emi,
            "opening_cash": base_turnover * 0.1 # 10% of annual turnover as buffer
        })
        
    return pd.DataFrame(profiles)

def generate_monthly_operations(profiles_df, market_df, climate_obs, shocks_df):
    """Generate causal monthly cash flows for 36 months."""
    months = pd.date_range(start="2022-08-01", periods=36, freq='M').to_period('M').to_timestamp()
    
    panel_rows = []
    
    for _, profile in profiles_df.iterrows():
        current_cash = profile['opening_cash']
        dist = profile['district']
        sector = profile['sector']
        
        # Filter environmental data for this district
        env_climate = climate_obs[climate_obs['district'] == dist]
        
        # Identify applicable shocks for this enterprise
        applicable_shocks = []
        if not shocks_df.empty:
            applicable_shocks = shocks_df[
                (shocks_df['district'] == dist) & 
                ((shocks_df['sector'] == sector) | (shocks_df['sector'] == 'All'))
            ].to_dict('records')
        
        for m in months:
            # Match climate
            clim_row = env_climate[env_climate['month'] == m]
            rain_anomaly = clim_row['rainfall_anomaly_pct'].values[0] if not clim_row.empty else 0
            
            # Base monthly capacity
            base_monthly_inflow = profile['production_capacity_annual'] / 12
            
            # Shock impacts
            demand_shock_multiplier = 1.0
            cost_shock_multiplier = 1.0
            active_shocks = []
            
            for shock in applicable_shocks:
                start = pd.to_datetime(shock['start_month'])
                end = start + pd.DateOffset(months=shock['duration_months'])
                if start <= m < end:
                    active_shocks.append(shock['shock_id'])
                    if shock['shock_type'] == 'demand_drop':
                        demand_shock_multiplier += shock['magnitude']
                    elif shock['shock_type'] == 'input_cost_spike':
                        cost_shock_multiplier += shock['magnitude']
            
            # Seasonality & Climate impacts (e.g. drought lowers production)
            climate_shock = 1.0 + (rain_anomaly * 0.1) # 10% elasticity
            
            # Simulated operating inflow
            operating_inflow = base_monthly_inflow * climate_shock * demand_shock_multiplier * np.random.normal(1, 0.05)
            
            # Operating outflow (fixed + variable)
            fixed_costs = profile['production_capacity_annual'] * 0.02
            variable_costs = operating_inflow * 0.6 * cost_shock_multiplier
            operating_outflow = fixed_costs + variable_costs
            
            # Debt Service
            debt_service = profile['scheduled_emi']
            
            # Cash Accounting Constraint (Strict)
            closing_cash = current_cash + operating_inflow - operating_outflow - debt_service
            
            # Did they default?
            dpd = 30 if closing_cash < 0 else 0
            
            panel_rows.append({
                "enterprise_id": profile['enterprise_id'],
                "month": m,
                "sector": profile['sector'],
                "district": profile['district'],
                "operating_inflow": max(0, operating_inflow),
                "operating_outflow": max(0, operating_outflow),
                "debt_service": debt_service,
                "opening_cash_balance": current_cash,
                "closing_cash_balance": closing_cash,
                "dpd": dpd,
                "active_shocks": ",".join(active_shocks) if active_shocks else None
            })
            
            current_cash = closing_cash # Carry forward
            
    return pd.DataFrame(panel_rows)

def main():
    logging.info("Starting Causal Simulator...")
    
    ent_dist, cred_dist, mkt_df, clim_obs, clim_fcst, shocks_df = load_calibration_data()
    
    # 1. Generate Static Profiles (N=5000 for Week 3 Scale)
    n_enterprises = 5000
    logging.info(f"Generating static enterprise profiles (N={n_enterprises})...")
    profiles = generate_static_profiles(n_enterprises, ent_dist, cred_dist)
    
    # 2. Roll forward monthly operations
    logging.info("Rolling forward 36 months of causal operations with shocks...")
    panel = generate_monthly_operations(profiles, mkt_df, clim_obs, shocks_df)
    
    # Save output
    output_path = SYNTHETIC_DIR / "grampulse_enterprise_monthly_v2.parquet"
    panel.to_parquet(output_path, index=False)
    logging.info(f"Saved synthetic panel to {output_path} (Rows: {len(panel)})")

if __name__ == "__main__":
    main()
