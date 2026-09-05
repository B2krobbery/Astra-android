import { ChemistryEngine, type ChemistryAnswers } from '../src/data/ChemistryEngine.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ Assertion failed: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log('Testing ChemistryEngine...');

// Profile A:
const userA: ChemistryAnswers = {
  sports: ['Cricket', 'Badminton', 'Running'],
  movies: ['Interstellar', '3 Idiots', 'Lagaan'],
  music: ['A.R. Rahman', 'Indian Classical', 'Coke Studio'],
  hobbies: ['Reading', 'Hiking', 'Cooking'],
  travelStyle: 'Nature & Mountains',
  weekendHabits: 'Exploring Cafes & Outdoors',
  personalityTraits: ['Calm & Thoughtful', 'Organized & Ambitious'],
  whatTheyLove: ['Family Traditions', 'Reading & Lifelong Learning'],
  partnerExpectations: ['Emotional Maturity', 'Shared Cultural Values', 'Supportive of Career'],
  diet: 'Vegetarian'
};

// Profile B (High Match):
const userB: ChemistryAnswers = {
  sports: ['Cricket', 'Tennis', 'Badminton'],
  movies: ['Interstellar', 'Swades', 'Inception'],
  music: ['A.R. Rahman', 'Acoustic Pop', 'Coke Studio'],
  hobbies: ['Hiking', 'Photography', 'Gardening'],
  travelStyle: 'Nature & Mountains',
  weekendHabits: 'Exploring Cafes & Outdoors',
  personalityTraits: ['Calm & Thoughtful', 'Empathetic & Creative'],
  whatTheyLove: ['Family Traditions', 'Pet Animals'],
  partnerExpectations: ['Emotional Maturity', 'Supportive of Career', 'Sense of Humor'],
  diet: 'Vegetarian'
};

// Profile C (Low / Contrasting Match):
const userC: ChemistryAnswers = {
  sports: ['Formula 1', 'Golf'],
  movies: ['The Godfather', 'Pulp Fiction'],
  music: ['Heavy Metal', 'Electronic Dance Music'],
  hobbies: ['Video Games', 'Clubbing'],
  travelStyle: 'Luxury',
  weekendHabits: 'Socializing with Friends & Family',
  personalityTraits: ['Energetic & Spontaneous'],
  whatTheyLove: ['Independent Thinking'],
  partnerExpectations: ['Sense of Humor'],
  diet: 'Non-Vegetarian'
};

const highMatch = ChemistryEngine.computeChemistry(userA, userB);
console.log(`High Match Score: ${highMatch.overallScore}%`);
console.log(`Shared Tags: ${highMatch.sharedTags.join(', ')}`);

assert(highMatch.overallScore >= 75, `High match score should be >= 75%, got ${highMatch.overallScore}%`);
assert(highMatch.sharedTags.some(t => t.toLowerCase().includes('cricket')), 'Must detect shared Cricket interest');
assert(highMatch.sharedTags.some(t => t.toLowerCase().includes('rahman')), 'Must detect shared A.R. Rahman interest');
assert(highMatch.sharedTags.some(t => t.toLowerCase().includes('vegetarian')), 'Must detect shared Vegetarian diet');

const lowMatch = ChemistryEngine.computeChemistry(userA, userC);
console.log(`Low Match Score: ${lowMatch.overallScore}%`);
assert(lowMatch.overallScore < highMatch.overallScore, 'Low match score must be strictly less than high match score');
assert(lowMatch.sharedInterestsScore <= 55, `Contrasting interests score should be <= 55, got ${lowMatch.sharedInterestsScore}`);

console.log('🎉 All ChemistryEngine unit tests passed!');
