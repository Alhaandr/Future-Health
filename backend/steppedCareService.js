/**
 * SANAD Abu Dhabi - Stepped Care & Clinician Directory Microservice
 * Manages 5 Tiers of Care & Anonymous Tele-Mental Health Booking
 */

const crypto = require('crypto');

const TIERS = [
  {
    level: 1,
    title: { en: "Level 1: Self-Guided Digital Support", ar: "المستوى 1: أدوات رقمية موجهة ذاتياً" },
    description: {
      en: "Evidence-informed cognitive exercises, Arabic/English mindfulness audio, and sleep architecture tracking.",
      ar: "تمارين معرفية سلوكية، وتأملات باللغة العربية، وأدلة تحسين جودة النوم ونمط الحياة."
    },
    suitableScoreBand: "Minimal Distress / Preventive Wellness",
    targetWaitTime: "Instant (0 hours)",
    category: "self_help"
  },
  {
    level: 2,
    title: { en: "Level 2: Approved Community Support & Peer Circles", ar: "المستوى 2: مبادرات الدعم المجتمعي والحلقات الشبابية" },
    description: {
      en: "DoH-accredited youth circles, cultural wellness walks at Saadiyat, and maternal peer support networks.",
      ar: "حلقات شبابية معتمدة، وأنشطة تواصل مجتمعي وثقافي في السعديات، ومجموعات أمهات داعمة."
    },
    suitableScoreBand: "Mild Distress / Social Adjustment",
    targetWaitTime: "Within 2 - 4 Days",
    category: "community"
  },
  {
    level: 3,
    title: { en: "Level 3: Primary Healthcare Integration (GPs)", ar: "المستوى 3: مراكز الرعاية الصحية الأولية (طب الأسرة)" },
    description: {
      en: "Holistic medical triage and physical/mental health assessment at SEHA, AHS, or private clinics.",
      ar: "استشارات طب الأسرة والتقييم الشامل في مراكز صحة والخدمات العلاجية الخارجية والقطاع الخاص."
    },
    suitableScoreBand: "Moderate Distress / Somatic Symptoms",
    targetWaitTime: "24 - 48 Hours",
    category: "primary_care"
  },
  {
    level: 4,
    title: { en: "Level 4: Licensed Tele-Mental Health Consultations", ar: "المستوى 4: الاستشارات النفسية المرئية المرخصة" },
    description: {
      en: "Confidential virtual 1-on-1 consultations with DoH-licensed clinical psychologists and therapists.",
      ar: "جلسات فردية آمنة ومحمية عن بُعد مع أخصائيين نفسيين مرخصين من دائرة الصحة بأبوظبي."
    },
    suitableScoreBand: "Moderately Severe Distress / Persistent Worry",
    targetWaitTime: "12 - 24 Hours",
    category: "tele_mental_health"
  },
  {
    level: 5,
    title: { en: "Level 5: Specialist & Tertiary Psychiatric Care", ar: "المستوى 5: الرعاية التخصصية والطب النفسي المتقدم" },
    description: {
      en: "Direct priority referral to specialized hospital psychiatric departments (SKMC, CCAD, ACPN).",
      ar: "تحويل مباشر للمستشفيات التخصصية مثل مدينة الشيخ خليفة الطبية، كليفلاند كلينك، والمركز الأمريكي."
    },
    suitableScoreBand: "Severe Distress / Complex Comorbidity",
    targetWaitTime: "Expedited Priority (< 12 Hours)",
    category: "specialist_psychiatry"
  }
];

