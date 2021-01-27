export interface Fraternity {
  id: string;
  location: string;
  masses: {
    sunday?: string[];
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    default?: string[];
    overrides?: Record<string, string[]>;
  };
}

export interface HolyMassBooking {
  id: string;
  fraternity: Fraternity;
  date: string;
  seats: number;
}
