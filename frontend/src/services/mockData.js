/**
 * Authentic Realistic Mock Dataset for AYURAI Platform
 * Compliant with Classical Ayurvedic Clinical Parameters (Charaka & Sushruta Samhita)
 */

export const QUEUE_STATUSES = {
  REGISTERED: 'Registered',
  CASE_TAKING: 'Case Taking',
  ASSESSMENT: 'Assessment',
  WAITING: 'Waiting',
  WITH_DOCTOR: 'With Doctor',
  COMPLETED: 'Completed',
  FOLLOW_UP: 'Follow-up'
};

export const QUEUE_PRIORITIES = {
  NORMAL: 'Normal',
  REVIEW_REQUIRED: 'Potential Red Flag — Review Required',
  VALIDATED: 'Priority Validated'
};

export const MOCK_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Vaidya Dr. K. Rajesh Sharma',
    qualification: 'BAMS, MD (Kayachikitsa - BHU)',
    specialty: 'Kayachikitsa & Metabolic Disorders',
    experience: '16 Years',
    roomNo: 'OPD-102',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    status: 'In Consultation',
    patientsServedToday: 18,
    averageTimePerPatient: '12 mins',
  },
  {
    id: 'doc-2',
    name: 'Vaidya Dr. Priya S. Nair',
    qualification: 'BAMS, MD (Panchakarma - Kerala)',
    specialty: 'Panchakarma & Chronic Rheumatology',
    experience: '12 Years',
    roomNo: 'OPD-104',
    avatar: 'https://images.unsplash.com/photo-1594824813596-78401306ef45?w=150&auto=format&fit=crop&q=80',
    status: 'Available',
    patientsServedToday: 14,
    averageTimePerPatient: '15 mins',
  },
  {
    id: 'doc-3',
    name: 'Vaidya Dr. Anand Deshmukh',
    qualification: 'BAMS, MS (Ayurveda)',
    specialty: 'Shalya Tantra & Gut Health',
    experience: '9 Years',
    roomNo: 'OPD-106',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    status: 'In Consultation',
    patientsServedToday: 11,
    averageTimePerPatient: '10 mins',
  }
];

