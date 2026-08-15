"""Borrower Affordability Engine.

Transforms absolute income estimates into prudent underwriting metrics:
- Fixed Obligation to Income Ratio (FOIR)
- Disposable Income
- Estimated Loan Eligibility
"""

import pandas as pd

class AffordabilityEngine:
    def __init__(self, target_dti_limit: float = 0.50, interest_rate: float = 0.12, tenure_months: int = 48):
        self.target_dti_limit = target_dti_limit
        self.interest_rate = interest_rate
        self.tenure_months = tenure_months

    def calculate_affordability(self, df: pd.DataFrame, estimated_income: float) -> dict:
        """
        Calculates debt and fixed obligations to determine affordability.
        Expects a normalized transaction DataFrame and a pre-estimated income.
        """
        if df.empty or estimated_income <= 0:
            return {}

        # Ensure datetime and numeric
        df['date'] = pd.to_datetime(df['date'])
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        
        debits = df[df['type'] == 'DEBIT']
        
        # 1. Existing EMIs (Debt Servicing)
        emi_txns = debits[debits['category'] == 'EMI']
        monthly_emi = emi_txns.groupby(pd.Grouper(key='date', freq='ME'))['amount'].sum().mean()
        if pd.isna(monthly_emi):
            monthly_emi = 0.0

        # 2. Fixed Expenses (Rent, Utilities, Insurance)
        fixed_txns = debits[debits['category'].isin(['Rent', 'Utility', 'Insurance'])]
        monthly_fixed = fixed_txns.groupby(pd.Grouper(key='date', freq='ME'))['amount'].sum().mean()
        if pd.isna(monthly_fixed):
            monthly_fixed = 0.0

        # 3. Savings Rate (Approximation: Total Credits - Total Debits over time)
        total_monthly_debits = debits.groupby(pd.Grouper(key='date', freq='ME'))['amount'].sum().mean()
        if pd.isna(total_monthly_debits):
            total_monthly_debits = 0.0
            
        disposable_income = estimated_income - total_monthly_debits
        disposable_income = max(0.0, disposable_income)

        # 4. FOIR calculation (Fixed Obligation to Income Ratio)
        foir = (monthly_emi + monthly_fixed) / estimated_income
        
        # 5. Maximum Affordable EMI
        max_affordable_emi = (estimated_income * self.target_dti_limit) - monthly_emi
        max_affordable_emi = max(0.0, float(max_affordable_emi))
        
        # 6. Estimated Loan Eligibility (Simple PV formula approximation)
        r_monthly = self.interest_rate / 12.0
        eligible_loan_amount = max_affordable_emi * ((1 + r_monthly)**self.tenure_months - 1) / (r_monthly * (1 + r_monthly)**self.tenure_months)

        return {
            "estimated_income": round(estimated_income, 2),
            "monthly_existing_emis": round(monthly_emi, 2),
            "monthly_fixed_expenses": round(monthly_fixed, 2),
            "disposable_income": round(disposable_income, 2),
            "foir": round(foir, 4),
            "max_affordable_emi": round(max_affordable_emi, 2),
            "estimated_loan_eligibility": round(eligible_loan_amount, 2),
            "affordability_confidence": 0.94 if disposable_income > 0 else 0.40
        }
