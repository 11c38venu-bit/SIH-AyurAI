/**
 * Ayurvedic Assessment Knowledge Base
 * Covers Prakriti, Vikriti, Agni, Koshtha, Ashtavidha Pariksha (8-Fold),
 * Dashavidha Pariksha (10-Fold), Ahara (Dietary Habits), and Vihara (Lifestyle Protocols).
 * Multilingual with patient-friendly explanations and clinical descriptions.
 */

export const ASHTAVIDHA_PARIKSHA_DATA = [
  {
    id: 'nadi',
    code: 'Nadi',
    title: 'Nadi (Pulse Examination)',
    description: 'Pulse rhythm, rate, and doshic movement (Sarpa, Manduka, Hamsa gati).',
    translations: {
      en: { title: 'Nadi (Pulse)', desc: 'Rhythm and strength of radial pulse' },
      ta: { title: 'நாடி (நாடித் துடிப்பு)', desc: 'நாடித் துடிப்பின் வேகம் மற்றும் தாளம்' },
      hi: { title: 'नाड़ी (नाड़ी परीक्षा)', desc: 'नाड़ी की गति एवं त्रिदोष स्थिति' },
      ml: { title: 'നാഡി (നാഡിമിടിപ്പ്)', desc: 'നാഡിയുടെ താളവും വേഗതയും' },
      te: { title: 'నాడి (నాడి పరీక్ష)', desc: 'నాడి వేగం మరియు లయ' },
      kn: { title: 'ನಾಡಿ (ನಾಡಿ ಪರೀಕ್ಷೆ)', desc: 'ನಾಡಿಯ ಲಯ ಮತ್ತು ವೇಗ' },
    },
    options: [
      { id: 'n1', value: 'Vataja — Sarpa Gati (Fast, light, snake-like movement, 80-90 bpm)' },
      { id: 'n2', value: 'Pittaja — Manduka Gati (Jumping, forceful, frog-like, 70-80 bpm)' },
      { id: 'n3', value: 'Kaphaja — Hamsa Gati (Slow, heavy, swan-like, 60-70 bpm)' },
      { id: 'n4', value: 'Sannipataja — Mixed dosha pulse rhythm' },
    ]
  },
  {
    id: 'mutra',
    code: 'Mutra',
    title: 'Mutra (Urine Examination)',
    description: 'Frequency, color, clarity, and sensation during urination.',
    translations: {
      en: { title: 'Mutra (Urinary Sensation)', desc: 'Frequency, color, and burning sensation' },
      ta: { title: 'மூத்திரம் (சிறுநீர்)', desc: 'சிறுநீர் நிறம், அளவு மற்றும் எரிச்சல்' },
      hi: { title: 'मूत्र (मूत्र परीक्षा)', desc: 'रंग, वेग एवं मूत्र त्याग में जलन' },
      ml: { title: 'മൂത്രം (മൂത്രപരിശോധന)', desc: 'നിറം, അളവ്, എരിച്ചിൽ' },
      te: { title: 'మూత్రం (మూత్ర పరీక్ష)', desc: 'రంగు, పరిమాణం మరియు మంట' },
      kn: { title: 'ಮೂತ್ರ (ಮೂತ್ರ ಪರೀಕ್ಷೆ)', desc: 'ಬಣ್ಣ, ಪ್ರಮಾಣ ಮತ್ತು ಉರಿತ' },
    },
    options: [
      { id: 'u1', value: 'Normal pale straw, 4-6 times daily, no burning' },
      { id: 'u2', value: 'Pitta dominant — Deep yellow (Peetabha) with mild burning sensation' },
      { id: 'u3', value: 'Vata dominant — Clear, frequent scanty urination' },
      { id: 'u4', value: 'Kapha dominant — Turbid/whitish, heavy stream' },
    ]
  },
  {
    id: 'mala',
    code: 'Mala',
    title: 'Mala (Stool & Bowel Examination)',
    description: 'Consistency, color, frequency, and presence of sticky metabolic toxins (Ama).',
    translations: {
      en: { title: 'Mala (Bowel / Stool)', desc: 'Consistency, regularity, and digestion toxins' },
      ta: { title: 'மலம் (மலக் கழிவு)', desc: 'மலம் வெளியேறும் தன்மை மற்றும் ஆமம்' },
      hi: { title: 'मल (मल परीक्षा)', desc: 'मल का स्वरूप, बंधापन एवं आम की उपस्थिति' },
      ml: { title: 'മലം (മലപരിശോധന)', desc: 'മലത്തിന്റെ സ്വഭാവവും ആമവും' },
      te: { title: 'మలం (మల పరీక్ష)', desc: 'మల విసర్జన మరియు ఆమం' },
      kn: { title: 'ಮಲ (ಮಲ ಪರೀಕ್ಷೆ)', desc: 'ಮಲದ ಸ್ವರೂಪ ಮತ್ತು ಆಮ ದೋಷ' },
    },
    options: [
      { id: 'm1', value: 'Nirama — Well-formed, floats easily, regular 1-2 times' },
      { id: 'm2', value: 'Sama — Sticky, foul-smelling, sinks in water, mucus' },
      { id: 'm3', value: 'Dry & Hard — Constipated, difficult elimination (Vata)' },
      { id: 'm4', value: 'Loose & Burning — Frequent, loose, yellowish (Pitta)' },
    ]
  },
  {
    id: 'jihva',
    code: 'Jihwa',
    title: 'Jihwa (Tongue Examination)',
    description: 'Color, coating, moisture, and papillae texture.',
    translations: {
      en: { title: 'Jihwa (Tongue)', desc: 'Coating, color, and digestive fire reflection' },
      ta: { title: 'ஜிஹ்வா (நாக்கு)', desc: 'நாக்கின் நிறம், படிவு மற்றும் ஈரப்பதம்' },
      hi: { title: 'जिह्वा (जीभ परीक्षा)', desc: 'जीभ पर मैल (लेप), रंग एवं सूखापन' },
      ml: { title: 'ജിഹ്വ (നാവ്)', desc: 'നാവിന്റെ നിറവും ആവരണവും' },
      te: { title: 'జిహ్వ (నాలుక)', desc: 'నాలుక రంగు, పూత మరియు తేమ' },
      kn: { title: 'ಜಿಹ್ವಾ (ನಾಲಿಗೆ)', desc: 'ನಾಲಿಗೆಯ ಬಣ್ಣ, ಲೇಪನ ಮತ್ತು ತೇವಾಂಶ' },
    },
    options: [
      { id: 'j1', value: 'Clean & Pink (Nirama) — Clear red, moist, flexible' },
      { id: 'j2', value: 'Yellowish Coating (Pitta/Sama) — Central yellow fur, redness on edges' },
      { id: 'j3', value: 'Thick White Coating (Kapha/Ama) — Heavy sluggish coating' },
      { id: 'j4', value: 'Dry & Cracked (Vata) — Darkish or pale, rough, dry edges' },
    ]
  },
  {
    id: 'shabda',
    code: 'Shabda',
    title: 'Shabda (Voice & Speech)',
    description: 'Tone, pitch, resonance, and respiratory sounds.',
    translations: {
      en: { title: 'Shabda (Voice / Speech)', desc: 'Tone, resonance, and hoarseness' },
      ta: { title: 'சப்தம் (குரல் / பேச்சு)', desc: 'குரலின் தெளிவு மற்றும் ஒலி' },
      hi: { title: 'शब्द (स्वर परीक्षा)', desc: 'आवाज का भारीपन, स्पष्टता व स्वरभंग' },
      ml: { title: 'ശബ്ദം (ശബ്ദപരിശോധന)', desc: 'ശബ്ദത്തിന്റെ വ്യക്തതയും താളവും' },
      te: { title: 'శబ్దం (స్వర పరీక్ష)', desc: 'స్వర గాంభీర్యం మరియు స్పష్టత' },
      kn: { title: 'ಶಬ್ದ (ಧ್ವನಿ ಪರೀಕ್ಷೆ)', desc: 'ಧ್ವನಿಯ ಸ್ಪಷ್ಟತೆ ಮತ್ತು ಗಾಂಭೀರ್ಯ' },
    },
    options: [
      { id: 's1', value: 'Clear & Resonant (Spashta) — Normal pitch and stamina' },
      { id: 's2', value: 'High Pitch / Fast Speech (Vata) — Rapid or slightly hoarse' },
      { id: 's3', value: 'Sharp & Assertive (Pitta) — Clear, loud, commanding' },
      { id: 's4', value: 'Deep & Heavy (Kapha) — Low pitched, resonant, slow' },
    ]
  },
  {
    id: 'sparsha',
    code: 'Sparsha',
    title: 'Sparsha (Skin & Tactile Examination)',
    description: 'Temperature, moisture, texture, and roughness.',
    translations: {
      en: { title: 'Sparsha (Skin / Touch)', desc: 'Temperature, texture, and dryness' },
      ta: { title: 'ஸ்பர்சம் (தொடுவுணர்வு / தோல்)', desc: 'தோலின் வெப்பநிலை மற்றும் வறட்சி' },
      hi: { title: 'स्पर्श (त्वचा परीक्षा)', desc: 'त्वचा का तापमान, खुरदरापन व चिकनाहट' },
      ml: { title: 'സ്പർശം (ചർമ്മം)', desc: 'ചർമ്മത്തിന്റെ ചൂടും മൃദുത്വവും' },
      te: { title: 'స్పర్శ (చర్మ స్పర్శ)', desc: 'చర్మ ఉష్ణోగ్రత మరియు గరుకుదనం' },
      kn: { title: 'ಸ್ಪರ್ಶ (ಚರ್ಮ ಪರೀಕ್ಷೆ)', desc: 'ಚರ್ಮದ ತಾಪಮಾನ ಮತ್ತು ಒರಟುತನ' },
    },
    options: [
      { id: 'sp1', value: 'Normal — Pleasant warm, smooth and supple' },
      { id: 'sp2', value: 'Warm to Touch (Ushna — Pitta) — Mild burning, oily forehead' },
      { id: 'sp3', value: 'Cold & Dry (Sheeta/Rooksha — Vata) — Rough skin, cold hands/feet' },
      { id: 'sp4', value: 'Cool & Moist (Sheeta/Snigdha — Kapha) — Smooth, thick, cool skin' },
    ]
  },
  {
    id: 'drik',
    code: 'Drik',
    title: 'Drik (Eyes & Visual Appearance)',
    description: 'Sclera color, moisture, luster, and vision acuity.',
    translations: {
      en: { title: 'Drik (Eyes)', desc: 'Scleral color, redness, and dryness' },
      ta: { title: 'த்ரிக் (கண்கள்)', desc: 'கண்களின் நிறம், சிவப்புத்தன்மை, வறட்சி' },
      hi: { title: 'दृक् (नेत्र परीक्षा)', desc: 'आंखों की लाली, पीलापन या सूखापन' },
      ml: { title: 'ദൃക് (കണ്ണുകൾ)', desc: 'കണ്ണുകളുടെ നിറവും തിളക്കവും' },
      te: { title: 'దృక్ (కళ్ళు)', desc: 'కళ్ళ రంగు, ఎరుపు మరియు పొడిబారడం' },
      kn: { title: 'ದೃಕ್ (ಕಣ್ಣುಗಳು)', desc: 'ಕಣ್ಣುಗಳ ಬಣ್ಣ ಮತ್ತು ತೇವಾಂಶ' },
    },
    options: [
      { id: 'd1', value: 'Normal — Bright, clear white sclera, normal blinking' },
      { id: 'd2', value: 'Reddish/Yellowish (Rakta/Peeta — Pitta) — Burning, photophobia, red vessels' },
      { id: 'd3', value: 'Dry & Sunken (Alpa Snigdha — Vata) — Rapid blinking, dull look' },
      { id: 'd4', value: 'Glossy & White (Snigdha/Shukla — Kapha) — Thick lashes, unctuous gaze' },
    ]
  },
  {
    id: 'akriti',
    code: 'Akriti',
    title: 'Akriti (Body Build & Gait)',
    description: 'Body posture, musculature, frame, and walking demeanor.',
    translations: {
      en: { title: 'Akriti (Physical Build)', desc: 'General stature, posture, and physique' },
      ta: { title: 'ஆக்ருதி (உடல் தோற்றம்)', desc: 'உடலமைப்பு, தோரணை மற்றும் நடை' },
      hi: { title: 'आकृति (शारीरिक गठन)', desc: 'कद-काठी, मुद्रा एवं शारीरिक बल' },
      ml: { title: 'ആകൃതി (ശരീരപ്രകൃതം)', desc: 'ശരീരഘടനയും നടപ്പും' },
      te: { title: 'ఆకృతి (శరీర నిర్మాణం)', desc: 'శరీర పరిమాణం మరియు ఆకృతి' },
      kn: { title: 'ಆಕೃತಿ (ದೇಹದ ನಿಲುವು)', desc: 'ದೇಹದ ನಿಲುವು ಮತ್ತು ರಚನೆ' },
    },
    options: [
      { id: 'a1', value: 'Madhyama (Medium proportion, balanced strength)' },
      { id: 'a2', value: 'Krisha / Alpa (Thin, slender frame, visible veins — Vata)' },
      { id: 'a3', value: 'Sthoola / Maha (Heavy, broad, well-padded joints — Kapha)' },
      { id: 'a4', value: 'Raktavarna Madhyama (Athletic, medium, warm toned — Pitta)' },
    ]
  }
];