export const MOCK_PATIENTS = [
  {
    id: 'pat-101',
    uhid: 'AYUR-2026-0891',
    name: 'Ananya S. Rao',
    dob: '1988-05-14',
    age: 38,
    gender: 'Female',
    phone: '+91 98450 12345',
    email: 'ananya.rao@example.com',
    address: 'No. 42, 4th Main Road, Indiranagar, Bengaluru - 560038',
    emergencyContact: '+91 98450 99887 (Srinivasa Rao - Spouse)',
    occupation: 'Senior Software Architect',
    preferredLanguage: 'ta',
    tokenNumber: 'A-024',
    tokenStatus: 'waiting', // Displayed as 'Waiting'
    queuePosition: 8, // Displayed as '08'
    estimatedWaitMins: 25, // Displayed as '~25 min'
    priority: 'Potential Red Flag — Review Required',
    registrationTime: '09:15 AM',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
    assignedDepartment: 'Kayachikitsa (Internal Medicine)',
    assignedRoom: 'OPD-102',
    chiefComplaint: 'Chronic hyperacidity (Amlapitta), retrosternal burning after spicy food, and morning joint stiffness.',
    duration: '6 months',
    vitals: {
      pulse: 78,
      bp: '124/82',
      weight: 62,
      height: 164,
      bmi: '23.1',
      temperature: '98.4 F',
    },
    prakriti: {
      primary: 'Pitta-Vata',
      vata: 35,
      pitta: 50,
      kapha: 15,
      vikriti: 'Pitta Vriddhi (Elevated Pitta with Vata Anubandha)',
    },
    caseIntake: {
      primaryCategory: 'gastrointestinal',
      chiefComplaint: 'வயிற்றில் கடுமையான நெஞ்செரிச்சல், புளித்த ஏப்பம் மற்றும் காலையில் மூட்டு பிடிப்பு (Chronic retrosternal burning and hyperacidity with morning stiffness)',
      duration: '6 months',
      severity: 6,
      giRelation: 'empty_stomach',
      appetite: 'Tikshna Agni (Intense burning hunger)',
      bowel: 'Mridu Koshtha (2-3 loose motions with burning sensation)',
      sleep: 'Disturbed / Early morning waking at 4 AM (Vata)',
      stress: 'Moderate work-related stress, perfectionist tendency',
      dietHabits: 'Frequent tea/coffee, spicy fermented foods, irregular meal timings',
      physicalActivity: 'Sedentary desk job with 20 mins light evening walking',
      pastTreatments: 'Antacids (Pantoprazole 40mg) for 3 months with partial relief.',
    },
    medicalHistory: {
      pastIllnesses: 'Occasional migraine episodes (2021-2023), Mild GERD',
      surgeries: 'None',
      allergies: 'Penicillin (Skin rash), Dust / Pollen allergy',
      currentMedicines: 'Pantoprazole 40mg OD (Occasional)',
      familyHistory: 'Father: Hypertension; Mother: Osteoarthritis (Janu Sandhigata Vata)',
      habits: 'Non-smoker, Tea (3 cups daily), No alcohol',
    },
    ashtavidhaAssessment: {
      nadi: 'Manduka Gati (Frog jump, Pitta dominant, 78 bpm)',
      jihwa: 'Raktavarna with mild yellow coating at center (Samata)',
      mutra: 'Peeta varna, mild burning micturition',
      mala: 'Peetabha, Mridu, Sasneha',
      shabda: 'Spashta (Clear)',
      sparsha: 'Ushna (Warm to touch)',
      drik: 'Rakta-Pitaabh (Mild conjunctival hyperemia)',
      akriti: 'Madhyama (Medium built)',
    },
    redFlags: [
      {
        id: 'rf-1',
        level: 'practitioner_review',
        title: 'Chronic Retrosternal Burning & Prolonged Antacid Dependency',
        desc: '6-month history of burning with sour regurgitation; warrants Vaidya review for mucosal irritation (Urdhwaga Amlapitta) vs ulceration.',
        action: 'Prioritize in current OPD session for pulse and tongue verification.'
      },
      {
        id: 'rf-2',
        level: 'informational',
        title: 'Reported Penicillin Drug Allergy',
        desc: 'Documented allopathic antibiotic allergy. Safe for Classical Ayurvedic herbs.',
        action: 'Noted in Patient Safety Log.'
      }
    ],
    documents: [
      { id: 'doc-d1', name: 'Upper_GI_Endoscopy_Report.pdf', type: 'imaging', date: '2026-07-15', size: '2.4 MB', status: 'Indexed & Processed' },
      { id: 'doc-d2', name: 'Lipid_and_LFT_Profile.pdf', type: 'labReport', date: '2026-08-10', size: '1.1 MB', status: 'Indexed & Processed' }
    ]
  },
  {
    id: 'pat-102',
    uhid: 'AYUR-2026-0892',
    name: 'Rajeshwari Krishnan',
    dob: '1974-11-20',
    age: 52,
    gender: 'Female',
    phone: '+91 94441 67890',
    email: 'rajeshwari.k@example.com',
    address: 'Plot 12, Gandhi Nagar, Chennai - 600020',
    emergencyContact: '+91 94441 12344 (Krishnan - Husband)',
    occupation: 'Teacher',
    preferredLanguage: 'ta',
    tokenNumber: 'A-025',
    tokenStatus: 'waiting',
    queuePosition: 9,
    estimatedWaitMins: 35,
    priority: 'Normal',
    registrationTime: '09:20 AM',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
    assignedDepartment: 'Kayachikitsa (Internal Medicine)',
    assignedRoom: 'OPD-102',
    chiefComplaint: 'Bilateral knee pain (Janu Sandhigata Vata), crepitus on walking, and calf cramps during night.',
    duration: '1.5 years',
    vitals: {
      pulse: 72,
      bp: '136/88',
      weight: 71,
      height: 158,
      bmi: '28.4',
      temperature: '98.2 F',
    },
    prakriti: {
      primary: 'Vata-Kapha',
      vata: 55,
      pitta: 20,
      kapha: 25,
      vikriti: 'Vata Prakopa in Sandhi & Asthi Dhatu',
    },
    caseIntake: {
      primaryCategory: 'musculoskeletal',
      chiefComplaint: 'இரு முழங்கால்களிலும் தாங்க முடியாத வலி மற்றும் காலை நேர பிடிப்பு (Severe bilateral knee pain with morning stiffness)',
      duration: '1.5 years',
      severity: 7,
      jointStiffness: 'morning_stiffness_1hr',
      appetite: 'Vishama Agni (Variable)',
      bowel: 'Krura Koshtha (Hard dry stools, tendency to constipation)',
      sleep: 'Light and interrupted by knee ache',
      stress: 'Anxious regarding mobility loss',
      dietHabits: 'Vegetarian, low ghee intake, cold beverages',
      physicalActivity: 'Limited due to joint discomfort',
      pastTreatments: 'Painkillers (Aceclofenac) on SOS basis.',
    },
    medicalHistory: {
      pastIllnesses: 'Hypothyroidism (diagnosed 2018)',
      surgeries: 'None',
      allergies: 'Sulpha drugs',
      currentMedicines: 'Thyronorm 50 mcg OD',
      familyHistory: 'Mother had severe arthritis',
      habits: 'Vegetarian, tea lover',
    },
    redFlags: [
      {
        id: 'rf-3',
        level: 'practitioner_review',
        title: 'Prolonged NSAID Analgesic Usage',
        desc: 'Intermittent use of Aceclofenac for 1.5 years; inspect for potential gastric irritation.',
        action: 'Prescribe Guggulu and Kashayam with Deepana-Pachana.'
      }
    ],
    documents: [
      { id: 'doc-d3', name: 'Bilateral_Knee_XRay.pdf', type: 'imaging', date: '2026-06-20', size: '4.8 MB', status: 'Indexed & Processed' }
    ]
  },
  {
    id: 'pat-103',
    uhid: 'AYUR-2026-0893',
    name: 'Arvind M. Kumar',
    dob: '1982-08-05',
    age: 44,
    gender: 'Male',
    phone: '+91 98800 45678',
    email: 'arvind.kumar@example.com',
    address: 'Flat 302, Green Glen Layout, Bellandur, Bengaluru',
    emergencyContact: '+91 98800 11223',
    occupation: 'Financial Analyst',
    preferredLanguage: 'kn',
    tokenNumber: 'A-021',
    tokenStatus: 'in_consultation', // 'With Doctor'
    queuePosition: 0,
    estimatedWaitMins: 0,
    priority: 'Normal',
    registrationTime: '09:05 AM',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
    assignedDepartment: 'Kayachikitsa (Internal Medicine)',
    assignedRoom: 'OPD-102',
    chiefComplaint: 'Post-prandial heaviness (Ajeerna), lethargy, sluggish metabolism, and weight gain around abdomen.',
    duration: '4 months',
    vitals: {
      pulse: 68,
      bp: '128/84',
      weight: 84,
      height: 172,
      bmi: '28.4',
      temperature: '98.6 F',
    },
    prakriti: {
      primary: 'Kapha-Pitta',
      vata: 20,
      pitta: 35,
      kapha: 45,
      vikriti: 'Kapha-Meda Dhatvagni Mandya with Ama',
    },
    caseIntake: {
      primaryCategory: 'gastrointestinal',
      chiefComplaint: 'ಉಟದ ನಂತರ ವಿಪರೀತ ಹೊಟ್ಟೆ ಭಾರ, ಆಲಸ್ಯ ಮತ್ತು ತೂಕ ಹೆಚ್ಚಳ (Post-prandial heaviness and sluggish digestion)',
      duration: '4 months',
      severity: 5,
      appetite: 'Manda Agni (Slow, lacks real hunger for 5-6 hours post meals)',
      bowel: 'Madhyama Koshtha with sticky unformed stools (Sama)',
      sleep: 'Heavy deep sleep, daytime sleepiness (Divasvapna)',
      stress: 'Calm, lethargic',
      dietHabits: 'High carbohydrate, sweets, dairy and fried snacks in evening',
      physicalActivity: 'Minimal exercise',
    },
    medicalHistory: {
      pastIllnesses: 'Prediabetes / Borderline HbA1c 6.1%',
      surgeries: 'None',
      allergies: 'None reported',
      currentMedicines: 'None',
      familyHistory: 'Type 2 Diabetes Mellitus (Both parents)',
      habits: 'Sedentary work, late night dinner',
    },
    redFlags: [
      {
        id: 'rf-4',
        level: 'informational',
        title: 'Meda-Kapha Metabolic Trend',
        desc: 'Family history of Diabetes with high abdominal Meda. Recommend Udvartana and Yava/Barley Ahara.',
        action: 'Pathya regimen oriented toward Kapha Shamana.'
      }
    ],
    documents: [
      { id: 'doc-d4', name: 'Fasting_Blood_Sugar_Report.pdf', type: 'labReport', date: '2026-08-28', size: '890 KB', status: 'Indexed & Processed' }
    ]
  },
  {
    id: 'pat-104',
    uhid: 'AYUR-2026-0894',
    name: 'Vikas Sharma',
    dob: '1978-03-12',
    age: 48,
    gender: 'Male',
    phone: '+91 98110 55667',
    email: 'vikas.sharma@example.com',
    address: 'B-12, Sector 14, Noida, UP',
    emergencyContact: '+91 98110 99881 (Sunita - Wife)',
    occupation: 'Civil Engineer',
    preferredLanguage: 'hi',
    tokenNumber: 'A-026',
    tokenStatus: 'case_taking', // 'Case Taking'
    queuePosition: 10,
    estimatedWaitMins: 45,
    priority: 'Potential Red Flag — Review Required',
    registrationTime: '09:30 AM',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
    assignedDepartment: 'Kayachikitsa (Internal Medicine)',
    assignedRoom: 'OPD-102',
    chiefComplaint: 'Chronic dry cough (Vataja Kasa), throat irritation in morning, and mild breathlessness after exertion.',
    duration: '3 months',
    vitals: {
      pulse: 76,
      bp: '130/84',
      weight: 74,
      height: 170,
      bmi: '25.6',
      temperature: '98.4 F',
    },
    prakriti: {
      primary: 'Vata-Pitta',
      vata: 50,
      pitta: 35,
      kapha: 15,
      vikriti: 'Pranavaha Srotas Dushti with Vata Prakopa',
    },
    caseIntake: {
      primaryCategory: 'respiratory',
      chiefComplaint: 'लगातार सूखी खांसी, गले में सूखापन एवं सुबह उठने पर सांस लेने में हल्की रुकावट (Chronic dry cough with throat tickle)',
      duration: '3 months',
      severity: 6,
      appetite: 'Sama Agni',
      bowel: 'Krura Koshtha (Dry stools)',
      sleep: 'Disturbed due to nocturnal coughing bouts',
      stress: 'Moderate work stress',
      dietHabits: 'Cold water intake, dusty outdoor work environment',
      pastTreatments: 'Allopathic cough syrups with temporary suppressive relief.',
    },
    medicalHistory: {
      pastIllnesses: 'Seasonal allergic rhinitis',
      surgeries: 'None',
      allergies: 'Dust, pollen, cold drinks',
      currentMedicines: 'None',
      familyHistory: 'Father: Bronchial asthma',
      habits: 'Non-smoker',
    },
    redFlags: [
      {
        id: 'rf-5',
        level: 'practitioner_review',
        title: '3-Month Chronic Unresolved Cough',
        desc: 'Persistent Vataja Kasa unresponsive to conventional syrups. Requires examination for Pranavaha Srotas obstruction.',
        action: 'Prescribe Kantakari Avaleha and Talisadi Churna.'
      }
    ],
    documents: [
      { id: 'doc-d5', name: 'Chest_XRay_PA_View.pdf', type: 'imaging', date: '2026-07-20', size: '3.1 MB', status: 'Indexed & Processed' }
    ]
  },
  {
    id: 'pat-105',
    uhid: 'AYUR-2026-0895',
    name: 'David Miller',
    dob: '1991-07-24',
    age: 35,
    gender: 'Male',
    phone: '+91 99000 88990',
    email: 'david.miller@example.com',
    address: 'Whitefield Palm Meadows, Bengaluru',
    emergencyContact: '+91 99000 77881',
    occupation: 'VP of Engineering',
    preferredLanguage: 'en',
    tokenNumber: 'A-022',
    tokenStatus: 'waiting', // 'Waiting'
    queuePosition: 1,
    estimatedWaitMins: 5,
    priority: 'Priority Validated',
    registrationTime: '09:10 AM',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
    assignedDepartment: 'Kayachikitsa (Internal Medicine)',
    assignedRoom: 'OPD-102',
    chiefComplaint: 'Severe chronic insomnia (Anidra), racing mind at night, restlessness, and daytime brain fog.',
    duration: '5 months',
    vitals: {
      pulse: 82,
      bp: '126/80',
      weight: 68,
      height: 178,
      bmi: '21.5',
      temperature: '98.6 F',
    },
    prakriti: {
      primary: 'Vata-Pitta',
      vata: 60,
      pitta: 30,
      kapha: 10,
      vikriti: 'Manovaha Srotas Vata Prakopa with Rajasic aggravation',
    },
    caseIntake: {
      primaryCategory: 'neurological',
      chiefComplaint: 'Severe sleep-onset insomnia, racing thoughts past midnight, high occupational stress.',
      duration: '5 months',
      severity: 7,
      appetite: 'Vishama Agni',
      bowel: 'Krura Koshtha',
      sleep: 'Less than 4 hours broken sleep',
      stress: 'Severe high-stress executive workload',
      dietHabits: 'High caffeine (4 cups espresso daily), late night screen time',
      pastTreatments: 'Melatonin 5mg with limited efficacy.',
    },
    medicalHistory: {
      pastIllnesses: 'Workplace burnout (2024)',
      surgeries: 'None',
      allergies: 'None',
      currentMedicines: 'Melatonin 5mg (SOS)',
      familyHistory: 'Non-contributory',
      habits: 'Coffee lover, non-smoker',
    },
    redFlags: [
      {
        id: 'rf-6',
        level: 'urgent',
        title: 'Severe Chronic Sleep Deprivation (< 4 hrs/night)',
        desc: 'Risk of Vata vyadhi exacerbation. Staff verified high clinical priority.',
        action: 'Prioritized for Panchakarma relaxation protocol.'
      }
    ],
    documents: [
      { id: 'doc-d6', name: 'Sleep_Study_Summary.pdf', type: 'labReport', date: '2026-06-15', size: '1.4 MB', status: 'Indexed & Processed' }
    ]
  },
  {
    id: 'pat-106',
    uhid: 'AYUR-2026-0896',
    name: 'Meera Patel',
    dob: '1997-04-18',
    age: 29,
    gender: 'Female',
    phone: '+91 97230 44556',
    email: 'meera.patel@example.com',
    address: 'Navrangpura, Ahmedabad, Gujarat',
    emergencyContact: '+91 97230 11223',
    occupation: 'Architect',
    preferredLanguage: 'hi',
    tokenNumber: 'A-027',
    tokenStatus: 'assessment', // 'Assessment'
    queuePosition: 11,
    estimatedWaitMins: 55,
    priority: 'Normal',
    registrationTime: '09:35 AM',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
    assignedDepartment: 'Kayachikitsa (Internal Medicine)',
    assignedRoom: 'OPD-102',
    chiefComplaint: 'Skin dryness and eczema flare-up (Vicharchika) with seasonal weather changes.',
    duration: '2 months',
    vitals: { pulse: 74, bp: '118/78', weight: 58, height: 162, bmi: '22.1', temperature: '98.4 F' },
    prakriti: { primary: 'Pitta-Kapha', vata: 25, pitta: 45, kapha: 30, vikriti: 'Rakta Dhatu Dushti' }
  },
  {
    id: 'pat-107',
    uhid: 'AYUR-2026-0897',
    name: 'Suresh Menon',
    dob: '1965-02-10',
    age: 61,
    gender: 'Male',
    phone: '+91 94470 33445',
    email: 'suresh.menon@example.com',
    address: 'Kaloor, Kochi, Kerala',
    emergencyContact: '+91 94470 99881',
    occupation: 'Retired Bank Manager',
    preferredLanguage: 'ml',
    tokenNumber: 'A-019',
    tokenStatus: 'completed', // 'Completed'
    queuePosition: 0,
    estimatedWaitMins: 0,
    priority: 'Normal',
    registrationTime: '08:45 AM',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
    assignedDepartment: 'Kayachikitsa (Internal Medicine)',
    assignedRoom: 'OPD-102',
    chiefComplaint: 'Lumbar spondylosis review post-Katy Basti therapy.',
    duration: '1 year',
    vitals: { pulse: 70, bp: '132/84', weight: 76, height: 168, bmi: '26.9', temperature: '98.2 F' },
    prakriti: { primary: 'Vata-Pitta', vata: 50, pitta: 35, kapha: 15, vikriti: 'Vata Shamana complete' }
  },
  {
    id: 'pat-108',
    uhid: 'AYUR-2026-0898',
    name: 'Lakshmi Narayanan',
    dob: '1971-09-25',
    age: 55,
    gender: 'Female',
    phone: '+91 98410 77889',
    email: 'lakshmi.n@example.com',
    address: 'Mylapore, Chennai, Tamil Nadu',
    emergencyContact: '+91 98410 22334',
    occupation: 'Homemaker',
    preferredLanguage: 'ta',
    tokenNumber: 'A-018',
    tokenStatus: 'follow_up', // 'Follow-up'
    queuePosition: 0,
    estimatedWaitMins: 0,
    priority: 'Normal',
    registrationTime: '08:30 AM',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
    assignedDepartment: 'Kayachikitsa (Internal Medicine)',
    assignedRoom: 'OPD-102',
    chiefComplaint: 'Routine 30-day follow-up for Amlapitta treatment progress.',
    duration: '30 days',
    vitals: { pulse: 72, bp: '122/80', weight: 64, height: 155, bmi: '26.6', temperature: '98.4 F' },
    prakriti: { primary: 'Pitta-Vata', vata: 40, pitta: 45, kapha: 15, vikriti: 'Pitta Shamana in progress' }
  },
  {
    id: 'pat-109',
    uhid: 'AYUR-2026-0899',
    name: 'Rohan Gupta',
    dob: '1995-12-05',
    age: 31,
    gender: 'Male',
    phone: '+91 98100 66778',
    email: 'rohan.gupta@example.com',
    address: 'Saket, New Delhi',
    emergencyContact: '+91 98100 44556',
    occupation: 'Consultant',
    preferredLanguage: 'en',
    tokenNumber: 'A-028',
    tokenStatus: 'registered', // 'Registered'
    queuePosition: 12,
    estimatedWaitMins: 60,
    priority: 'Normal',
    registrationTime: '09:40 AM',
    assignedDoctorId: 'doc-1',
    assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
    assignedDepartment: 'Kayachikitsa (Internal Medicine)',
    assignedRoom: 'OPD-102',
    chiefComplaint: 'Digestive sluggishness, fatigue after lunch, weight management.',
    duration: '1 month',
    vitals: { pulse: 74, bp: '120/80', weight: 79, height: 175, bmi: '25.8', temperature: '98.6 F' },
    prakriti: { primary: 'Kapha-Pitta', vata: 20, pitta: 35, kapha: 45, vikriti: 'Agnimandya' }
  }
];

