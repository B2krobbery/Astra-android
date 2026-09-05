const fs = require('fs');
const file_path = 'web/src/pages/MarriageOnboardingPage.tsx';
let file = fs.readFileSync(file_path, 'utf8');

const oldCompletion = `const calculateCompletion = () => {
    let completed = 0;
    const requiredFields = [
      name, gender, dateOfBirth, height, motherTongue, 
      religion, caste, higherEducation, profession, 
      diet, maritalStatus
    ];
    
    requiredFields.forEach(field => {
      if (field && field.trim() !== '') completed++;
    });
    
    return Math.round((completed / requiredFields.length) * 100);
  };`;

const newCompletion = `const calculateCompletion = () => {
    let completed = 0;
    const requiredFields = [
      name, gender, dateOfBirth, height, bloodGroup, motherTongue, location, birthLocation,
      religion, caste, higherEducation, profession, annualIncome,
      diet, maritalStatus, bio
    ];
    
    requiredFields.forEach(field => {
      if (field && String(field).trim() !== '') completed++;
    });
    
    return Math.round((completed / requiredFields.length) * 100);
  };`;

file = file.replace(oldCompletion, newCompletion);
fs.writeFileSync(file_path, file);
