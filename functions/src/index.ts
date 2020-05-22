import { processAncilla } from './process-ancilla';
import { getAncillas } from './get-ancillas';
import { getAncilla } from './get-ancilla';
import { getSongs } from './get-songs';
import { getSong } from './get-song';
import { getPrayers } from './get-prayers';
import { getPrayer } from './get-prayer';
import { getBreviary } from './get-breviary';
import { subscribeForNotifications } from './subscribe-for-notifications';
import { getHolyMasses } from './get-holy-masses';
import { getFraternities } from './get-fraternities';
import { getHolyMassesSeats } from './get-holy-masses-seats';
import { handleHolyMassBooking } from './handle-holy-mass-booking';

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
  getHolyMasses,
  getFraternities,
  getHolyMassesSeats,
  handleHolyMassBooking,
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
  getHolyMasses,
  getFraternities,
  getHolyMassesSeats,
  handleHolyMassBooking,
};
