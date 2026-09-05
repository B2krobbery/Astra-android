const fs = require('fs');
let file = fs.readFileSync('web/src/context/AstraContext.tsx', 'utf8');

const oldAI = `const botResponse = AstrologyEngine.getAstroAiResponse(question, userProfile);`;
const newAI = `const botResponse = AstrologyEngine.getAstroAiResponse(question, userProfile, currentCandidate ? AstrologyEngine.calculateCompatibility(userProfile, currentCandidate) : undefined);`;

file = file.replace(oldAI, newAI);
fs.writeFileSync('web/src/context/AstraContext.tsx', file);