export const MOCK_FORMULATIONS = [
  {
    id: 'form-1',
    name: 'Maharasnadi Kashayam',
    type: 'Kashayam (Decoction)',
    classicalReference: 'Sahasrayogam / Sharangadhara Samhita',
    doshaTarget: 'Vata Dosha (Vata-Kapha Harana)',
    indications: 'Sandhigata Vata (Osteoarthritis), Amavata (Rheumatoid arthritis), Gridhrasi (Sciatica)',
    standardDosage: '15 ml Kashayam diluted with 45 ml lukewarm water twice daily',
    anupana: 'Lukewarm water / Ginger juice / Shunthi Churna',
    timing: 'Abhakta / Pragbhakta (Before meals on empty stomach)',
  },
  {
    id: 'form-2',
    name: 'Avipattikar Churna',
    type: 'Churna (Herbal Powder)',
    classicalReference: 'Bhaishajya Ratnavali',
    doshaTarget: 'Pitta Dosha (Pitta Rechana & Agni Deepana)',
    indications: 'Amlapitta (Hyperacidity), Vidagdha Jeerna, Heartburn, Constipation with Pitta',
    standardDosage: '3 to 5 grams twice daily',
    anupana: 'Lukewarm water or Honey / Coconut water',
    timing: 'Samana Kala (Between meals or just before bedtime)',
  },
  {
    id: 'form-3',
    name: 'Yogaraj Guggulu',
    type: 'Vati / Guggulu (Purified Resin Tablet)',
    classicalReference: 'Bhaishajya Ratnavali / Yogaratnakara',
    doshaTarget: 'Vata-Kapha Shamaka',
    indications: 'Joint stiffness, Vataja Shirashoola, Asthi-Majja Dhatu Gata Vata',
    standardDosage: '2 tablets (500mg each) twice daily',
    anupana: 'Warm water / Maharasnadi Kashayam / Warm milk',
    timing: 'Adhobhakta (After meals)',
  },
  {
    id: 'form-4',
    name: 'Triphala Churna',
    type: 'Churna (Tri-herbal Blend)',
    classicalReference: 'Charaka Samhita Chikitsa Sthana',
    doshaTarget: 'Tridoshahara (Balances Vata, Pitta & Kapha)',
    indications: 'Koshtha Shuddhi (Gentle bowel regulator), Rasayana, Chakshushya',
    standardDosage: '3 to 6 grams at bedtime',
    anupana: 'Warm water or Honey with Ghee in unequal proportions',
    timing: 'Nishi (At bedtime)',
  },
  {
    id: 'form-5',
    name: 'Ashwagandharishta',
    type: 'Arishta (Fermented Formulation)',
    classicalReference: 'Bhaishajya Ratnavali Murcha Roga',
    doshaTarget: 'Vata-Kaphahara, Balya & Medhya',
    indications: 'Manasika Shrama (Mental exhaustion), insomnia, nervous debility, Rasayana',
    standardDosage: '20 ml with equal quantity of water twice daily',
    anupana: 'Equal quantity of water',
    timing: 'Adhobhakta (Immediately after meals)',
  },
  {
    id: 'form-6',
    name: 'Praval Pishti',
    type: 'Pishti / Bhasma (Processed Coral Calx)',
    classicalReference: 'Ayurveda Sara Sangraha',
    doshaTarget: 'Pitta Shamaka & Dahashamaka',
    indications: 'Amlapitta, Burning sensation, Hyperacidity, Raktapitta',
    standardDosage: '250 mg twice daily',
    anupana: 'Gulkand, Honey, or Butter',
    timing: 'Pragbhakta (Before meals)',
  }
];

