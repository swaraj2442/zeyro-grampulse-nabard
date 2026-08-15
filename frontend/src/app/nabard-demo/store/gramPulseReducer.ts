import { GramPulseState, GramPulseAction } from './gramPulseTypes';

export function gramPulseReducer(state: GramPulseState, action: GramPulseAction): GramPulseState {
  switch (action.type) {
    case 'FINANCIAL_RECORD_ADDED': {
      const enterpriseId = action.payload.enterpriseId;
      const currentRecords = state.financialRecords[enterpriseId] || [];
      return {
        ...state,
        financialRecords: {
          ...state.financialRecords,
          [enterpriseId]: [...currentRecords, action.payload]
        }
      };
    }
    case 'FORECAST_REFRESHED': {
      return {
        ...state,
        forecasts: {
          ...state.forecasts,
          [action.payload.enterpriseId]: action.payload
        }
      };
    }
    case 'EARLY_WARNING_UPDATED': {
      return {
        ...state,
        earlyWarnings: {
          ...state.earlyWarnings,
          [action.payload.enterpriseId]: action.payload
        }
      };
    }
    case 'ALERT_CREATED': {
      return {
        ...state,
        alerts: {
          ...state.alerts,
          [action.payload.id]: action.payload
        }
      };
    }
    case 'ALERT_UPDATED': {
      return {
        ...state,
        alerts: {
          ...state.alerts,
          [action.payload.id]: action.payload
        }
      };
    }
    case 'ALERT_RESOLVED': {
      const alert = state.alerts[action.payload.alertId];
      if (!alert) return state;
      return {
        ...state,
        alerts: {
          ...state.alerts,
          [action.payload.alertId]: { ...alert, status: 'Resolved' }
        }
      };
    }
    case 'SCENARIO_RUN': {
      // Typically we don't save scenarios into the main enterprise forecast immediately, 
      // they are transient until converted to an intervention. But we might store them in a 'scenarios' state if needed.
      return state;
    }
    case 'INTERVENTION_CREATED': {
      return {
        ...state,
        interventions: {
          ...state.interventions,
          [action.payload.id]: action.payload
        }
      };
    }
    case 'INTERVENTION_STATUS_UPDATED': {
      const intervention = state.interventions[action.payload.interventionId];
      if (!intervention) return state;
      return {
        ...state,
        interventions: {
          ...state.interventions,
          [action.payload.interventionId]: { ...intervention, status: action.payload.status }
        }
      };
    }
    case 'TIMELINE_EVENT_ADDED': {
      const enterpriseId = action.payload.enterpriseId;
      const currentEvents = state.timelineEvents[enterpriseId] || [];
      return {
        ...state,
        timelineEvents: {
          ...state.timelineEvents,
          [enterpriseId]: [...currentEvents, action.payload]
        }
      };
    }
    case 'OFFLINE_SYNC_STATUS_CHANGED': {
      // Find the record and update its sync status
      // This is simplified and assumes financial records for now
      const newRecords = { ...state.financialRecords };
      let updated = false;
      for (const [entId, records] of Object.entries(newRecords)) {
        const index = records.findIndex(r => r.id === action.payload.recordId);
        if (index !== -1) {
          const updatedRecords = [...records];
          updatedRecords[index] = { ...updatedRecords[index], syncStatus: action.payload.status };
          newRecords[entId] = updatedRecords;
          updated = true;
          break;
        }
      }
      if (!updated) return state;
      return {
        ...state,
        financialRecords: newRecords
      };
    }
    default:
      return state;
  }
}
