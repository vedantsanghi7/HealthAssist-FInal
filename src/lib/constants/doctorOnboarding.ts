// Speciality categories with sub-specialties (from specialities.md)
export const SPECIALITY_CATEGORIES = [
  {
    category: 'General Medicine',
    specialties: ['General Physician', 'Family Medicine', 'Internal Medicine'],
  },
  {
    category: 'Medical Specialties (Non-Surgical)',
    specialties: [
      'Cardiology',
      'Endocrinology',
      'Gastroenterology',
      'Nephrology',
      'Neurology',
      'Oncology',
      'Rheumatology',
      'Pulmonology (Chest Medicine)',
      'Infectious Diseases',
      'Geriatrics',
    ],
  },
  {
    category: 'Surgical Specialties',
    specialties: [
      'General Surgery',
      'Cardiothoracic Surgery',
      'Neurosurgery',
      'Plastic & Reconstructive Surgery',
      'Vascular Surgery',
      'Gastrointestinal Surgery',
      'Urology',
      'Transplant Surgery',
    ],
  },
  {
    category: 'Women & Child Care',
    specialties: [
      'Obstetrics & Gynecology (OB-GYN)',
      'Pediatrics',
      'Neonatology',
      'Pediatric Cardiology',
      'Pediatric Neurology',
    ],
  },
  {
    category: 'Dermatology & Aesthetics',
    specialties: [
      'Dermatology',
      'Cosmetology',
      'Trichology (Hair Specialist)',
      'Aesthetic Medicine',
    ],
  },
  {
    category: 'ENT & Eye Care',
    specialties: [
      'Ophthalmology',
      'ENT (Ear, Nose, Throat)',
      'Audiology',
      'Speech Therapy',
    ],
  },
  {
    category: 'Orthopedics & Rehabilitation',
    specialties: [
      'Orthopedics',
      'Physiotherapy',
      'Sports Medicine',
      'Chiropractic',
      'Rehabilitation Medicine',
    ],
  },
  {
    category: 'Mental Health',
    specialties: [
      'Psychiatry',
      'Psychology',
      'Clinical Psychology',
      'Counseling / Therapy',
    ],
  },
  {
    category: 'Dental Care',
    specialties: [
      'General Dentistry',
      'Orthodontics',
      'Prosthodontics',
      'Endodontics',
      'Periodontics',
      'Oral & Maxillofacial Surgery',
      'Pedodontics (Pediatric Dentistry)',
    ],
  },
  {
    category: 'Diagnostics & Imaging',
    specialties: [
      'Pathology',
      'Radiology',
      'Nuclear Medicine',
      'Microbiology',
      'Biochemistry',
    ],
  },
  {
    category: 'Emergency & Critical Care',
    specialties: ['Emergency Medicine', 'Critical Care Medicine', 'Trauma Care'],
  },
  {
    category: 'Alternative Medicine',
    specialties: [
      'Ayurveda',
      'Homeopathy',
      'Unani',
      'Siddha',
      'Naturopathy',
      'Yoga & Wellness',
    ],
  },
];

// Medical councils in India
export const MEDICAL_COUNCILS = [
  'National Medical Commission (NMC)',
  'Andhra Pradesh Medical Council',
  'Arunachal Pradesh Medical Council',
  'Assam Medical Council',
  'Bihar Medical Council',
  'Chhattisgarh Medical Council',
  'Delhi Medical Council',
  'Goa Medical Council',
  'Gujarat Medical Council',
  'Haryana Medical Council',
  'Himachal Pradesh Medical Council',
  'Jammu & Kashmir Medical Council',
  'Jharkhand Medical Council',
  'Karnataka Medical Council',
  'Kerala Medical Council',
  'Madhya Pradesh Medical Council',
  'Maharashtra Medical Council',
  'Manipur Medical Council',
  'Meghalaya Medical Council',
  'Mizoram Medical Council',
  'Nagaland Medical Council',
  'Odisha Medical Council',
  'Punjab Medical Council',
  'Rajasthan Medical Council',
  'Sikkim Medical Council',
  'Tamil Nadu Medical Council',
  'Telangana State Medical Council',
  'Tripura Medical Council',
  'Uttar Pradesh Medical Council',
  'Uttarakhand Medical Council',
  'West Bengal Medical Council',
  'Dental Council of India',
  'Central Council of Homoeopathy',
  'Central Council of Indian Medicine',
];

// Common medical degrees
export const MEDICAL_DEGREES = [
  'MBBS',
  'MD',
  'MS',
  'BDS',
  'MDS',
  'BAMS',
  'BHMS',
  'BUMS',
  'BPT',
  'MPT',
  'DNB',
  'DM',
  'MCh',
  'FRCS',
  'MRCP',
  'PhD (Medical)',
];

// Common Indian languages
export const LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Urdu',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Odia',
  'Punjabi',
  'Assamese',
  'Maithili',
  'Sanskrit',
  'Konkani',
  'Nepali',
  'Manipuri',
  'Sindhi',
  'Kashmiri',
];

// Days of the week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Onboarding step metadata
export const ONBOARDING_STEPS = [
  { number: 1, label: 'Personal Info', description: 'Basic details about you' },
  { number: 2, label: 'Education', description: 'Qualifications & registration' },
  { number: 3, label: 'Practice', description: 'Experience & clinic details' },
  { number: 4, label: 'Availability', description: 'Schedule & consultation mode' },
];
