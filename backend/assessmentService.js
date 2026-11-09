/**
 * SANAD Abu Dhabi - Assessment & Clinical Scoring Microservice
 * Standardized Psychometric Evaluation (PHQ-9, GAD-7, WHO-5)
 * Compliant with DoH Abu Dhabi Clinical Safety Guidelines
 */

const crypto = require('crypto');

const INSTRUMENTS = {
  phq9: {
    name: "PHQ-9 Mood & Vitality",
    loinc: "44249-1",
    itemCount: 9,
    maxPerItem: 3,
    evaluate: (answers) => {
      let score = 0;
      let hasItem9Risk = false;
      
      for (let i = 1; i <= 9; i++) {
        const val = parseInt(answers[`q${i}`] ?? answers[i - 1] ?? 0, 10);
        score += val;
        if (i === 9 && val > 0) {
          hasItem9Risk = true;
        }
      }

      let severity = { en: "Minimal Distress", ar: "أعراض طفيفة جداً" };
      let tier = 1;

      if (score >= 20) {
        severity = { en: "Severe Distress Indicator", ar: "مؤشر أعراض شديدة" };
        tier = 5;
      } else if (score >= 15) {
        severity = { en: "Moderately Severe Distress", ar: "أعراض شديدة معتدلة" };
        tier = 4;
      } else if (score >= 10) {
        severity = { en: "Moderate Distress", ar: "أعراض متوسطة الشدة" };
        tier = 3;
      } else if (score >= 5) {
        severity = { en: "Mild Emotional Pressure", ar: "ضيق نفسي خفيف" };
        tier = 2;
      }

      return {
        score,
        maxScore: 27,
        tier,
        severity,
        hasCrisisRisk: hasItem9Risk,
        crisisReason: hasItem9Risk ? "PHQ-9 Item 9 positive endorsement (thoughts of self-harm)" : null
      };
    }
  },
  gad7: {
    name: "GAD-7 Anxiety & Worry",
    loinc: "69737-5",
    itemCount: 7,
    maxPerItem: 3,
    evaluate: (answers) => {
      let score = 0;
      for (let i = 1; i <= 7; i++) {
        const val = parseInt(answers[`g${i}`] ?? answers[i - 1] ?? 0, 10);
        score += val;
      }

      let severity = { en: "Minimal Anxiety", ar: "قلق طفيف طبيعي" };
      let tier = 1;

      if (score >= 15) {
        severity = { en: "High Anxiety Indicator", ar: "مؤشر قلق مرتفع" };
        tier = 4;
      } else if (score >= 10) {
        severity = { en: "Moderate Anxiety", ar: "قلق متوسط الشدة" };
        tier = 3;
      } else if (score >= 5) {
        severity = { en: "Mild Anxiety Pressure", ar: "توتر خفيف" };
        tier = 2;
      }

      return {
        score,
        maxScore: 21,
        tier,
        severity,
        hasCrisisRisk: false,
        crisisReason: null
      };
    }
  },
  who5: {
    name: "WHO-5 Well-Being Index",
    loinc: "77242-6",
    itemCount: 5,
    maxPerItem: 5,
    evaluate: (answers) => {
      let score = 0;
      for (let i = 1; i <= 5; i++) {
        const val = parseInt(answers[`w${i}`] ?? answers[i - 1] ?? 0, 10);
        score += val;
      }

      const percentage = score * 4; // 0 - 100%
      let severity = { en: "High Vitality & Wellbeing", ar: "عافية ونشاط نفسي مرتفع" };
      let tier = 1;

      if (percentage < 28) {
        severity = { en: "Low Well-Being Indicator", ar: "مؤشر انخفاض حاد في العافية النفسية" };
        tier = 4;
      } else if (percentage < 50) {
        severity = { en: "Reduced Vitality & Low Motivation", ar: "انخفاض ملحوظ في الحيوية والدافعية" };
        tier = 3;
      } else if (percentage < 70) {
        severity = { en: "Moderate Vitality (Mild Fatigue)", ar: "عافية معتدلة مع بعض الإرهاق" };
        tier = 2;
      }

      return {
        score,
        maxScore: 25,
        percentage,
        tier,
        severity,
        hasCrisisRisk: false,
        crisisReason: null
      };
    }
  }
};

function evaluateAssessment(instrumentType, answers, clientPseudonym = null) {
  const instrument = INSTRUMENTS[instrumentType.toLowerCase()];
  if (!instrument) {
    throw new Error(`Unsupported psychometric instrument: ${instrumentType}. Supported: phq9, gad7, who5.`);
  }

  const result = instrument.evaluate(answers);
  
  // Non-diagnostic governance notice
  const disclaimer = {
    en: "Notice: This score is an indicator of current symptom intensity and daily functioning. It does not establish a medical diagnosis or replace a licensed clinical evaluation.",
    ar: "تنويه سريري: هذه النتيجة تعبر عن مؤشر لشدة الأعراض الحالية والتوازن اليومي، ولا تشكل أي تشخيص طبي أو بديلاً عن التقييم الإكلينيكي المرخص."
  };

  const auditToken = crypto
    .createHash('sha256')
    .update(`${instrumentType}:${result.score}:${Date.now()}:${clientPseudonym || 'ANON'}`)
    .digest('hex')
    .substring(0, 16);

  return {
    instrument: instrumentType.toUpperCase(),
    instrumentName: instrument.name,
    loincCode: instrument.loinc,
    score: result.score,
    maxScore: result.maxScore,
    percentage: result.percentage ?? Math.round((result.score / result.maxScore) * 100),
    recommendedTier: result.tier,
    severity: result.severity,
    isCrisisTriggered: result.hasCrisisRisk,
    crisisReason: result.crisisReason,
    auditChecksum: auditToken,
    disclaimer,
    evaluatedAt: new Date().toISOString()
  };
}

module.exports = {
  INSTRUMENTS,
  evaluateAssessment
};