export const MOCK_PATHYA_APATHYA = {
  pitta: {
    pathya: [
      'Cow’s Ghee (Ghrita) in moderate quantity with warm meals',
      'Old harvested Basmati rice, Mudga (Mung dal soup)',
      'Sweet cooling fruits: Pomegranate (Dadima), Sweet Grapes (Draksha), Amla',
      'Vegetables: Bitter gourd, Bottle gourd, Ash gourd (Kushmanda)',
      'Drink cooled boiled water, coconut water, coriander/fennel infusion',
      'Mindful relaxed eating without hurry or frustration'
    ],
    apathya: [
      'Excessively sour (Amla), salty (Lavana), and pungent (Katu) spices',
      'Deep-fried foods, papad, fermented batter, hot pickles',
      'Excess tea, coffee, carbonated drinks, alcohol',
      'Skipping breakfast or prolonged daytime fasting',
      'Midday sun exposure and heated arguments'
    ]
  },
  vata: {
    pathya: [
      'Warm, freshly cooked, soupy, and unctuous (Snigdha) foods',
      'Warm milk with a pinch of nutmeg and cardamom at bedtime',
      'Sesame oil (Tila taila) whole-body self massage (Abhyanga)',
      'Sweet, sour, and mildly salted dishes',
      'Consistent daily sleep and waking routine (Dinacharya)'
    ],
    apathya: [
      'Raw salads, dry snacks, cold drinks, iced water',
      'Staying awake past midnight (Ratri Jagarana)',
      'Excessive multi-tasking and skipping meals',
      'Cold, dry, and windy environmental exposure'
    ]
  },
  kapha: {
    pathya: [
      'Warm, light, dry, and mildly spiced foods (Pungent, Bitter, Astringent)',
      'Honey (Madhu) in lukewarm water on empty stomach',
      'Barley (Yava), Horse gram (Kulatthi), Millets',
      'Active daily exercise (Vyayama) and brisk walking'
    ],
    apathya: [
      'Daytime sleeping (Divasvapna)',
      'Heavy dairy: Cheese, thick buffalo milk, ice-cream',
      'Cold drinks, heavy oily sweets, bakery items',
      'Sedentary lifestyle with prolonged sitting'
    ]
  }
};

