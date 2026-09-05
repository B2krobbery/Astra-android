const fs = require('fs');
let file = fs.readFileSync('web/src/context/AstraContext.tsx', 'utf8');

const oldCompletion = `const calculateCompletion = (p: any, photo: string | undefined) => {
            let score = 0;
            if (p.display_name) score += 10;
            if (photo) score += 20;
            if (p.bio) score += 10;
            if (p.date_of_birth) score += 10;
            if (p.gender) score += 10;
            if (p.location) score += 10;
            if (p.profession) score += 10;
            if (p.education) score += 10;
            if (p.religion) score += 10;
            return Math.min(100, score);
          };`;

const newCompletion = `const calculateCompletion = (p: any, photo: string | undefined) => {
            let score = 0;
            let totalFields = 20;
            if (p.display_name) score++;
            if (p.gender) score++;
            if (p.date_of_birth) score++;
            if (p.location) score++;
            if (p.height) score++;
            if (p.blood_group) score++;
            if (p.mother_tongue) score++;
            if (p.religion) score++;
            if (p.caste) score++;
            if (p.education) score++;
            if (p.profession) score++;
            if (p.diet) score++;
            if (p.marital_status) score++;
            if (photo) score += 4; // Photo is heavily weighted
            if (p.bio) score++;
            if (p.nakshatra) score++;
            if (p.rashi) score++;
            
            return Math.min(100, Math.round((score / totalFields) * 100));
          };`;

file = file.replace(oldCompletion, newCompletion);
fs.writeFileSync('web/src/context/AstraContext.tsx', file);
