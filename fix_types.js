const fs = require('fs');
let file = fs.readFileSync('web/src/types/index.ts', 'utf8');

if (!file.includes('detailedGunas')) {
    file = file.replace('gunaScore?: string;', 'gunaScore?: string;\n  detailedGunas?: GunaScore[];');
}

fs.writeFileSync('web/src/types/index.ts', file);
