import { SwissEphemerisProvider, EphemerisResult } from './SwissEphemerisProvider';

export interface BirthDetails {
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm
  latitude: number;
  longitude: number;
}

export interface VedicPrimitives {
  moonLongitudeSidereal: number;
  nakshatraIndex: number; // 1 to 27
  pada: number; // 1 to 4
  rashiIndex: number; // 1 to 12
  nadiIndex: number; // 1 to 3
  
  // Manglik and full chart requires Ephemeris
  isManglik: boolean | 'BLOCKED_MISSING_EPHEMERIS';
  doshas: string[];
  ephemerisStatus: EphemerisResult['status'];
  methodology: string;
}

export const VedicAstrologyEngine = {
  calculateJulianDay(dateStr: string, timeStr: string): number {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    let Y = year;
    let M = month;
    if (M <= 2) { Y -= 1; M += 12; }
    const D = day + (hours / 24) + (minutes / 1440);
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
  },

  calculateMoonSiderealLongitude(jd: number): number {
    const T = (jd - 2451545.0) / 36525.0;
    let L_prime = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
    const M = 357.5291092 + 35999.0502909 * T;
    const M_prime = 134.9633964 + 477198.8675055 * T;
    const F = 93.2720950 + 483202.0175233 * T;
    L_prime += 6.289 * Math.sin(M_prime * Math.PI / 180);
    L_prime -= 1.274 * Math.sin((M_prime - 2 * F) * Math.PI / 180);
    L_prime += 0.658 * Math.sin(2 * F * Math.PI / 180);
    L_prime -= 0.186 * Math.sin(M * Math.PI / 180);
    L_prime = L_prime % 360;
    if (L_prime < 0) L_prime += 360;
    const ayanamsa = 23.85 + (T * 1.396);
    let sidereal = L_prime - ayanamsa;
    if (sidereal < 0) sidereal += 360;
    return sidereal;
  },

  async calculatePrimitives(details: BirthDetails): Promise<VedicPrimitives> {
    const ephemeris = await SwissEphemerisProvider.fetchPlanetaryPositions(details.dateOfBirth, details.timeOfBirth, details.latitude, details.longitude);
    
    // Moon fallback via Meeus
    const jd = this.calculateJulianDay(details.dateOfBirth, details.timeOfBirth);
    const siderealMoon = ephemeris.moon?.longitude || this.calculateMoonSiderealLongitude(jd);
    
    const NAKSHATRA_ARC = 360 / 27;
    const nakshatraIndex = Math.floor(siderealMoon / NAKSHATRA_ARC) + 1;
    const remainder = siderealMoon % NAKSHATRA_ARC;
    const pada = Math.floor(remainder / (NAKSHATRA_ARC / 4)) + 1;
    const rashiIndex = Math.floor(siderealMoon / 30) + 1;
    
    const nadiPattern = [1,2,3,3,2,1,1,2,3];
    const nadiIndex = nadiPattern[(nakshatraIndex - 1) % 9];
    
    let isManglik: boolean | 'BLOCKED_MISSING_EPHEMERIS' = 'BLOCKED_MISSING_EPHEMERIS';
    const doshas: string[] = [];

    if (ephemeris.status === 'SUCCESS' && ephemeris.mars && ephemeris.ascendant) {
        const marsRashi = Math.floor(ephemeris.mars.longitude / 30) + 1;
        const rashiAsc = Math.floor(ephemeris.ascendant / 30) + 1;
        let housesFromAsc = (marsRashi - rashiAsc + 1);
        if (housesFromAsc <= 0) housesFromAsc += 12;
        isManglik = [1, 4, 7, 8, 12].includes(housesFromAsc);
        if (isManglik) doshas.push("Manglik Dosha");
    }

    return {
      moonLongitudeSidereal: siderealMoon,
      nakshatraIndex,
      pada,
      rashiIndex,
      nadiIndex,
      isManglik,
      doshas,
      ephemerisStatus: ephemeris.status,
      methodology: ephemeris.status === 'SUCCESS' ? ephemeris.methodology : 'Meeus Algorithm (Lunar Only)'
    };
  }
};
