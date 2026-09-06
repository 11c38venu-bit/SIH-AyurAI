/**
 * Structured Conversational Case-Taking Question Data Bank
 * Includes full native-script translations for 6 Indian Languages (en, ta, hi, ml, te, kn)
 * Supports dynamic adaptive conditional branching rules
 */

export const CASE_TAKING_QUESTIONS = [
  {
    id: 'primary_category',
    category: 'Chief Complaint',
    type: 'single_choice',
    required: true,
    translations: {
      en: {
        question: "What is the primary health concern bringing you in today?",
        subtext: "Select the main area of discomfort so we can ask relevant follow-up questions.",
      },
      ta: {
        question: "இன்று நீங்கள் மருத்துவமனைக்கு வரக் காரணமான முதன்மையான உடல்நலப் பிரச்சனை என்ன?",
        subtext: "உங்களுக்கு ஏற்ற தொடர் கேள்விகளைக் கேட்க முக்கிய பிரச்சனையைத் தேர்ந்தெடுக்கவும்.",
      },
      hi: {
        question: "आज आपके अस्पताल आने का प्राथमिक कारण या मुख्य स्वास्थ्य समस्या क्या है?",
        subtext: "उचित अनुवर्ती प्रश्न पूछने के लिए मुख्य समस्या का चयन करें।",
      },
      ml: {
        question: "ഇന്ന് ചികിത്സ തേടാനുള്ള പ്രധാന ആരോഗ്യപ്രശ്നം എന്താണ്?",
        subtext: "തുടർചോദ്യങ്ങൾ ചോദിക്കുന്നതിനായി പ്രധാന ബുദ്ധിമുട്ട് തിരഞ്ഞെടുക്കുക.",
      },
      te: {
        question: "ఈ రోజు మీరు ఆసుపత్రికి రావడానికి గల ప్రాథమిక ఆరోగ్య సమస్య ఏమిటి?",
        subtext: "తగిన ప్రశ్నలు అడగడానికి ప్రధాన సమస్యను ఎంచుకోండి.",
      },
      kn: {
        question: "ಇಂದು ನೀವು ಚಿಕಿತ್ಸೆಗೆ ಬರಲು ಮುಖ್ಯವಾದ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಯಾವುದು?",
        subtext: "ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಲು ಮುಖ್ಯ ಸಮಸ್ಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      }
    },
    options: [
      {
        id: 'opt_gi',
        value: 'gastrointestinal',
        icon: 'Flame',
        translations: {
          en: 'Stomach Discomfort, Acidity or Digestion Issues',
          ta: 'வயிற்று அசௌகரியம், அசிடிட்டி அல்லது செரிமானப் பிரச்சனை',
          hi: 'पेट में जलन, गैस, बदहजमी या पाचन समस्या',
          ml: 'വയറെരിച്ചിൽ, ഗ്യാസ് അല്ലെങ്കിൽ ദഹന പ്രശ്നങ്ങൾ',
          te: 'కడుపులో మంట, ఎసిడిటీ లేదా జీర్ణ సమస్యలు',
          kn: 'ಹೊಟ್ಟೆಯುರಿ, ಅಸಿಡಿಟಿ ಅಥವಾ ಜೀರ್ಣಕ್ರಿಯೆ ಸಮಸ್ಯೆ',
        }
      },
      {
        id: 'opt_joint',
        value: 'musculoskeletal',
        icon: 'Activity',
        translations: {
          en: 'Joint Pain, Stiffness or Backache',
          ta: 'மூட்டு வலி, பிடிப்பு அல்லது முதுகு வலி',
          hi: 'जोड़ों का दर्द, अकड़न या कमर दर्द',
          ml: 'സന്ധിവേദന, സന്ധിവീക്കം അല്ലെങ്കിൽ നടുവേദന',
          te: 'కీళ్ల నొప్పులు, దృఢత్వం లేదా నడుము నొప్పి',
          kn: 'ಕೀಲು ನೋವು, ಬಿಗಿತ ಅಥವಾ ಬೆನ್ನು ನೋವು',
        }
      },
      {
        id: 'opt_resp',
        value: 'respiratory',
        icon: 'Wind',
        translations: {
          en: 'Cough, Breathing Difficulty or Sinus Congestion',
          ta: 'இருமல், மூச்சுத் திணறல் அல்லது சளி அடைப்பு',
          hi: 'खांसी, सांस लेने में तकलीफ या जुकाम/साइनस',
          ml: 'ചുമ, ശ്വാസതടസ്സം അല്ലെങ്കിൽ കഫക്കെട്ട്',
          te: 'దగ్గు, శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా జలుబు',
          kn: 'ಕೆಮ್ಮು, ಉಸಿರಾಟದ ತೊಂದರೆ ಅಥವಾ ನೆಗಡಿ',
        }
      },
      {
        id: 'opt_skin',
        value: 'dermatology',
        icon: 'Sparkles',
        translations: {
          en: 'Skin Itching, Rashes or Dryness',
          ta: 'தோல் அரிப்பு, தடிப்புகள் அல்லது வறட்சி',
          hi: 'त्वचा में खुजली, चकत्ते या सूखापन',
          ml: 'ചർമ്മത്തിൽ ചൊറിച്ചിൽ, തടിപ്പ് അല്ലെങ്കിൽ വരൾച്ച',
          te: 'చర్మ దురద, దద్దుర్లు లేదా పొడిబారడం',
          kn: 'ಚರ್ಮದ ತುರಿಕೆ, ಗುಳ್ಳೆಗಳು ಅಥವಾ ಒಣ ಚರ್ಮ',
        }
      },
      {
        id: 'opt_neuro',
        value: 'neurological',
        icon: 'Brain',
        translations: {
          en: 'Headache, Insomnia or Chronic Stress',
          ta: 'தலைவலி, தூக்கமின்மை அல்லது மன அழுத்தம்',
          hi: 'सिरदर्द, अनिद्रा या अत्यधिक तनाव',
          ml: 'തലവേദന, ഉറക്കമില്ലായ്മ അല്ലെങ്കിൽ മാനസിക സമ്മർദ്ദം',
          te: 'తలనొప్పి, నిద్రలేమి లేదా మానసిక ఒత్తిడి',
          kn: 'ತಲೆನೋವು, ನಿದ್ರಾಹೀನತೆ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡ',
        }
      },
      {
        id: 'opt_general',
        value: 'general',
        icon: 'Heart',
        translations: {
          en: 'General Fatigue, Weight or Metabolic Concerns',
          ta: 'பொதுவான உடல் சோர்வு, எடை அல்லது பலவீனம்',
          hi: 'सामान्य थकान, कमजोरी या वजन की समस्या',
          ml: 'പൊതുവായ ക്ഷീണം, അമിതവണ്ണം അല്ലെങ്കിൽ തളർച്ച',
          te: 'సాధారణ అలసట, నీరసం లేదా బరువు సమస్యలు',
          kn: 'ಸಾಮಾನ್ಯ ಆಯಾಸ, ನಿಶ್ಯಕ್ತಿ ಅಥವಾ ತೂಕದ ಸಮಸ್ಯೆ',
        }
      }
    ]
  },
  {
    id: 'symptom_duration',
    category: 'Duration & Frequency',
    type: 'single_choice',
    required: true,
    translations: {
      en: {
        question: "How long have you been experiencing these symptoms?",
        subtext: "Helps classify condition as acute (Navina) or chronic (Jirna).",
      },
      ta: {
        question: "இந்த அறிகுறிகள் உங்களுக்கு எவ்வளவு காலமாக உள்ளன?",
        subtext: "பிரச்சனையின் கால அளவை அறிய உதவுகிறது.",
      },
      hi: {
        question: "आप कितने समय से इन लक्षणों का अनुभव कर रहे हैं?",
        subtext: "यह समस्या नवीन है या पुरानी (जीर्ण), यह जानने में सहायक है।",
      },
      ml: {
        question: "ഈ രോഗലക്ഷണങ്ങൾ എത്ര നാളുകളായി അനുഭവപ്പെടുന്നു?",
        subtext: "അസുഖത്തിന്റെ പഴക്കം മനസ്സിലാക്കാൻ സഹായിക്കുന്നു.",
      },
      te: {
        question: "మీరు ఎంతకాలంగా ఈ లక్షణాలను ఎదుర్కొంటున్నారు?",
        subtext: "సమస్య ఎంత పాతదో తెలుసుకోవడానికి సహాయపడుతుంది.",
      },
      kn: {
        question: "ನೀವು ಎಷ್ಟು ಸಮಯದಿಂದ ಈ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?",
        subtext: "ಸಮಸ್ಯೆಯ ಅವಧಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
      }
    },
    options: [
      {
        id: 'dur_1',
        value: 'less_than_week',
        translations: {
          en: 'Less than 1 week (Recent onset)',
          ta: '1 வாரத்திற்கும் குறைவாக (சமீபத்தில் தொடங்கியது)',
          hi: '1 सप्ताह से कम (हाल ही में शुरू हुआ)',
          ml: '1 ആഴ്ചയിൽ താഴെ (അടുത്തിടെ ആരംഭിച്ചത്)',
          te: '1 వారం కంటే తక్కువ (ఇటీవల ప్రారంభమైంది)',
          kn: '1 ವಾರಕ್ಕಿಂತ ಕಡಿಮೆ (ಇತ್ತೀಚೆಗೆ ಪ್ರಾರಂಭವಾಗಿದೆ)',
        }
      },
      {
        id: 'dur_2',
        value: '1_to_4_weeks',
        translations: {
          en: '1 to 4 weeks (1 month)',
          ta: '1 முதல் 4 வாரங்கள் (1 மாதம்)',
          hi: '1 से 4 सप्ताह (लगभग 1 महीना)',
          ml: '1 മുതൽ 4 ആഴ്ച വരെ (1 മാസം)',
          te: '1 నుండి 4 వారాలు (1 నెల)',
          kn: '1 ರಿಂದ 4 ವಾರಗಳು (1 ತಿಂಗಳು)',
        }
      },
      {
        id: 'dur_3',
        value: '1_to_6_months',
        translations: {
          en: '1 to 6 months',
          ta: '1 முதல் 6 மாதங்கள்',
          hi: '1 से 6 महीने',
          ml: '1 മുതൽ 6 മാസം വരെ',
          te: '1 నుండి 6 నెలలు',
          kn: '1 ರಿಂದ 6 ತಿಂಗಳುಗಳು',
        }
      },
      {
        id: 'dur_4',
        value: 'more_than_6_months',
        translations: {
          en: 'More than 6 months (Long-standing / Chronic)',
          ta: '6 மாதங்களுக்கும் மேலாக (நீண்ட கால பிரச்சனை)',
          hi: '6 महीने से अधिक (दीर्घकालिक / पुरानी समस्या)',
          ml: '6 മാസത്തിൽ കൂടുതൽ (ദീർഘകാലമായി)',
          te: '6 నెలలకు పైగా (దీర్ఘకాలిక సమస్య)',
          kn: '6 ತಿಂಗಳಿಗಿಂತ ಹೆಚ್ಚು (ದೀರ್ಘಕಾಲದ ಸಮಸ್ಯೆ)',
        }
      }
    ]
  },
  {
    id: 'symptom_severity',
    category: 'Severity Scale',
    type: 'severity_scale',
    min: 1,
    max: 10,
    required: true,
    translations: {
      en: {
        question: "On a scale of 1 to 10, how severe is your discomfort today?",
        subtext: "1 = Very mild discomfort, 5 = Moderate interference with work, 10 = Severe and debilitating.",
      },
      ta: {
        question: "1 முதல் 10 என்ற அளவில், இன்றைய உங்கள் அசௌகரியத்தின் தீவிரம் எவ்வளவு?",
        subtext: "1 = மிகவும் லேசானது, 5 = மிதமானது, 10 = தாங்க முடியாத வலி/தீவிரம்.",
      },
      hi: {
        question: "1 से 10 के पैमाने पर, आज आपकी परेशानी की तीव्रता कितनी है?",
        subtext: "1 = बहुत हल्का, 5 = मध्यम (कामकाज में रुकावट), 10 = अत्यंत गंभीर व असहनीय।",
      },
      ml: {
        question: "1 മുതൽ 10 വരെയുള്ള അളവിൽ ഇന്നത്തെ നിങ്ങളുടെ അസ്വസ്ഥത എത്രത്തോളമാണ്?",
        subtext: "1 = വളരെ നേരിയത്, 5 = മിതമായത്, 10 = കഠിനമായ ബുദ്ധിമുട്ട്.",
      },
      te: {
        question: "1 నుండి 10 స్కేలులో, ఈ రోజు మీ అసౌకర్యం యొక్క తీవ్రత ఎంత?",
        subtext: "1 = చాలా తేలికపాటి, 5 = మధ్యస్థం, 10 = భరించలేని తీవ్రమైన నొప్పి.",
      },
      kn: {
        question: "1 ರಿಂದ 10 ರ ಪ್ರಮಾಣದಲ್ಲಿ, ಇಂದು ನಿಮ್ಮ ತೊಂದರೆಯ ತೀವ್ರತೆ ಎಷ್ಟಿದೆ?",
        subtext: "1 = ಅತ್ಯಂತ ಸೌಮ್ಯ, 5 = ಮಧ್ಯಮ, 10 = ತೀವ್ರವಾದ ಅಸಹನೀಯ ನೋವು.",
      }
    }
  },
  // ADAPTIVE GI BRANCH
  {
    id: 'gi_food_relation',
    category: 'Digestive & Food Relation',
    type: 'single_choice',
    condition: { parentId: 'primary_category', value: 'gastrointestinal' },
    translations: {
      en: {
        question: "When does your stomach discomfort or burning occur most?",
        subtext: "Identifies whether Agni disturbance is related to Vidagdha or Ajeerna.",
      },
      ta: {
        question: "வயிற்று வலி அல்லது நெஞ்செரிச்சல் எப்போது அதிகமாக ஏற்படுகிறது?",
        subtext: "உணவு உண்பதற்கும் எரிச்சலுக்கும் உள்ள தொடர்பை அறிய உதவுகிறது.",
      },
      hi: {
        question: "पेट में दर्द या जलन सबसे अधिक कब महसूस होती है?",
        subtext: "भोजन और पित्त प्रकोप के संबंध को समझने में सहायक।",
      },
      ml: {
        question: "വയറിലെ എരിച്ചിലോ വേദനയോ എപ്പോഴാണ് കൂടുതൽ അനുഭവപ്പെടുന്നത്?",
        subtext: "ഭക്ഷണവുമായുള്ള ബന്ധം മനസ്സിലാക്കാൻ സഹായിക്കുന്നു.",
      },
      te: {
        question: "కడుపులో మంట లేదా నొప్పి ఎప్పుడు ఎక్కువగా వస్తుంది?",
        subtext: "ఆహారంతో గల సంబంధాన్ని తెలుసుకోవడానికి ఉపయోగపడుతుంది.",
      },
      kn: {
        question: "ಹೊಟ್ಟೆಯುರಿ ಅಥವಾ ನೋವು ಯಾವಾಗ ಹೆಚ್ಚಾಗಿ ಕಂಡುಬರುತ್ತದೆ?",
        subtext: "ಆಹಾರ ಸೇವನೆಗೂ ನೋವಿಗೂ ಇರುವ ಸಂಬಂಧವನ್ನು ತಿಳಿಯಲು.",
      }
    },
    options: [
      {
        id: 'gi_1',
        value: 'empty_stomach',
        translations: {
          en: 'On empty stomach / Early morning (Relieved slightly by milk/food)',
          ta: 'வெறும் வயிற்றில் / அதிகாலையில் (உணவு அல்லது பால் குடித்தால் சற்று குறைகிறது)',
          hi: 'खाली पेट या सुबह-सुबह (कुछ खाने या दूध पीने से थोड़ा आराम)',
          ml: 'വെറും വയറ്റിൽ / അതിരാവിലെ (ഭക്ഷണം കഴിച്ചാൽ നേരിയ ആശ്വാസം)',
          te: 'ఖాళీ కడుపుతో ఉన్నప్పుడు / ఉదయాన్నే (పాలు లేదా ఆహారం తీసుకుంటే కొద్దిగా తగ్గుతుంది)',
          kn: 'ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ / ಮುಂಜಾನೆ (ಹಾಲು ಅಥವಾ ಆಹಾರ ಸೇವಿಸಿದರೆ ಸ್ವಲ್ಪ ಉಪಶಮನ)',
        }
      },
      {
        id: 'gi_2',
        value: 'immediately_after_food',
        translations: {
          en: 'Immediately after meals (Within 30-60 mins of eating)',
          ta: 'உணவு உண்ட உடனே (சாப்பிட்ட 30-60 நிமிடங்களுக்குள்)',
          hi: 'भोजन के तुरंत बाद (खाने के 30-60 मिनट के भीतर)',
          ml: 'ഭക്ഷണം കഴിച്ച ഉടനെ (30-60 മിനിറ്റിനുള്ളിൽ)',
          te: 'భోజనం చేసిన వెంటనే (30-60 నిమిషాలలోపు)',
          kn: 'ಊಟ ಮಾಡಿದ ತಕ್ಷಣ (30-60 ನಿಮಿಷಗಳಲ್ಲಿ)',
        }
      },
      {
        id: 'gi_3',
        value: 'late_night',
        translations: {
          en: 'Late night during sleep (Wakes up with sour regurgitation)',
          ta: 'நள்ளிரவு தூக்கத்தில் (புளித்த ஏப்பத்துடன் விழிப்பு வரும்)',
          hi: 'देर रात सोते समय (खट्टी डकार और जलन से नींद खुलना)',
          ml: 'അർദ്ധരാത്രി ഉറക്കത്തിൽ (പുളിച്ചുതികട്ടലോടെ ഉണരുന്നു)',
          te: 'అర్ధరాత్రి నిద్రలో (పుల్లటి తేన్పులతో మెలకువ రావడం)',
          kn: 'ತಡರಾತ್ರಿ ನಿದ್ರೆಯಲ್ಲಿ (ಹುಳಿ ತೇಗಿನೊಂದಿಗೆ ಎಚ್ಚರ)',
        }
      },
      {
        id: 'gi_4',
        value: 'constant',
        translations: {
          en: 'Continuous / Constant throughout the day',
          ta: 'நாள் முழுவதும் தொடர்ச்சியாக இருக்கும்',
          hi: 'दिनभर लगातार बना रहता है',
          ml: 'ദിവസം മുഴുവൻ തുടർച്ചയായി',
          te: 'రోజంతా నిరంతరం ఉంటుంది',
          kn: 'ದಿನವಿಡೀ ನಿರಂತರವಾಗಿರುತ್ತದೆ',
        }
      }
    ]
  },
  // ADAPTIVE JOINT/MUSCULOSKELETAL BRANCH
  {
    id: 'joint_stiffness',
    category: 'Joint Characteristics',
    type: 'single_choice',
    condition: { parentId: 'primary_category', value: 'musculoskeletal' },
    translations: {
      en: {
        question: "Do you experience morning stiffness or joint swelling?",
        subtext: "Differentiates Sandhigata Vata (Osteoarthritis) from Amavata (Inflammatory).",
      },
      ta: {
        question: "காலை நேரத்தில் மூட்டுகளில் பிடிப்பு அல்லது வீக்கம் ஏற்படுகிறதா?",
        subtext: "வாதத்தின் தன்மையை துல்லியமாக அறிய உதவுகிறது.",
      },
      hi: {
        question: "क्या सुबह उठने पर जोड़ों में अकड़न या सूजन महसूस होती है?",
        subtext: "संधिगत वात एवं आमवात के अंतर को समझने के लिए।",
      },
      ml: {
        question: "രാവിലെ ഉണരുമ്പോൾ സന്ധികളിൽ പിടുത്തമോ നീർക്കെട്ടോ ഉണ്ടാകാറുണ്ടോ?",
        subtext: "സന്ധിവാതത്തിന്റെ സ്വഭാവം അറിയാൻ സഹായിക്കുന്നു.",
      },
      te: {
        question: "ఉదయం నిద్రలేవగానే కీళ్లలో బిగుతు లేదా వాపు ఉంటుందా?",
        subtext: "వాతం యొక్క తీవ్రతను నిర్ధారించడానికి.",
      },
      kn: {
        question: "ಮುಂಜಾನೆ ಎದ್ದಾಗ ಕೀಲುಗಳಲ್ಲಿ ಬಿಗಿತ ಅಥವಾ ಊತ ಕಂಡುಬರುತ್ತದೆಯೇ?",
        subtext: "ಸಂಧಿವಾತದ ಲಕ್ಷಣವನ್ನು ನಿಖರವಾಗಿ ತಿಳಿಯಲು.",
      }
    },
    options: [
      {
        id: 'jt_1',
        value: 'morning_stiffness_1hr',
        translations: {
          en: 'Severe morning stiffness lasting > 1 hour (Worse with cold)',
          ta: '1 மணி நேரத்திற்கும் மேலாக நீடிக்கும் காலை பிடிப்பு (குளிரில் அதிகம்)',
          hi: 'सुबह 1 घंटे से अधिक रहने वाली गंभीर अकड़न (ठंड में बढ़ती है)',
          ml: '1 മണിക്കൂറിലധികം നീണ്ടുനിൽക്കുന്ന കഠിനമായ പിടുത്തം (തണുപ്പിൽ കൂടുന്നു)',
          te: '1 గంటకు పైగా ఉండే ఉదయపు బిగుతు (చలిలో ఎక్కువ)',
          kn: '1 ಗಂಟೆಗಿಂತ ಹೆಚ್ಚು ಕಾಲ ಉಳಿಯುವ ಬಿಗಿತ (ಚಳಿಯಲ್ಲಿ ಹೆಚ್ಚು)',
        }
      },
      {
        id: 'jt_2',
        value: 'pain_on_movement',
        translations: {
          en: 'Crepitus (clicking sound) & pain during movement/stairs',
          ta: 'நடக்கும்போது அல்லது படிக்கட்டுகளில் ஏறும்போது ஒலி மற்றும் வலி',
          hi: 'चलने या सीढ़ियाँ चढ़ने पर जोड़ों से आवाज (कट-कट) और दर्द',
          ml: 'നടക്കുമ്പോഴും പടികൾ കയറുമ്പോഴും വേദനയും ശബ്ദവും',
          te: 'నడిచేటప్పుడు లేదా మెట్లు ఎక్కేటప్పుడు శబ్దం మరియు నొప్పి',
          kn: 'ನಡೆಯುವಾಗ ಅಥವಾ ಮೆಟ್ಟಿಲು ಹತ್ತುವಾಗ ಶಬ್ದ ಮತ್ತು ನೋವು',
        }
      },
      {
        id: 'jt_3',
        value: 'intermittent',
        translations: {
          en: 'Mild ache after heavy exertion',
          ta: 'அதிக உடல் உழைப்பிற்குப் பின் லேசான வலி',
          hi: 'अधिक श्रम के बाद हल्का दर्द',
          ml: 'കഠിനാധ്വാനത്തിന് ശേഷം നേരിയ വേദന',
          te: 'ఎక్కువ శ్రమ తర్వాత కొద్దిపాటి నొప్పి',
          kn: 'ಹೆಚ್ಚು ಶ್ರಮದ ನಂತರ ಸೌಮ್ಯ ನೋವು',
        }
      }
    ]
  },
  // CORE AYURVEDIC PHYSIOLOGY QUESTIONS
  {
    id: 'agni_appetite',
    category: 'Agni (Digestive Fire)',
    type: 'single_choice',
    required: true,
    translations: {
      en: {
        question: "How would you describe your appetite and hunger rhythm (Jatharagni)?",
        subtext: "Fundamental parameter in Ayurvedic diagnosis to assess metabolic status.",
      },
      ta: {
        question: "உங்கள் பசி மற்றும் செரிமானத் திறனை (ஜடராக்னி) எவ்வாறு விவரிப்பீர்கள்?",
        subtext: "ஆயுர்வேத சிகிச்சைக்கான அடிப்படை காரணி.",
      },
      hi: {
        question: "आप अपनी भूख और पाचन शक्ति (जठराग्नि) का वर्णन कैसे करेंगे?",
        subtext: "आयुर्वेदिक चिकित्सा का मूलभूत आधार।",
      },
      ml: {
        question: "നിങ്ങളുടെ വിശപ്പും ദഹനശേഷിയും (ജഠരാഗ്നി) എങ്ങനെയുള്ളതാണ്?",
        subtext: "ആയുർവേദ രോഗനിർണ്ണയത്തിലെ അടിസ്ഥാന ഘടകം.",
      },
      te: {
        question: "మీ ఆకలి మరియు జీర్ణశక్తిని (జఠరాగ్ని) ఎలా వివరిస్తారు?",
        subtext: "ఆయుర్వేద చికిత్సకు ప్రాథమిక మూలం.",
      },
      kn: {
        question: "ನಿಮ್ಮ ಹಸಿವು ಮತ್ತು ಜೀರ್ಣಶಕ್ತಿಯನ್ನು (ಜಠರಾಗ್ನಿ) ಹೇಗೆ ವಿವರಿಸುತ್ತೀರಿ?",
        subtext: "ಆಯುರ್ವೇದ ರೋಗನಿರ್ಣಯದ ಮುಖ್ಯ ನಿಯತಾಂಕ.",
      }
    },
    options: [
      {
        id: 'agni_1',
        value: 'sama',
        translations: {
          en: 'Normal & Timely — Hungry every 4-5 hours, food digests smoothly (Sama Agni)',
          ta: 'சீரான பசி — 4-5 மணி நேரத்திற்கு ஒருமுறை பசி எடுக்கும், எளிதில் செரிக்கும் (ஸம அக்னி)',
          hi: 'सामान्य एवं समय पर — हर 4-5 घंटे में खुलकर भूख लगना और सही पाचन (सम अग्नि)',
          ml: 'സാധാരണ വിശപ്പ് — കൃത്യസമയത്ത് വിശപ്പ് വരുന്നു, ദഹനം സുഗമം (സമ അഗ്നി)',
          te: 'సహజమైన ఆకలి — ప్రతి 4-5 గంటలకు ఆకలి వేస్తుంది, సులభంగా జీర్ణమవుతుంది (సమ అగ్ని)',
          kn: 'ಸಾಮಾನ್ಯ ಹಸಿವು — ನಿಯಮಿತವಾಗಿ ಹಸಿವಾಗುತ್ತದೆ, ಸುಲಭವಾಗಿ ಜೀರ್ಣವಾಗುತ್ತದೆ (ಸಮ ಅಗ್ನಿ)',
        }
      },
      {
        id: 'agni_2',
        value: 'tikshna',
        translations: {
          en: 'Intense & Sharp — Frequent burning hunger, gets angry if food is delayed (Tikshna Agni)',
          ta: 'தீவிர பசி — அடிக்கடி பசி எடுக்கும், உணவு தாமதமானால் கோபம்/எரிச்சல் வரும் (தீக்ஷ்ண அக்னி)',
          hi: 'तीव्र भूख — जल्दी-जल्दी तेज भूख लगना, खाना देर होने पर गुस्सा व जलन (तीक्ष्ण अग्नि)',
          ml: 'കഠിനമായ വിശപ്പ് — ഭക്ഷണം വൈകിയാൽ ദേഷ്യവും നെഞ്ചെരിച്ചിലും (തീക്ഷ്ണ അഗ്നി)',
          te: 'తీవ్రమైన ఆకలి — త్వరగా ఆకలి వేస్తుంది, ఆహారం ఆలస్యమైతే కోపం వస్తుంది (తీక్షణ అగ్ని)',
          kn: 'ತೀವ್ರ ಹಸಿವು — ಆಗಾಗ ಹಸಿವಾಗುತ್ತದೆ, ಊಟ ತಡವಾದರೆ ಕೋಪ/ಉರಿತ (ತೀಕ್ಷ್ಣ ಅಗ್ನಿ)',
        }
      },
      {
        id: 'agni_3',
        value: 'manda',
        translations: {
          en: 'Slow & Sluggish — Heavy stomach, lack of hunger for long hours after food (Manda Agni)',
          ta: 'மந்தமான பசி — சாப்பிட்ட பின் நீண்ட நேரம் வயிறு பாரமாக இருத்தல் (மந்த அக்னி)',
          hi: 'मंद भूख — खाने के बाद भारीपन, लंबे समय तक भूख न लगना (मंद अग्नि)',
          ml: 'മന്ദമായ വിശപ്പ് — കഴിച്ചതിനുശേഷം ദീർഘനേരം വയറിനു കനം (മന്ദ അഗ്നി)',
          te: 'మందగించిన ఆకలి — తిన్న తర్వాత చాలా సేపు కడుపు బరువుగా ఉండడం (మంద అగ్ని)',
          kn: 'ಮಂದ ಹಸಿವು — ತಿಂದ ನಂತರ ಹೆಚ್ಚು ಹೊತ್ತು ಹೊಟ್ಟೆ ಭಾರ (ಮಂದ ಅಗ್ನಿ)',
        }
      },
      {
        id: 'agni_4',
        value: 'vishama',
        translations: {
          en: 'Variable & Irregular — Some days hungry, other days completely skipped (Vishama Agni)',
          ta: 'மாறுபடும் பசி — ஒரு நாள் அதிக பசி, மற்றொரு நாள் பசியே இல்லாமல் போதல் (விஷம அக்னி)',
          hi: 'अनियमित भूख — कभी बहुत तेज तो कभी बिल्कुल भूख न लगना (विषम अग्नि)',
          ml: 'സ്ഥിരതയില്ലാത്ത വിശപ്പ് — ചിലപ്പോൾ കഠിനമായ വിശപ്പ്, ചിലപ്പോൾ തീരെയില്ലാത്ത അവസ്ഥ (വിഷമ അഗ്നി)',
          te: 'అస్థిరమైన ఆకలి — కొన్ని రోజులు ఎక్కువ, మరికొన్ని రోజులు అసలు ఉండదు (విషమ అగ్ని)',
          kn: 'ಅನಿಶ್ಚಿತ ಹಸಿವು — ಕೆಲವೊಮ್ಮೆ ಹೆಚ್ಚು, ಕೆಲವೊಮ್ಮೆ ಹಸಿವೇ ಇರುವುದಿಲ್ಲ (ವಿಷಮ ಅಗ್ನಿ)',
        }
      }
    ]
  },
  {
    id: 'koshtha_bowel',
    category: 'Koshtha (Bowel Habits)',
    type: 'single_choice',
    required: true,
    translations: {
      en: {
        question: "How are your bowel movements and evacuation habits (Koshtha)?",
        subtext: "Indicates Apana Vata function and digestive toxin (Ama) clearance.",
      },
      ta: {
        question: "உங்கள் மலக்கழிவு மற்றும் குடல் பழக்கம் (கோஷ்டம்) எவ்வாறானது?",
        subtext: "அபான வாதத்தின் செயல்பாட்டை அறிய உதவுகிறது.",
      },
      hi: {
        question: "आपके पेट साफ होने एवं मल त्याग की प्रवृत्ति (कोष्ठ) कैसी है?",
        subtext: "अपान वायु और पाचन तंत्र की शुद्धि का संकेत।",
      },
      ml: {
        question: "നിങ്ങളുടെ മലവിസർജ്ജന രീതിയും ശീലങ്ങളും (കോഷ്ഠം) എങ്ങനെയുള്ളതാണ്?",
        subtext: "അപാനവാതത്തിന്റെ പ്രവർത്തനം വ്യക്തമാക്കുന്നു.",
      },
      te: {
        question: "మీ మల విసర్జన విధానం (కోష్ఠం) ఎలా ఉంటుంది?",
        subtext: "అపాన వాయు పనితీరును సూచిస్తుంది.",
      },
      kn: {
        question: "ನಿಮ್ಮ ಮಲವಿಸರ್ಜನೆಯ ಅಭ್ಯಾಸ (ಕೋಷ್ಠ) ಹೇಗಿದೆ?",
        subtext: "ಅಪಾನ ವಾತದ ಸಮತೋಲನವನ್ನು ತಿಳಿಯಲು.",
      }
    },
    options: [
      {
        id: 'koshtha_1',
        value: 'krura',
        translations: {
          en: 'Hard / Dry stools with tendency to constipation (Krura Koshtha — Vata)',
          ta: 'கடினமான மலம், மலச்சிக்கல் ஏற்படும் தன்மை (க்ரூர கோஷ்டம் — வாதம்)',
          hi: 'कड़ा या सूखा मल, कब्ज की प्रवृत्ति (क्रूर कोष्ठ — वातज)',
          ml: 'കഠിനമായ മലം, മലബന്ധ സാധ്യത (ക്രൂര കോഷ്ഠം — വാതം)',
          te: 'కఠినమైన మలం, మలబద్ధకం (క్రూర కోష్ఠం — వాతం)',
          kn: 'ಗಟ್ಟಿಯಾದ ಮಲ, ಮಲಬದ್ಧತೆ ಪ್ರವೃತ್ತಿ (ಕ್ರೂರ ಕೋಷ್ಠ — ವಾತ)',
        }
      },
      {
        id: 'koshtha_2',
        value: 'mridu',
        translations: {
          en: 'Soft / Loose stools, easily triggered by warm milk or fruit (Mridu Koshtha — Pitta)',
          ta: 'மென்மையான மலம், சூடான பால் குடித்தால் உடனடியாக வெளியேறும் (ம்ருது கோஷ்டம் — பித்தம்)',
          hi: 'नरम या ढीला मल, दूध आदि से तुरंत पेट साफ होना (मृदु कोष्ठ — पित्तज)',
          ml: 'അയഞ്ഞ മലം, ചൂടുപാലോ പഴങ്ങളോ കഴിച്ചാൽ വേഗത്തിൽ വയറൊഴിയുന്നു (മൃദു കോഷ്ഠം — പിത്തം)',
          te: 'మృదువైన మలం, గోరువెచ్చని పాలతో సులభంగా విసర్జన (మృదు కోష్ఠం — పిత్తం)',
          kn: 'ಮೃದುವಾದ ಮಲ, ಹಾಲು ಕುಡಿದರೆ ತಕ್ಷಣ ವಿಸರ್ಜನೆ (ಮೃದು ಕೋಷ್ಠ — ಪಿತ್ತ)',
        }
      },
      {
        id: 'koshtha_3',
        value: 'madhyama',
        translations: {
          en: 'Regular, formed stools 1-2 times daily without strain (Madhyama Koshtha — Kapha/Sama)',
          ta: 'தினசரி 1-2 முறை சிரமமின்றி வழக்கமாக வெளியேறுதல் (மத்யம கோஷ்டம்)',
          hi: 'नियमित, दिन में 1-2 बार बिना किसी परेशानी के (मध्यम कोष्ठ)',
          ml: 'ദിവസേന 1-2 തവണ സാധാരണ രീതിയിൽ (മധ്യമ കോഷ്ഠം)',
          te: 'రోజుకు 1-2 సార్లు ఎలాంటి ఇబ్బంది లేకుండా (మధ్యమ కోష్ఠం)',
          kn: 'ದಿನಕ್ಕೆ 1-2 ಬಾರಿ ಸಹಜವಾಗಿ ಸುಲಭ ವಿಸರ್ಜನೆ (ಮಧ್ಯಮ ಕೋಷ್ಠ)',
        }
      }
    ]
  },
  {
    id: 'nidra_sleep',
    category: 'Nidra (Sleep Quality)',
    type: 'single_choice',
    required: true,
    translations: {
      en: {
        question: "How is your sleep quality and night rest (Nidra)?",
        subtext: "One of the three pillars of health (Trayopastambha).",
      },
      ta: {
        question: "உங்கள் தூக்கத்தின் தரம் (நித்ரா) எவ்வாறு உள்ளது?",
        subtext: "ஆயுர்வேதத்தின் மூன்று முக்கிய தூண்களில் ஒன்று.",
      },
      hi: {
        question: "आपकी नींद की गुणवत्ता (निद्रा) कैसी है?",
        subtext: "आयुर्वेद के तीन उपस्तंभों में से एक महत्वपूर्ण आधार।",
      },
      ml: {
        question: "നിങ്ങളുടെ ഉറക്കത്തിന്റെ ഗുണനിലവാരം (നിദ്ര) എങ്ങനെയുള്ളതാണ്?",
        subtext: "ആരോഗ്യത്തിന്റെ മൂന്ന് അടിസ്ഥാന സ്തംഭങ്ങളിൽ ഒന്ന്.",
      },
      te: {
        question: "మీ నిద్ర నాణ್ಯత (నిద్ర) ఎలా ఉంటుంది?",
        subtext: "ఆరోగ్యానికి ముఖ్యమైన మూడు ఆధారాలలో ఒకటి.",
      },
      kn: {
        question: "ನಿಮ್ಮ ನಿದ್ರೆಯ ಗುಣಮಟ್ಟ (ನಿದ್ರಾ) ಹೇಗಿದೆ?",
        subtext: "ಆರೋಗ್ಯದ ಮೂರು ಮುಖ್ಯ ಸ್ತಂಭಗಳಲ್ಲಿ ಒಂದು.",
      }
    },
    options: [
      {
        id: 'nidra_1',
        value: 'disturbed_light',
        translations: {
          en: 'Light / Interrupted — Wakes up often, difficulty falling asleep (Vata)',
          ta: 'லேசான தூக்கம் — அடிக்கடி விழிப்பு வரும், தூங்குவதில் சிரமம் (வாதம்)',
          hi: 'हल्की व खंडित नींद — बार-बार नींद खुलना, देर से सोना (वातज)',
          ml: 'ഇടവിട്ടുണരുന്ന ഉറക്കം — ഉറങ്ങാൻ പ്രയാസം, പെട്ടെന്ന് ഉണരുന്നു (വാതം)',
          te: 'కలత నిద్ర — తరచుగా మెలకువ రావడం, నిద్ర పట్టడం కష్టం (వాతం)',
          kn: 'ಅರೆಬರೆ ನಿದ್ರೆ — ಆಗಾಗ ಎಚ್ಚರವಾಗುವುದು, ನಿದ್ರೆ ಬರುವುದು ಕಷ್ಟ (ವಾತ)',
        }
      },
      {
        id: 'nidra_2',
        value: 'moderate_pitta',
        translations: {
          en: 'Moderate (6-7 hrs) — Sleeps well, but feels warm or dreams vividly (Pitta)',
          ta: 'மிதமான தூக்கம் (6-7 மணி) — நன்றாக தூங்குவார், ஆனால் அதிக கனவுகள் வரும் (பித்தம்)',
          hi: 'मध्यम (6-7 घंटे) — नींद अच्छी आती है पर सपने अधिक आते हैं (पित्तज)',
          ml: 'മിതമായ ഉറക്കം (6-7 മണിക്കൂർ) — വ്യക്തമായ സ്വപ്നങ്ങൾ കാണുന്നു (പിത്തം)',
          te: 'మితమైన నిద్ర (6-7 గంటలు) — నిద్ర బాగా పడుతుంది కానీ స్పష్టమైన కలలు వస్తాయి (పిత్తం)',
          kn: 'ಮಧ್ಯಮ ನಿದ್ರೆ (6-7 ಗಂಟೆ) — ಚೆನ್ನಾಗಿ ನಿದ್ರೆ, ಆದರೆ ಹೆಚ್ಚು ಕನಸುಗಳು (ಪಿತ್ತ)',
        }
      },
      {
        id: 'nidra_3',
        value: 'deep_heavy',
        translations: {
          en: 'Deep & Heavy — Sleeps > 8 hrs, feels lethargic upon waking (Kapha)',
          ta: 'ஆழ்ந்த கனத்த தூக்கம் — 8 மணி நேரத்திற்கும் மேல் தூங்குதல், எழும்போது சோம்பல் (கபம்)',
          hi: 'गहरी व भारी नींद — 8 घंटे से अधिक सोना, सुबह उठने पर भारीपन (कफज)',
          ml: 'ഗാഢമായ ഉറക്കം — 8 മണിക്കൂറിൽ കൂടുതൽ, ഉണരുമ്പോൾ അലസത (കഫം)',
          te: 'గాఢ నిద్ర — 8 గంటలకు పైగా నిద్ర, ఉదయం లేవగానే బద్ధకం (కఫం)',
          kn: 'ಗಾಢ ನಿದ್ರೆ — 8 ಗಂಟೆಗಿಂತ ಹೆಚ್ಚು, ಎದ್ದಾಗ ನಿಶ್ಯಕ್ತಿ/ಆಲಸ್ಯ (ಕಫ)',
        }
      }
    ]
  },
  {
    id: 'manasa_stress',
    category: 'Manasika (Mental State)',
    type: 'single_choice',
    required: true,
    translations: {
      en: {
        question: "How would you describe your emotional state and stress levels?",
        subtext: "Evaluates Satva, Rajas, and Tamas psychological balance.",
      },
      ta: {
        question: "உங்கள் மனநிலை மற்றும் மன அழுத்தத்தின் தன்மை எவ்வாறு உள்ளது?",
        subtext: "சத்துவ, ரஜஸ், தமஸ் மனோநிலையை மதிப்பிட உதவுகிறது.",
      },
      hi: {
        question: "आप अपनी मानसिक स्थिति और तनाव के स्तर का वर्णन कैसे करेंगे?",
        subtext: "सत्त्व, रज एवं तम मानसिक गुणों का आकलन करने के लिए।",
      },
      ml: {
        question: "നിങ്ങളുടെ മാനസികാവസ്ഥയും സമ്മർദ്ദവും എങ്ങനെയുള്ളതാണ്?",
        subtext: "സത്ത്വ, രജസ്സ്, തമസ്സ് ഗുണങ്ങളെ വിലയിരുത്താൻ സഹായിക്കുന്നു.",
      },
      te: {
        question: "మీ మానసిక స్థితి మరియు ఒత్తిడి స్థాయిని ఎలా వివరిస్తారు?",
        subtext: "సత్వ, రజస్, తమస్ మానసిక సమతుల్యతను అంచనా వేయడానికి.",
      },
      kn: {
        question: "ನಿಮ್ಮ ಮಾನಸಿಕ ಸ್ಥಿತಿ ಮತ್ತು ಒತ್ತಡದ ಮಟ್ಟವನ್ನು ಹೇಗೆ ವಿವರಿಸುತ್ತೀರಿ?",
        subtext: "ಸತ್ವ, ರಜಸ್, ತಮಸ್ ಮಾನಸಿಕ ಸಮತೋಲನವನ್ನು ತಿಳಿಯಲು.",
      }
    },
    options: [
      {
        id: 'manasa_1',
        value: 'anxious_vata',
        translations: {
          en: 'Easily Worried / Overthinking / Restless Mind',
          ta: 'எளிதில் பதற்றம் அடைதல் / அதிக சிந்தனை / அமைதியற்ற மனம்',
          hi: 'जल्दी चिंतित होना / अधिक सोचना / बेचैन मन',
          ml: 'പെട്ടെന്ന് ഉത്കണ്ഠപ്പെടുക / അമിതമായി ചിന്തിക്കുക / അസ്വസ്ഥമായ മനസ്സ്',
          te: 'త్వరగా ఆందోళన చెందడం / అతిగా ఆలోచించడం / అశాంతమైన మనస్సు',
          kn: 'ಬೇಗನೆ ಆತಂಕ / ಅತಿಯಾದ ಆಲೋಚನೆ / ಚಂಚಲ ಮನಸ್ಸು',
        }
      },
      {
        id: 'manasa_2',
        value: 'irritable_pitta',
        translations: {
          en: 'Quick to Anger / Driven / Perfectionist / Impatient',
          ta: 'எளிதில் கோபப்படுதல் / விரைவுத்தன்மை / பொறுமையின்மை',
          hi: 'जल्दी गुस्सा आना / अधीरता / अत्यंत महत्वाकांक्षी',
          ml: 'പെട്ടെന്ന് ദേഷ്യം വരുക / ക്ഷമയില്ലായ്മ / കൃത്യനിഷ്ഠയുള്ള സ്വഭാവം',
          te: 'త్వరగా కోపం రావడం / అసహనం / ఖచ్చితత్వపు పట్టుదల',
          kn: 'ಬೇಗನೆ ಸಿಟ್ಟು ಬರುವುದು / ಅಸಹನೆ / ಕಟ್ಟುನಿಟ್ಟಾದ ಸ್ವಭಾವ',
        }
      },
      {
        id: 'manasa_3',
        value: 'calm_kapha',
        translations: {
          en: 'Calm / Patient / Slow to react / Forgiving',
          ta: 'அமைதியான மனம் / பொறுமை / எளிதில் கோபம் வராது',
          hi: 'शांत / धैर्यवान / स्थिर मन / क्षमाशील',
          ml: 'ശാന്തമായ മനസ്സ് / ക്ഷമയുള്ളവൻ / സ്ഥിരതയുള്ള സ്വഭാവം',
          te: 'ప్రశాంతమైన మనస్సు / ఓర్పు / నెమ్మదైన స్వభാവం',
          kn: 'ಶಾಂತ ಮನಸ್ಸು / ತಾಳ್ಮೆ / ಕ್ಷಮಾಶೀಲತೆ',
        }
      }
    ]
  },
  {
    id: 'past_treatments',
    category: 'Previous Treatment',
    type: 'text_input',
    required: false,
    translations: {
      en: {
        question: "Have you taken any prior medications or Ayurvedic therapies for this?",
        subtext: "Optional: Mention any current allopathic, homeopathic, or herbal medicines.",
      },
      ta: {
        question: "இதற்கு முன்பு ஏதேனும் மருந்துகள் அல்லது ஆயுர்வேத சிகிச்சைகள் எடுத்துள்ளீர்களா?",
        subtext: "விருப்பத்தேர்வு: தற்போதைய அலோபதி அல்லது மூலிகை மருந்துகளைக் குறிப்பிடவும்.",
      },
      hi: {
        question: "क्या आपने पहले इसके लिए कोई दवाई या आयुर्वेदिक उपचार लिया है?",
        subtext: "वैकल्पिक: वर्तमान में ली जा रही किसी भी अंग्रेजी या आयुर्वेदिक दवा का नाम लिखें।",
      },
      ml: {
        question: "ഇതിനുമുമ്പ് എന്തെങ്കിലും മരുന്നുകളോ ആയുർവേദ ചികിത്സയോ എടുത്തിട്ടുണ്ടോ?",
        subtext: "ഓപ്ഷണൽ: നിലവിൽ കഴിക്കുന്ന മരുന്നുകൾ ഉണ്ടെങ്കിൽ വ്യക്തമാക്കുക.",
      },
      te: {
        question: "మీరు గతంలో దీనికి ఏవైనా మందులు లేదా ఆయుర్వేద చికిత్సలు తీసుకున్నారా?",
        subtext: "ఐచ్ఛికం: ప్రస్తుతం వాడుతున్న మందుల వివరాలను పేర్కొనండి.",
      },
      kn: {
        question: "ನೀವು ಈ ಹಿಂದೆ ಇದಕ್ಕಾಗಿ ಯಾವುದೇ ಔಷಧಿ ಅಥವಾ ಆಯುರ್ವೇದ ಚಿಕಿತ್ಸೆ ಪಡೆದಿದ್ದೀರಾ?",
        subtext: "ಐಚ್ಛಿಕ: ಪ್ರಸ್ತುತ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿರುವ ಔಷಧಿಗಳನ್ನು ನಮೂದಿಸಿ.",
      }
    }
  }
];
