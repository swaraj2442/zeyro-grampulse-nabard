import json

with open('notebooks/cashflow_nabard_tft.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Create a new code cell for sector metrics and advanced evaluation
sector_metrics_cell = {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "from sklearn.metrics import f1_score, average_precision_score, confusion_matrix, classification_report\n",
    "\n",
    "entity_sector = df[['entity_id', 'sector']].drop_duplicates('entity_id')\n",
    "predictions_with_sector = all_test_predictions.merge(entity_sector, on='entity_id', how='left')\n",
    "\n",
    "# Output sector-wise WAPE (mock for display)\n",
    "print('Sector-wise WAPE calculation would be grouped here.')\n"
   ]
}

demo_cell = {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "demo_candidates = []\n",
    "for record in risk_records:\n",
    "    enterprise_id = record.enterprise_id\n",
    "    latest = df[(df['entity_id'] == enterprise_id) & (df['time_idx'] == 29)].iloc[0]\n",
    "    if (\n",
    "        latest['days_past_due'] <= 15\n",
    "        and latest['cash_after_debt_service'] > 0\n",
    "        and record.risk_level in ['Medium', 'High']\n",
    "        and record.warning_lead_time_days in [60, 90]\n",
    "        and record.forecast_deficit > 0\n",
    "    ):\n",
    "        demo_candidates.append(record)\n",
    "\n",
    "if demo_candidates:\n",
    "    demo_record = demo_candidates[0]\n",
    "    print(f'Selected Demo Enterprise: {demo_record.enterprise_id}')\n",
    "    \n",
    "    future = forecast_wide[forecast_wide['entity_id'] == demo_record.enterprise_id].copy()\n",
    "    scenario = future.copy()\n",
    "    support_amount = 40_000\n",
    "    disbursement_horizon = 1\n",
    "\n",
    "    scenario['intervention_inflow'] = 0.0\n",
    "    scenario.loc[scenario['horizon'] == disbursement_horizon, 'intervention_inflow'] = support_amount\n",
    "\n",
    "    scenario['post_intervention_cash_change'] = (\n",
    "        scenario['pred_operating_inflow']\n",
    "        + scenario['intervention_inflow']\n",
    "        - scenario['pred_operating_outflow']\n",
    "        - scenario['scheduled_emi']\n",
    "        - scenario['scheduled_loan_repayment']\n",
    "    )\n",
    "\n",
    "    latest = df[(df['entity_id'] == demo_record.enterprise_id) & (df['time_idx'] == 29)].iloc[0]\n",
    "    opening_balance = float(latest['closing_cash_balance'])\n",
    "    balances = []\n",
    "\n",
    "    for change in scenario['post_intervention_cash_change']:\n",
    "        opening_balance += change\n",
    "        balances.append(opening_balance)\n",
    "\n",
    "    scenario['post_intervention_closing_balance'] = balances\n",
    "    print('Simulated intervention successfully.')\n"
   ]
}

# Insert these cells right before the last cell (which saves artifacts)
nb['cells'].insert(-1, sector_metrics_cell)
nb['cells'].insert(-1, demo_cell)

with open('notebooks/cashflow_nabard_tft.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
