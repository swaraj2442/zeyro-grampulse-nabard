import { initialDemoState as shaktiState } from '../data/shaktiPoultryDemo';
import { GramPulseState } from './gramPulseTypes';

export const initialDemoState: GramPulseState = {
  ...shaktiState,
  lastUpdated: new Date().toISOString()
};
