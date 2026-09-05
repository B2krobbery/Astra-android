const candidates = [{"id":"44444444-4444-4444-4444-444444444444","name":"Rahul","intent":"Dating","gender":"Male","location":"Pune","regionalCategory":"ALL","education":"Pune University"},{"id":"804ebebb-7b92-4b18-955a-f5cb19913804","name":"visalvijay","intent":"Dating","gender":"Male","location":"","regionalCategory":"ALL","education":"Graduate"}];

const userProfile = {
  intent: "Dating",
  gender: "Female",
  regionalPreference: "ALL",
  partnerPreferences: {
    preferredEducation: "B.Tech",
    preferredLocation: "Bangalore, IN",
    preferredReligion: "Any",
    preferredCaste: "Any"
  }
};
const isPreferenceStrictFilterOn = false;

const filteredCandidates = candidates.filter((c) => {
    // Filter by Intent strictly
    if (userProfile.intent && c.intent && userProfile.intent !== c.intent) return false;

    // Strict Partner Preferences Check
    if (isPreferenceStrictFilterOn && userProfile.partnerPreferences) {
      const prefs = userProfile.partnerPreferences;
      
      if (userProfile.intent === 'Marriage') {
        if (prefs.preferredReligion && prefs.preferredReligion !== 'Any' && c.religion !== prefs.preferredReligion) return false;
        if (prefs.preferredCaste && prefs.preferredCaste !== 'Any' && c.caste !== prefs.preferredCaste) return false;
      } else {
        if (prefs.preferredEducation && prefs.preferredEducation !== 'Any' && !c.education.includes(prefs.preferredEducation)) return false;
        if (prefs.preferredLocation && prefs.preferredLocation !== 'Any' && c.location !== prefs.preferredLocation) return false;
      }
    }

    if (userProfile.gender === 'Male' && c.gender === 'Male') return false;
    if (userProfile.gender === 'Female' && c.gender === 'Female') return false;
    
    // Regional Prefs
    const userRegionalPref = userProfile.regionalPreference || 'ALL';
    if (userRegionalPref === 'ALL') return true;
    return c.regionalCategory === userRegionalPref;
  });

console.log(filteredCandidates);
