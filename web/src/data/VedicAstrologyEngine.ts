import * as Astronomy from 'astronomy-engine';

export interface BirthDetails {
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm
  latitude: number;
  longitude: number;
  timezoneOffsetMinutes?: number; // e.g. +330 for IST (+5:30)
}

export interface PlanetaryPosition {
  name: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  rashiIndex: number; // 1 to 12
  rashiName: string;
  nakshatraIndex: number; // 1 to 27
  nakshatraName: string;
  pada: number; // 1 to 4
  degreeInSign: number;
  houseFromLagna: number;
  isRetrograde?: boolean;
}

export interface VedicChart {
  julianDay: number;
  ayanamsa: number; // Lahiri Ayanamsa in degrees
  ascendant: PlanetaryPosition;
  planets: Record<string, PlanetaryPosition>;
  moon: PlanetaryPosition;
  sun: PlanetaryPosition;
  mars: PlanetaryPosition;
  mercury: PlanetaryPosition;
  jupiter: PlanetaryPosition;
  venus: PlanetaryPosition;
  saturn: PlanetaryPosition;
  rahu: PlanetaryPosition;
  ketu: PlanetaryPosition;
  nakshatraIndex: number;
  nakshatraName: string;
  pada: number;
  rashiIndex: number;
  rashiName: string;
  nadiIndex: number; // 1: Aadi, 2: Madhya, 3: Antya
  nadiName: string;
  isManglik: boolean;
  manglikSeverity: 'None' | 'Low' | 'High';
  manglikHouses: number[];
  doshas: string[];
  remedies: string[];
  methodology: string;
}

export const VEDIC_RASHIS = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

export const VEDIC_NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

export const NADI_NAMES = ['Aadi (Vata)', 'Madhya (Pitta)', 'Antya (Kapha)'];

// 1: Aadi, 2: Madhya, 3: Antya
export const NAKSHATRA_NADI_MAP: number[] = [
  1, 2, 3, 3, 2, 1, 1, 2, 3, // 1 Ashwini to 9 Ashlesha
  3, 2, 1, 1, 2, 3, 3, 2, 1, // 10 Magha to 18 Jyeshtha
  1, 2, 3, 3, 2, 1, 1, 2, 3  // 19 Mula to 27 Revati
];

export class VedicAstrologyEngine {
  /**
   * Calculates high-precision Lahiri (Chitrapaksha) Ayanamsa for an astronomical time
   */
  static calculateLahiriAyanamsa(astroTime: Astronomy.AstroTime): number {
    // Days since J2000.0
    const T = astroTime.tt / 36525.0;
    // Lahiri Ayanamsa at J2000.0 is 23° 51' 25.53" = 23.857092°
    // Precession rate: 50.290966" / year = 1.396971° / century
    const ayanamsa = 23.857092 + 1.396971 * T - 0.000308 * T * T;
    return ayanamsa;
  }

  /**
   * Constructs an AstroTime instance handling exact local time and timezone offset
   */
  static parseAstroTime(dateStr: string, timeStr: string, timezoneOffsetMinutes = 330): Astronomy.AstroTime {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = (timeStr || '12:00').split(':').map(Number);

    // Convert local time to UTC
    const localUtcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    const utcMillis = localUtcDate.getTime() - timezoneOffsetMinutes * 60 * 1000;
    const utcDate = new Date(utcMillis);

    return Astronomy.MakeTime(utcDate);
  }

  /**
   * Calculates Sidereal Ascendant (Lagna)
   */
  static calculateAscendant(
    astroTime: Astronomy.AstroTime,
    latitude: number,
    longitude: number,
    ayanamsa: number
  ): number {
    const gstHours = Astronomy.SiderealTime(astroTime);
    // Right Ascension of Midheaven in degrees
    const ramc = ((gstHours * 15 + longitude) % 360 + 360) % 360;

    // Obliquity of the Ecliptic
    const eTilt = Astronomy.e_tilt(astroTime);
    const epsDeg = eTilt.tobl;

    const rad = Math.PI / 180;
    const theta = ramc * rad;
    const phi = latitude * rad;
    const eps = epsDeg * rad;

    const y = Math.cos(theta);
    const x = -(Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps));

    let ascTropical = Math.atan2(y, x) / rad;
    if (ascTropical < 0) ascTropical += 360;