export const MOCK_HOSPITAL_ANALYTICS = {
  todayFootfall: 148,
  activeInQueue: 32,
  completedConsultations: 116,
  avgConsultationMinutes: 13.4,
  avgWaitMinutes: 18.2,
  patientSatisfaction: '94.8%',
  doshaDistribution: [
    { name: 'Vata Predominant', value: 42, color: '#6366F1' },
    { name: 'Pitta Predominant', value: 36, color: '#E11D48' },
    { name: 'Kapha Predominant', value: 22, color: '#16A34A' },
  ],
  topConditions: [
    { condition: 'Amlapitta & Agnimandya (Gut & Acidity)', count: 48, pct: '32%' },
    { condition: 'Sandhigata Vata & Amavata (Joints/Arthritis)', count: 37, pct: '25%' },
    { condition: 'Prameha & Medoroga (Metabolic & Diabetes)', count: 24, pct: '16%' },
    { condition: 'Kasa & Shwasa (Respiratory/Allergy)', count: 18, pct: '12%' },
    { condition: 'Tvak Roga (Skin / Eczema / Psoriasis)', count: 12, pct: '8%' },
    { condition: 'Manasika Shrama (Stress & Insomnia)', count: 9, pct: '7%' },
  ],
  hourlyFlow: [
    { hour: '08:00 AM', patients: 12, avgWait: 8 },
    { hour: '09:00 AM', patients: 28, avgWait: 14 },
    { hour: '10:00 AM', patients: 38, avgWait: 22 },
    { hour: '11:00 AM', patients: 32, avgWait: 20 },
    { hour: '12:00 PM', patients: 24, avgWait: 15 },
    { hour: '01:00 PM', patients: 8, avgWait: 10 },
    { hour: '02:00 PM', patients: 18, avgWait: 12 },
    { hour: '03:00 PM', patients: 22, avgWait: 16 },
  ]
};
