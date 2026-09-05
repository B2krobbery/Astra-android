import { calculateMarriageReadiness, MARRIAGE_REQUIRED_FIELDS } from '../src/utils/profileReadiness.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ ${msg}`);
  }
}

console.log('Testing Marriage Profile Readiness Engine...');

// Test 1: Empty Profile (0%)
const emptyResult = calculateMarriageReadiness({});
assert(emptyResult.percentage === 0, `Empty profile percentage should be 0, got ${emptyResult.percentage}`);
assert(!emptyResult.isComplete, 'Empty profile should not be complete');
assert(emptyResult.missingFields.length === MARRIAGE_REQUIRED_FIELDS.length, 'All fields should be missing');

// Test 2: Partially Completed Profile (~30%)
const partialProfile = {
  name: 'Rahul Sharma',
  gender: 'Male',
  dateOfBirth: '1995-05-15',
  height: "5'10\"",
  bloodGroup: 'B+',
  location: 'Bangalore',
  nativeLocation: 'Delhi',
  motherTongue: 'Hindi'
};
const partialResult = calculateMarriageReadiness(partialProfile);
assert(partialResult.completedCount === 8, `Partial profile should have 8 completed fields, got ${partialResult.completedCount}`);
assert(partialResult.percentage > 25 && partialResult.percentage < 40, `Partial percentage should be ~30%, got ${partialResult.percentage}%`);
assert(!partialResult.isComplete, 'Partial profile should not be complete');
assert(partialResult.missingFields.includes('Religion'), 'Missing fields should include Religion');
assert(partialResult.missingFields.includes('Profile Photo'), 'Missing fields should include Profile Photo');

// Test 3: Nearly Complete Profile (Missing only photo and gotra)
const nearlyComplete = {
  ...partialProfile,
  religion: 'Hindu',
  caste: 'Brahmin',
  subCaste: 'Saraswat',
  region: 'North India',
  state: 'Karnataka',
  cityDistrict: 'Bangalore Urban',
  // gotra missing
  education10th: 'CBSE 92%',
  education12th: 'CBSE 90%',
  higherEducation: 'B.Tech Computer Science',
  profession: 'Software Architect',
  employer: 'Tech Corp',
  annualIncome: '₹35 LPA',
  healthStatus: 'Excellent, non-smoker',
  diet: 'Vegetarian',
  maritalStatus: 'Never Married',
  birthTime: '14:30',
  birthLocation: 'New Delhi'
  // photo missing
};
const nearResult = calculateMarriageReadiness(nearlyComplete);
assert(!nearResult.isComplete, 'Nearly complete profile should NOT be complete');
assert(nearResult.percentage >= 90 && nearResult.percentage < 100, `Percentage should be ~93%, got ${nearResult.percentage}%`);
assert(nearResult.missingFields.includes('Gotra'), 'Should accurately identify Gotra as missing');
assert(nearResult.missingFields.includes('Profile Photo'), 'Should accurately identify Profile Photo as missing');

// Test 4: Fully Complete Profile (100%)
const fullyComplete = {
  ...nearlyComplete,
  gotra: 'Vatsa',
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
};
const fullResult = calculateMarriageReadiness(fullyComplete);
assert(fullResult.percentage === 100, `Fully complete profile should be 100%, got ${fullResult.percentage}%`);
assert(fullResult.isComplete, 'Fully complete profile MUST be complete');
assert(fullResult.missingFields.length === 0, 'Missing fields must be empty');

console.log('🎉 All Profile Readiness unit tests passed successfully!');
