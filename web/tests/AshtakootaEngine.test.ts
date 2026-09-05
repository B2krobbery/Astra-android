import { AshtakootaEngine } from '../src/data/AshtakootaEngine.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ Assertion failed: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log('Testing AshtakootaEngine (Authentic 36 Guna Milan)...');

// 1. Varna Test:
// Boy Brahmin (Cancer, 4), Girl Kshatriya (Leo, 5) -> Boy >= Girl -> 1 pt
const varna1 = AshtakootaEngine.calculateVarna(4, 5);
assert(varna1.score === 1, `Boy Brahmin vs Girl Kshatriya should be 1 point, got ${varna1.score}`);

// Boy Shudra (Gemini, 3), Girl Brahmin (Cancer, 4) -> Boy < Girl -> 0 pt
const varna2 = AshtakootaEngine.calculateVarna(3, 4);
assert(varna2.score === 0, `Boy Shudra vs Girl Brahmin should be 0 points, got ${varna2.score}`);

// 2. Vashya Test:
// Same Vashya -> 2 pts
const vashya1 = AshtakootaEngine.calculateVashya(1, 2); // Both Chatushpada
assert(vashya1.score === 2, `Same Vashya should be 2 points, got ${vashya1.score}`);

// 3. Tara Test:
// Boy Bharani (2), Girl Ashwini (1): Girl to Boy = 2 (Sampat, 1.5), Boy to Girl = 27 -> 9 (Parama Mitra, 1.5) -> 3 pts
const tara1 = AshtakootaEngine.calculateTara(2, 1); // Ashwini (1) to Magha (10) -> (10-1)%9 = 0 -> 9 (Parama Mitra)
assert(tara1.score === 3, `Bharani and Ashwini Tara should be 3 points, got ${tara1.score}`);

// 4. Yoni Test:
// Same Yoni: Horse (Ashwini, 1) and Horse (Shatabhisha, 24) -> 4 pts
const yoni1 = AshtakootaEngine.calculateYoni(1, 24);
assert(yoni1.score === 4, `Same Yoni (Horse) should be 4 points, got ${yoni1.score}`);

// Sworn enemies: Horse (Ashwini, 1) vs Buffalo (Hasta, 14) -> 0 pts
const yoniEnemy = AshtakootaEngine.calculateYoni(1, 14);
assert(yoniEnemy.score === 0, `Sworn Enemy Yoni (Horse vs Buffalo) must be 0 points, got ${yoniEnemy.score}`);

// 5. Graha Maitri Test:
// Sun (Leo, 5) and Moon (Cancer, 4) -> Friends -> 5 pts
const maitri1 = AshtakootaEngine.calculateGrahaMaitri(5, 4);
assert(maitri1.score === 5, `Sun and Moon should be 5 points, got ${maitri1.score}`);

// Sun (Leo, 5) and Saturn (Capricorn, 10) -> Enemies -> 0 pts
const maitriEnemy = AshtakootaEngine.calculateGrahaMaitri(5, 10);
assert(maitriEnemy.score === 0, `Sun and Saturn enemies should be 0 points, got ${maitriEnemy.score}`);

// 6. Gana Test:
// Deva (Ashwini, 1) and Deva (Mrigashira, 5) -> 6 pts
const gana1 = AshtakootaEngine.calculateGana(1, 5);
assert(gana1.score === 6, `Deva-Deva should be 6 points, got ${gana1.score}`);

// Deva (1) and Rakshasa (Ashlesha, 9) -> 0 pts (Gana Dosha)
const ganaDosha = AshtakootaEngine.calculateGana(9, 1);
assert(ganaDosha.score <= 1, `Rakshasa vs Deva should be 0 or 1, got ${ganaDosha.score}`);

// 7. Bhakoot Test:
// 7/7 aspect: Aries (1) and Libra (7) -> 7 pts
const bhakoot1 = AshtakootaEngine.calculateBhakoot(1, 7);
assert(bhakoot1.score === 7, `7/7 Samasaptaka should be 7 points, got ${bhakoot1.score}`);

// 6/8 Shadashtak: Aries (1) and Virgo (6) -> 0 pts
const bhakootDosha = AshtakootaEngine.calculateBhakoot(1, 6);
assert(bhakootDosha.score === 0, `6/8 Shadashtak must be 0 points, got ${bhakootDosha.score}`);

// 8. Nadi Test:
// Ashwini (Aadi, 1) and Bharani (Madhya, 2) -> 8 pts
const nadi1 = AshtakootaEngine.calculateNadi(1, 2);
assert(nadi1.score === 8, `Different Nadi should be 8 points, got ${nadi1.score}`);

// Ashwini (Aadi, 1) and Ardra (Aadi, 6) -> 0 pts (Nadi Dosha)
const nadiDosha = AshtakootaEngine.calculateNadi(1, 6);
assert(nadiDosha.score === 0, `Same Nadi must be 0 points (Nadi Dosha), got ${nadiDosha.score}`);

// Full 36 Guna Milan Test
const match = AshtakootaEngine.match(
  { rashiIndex: 1, nakshatraIndex: 1, pada: 1 }, // Ashwini, Mesha
  { rashiIndex: 7, nakshatraIndex: 15, pada: 2 }  // Swati, Tula
);

console.log(`Total 36 Guna Score: ${match.totalScore}/36 (${match.percentage}%) - Verdict: ${match.verdict}`);
console.log(`Gunas: ${match.gunas.map(g => `${g.name}: ${g.score}/${g.max}`).join(', ')}`);
assert(match.totalScore > 0 && match.totalScore <= 36, 'Total score must be in range 1-36');
assert(match.gunas.length === 8, 'Must return all 8 Guna kootas');

console.log('🎉 All AshtakootaEngine authentic 36 Guna tests passed!');
