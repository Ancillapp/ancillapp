import { processAncilla } from './process-ancilla';
import { getAncillas } from './get-ancillas';
import { getAncilla } from './get-ancilla';
import { getSongs } from './get-songs';
import { getSong } from './get-song';
import { getPrayers } from './get-prayers';
import { getPrayer } from './get-prayer';
import { subscribeForNotifications } from './subscribe-for-notifications';

export const production = {
  processAncillaProduction: processAncilla,
  getAncillasProduction: getAncillas,
  getAncillaProduction: getAncilla,
  getSongsProduction: getSongs,
  getSongProduction: getSong,
  getPrayersProduction: getPrayers,
  getPrayerProduction: getPrayer,
  subscribeForNotificationsProduction: subscribeForNotifications,
};

export const staging = {
  processAncillaStaging: processAncilla,
  getAncillasStaging: getAncillas,
  getAncillaStaging: getAncilla,
  getSongsStaging: getSongs,
  getSongStaging: getSong,
  getPrayersStaging: getPrayers,
  getPrayerStaging: getPrayer,
  subscribeForNotificationsStaging: subscribeForNotifications,
};