export const DASHAVIDHA_PARIKSHA_DATA = [
  {
    id: 'd1_prakriti',
    title: '1. Prakriti (Baseline Constitution)',
    desc: 'Genotypic baseline Dosha balance determined at conception.',
    patientExpl: 'Your natural body type and tendency from birth.',
    status: 'Pitta-Vata (Estimated)',
    options: ['Pitta-Vata', 'Vata-Pitta', 'Pitta-Kapha', 'Kapha-Pitta', 'Vata-Kapha', 'Sama Dosha']
  },
  {
    id: 'd2_vikriti',
    title: '2. Vikriti (Pathological Imbalance)',
    desc: 'Acquired pathological state and current Dosha elevation.',
    patientExpl: 'The current imbalance causing your present symptoms.',
    status: 'Pitta Vriddhi with Vata Anubandha',
    options: ['Pitta Vriddhi', 'Vata Prakopa', 'Kapha Vriddhi', 'Vata-Pitta Dushti', 'Tridoshaja Sama']
  },
  {
    id: 'd3_sara',
    title: '3. Sara (Tissue Quality / Dhatu Essence)',
    desc: 'Evaluates the optimum vitality and density of the 7 body tissues.',
    patientExpl: 'Overall quality and strength of blood, muscles, and bone tissues.',
    status: 'Rasa-Rakta Madhyama',
    options: ['Uttama Sara (Superior)', 'Madhyama Sara (Moderate)', 'Alpa Sara (Deficient)']
  },
  {
    id: 'd4_samhanana',
    title: '4. Samhanana (Compactness / Body Symmetry)',
    desc: 'Joint stability, skeletal symmetry, and muscle firmness.',
    patientExpl: 'How compact and sturdy your bones and joints are built.',
    status: 'Madhyama Samhanana',
    options: ['Su-samhata (Well-compacted)', 'Madhyama (Moderate)', 'Hina (Loose/Fragile)']
  },
  {
    id: 'd5_pramana',
    title: '5. Pramana (Anthropometric Proportions)',
    desc: 'Physical dimensions: height, weight, arm span (Anguli Pramana).',
    patientExpl: 'Healthy height-to-weight and body symmetry ratio.',
    status: 'Normal BMI (23.1)',
    options: ['Anurupa (Proportionate)', 'Ati-krisha (Underweight)', 'Ati-sthula (Overweight)']
  },
  {
    id: 'd6_satmya',
    title: '6. Satmya (Habituation & Diet Adaptability)',
    desc: 'Substances, foods, and climate conducive to patient health.',
    patientExpl: 'Foods and habits that your body tolerates comfortably.',
    status: 'Ghritha-Dugdha Satmya',
    options: ['Sarva Rasa Satmya (All tastes)', 'Eka Rasa Satmya (Specific)', 'Vyavahita Satmya']
  },
  {
    id: 'd7_satva',
    title: '7. Satva (Mental Stamina & Resilience)',
    desc: 'Psychological tolerance to pain, adversity, and treatments.',
    patientExpl: 'Emotional willpower, patience, and ability to handle stress.',
    status: 'Madhyama Satva',
    options: ['Pravara Satva (Strong willpower)', 'Madhyama Satva (Moderate)', 'Avara Satva (Sensitive)']
  },
  {
    id: 'd8_ahara_shakti',
    title: '8. Ahara Shakti (Digestive & Intake Capacity)',
    desc: 'Ability to ingest (Abhyavaharana) and digest (Jarana) meals.',
    patientExpl: 'Your capacity to eat and metabolize nourishing food.',
    status: 'Tikshna Ahara Shakti',
    options: ['Pravara (High intake & digestion)', 'Madhyama (Moderate)', 'Avara (Weak digestion)']
  },
  {
    id: 'd9_vyayama_shakti',
    title: '9. Vyayama Shakti (Physical Exercise Endurance)',
    desc: 'Capacity for physical labor, walking, and exercise before fatigue.',
    patientExpl: 'Physical stamina and how long you can exercise comfortably.',
    status: 'Madhyama Vyayama',
    options: ['Pravara (High endurance)', 'Madhyama (Moderate)', 'Avara (Quick fatigue)']
  },
  {
    id: 'd10_vaya',
    title: '10. Vaya (Age / Chronological & Biological Stage)',
    desc: 'Balya (Childhood/Kapha), Madhyama (Adult/Pitta), Vardhakya (Elderly/Vata).',
    patientExpl: 'Life stage determining metabolic rate and therapeutic approach.',
    status: 'Madhyama Vaya (Pitta Era)',
    options: ['Balya (0-16 yrs)', 'Madhyama (16-60 yrs)', 'Vardhakya (60+ yrs)']
  }
];

