import { setGlobalOptions } from 'firebase-functions/options';
import { api } from './api';
import { processAncilla } from './process-ancilla';

setGlobalOptions({ region: 'europe-west8' });

export const pwa = { api, processAncilla };
