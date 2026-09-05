import { VedicAstrologyEngine, VEDIC_RASHIS, VEDIC_NAKSHATRAS } from '../src/data/VedicAstrologyEngine.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ Assertion failed: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log('Testing VedicAstrologyEngine (Ephemeris Pipeline)...');

// Test 1: Known chart in New Delhi
// 15 May 1995 at 14:30 IST
const chart1 = VedicAstrologyEngine.calculateChart({
  dateOfBirth: '1995-05-15',
  timeOfBirth: '14:30',
  latitude: 28.6139,
  longitude: 77.2090,
  timezoneOffsetMinutes: 330
});

console.log(`Ascendant: ${chart1.ascendant.rashiName} (${chart1.ascendant.siderealLongitude.toFixed(2)}°) Nakshatra: ${chart1.ascendant.nakshatraName}`);
console.log(`Moon: ${chart1.moon.rashiName} (${chart1.moon.siderealLongitude.toFixed(2)}°) Nakshatra: ${chart1.moon.nakshatraName} Pada: ${chart1.moon.pada}`);
console.log(`Sun: ${chart1.sun.rashiName} (${chart1.sun.siderealLongitude.toFixed(2)}°)`);
console.log(`Mars: ${chart1.mars.rashiName} (${chart1.mars.siderealLongitude.toFixed(2)}°) House: ${chart1.mars.houseFromLagna}`);
console.log(`Ayanamsa: ${chart1.ayanamsa.toFixed(4)}°`);
console.log(`Is Manglik: ${chart1.isManglik}, Severity: ${chart1.manglikSeverity}, Houses: ${chart1.manglikHouses.join(', ')}`);

assert(chart1.ayanamsa > 23.7 && chart1.ayanamsa < 23.9, `Ayanamsa should be ~23.79°, got ${chart1.ayanamsa}`);
assert(chart1.moon.nakshatraIndex >= 1 && chart1.moon.nakshatraIndex <= 27, 'Moon nakshatra must be between 1 and 27');
assert(chart1.moon.pada >= 1 && chart1.moon.pada <= 4, 'Moon pada must be between 1 and 4');
assert(chart1.nadiIndex >= 1 && chart1.nadiIndex <= 3, 'Nadi must be 1, 2, or 3');
assert(chart1.planets['Jupiter'] !== undefined, 'Jupiter must be present');
assert(chart1.planets['Saturn'] !== undefined, 'Saturn must be present');
assert(chart1.planets['Rahu'] !== undefined, 'Rahu must be present');
assert(chart1.planets['Ketu'] !== undefined, 'Ketu must be present');

// Test 2: Verify consistency (Same inputs produce exact same outputs)
const chart2 = VedicAstrologyEngine.calculateChart({
  dateOfBirth: '1995-05-15',
  timeOfBirth: '14:30',
  latitude: 28.6139,
  longitude: 77.2090,
  timezoneOffsetMinutes: 330
});

assert(chart1.moon.siderealLongitude === chart2.moon.siderealLongitude, 'Determinism check: Moon coordinates must match identically');
assert(chart1.mars.siderealLongitude === chart2.mars.siderealLongitude, 'Determinism check: Mars coordinates must match identically');
assert(chart1.ascendant.siderealLongitude === chart2.ascendant.siderealLongitude, 'Determinism check: Ascendant must match identically');

console.log('🎉 All VedicAstrologyEngine ephemeris tests passed!');