export const AGNI_ASSESSMENT_DATA = [
  {
    id: 'sama',
    name: 'Sama Agni (Balanced Metabolism)',
    dosha: 'Tridosha Equilibrium',
    desc: 'Digests food taken at proper times without discomfort. Normal hunger and elimination.',
    badge: 'Equilibrium',
    badgeVariant: 'success'
  },
  {
    id: 'vishama',
    name: 'Vishama Agni (Irregular / Variable)',
    dosha: 'Vata Dominant',
    desc: 'Unpredictable hunger — sometimes digests heavy food rapidly, other times fails to digest light meals. Prone to bloating and constipation.',
    badge: 'Vata Impairment',
    badgeVariant: 'vata'
  },
  {
    id: 'tikshna',
    name: 'Tikshna Agni (Hyperactive / Intense)',
    dosha: 'Pitta Dominant',
    desc: 'Excessively sharp hunger. Frequent intense cravings, burning in epigastrium (Amlapitta), irritability if meals delayed.',
    badge: 'Pitta Impairment',
    badgeVariant: 'pitta'
  },
  {
    id: 'manda',
    name: 'Manda Agni (Sluggish / Hypoactive)',
    dosha: 'Kapha Dominant',
    desc: 'Slow digestion, lack of appetite, post-meal heaviness (Gaurava), excessive salivation, and Ama formation.',
    badge: 'Kapha Impairment',
    badgeVariant: 'kapha'
  }
];

