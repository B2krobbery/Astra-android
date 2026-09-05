const fs = require('fs');
let file = 'web/src/types/index.ts';
let content = fs.readFileSync(file, 'utf8');

// Add chemistry fields to AstrologyCompatibility
content = content.replace(
  "emotionalScore: number;",
  "emotionalScore: number;\n  intellectualScore: number;\n  physicalScore: number;\n  spiritualScore: number;"
);
fs.writeFileSync(file, content);

file = 'web/src/data/astrologyEngine.ts';
content = fs.readFileSync(file, 'utf8');

content = "import { ChemistryEngine } from './ChemistryEngine';\n" + content;
content = content.replace(
  "emotionalScore: Math.round(overall),",
  "emotionalScore: ChemistryEngine.calculateChemistry(matchResult, 50).emotionalScore,\n      intellectualScore: ChemistryEngine.calculateChemistry(matchResult, 50).intellectualScore,\n      physicalScore: ChemistryEngine.calculateChemistry(matchResult, 50).physicalScore,\n      spiritualScore: ChemistryEngine.calculateChemistry(matchResult, 50).spiritualScore,"
);

fs.writeFileSync(file, content);
