import { useCallback } from 'react';
import { useGramPulse } from './GramPulseContext';
import { FinancialRecordInput } from './gramPulseTypes';
import { persistFinancialRecord, refreshForecastData, evaluateRisk } from '../services/mockServices';
import { selectEnterpriseHistory, selectEnterpriseWarning } from './gramPulseSelectors';

export const useGramPulseActions = () => {
  const { state, dispatch } = useGramPulse();

  const addFinancialRecord = useCallback(async (record: FinancialRecordInput) => {
    // 1. Persist record (POST to backend — also triggers forecast refresh + alert on server)
    const savedRecord = await persistFinancialRecord(record);

    // 2. Add to local context
    dispatch({ type: 'FINANCIAL_RECORD_ADDED', payload: savedRecord });

    // 3. Refresh forecast from backend
    const history = [...selectEnterpriseHistory(state, record.enterpriseId), savedRecord];
    const forecast = await refreshForecastData(record.enterpriseId, history);

    dispatch({ type: 'FORECAST_REFRESHED', payload: forecast });

    // 4. Re-evaluate risk from backend (now async, takes enterpriseId)
    const previousWarning = selectEnterpriseWarning(state, record.enterpriseId);
    const newWarning = await evaluateRisk(record.enterpriseId);

    dispatch({ type: 'EARLY_WARNING_UPDATED', payload: newWarning as any });

    // 5. Update local timeline
    dispatch({
      type: 'TIMELINE_EVENT_ADDED',
      payload: {
        id: `EV-${Math.random().toString(36).substr(2, 9)}`,
        enterpriseId: record.enterpriseId,
        date: new Date().toISOString(),
        title: 'Financial records submitted & Forecast recalculated',
        description: `New monthly data recorded. Risk: ${newWarning.riskLevel}.`
      }
    });

    // 6. Manage local alert state
    if (newWarning.riskLevel === 'High' || newWarning.riskLevel === 'Critical') {
      dispatch({
        type: 'ALERT_CREATED',
        payload: {
          id: `ALT-${Math.random().toString(36).substr(2, 9)}`,
          enterpriseId: record.enterpriseId,
          riskLevel: newWarning.riskLevel,
          title: 'Cash Deficit Warning Updated',
          description: `Projected cash deficit of ₹${newWarning.forecastDeficit?.toLocaleString('en-IN') ?? 0}.`,
          createdAt: new Date().toISOString(),
          status: 'Active'
        }
      });
    } else if (previousWarning && (previousWarning.riskLevel === 'High' || previousWarning.riskLevel === 'Critical')) {
      const activeAlerts = Object.values(state.alerts).filter(
        a => a.enterpriseId === record.enterpriseId && a.status === 'Active'
      );
      activeAlerts.forEach(a => {
        dispatch({ type: 'ALERT_RESOLVED', payload: { alertId: a.id } });
      });
    }

    return {
      previousRiskLevel: previousWarning?.riskLevel,
      currentRiskLevel: newWarning.riskLevel,
      forecast,
      warning: newWarning
    };
  }, [state, dispatch]);

  return {
    addFinancialRecord
  };
};