    // Convert Tropical to Sidereal (Lahiri)
    let ascSidereal = (ascTropical - ayanamsa + 360) % 360;
    return ascSidereal;
  }

  /**
   * Calculates complete Vedic Planetary Chart
   */
  static calculateChart(details: BirthDetails): VedicChart {
    const tz = details.timezoneOffsetMinutes ?? 330; // default Indian Standard Time (UTC+5:30)
    const astroTime = this.parseAstroTime(details.dateOfBirth, details.timeOfBirth, tz);
    const ayanamsa = this.calculateLahiriAyanamsa(astroTime);

    // Calculate Sidereal Ascendant
    const ascSidereal = this.calculateAscendant(astroTime, details.latitude, details.longitude, ayanamsa);
    const lagnaRashiIndex = Math.floor(ascSidereal / 30) + 1;
    const ascNakArc = 360 / 27;
    const ascNakIndex = Math.floor(ascSidereal / ascNakArc) + 1;
    const ascPada = Math.floor((ascSidereal % ascNakArc) / (ascNakArc / 4)) + 1;

    const ascendantPos: PlanetaryPosition = {
      name: 'Ascendant (Lagna)',
      tropicalLongitude: (ascSidereal + ayanamsa) % 360,
      siderealLongitude: ascSidereal,
      rashiIndex: lagnaRashiIndex,
      rashiName: VEDIC_RASHIS[lagnaRashiIndex - 1],
      nakshatraIndex: ascNakIndex,
      nakshatraName: VEDIC_NAKSHATRAS[ascNakIndex - 1],
      pada: ascPada,
      degreeInSign: ascSidereal % 30,
      houseFromLagna: 1
    };

    // Calculate 7 Physical Planets
    const planetBodies: { name: string; body: Astronomy.Body }[] = [
      { name: 'Sun', body: Astronomy.Body.Sun },
      { name: 'Moon', body: Astronomy.Body.Moon },
      { name: 'Mars', body: Astronomy.Body.Mars },
      { name: 'Mercury', body: Astronomy.Body.Mercury },
      { name: 'Jupiter', body: Astronomy.Body.Jupiter },
      { name: 'Venus', body: Astronomy.Body.Venus },
      { name: 'Saturn', body: Astronomy.Body.Saturn }
    ];

    const planets: Record<string, PlanetaryPosition> = {};

    for (const p of planetBodies) {
      const geo = Astronomy.GeoVector(p.body, astroTime, true);
      const ecl = Astronomy.Ecliptic(geo);
      const tropLong = ((ecl.elon % 360) + 360) % 360;
      const sidLong = ((tropLong - ayanamsa) % 360 + 360) % 360;

      const rashiIdx = Math.floor(sidLong / 30) + 1;
      const nakIdx = Math.floor(sidLong / ascNakArc) + 1;
      const pada = Math.floor((sidLong % ascNakArc) / (ascNakArc / 4)) + 1;
      const house = ((rashiIdx - lagnaRashiIndex + 12) % 12) + 1;

      planets[p.name] = {
        name: p.name,
        tropicalLongitude: tropLong,
        siderealLongitude: sidLong,
        rashiIndex: rashiIdx,
        rashiName: VEDIC_RASHIS[rashiIdx - 1],
        nakshatraIndex: nakIdx,
        nakshatraName: VEDIC_NAKSHATRAS[nakIdx - 1],
        pada,
        degreeInSign: sidLong % 30,
        houseFromLagna: house
      };
    }

    // Calculate Lunar Nodes (Rahu and Ketu)
    // Mean Lunar Node calculation (Meeus astronomical formula)
    const T = astroTime.tt / 36525.0;
    let nodeLongitude = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
    nodeLongitude = ((nodeLongitude % 360) + 360) % 360;

    const rahuSidereal = ((nodeLongitude - ayanamsa) % 360 + 360) % 360;
    const ketuSidereal = (rahuSidereal + 180) % 360;

    const rahuRashi = Math.floor(rahuSidereal / 30) + 1;
    const rahuNak = Math.floor(rahuSidereal / ascNakArc) + 1;
    const rahuHouse = ((rahuRashi - lagnaRashiIndex + 12) % 12) + 1;

    const ketuRashi = Math.floor(ketuSidereal / 30) + 1;
    const ketuNak = Math.floor(ketuSidereal / ascNakArc) + 1;
    const ketuHouse = ((ketuRashi - lagnaRashiIndex + 12) % 12) + 1;

    planets['Rahu'] = {
      name: 'Rahu',
      tropicalLongitude: nodeLongitude,
      siderealLongitude: rahuSidereal,
      rashiIndex: rahuRashi,
      rashiName: VEDIC_RASHIS[rahuRashi - 1],
      nakshatraIndex: rahuNak,
      nakshatraName: VEDIC_NAKSHATRAS[rahuNak - 1],
      pada: Math.floor((rahuSidereal % ascNakArc) / (ascNakArc / 4)) + 1,
      degreeInSign: rahuSidereal % 30,
      houseFromLagna: rahuHouse
    };

    planets['Ketu'] = {
      name: 'Ketu',
      tropicalLongitude: (nodeLongitude + 180) % 360,
      siderealLongitude: ketuSidereal,
      rashiIndex: ketuRashi,
      rashiName: VEDIC_RASHIS[ketuRashi - 1],
      nakshatraIndex: ketuNak,
      nakshatraName: VEDIC_NAKSHATRAS[ketuNak - 1],
      pada: Math.floor((ketuSidereal % ascNakArc) / (ascNakArc / 4)) + 1,
      degreeInSign: ketuSidereal % 30,
      houseFromLagna: ketuHouse
    };

    // Moon details
    const moon = planets['Moon'];
    const mars = planets['Mars'];

    const nadiIndex = NAKSHATRA_NADI_MAP[moon.nakshatraIndex - 1];

    // Manglik Dosha Calculation (Kuja Dosha)
    // Mars in houses 1, 2, 4, 7, 8, 12 from Lagna or Moon
    const marsHouseFromLagna = mars.houseFromLagna;
    const marsHouseFromMoon = ((mars.rashiIndex - moon.rashiIndex + 12) % 12) + 1;

    const manglikHousesToCheck = [1, 2, 4, 7, 8, 12];
    const isManglikFromLagna = manglikHousesToCheck.includes(marsHouseFromLagna);
    const isManglikFromMoon = manglikHousesToCheck.includes(marsHouseFromMoon);

    const isManglik = isManglikFromLagna || isManglikFromMoon;
    const manglikHouses: number[] = [];
    if (isManglikFromLagna) manglikHouses.push(marsHouseFromLagna);
    if (isManglikFromMoon && !manglikHouses.includes(marsHouseFromMoon)) manglikHouses.push(marsHouseFromMoon);

    // Standard Vedic Cancellation checks:
    // Mars in Aries in 1st, Mars in Scorpio in 4th, Mars in Capricorn in 7th, Mars in Leo in 8th, Mars in Sagittarius in 12th
    let isCancelled = false;
    if (mars.rashiIndex === 1 && marsHouseFromLagna === 1) isCancelled = true;
    if (mars.rashiIndex === 8 && marsHouseFromLagna === 4) isCancelled = true;
    if (mars.rashiIndex === 10 && marsHouseFromLagna === 7) isCancelled = true;
    if (mars.rashiIndex === 5 && marsHouseFromLagna === 8) isCancelled = true;
    if (mars.rashiIndex === 9 && marsHouseFromLagna === 12) isCancelled = true;

    let manglikSeverity: 'None' | 'Low' | 'High' = 'None';
    if (isManglik) {
      if (isCancelled) {
        manglikSeverity = 'Low';
      } else if (isManglikFromLagna && isManglikFromMoon) {
        manglikSeverity = 'High';
      } else {
        manglikSeverity = 'Low';
      }
    }

    const doshas: string[] = [];
    const remedies: string[] = [];

    if (isManglik && !isCancelled) {
      doshas.push(`Kuja/Manglik Dosha (Mars placed in House ${manglikHouses.join(', ')})`);
      remedies.push('Kumbh Vivah ceremony or Hanuman Chalisa recitation');
      remedies.push('Partner with matching Manglik placement balances the energy naturally');
    } else if (isManglik && isCancelled) {
      doshas.push(`Anshik (Cancelled) Manglik Dosha (Mars in own/friendly sign)`);
      remedies.push('Minor mitigation: Light a ghee lamp on Tuesdays');
    }

    // Rahu in 7th House check
    if (planets['Rahu'].houseFromLagna === 7) {
      doshas.push('Rahu in 7th House (Kalathra Dosha factor)');
      remedies.push('Rahu-Ketu Shanti Puja or chanting Maha Mrityunjaya Mantra');
    }

    return {
      julianDay: astroTime.tt + 2451545.0,
      ayanamsa,
      ascendant: ascendantPos,
      planets,
      moon,
      sun: planets['Sun'],
      mars,
      mercury: planets['Mercury'],
      jupiter: planets['Jupiter'],
      venus: planets['Venus'],
      saturn: planets['Saturn'],
      rahu: planets['Rahu'],
      ketu: planets['Ketu'],
      nakshatraIndex: moon.nakshatraIndex,
      nakshatraName: moon.nakshatraName,
      pada: moon.pada,
      rashiIndex: moon.rashiIndex,
      rashiName: moon.rashiName,
      nadiIndex,
      nadiName: NADI_NAMES[nadiIndex - 1],
      isManglik: isManglik && !isCancelled,
      manglikSeverity,
      manglikHouses,
      doshas,
      remedies,
      methodology: 'High-Precision Astronomy Engine (VSOP87 / Lahiri Ayanamsa)'
    };
  }
}
