import { processAncilla } from './process-ancilla';
import { getAncillas } from './get-ancillas';
import { getAncilla } from './get-ancilla';
import { getSongs } from './get-songs';
import { getSong } from './get-song';
import { getPrayers } from './get-prayers';
import { getPrayer } from './get-prayer';
import { getBreviary } from './get-breviary';
import { subscribeForNotifications } from './subscribe-for-notifications';

export const production = {
  processAncilla,
  getAncillas,
  getAncilla,
  getSongs,
  getSong,
  getPrayers,
  getPrayer,
  subscribeForNotifications,
  getBreviary,
};

export const staging = {
  processAncilla,
  getAncillas,
  getAncilla,
  getSongs,
  getSong,
  getPrayers,
  getPrayer,
  subscribeForNotifications,
  getBreviary,
};
