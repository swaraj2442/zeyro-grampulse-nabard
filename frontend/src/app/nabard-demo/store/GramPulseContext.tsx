"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { GramPulseState, GramPulseAction } from './gramPulseTypes';
import { gramPulseReducer } from './gramPulseReducer';
import { initialDemoState } from './initialDemoState';
import { initialDemoState as initialState } from './initialDemoState';

export const GramPulseContext = createContext<{
  state: GramPulseState;
  dispatch: React.Dispatch<GramPulseAction>;
} | undefined>(undefined);

const STORAGE_KEY = 'grampulse_state_v1';

export const GramPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gramPulseReducer, initialState, (initial) => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Only hydrate if we have an initialized timestamp to ensure valid data structure
          if (parsed.lastUpdated) {
            return {
              ...initial,
              ...parsed,
              lastUpdated: new Date().toISOString() // Refresh timestamp on load
            };
          }
        }
      } catch (e) {
        console.warn('Failed to load state from local storage', e);
      }
    }
    return {
      ...initial,
      lastUpdated: new Date().toISOString()
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save state to local storage', e);
      }
    }
  }, [state]);

  return (
    <GramPulseContext.Provider value={{ state, dispatch }}>
      {children}
    </GramPulseContext.Provider>
  );
};

export const useGramPulse = () => {
  const context = useContext(GramPulseContext);
  if (context === undefined) {
    throw new Error('useGramPulse must be used within a GramPulseProvider');
  }
  return context;
};