const CLINICIANS = [
  {
    id: 1,
    name: { en: "Dr. Fatima Al-Zaabi", ar: "د. فاطمة الزعابي" },
    title: { en: "Consultant Clinical Psychologist", ar: "استشارية علم النفس الإكلينيكي" },
    clinic: { en: "SEHA / AHS Community Health Clinic", ar: "شركة صحة / الخدمات العلاجية الخارجية" },
    dohLicense: "DoH-PSY-8421",
    tier: 4,
    languages: ["Arabic (Emirati)", "English"],
    insurance: ["Thiqa", "Daman Enhanced"],
    waitHours: 18,
    slots: ["Tomorrow at 10:00 AM", "Tomorrow at 2:30 PM", "Wednesday at 11:00 AM"]
  },
  {
    id: 2,
    name: { en: "Dr. Marcus Vance", ar: "د. ماركوس فانس" },
    title: { en: "Senior Behavioral Specialist (CBT/ACT)", ar: "أخصائي أول في العلاج المعرفي السلوكي" },
    clinic: { en: "Cleveland Clinic Abu Dhabi", ar: "مستشفى كليفلاند كلينك أبوظبي" },
    dohLicense: "DoH-PSY-9104",
    tier: 4,
    languages: ["English", "German"],
    insurance: ["Daman Enhanced", "NAS"],
    waitHours: 28,
    slots: ["Thursday at 11:15 AM", "Thursday at 4:00 PM"]
  },
  {
    id: 3,
    name: { en: "Dr. Laila Mansoor", ar: "د. ليلى منصور" },
    title: { en: "Specialist Psychotherapist (Mood & Perinatal)", ar: "أخصائية علاج نفسي (المزاج وصحة المرأة)" },
    clinic: { en: "American Center for Psychiatry & Neurology (ACPN)", ar: "المركز الأمريكي للطب النفسي والعصبي" },
    dohLicense: "DoH-PSY-7319",
    tier: 4,
    languages: ["Arabic (Levantine)", "English", "French"],
    insurance: ["Thiqa", "Daman Enhanced", "Self-pay"],
    waitHours: 8,
    slots: ["Today at 5:00 PM", "Tomorrow at 9:00 AM", "Thursday at 2:00 PM"]
  },
  {
    id: 4,
    name: { en: "Dr. Rajesh Nair", ar: "د. راجيش ناير" },
    title: { en: "Adult Clinical Psychologist", ar: "أخصائي علم النفس السريري للبالغين" },
    clinic: { en: "Maudsley Health Abu Dhabi", ar: "مودزلي هيلث أبوظبي" },
    dohLicense: "DoH-PSY-6208",
    tier: 4,
    languages: ["English", "Hindi", "Malayalam"],
    insurance: ["Thiqa", "Daman Enhanced"],
    waitHours: 24,
    slots: ["Tomorrow at 1:00 PM", "Friday at 10:30 AM"]
  },
  {
    id: 5,
    name: { en: "Dr. Sultan Al-Nuaimi", ar: "د. سلطان النعيمي" },
    title: { en: "Consultant Family Medicine & Primary Care", ar: "استشاري طب الأسرة والرعاية الصحية الأولية" },
    clinic: { en: "SEHA Al Bateen Healthcare Center", ar: "مركز البطين الصحي - صحة" },
    dohLicense: "DoH-FAM-3312",
    tier: 3,
    languages: ["Arabic (Emirati)", "English"],
    insurance: ["Thiqa", "Daman Enhanced", "All Basic"],
    waitHours: 24,
    slots: ["Tomorrow at 8:30 AM", "Tomorrow at 1:00 PM"]
  }
];

// In-memory anonymous booking store
const bookingsDatabase = [];

function getTiers() {
  return TIERS;
}

function getClinicians(filters = {}) {
  let list = [...CLINICIANS];

  if (filters.tier) {
    const t = parseInt(filters.tier, 10);
    list = list.filter(c => c.tier === t);
  }

  if (filters.language && filters.language !== 'all') {
    const langLower = filters.language.toLowerCase();
    list = list.filter(c => c.languages.some(l => l.toLowerCase().includes(langLower)));
  }

  if (filters.insurance && filters.insurance !== 'all') {
    const insLower = filters.insurance.toLowerCase();
    list = list.filter(c => c.insurance.some(i => i.toLowerCase().includes(insLower)));
  }

  return list;
}

function bookAppointment(clinicianId, slotTime, clientToken = null) {
  const clinician = CLINICIANS.find(c => c.id === parseInt(clinicianId, 10));
  if (!clinician) {
    throw new Error(`Clinician ID ${clinicianId} not found in DoH registry.`);
  }

  const bookingToken = 'SANAD-BOOK-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const encryptedRoomId = 'room_' + crypto.randomBytes(8).toString('hex');

  const booking = {
    bookingToken,
    clinicianId: clinician.id,
    clinicianName: clinician.name,
    clinic: clinician.clinic,
    dohLicense: clinician.dohLicense,
    slotTime: slotTime || clinician.slots[0],
    encryptedRoomUri: `https://telehealth.sanad.doh.gov.ae/v/${encryptedRoomId}`,
    clientToken: clientToken || 'ANON-' + crypto.randomBytes(3).toString('hex'),
    createdAt: new Date().toISOString(),
    status: "CONFIRMED_ANONYMOUS"
  };

  bookingsDatabase.push(booking);
  return booking;
}

module.exports = {
  getTiers,
  getClinicians,
  bookAppointment
};

