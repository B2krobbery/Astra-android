export interface ReadinessResult {
  percentage: number;
  isComplete: boolean;
  completedCount: number;
  totalRequired: number;
  missingFields: string[];
  fieldStatus: Record<string, boolean>;
}

export interface ReadinessFieldDef {
  key: string;
  label: string;
  category: 'Basic' | 'Community' | 'Career' | 'Health' | 'Lifestyle' | 'Astrology' | 'Photos';
  getValue: (profile: any) => any;
}

export const MARRIAGE_REQUIRED_FIELDS: ReadinessFieldDef[] = [
  // Basic & Identity
  { key: 'name', label: 'Full Name', category: 'Basic', getValue: p => p.name || p.display_name },
  { key: 'gender', label: 'Gender', category: 'Basic', getValue: p => p.gender },
  { key: 'dateOfBirth', label: 'Date of Birth', category: 'Basic', getValue: p => p.dateOfBirth || p.date_of_birth },
  { key: 'height', label: 'Height', category: 'Basic', getValue: p => p.height },
  { key: 'bloodGroup', label: 'Blood Group', category: 'Basic', getValue: p => p.bloodGroup || p.blood_group },
  { key: 'location', label: 'Current City/Location', category: 'Basic', getValue: p => p.location },
  { key: 'nativeLocation', label: 'Native Location', category: 'Basic', getValue: p => p.nativeLocation || p.native_location },
  { key: 'motherTongue', label: 'Mother Tongue', category: 'Basic', getValue: p => p.motherTongue || p.mother_tongue },

  // Religion & Community
  { key: 'religion', label: 'Religion', category: 'Community', getValue: p => p.religion },
  { key: 'caste', label: 'Caste / Community', category: 'Community', getValue: p => p.caste },
  { key: 'subCaste', label: 'Sub-Caste', category: 'Community', getValue: p => p.subCaste || p.sub_caste },
  { key: 'region', label: 'Cultural Region', category: 'Community', getValue: p => p.region },
  { key: 'state', label: 'State', category: 'Community', getValue: p => p.state },
  { key: 'cityDistrict', label: 'City / District', category: 'Community', getValue: p => p.cityDistrict || p.city_district },
  { key: 'gotra', label: 'Gotra', category: 'Community', getValue: p => p.gotra },

  // Education & Career
  { key: 'education10th', label: '10th Standard Education', category: 'Career', getValue: p => p.education10th || p.education_10th },
  { key: 'education12th', label: '12th Standard Education', category: 'Career', getValue: p => p.education12th || p.education_12th },
  { key: 'higherEducation', label: 'Higher Education', category: 'Career', getValue: p => p.higherEducation || p.higher_education },
  { key: 'profession', label: 'Profession', category: 'Career', getValue: p => p.profession },
  { key: 'employer', label: 'Employer / Business', category: 'Career', getValue: p => p.employer },
  { key: 'annualIncome', label: 'Annual Income', category: 'Career', getValue: p => p.annualIncome || p.annual_income },

  // Health & Lifestyle
  { key: 'healthStatus', label: 'Health Status', category: 'Health', getValue: p => p.healthStatus || p.health_status },
  { key: 'diet', label: 'Dietary Preference', category: 'Lifestyle', getValue: p => p.diet },
  { key: 'maritalStatus', label: 'Marital Status', category: 'Lifestyle', getValue: p => p.maritalStatus || p.marital_status },

  // Astrology / Birth Inputs
  { key: 'birthTime', label: 'Exact Birth Time', category: 'Astrology', getValue: p => p.birthTime || p.birth_time },
  { key: 'birthLocation', label: 'Birth City / Place', category: 'Astrology', getValue: p => p.birthLocation || p.birth_location || p.birthCity },

  // Photos
  { key: 'photoUrl', label: 'Profile Photo', category: 'Photos', getValue: p => p.photoUrl || (p.photoUrls && p.photoUrls.length > 0 ? p.photoUrls[0] : null) }
];

export function calculateMarriageReadiness(profile: any, extraPhoto?: string | null): ReadinessResult {
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      completedCount: 0,
      totalRequired: MARRIAGE_REQUIRED_FIELDS.length,
      missingFields: MARRIAGE_REQUIRED_FIELDS.map(f => f.label),
      fieldStatus: {}
    };
  }

  const missingFields: string[] = [];
  const fieldStatus: Record<string, boolean> = {};
  let completedCount = 0;

  for (const field of MARRIAGE_REQUIRED_FIELDS) {
    let value = field.getValue(profile);
    if (field.key === 'photoUrl' && extraPhoto) {
      value = extraPhoto;
    }

    const isPopulated = (
      value !== undefined &&
      value !== null &&
      (typeof value === 'string' ? value.trim() !== '' : Boolean(value))
    );

    fieldStatus[field.key] = isPopulated;
    if (isPopulated) {
      completedCount++;
    } else {
      missingFields.push(field.label);
    }
  }

  const totalRequired = MARRIAGE_REQUIRED_FIELDS.length;
  const percentage = Math.round((completedCount / totalRequired) * 100);

  return {
    percentage,
    isComplete: completedCount === totalRequired,
    completedCount,
    totalRequired,
    missingFields,
    fieldStatus
  };
}

export const calculateProfileReadiness = calculateMarriageReadiness;
