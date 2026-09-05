const fs = require('fs');
let file = fs.readFileSync('web/src/services/discovery.ts', 'utf8');
const oldText = `        if (signedUrls) {
          signedUrls.forEach(su => {
            if (su.signedUrl) signedUrlsMap[su.path] = su.signedUrl;
          });
        }`;
const newText = `        if (signedUrls) {
          signedUrls.forEach(su => {
            if (su.path && su.signedUrl) signedUrlsMap[su.path] = su.signedUrl;
          });
        }`;
file = file.replace(oldText, newText);
fs.writeFileSync('web/src/services/discovery.ts', file);