export const KOSHTHA_ASSESSMENT_DATA = [
  {
    id: 'mridu',
    name: 'Mridu Koshtha (Soft / Laxative-Sensitive)',
    dosha: 'Pitta Dominant',
    desc: 'Evacuates bowels easily with light substances like warm milk or sugarcane juice. Tendency towards loose stools.',
  },
  {
    id: 'madhyama',
    name: 'Madhyama Koshtha (Moderate Bowel)',
    dosha: 'Kapha / Sama',
    desc: 'Regular, formed daily bowel movements without excessive strain or urgency.',
  },
  {
    id: 'krura',
    name: 'Krura Koshtha (Hard / Constipated)',
    dosha: 'Vata Dominant',
    desc: 'Difficult, dry, irregular bowel movements. Requires strong laxatives or purgatives for evacuation.',
  }
];

export const AHARA_VIHARA_DATA = {
  ahara: {
    title: 'Ahara (Dietary Intake & Nutritional Regimen)',
    tastes: [
      { id: 'madhura', name: 'Sweet (Madhura)', effect: 'Pacifies Vata & Pitta, increases Kapha' },
      { id: 'amla', name: 'Sour (Amla)', effect: 'Pacifies Vata, increases Pitta & Kapha' },
      { id: 'lavana', name: 'Salty (Lavana)', effect: 'Pacifies Vata, increases Pitta & Kapha' },
      { id: 'katu', name: 'Pungent / Spicy (Katu)', effect: 'Pacifies Kapha, aggravates Pitta & Vata' },
      { id: 'tikta', name: 'Bitter (Tikta)', effect: 'Pacifies Pitta & Kapha, increases Vata' },
      { id: 'kashaya', name: 'Astringent (Kashaya)', effect: 'Pacifies Pitta & Kapha, increases Vata' },
    ],
    mealHabits: [
      { id: 'punctual', label: 'Regular Timings (Sama Ahara)', value: 'Eat at fixed intervals' },
      { id: 'irregular', label: 'Irregular Timings (Vishamashana)', value: 'Unpredictable meal times' },
      { id: 'overeating', label: 'Heavy Eating (Adhyashana)', value: 'Eating before previous meal digested' },
    ],
    waterIntake: [
      { id: 'warm', label: 'Ushnodaka (Warm water preferred)', desc: 'Kindles Agni & flushes Ama' },
      { id: 'cold', label: 'Sheeta Jala (Chilled/Cold water)', desc: 'Suppresses Agni, aggravates Pitta-Vata' },
      { id: 'excess', label: 'Atipana (Excessive water during meals)', desc: 'Dilutes digestive enzymes' },
    ]
  },
  vihara: {
    title: 'Vihara (Daily Lifestyle & Behavioral Regimen)',
    nidra: [
      { id: 'sukha', label: 'Sukha Nidra (Sound restful sleep, 6-8 hrs)', badge: 'Balanced' },
      { id: 'alpa', label: 'Alpa / Anidra (Disturbed, insomnia, frequent waking)', badge: 'Vata/Pitta' },
      { id: 'ati', label: 'Ati Nidra (Excessive daytime sleep, sluggishness)', badge: 'Kapha' },
    ],
    vyayama: [
      { id: 'regular', label: 'Ardhashakti (Daily moderate exercise till light sweat)' },
      { id: 'sedentary', label: 'Alpa Vyayama (Sedentary desk lifestyle)' },
      { id: 'excessive', label: 'Ativyayama (Strenuous exhaustive exercise)' },
    ],
    manasika: [
      { id: 'satva', label: 'Satva Dominant (Calm, mindful, emotionally stable)' },
      { id: 'rajas', label: 'Rajas Dominant (High stress, urgency, anxiety, irritability)' },
      { id: 'tamas', label: 'Tamas Dominant (Lethargy, depression, procrastination)' },
    ]
  }
};
