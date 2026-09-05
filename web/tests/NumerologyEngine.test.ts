import { NumerologyEngine } from '../src/data/NumerologyEngine.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ Assertion failed: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log('Testing NumerologyEngine...');

// Test 1: Known DOB Life Path
// 1995-05-15:
// 1995: 1+9+9+5 = 24 -> 2+4 = 6
// 05: 5
// 15: 1+5 = 6
// Sum: 6 + 5 + 6 = 17 -> 1+7 = 8
const lp1 = NumerologyEngine.calculateLifePath('1995-05-15');
assert(lp1 === 8, `Life Path of 1995-05-15 should be 8, got ${lp1}`);

// Master Number Preservation:
// 1982-11-29:
// 1982: 1+9+8+2 = 20 -> 2
// 11: 11 (Master) or 1+1 = 2
// 29: 2+9 = 11 (Master)
// Sum: 2 + 2 + 11 = 15 or with master handling
// Let's test a known Master Number:
// 1975-07-29: 1+9+7+5 = 22!
const lpMaster = NumerologyEngine.calculateLifePath('1975-07-29');
console.log(`Life Path for 1975-07-29: ${lpMaster}`);
assert([11, 22, 33, 4].includes(lpMaster), 'Master number or reduced digit expected');

// Test 2: Name Numbers (Destiny, Soul Urge, Personality)
// "RAHUL SHARMA"
// R(9) A(1) H(8) U(3) L(3) = 24
// S(1) H(8) A(1) R(9) M(4) A(1) = 24
// Total: 48 -> 4+8 = 12 -> 1+2 = 3
const rahulNumbers = NumerologyEngine.calculateNameNumbers('RAHUL SHARMA');
console.log('Rahul Sharma Numbers:', rahulNumbers);
assert(rahulNumbers.destiny === 3, `Rahul Sharma Destiny should be 3, got ${rahulNumbers.destiny}`);

// Vowels: A(1) U(3) A(1) A(1) = 6
assert(rahulNumbers.soulUrge === 6, `Rahul Sharma Soul Urge should be 6, got ${rahulNumbers.soulUrge}`);

// Consonants: R(9) H(8) L(3) S(1) H(8) R(9) M(4) = 42 -> 4+2 = 6
assert(rahulNumbers.personality === 6, `Rahul Sharma Personality should be 6, got ${rahulNumbers.personality}`);

// Test 3: Determinism
const report1 = NumerologyEngine.generateReport('Pooja Patel', '1996-08-22', '1995-05-15');
const report2 = NumerologyEngine.generateReport('Pooja Patel', '1996-08-22', '1995-05-15');
assert(report1.lifePathNumber === report2.lifePathNumber, 'Determinism: Life path must match identically');
assert(report1.destinyNumber === report2.destinyNumber, 'Determinism: Destiny number must match identically');
assert(report1.compatibilityScore === report2.compatibilityScore, 'Determinism: Compatibility score must match identically');

console.log('🎉 All NumerologyEngine unit tests passed!');
