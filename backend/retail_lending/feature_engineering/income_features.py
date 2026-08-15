"""Income Feature Engineering Engine.

Calculates income-specific features from standard transaction data.
"""

import pandas as pd
import numpy as np

class IncomeFeatureEngine:
    def extract_features(self, df: pd.DataFrame) -> dict:
        """
        Extracts structural income features from normalized transactions.
        Requires dataframe with columns: date, amount, type, category
        """
        if df.empty:
            return {}

        # Ensure datetime and numeric
        df['date'] = pd.to_datetime(df['date'])
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        
        # Filter for Income and Credits
        credits = df[df['type'] == 'CREDIT']
        salaries = df[df['category'] == 'Salary']
        
        # 1. Average monthly income
        monthly_income = credits.groupby(pd.Grouper(key='date', freq='ME'))['amount'].sum()
        avg_monthly_income = monthly_income.mean() if not monthly_income.empty else 0.0
        
        # 2. Salary periodicity and variance
        if len(salaries) > 1:
            salary_variance = salaries['amount'].var()
            # Approximation of periodicity (days between salary credits)
            salaries = salaries.sort_values('date')
            periodicity = salaries['date'].diff().dt.days.mean()
        else:
            salary_variance = 0.0
            periodicity = 0.0
            
        # 3. Number of income sources (distinct counterparties generating credits)
        num_income_sources = credits['merchant'].nunique() if 'merchant' in credits.columns else 1
        
        # 4. Salary confidence (ratio of explicit salary to total credits)
        total_credit_vol = credits['amount'].sum()
        salary_vol = salaries['amount'].sum()
        salary_confidence = (salary_vol / total_credit_vol) if total_credit_vol > 0 else 0.0

        return {
            "avg_monthly_income": float(avg_monthly_income),
            "salary_variance": float(np.nan_to_num(salary_variance)),
            "salary_periodicity_days": float(np.nan_to_num(periodicity)),
            "num_income_sources": int(num_income_sources),
            "salary_confidence_score": float(salary_confidence)
        }
