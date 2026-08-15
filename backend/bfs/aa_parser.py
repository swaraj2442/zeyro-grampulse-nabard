"""Account Aggregator (AA) Unstructured Parser.

Parses raw FIP (Financial Information Provider) JSON bank statements and unstructured
narratives (NEFT/UPI/IMPS remarks) into a standardized transaction schema for the
behavioral engine.
"""

import json
import re
from typing import List, Dict, Any

class AAParser:
    def __init__(self):
        # Basic NLP/Regex rules for unstructured narrative parsing
        self.category_rules = {
            r"swiggy|zomato|ubereats": "food_delivery",
            r"amazon|flipkart|myntra": "e_commerce",
            r"salary|sal|payroll": "income",
            r"emi|loan|bajaj|muthoot": "debt_repayment",
            r"zerodha|groww|upstox": "investments",
            r"atm|cash withdrawal": "cash_withdrawal",
            r"upi|bharatpe|phonepe": "p2p_transfer"
        }

    def _infer_category(self, narrative: str) -> str:
        """Infer transaction category from unstructured text narrative."""
        if not narrative:
            return "unknown"
            
        narrative_lower = narrative.lower()
        for pattern, category in self.category_rules.items():
            if re.search(pattern, narrative_lower):
                return category
        return "other"

    def parse_statement(self, raw_json: str) -> List[Dict[str, Any]]:
        """Parses a raw AA JSON string into standardized transaction dicts."""
        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError:
            return []

        transactions = []
        # Support generic AA schema (Account -> Transactions -> Transaction)
        accounts = data.get("Account", [])
        if not isinstance(accounts, list):
            accounts = [accounts]

        for account in accounts:
            account_id = account.get("maskedAccNumber", "unknown")
            txns = account.get("Transactions", {}).get("Transaction", [])
            
            for txn in txns:
                narrative = txn.get("narration", "")
                amount = float(txn.get("amount", 0.0))
                txn_type = txn.get("type", "DEBIT").upper()
                date_str = txn.get("transactionTimestamp", "")

                parsed_txn = {
                    "account_id": account_id,
                    "date": date_str,
                    "amount": amount if txn_type == "CREDIT" else -amount,
                    "type": txn_type,
                    "narrative": narrative,
                    "category": self._infer_category(narrative)
                }
                transactions.append(parsed_txn)

        return transactions
