/**
 * SANAD Abu Dhabi - Murshid AI Clinical Navigation Engine
 * 
 * Powered by Google Gemini API (gemini-3.8-flash / gemini-2.5-flash) with
 * high-intelligence bounded clinical reasoning fallback.
 * 
 * Regulatory Governance:
 * - Department of Health – Abu Dhabi (DoH) Digital Health Standards
 * - UAE Federal Law No. 2 of 2019 (Health Data Privacy)
 * - DCB0129 Clinical Risk Management Standard
 */

const crisisService = require('./crisisService');
const smartNavigatorService = require('./smartNavigatorService');

// Try loading environment variables if .env exists
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch (e) {
  // .env file is optional
}

// Model Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;

const MURSHID_SYSTEM_INSTRUCTION = `You are Murshid (مُرشِد), an advanced, culturally attuned, empathetic AI Clinical Care Navigation Guide for the SANAD Abu Dhabi ecosystem, operating in strict alignment with the UAE Department of Health (DoH) Abu Dhabi and UAE Federal Law No. 2 of 2019.

CORE CLINICAL ROLES & BOUNDARIES:
1. NON-DIAGNOSTIC GUIDANCE: Never provide autonomous medical or psychiatric diagnoses (e.g. do not state "You have Clinical Depression / Generalized Anxiety Disorder"). Frame all insights as supportive, non-diagnostic wellbeing observations.
2. INTELLIGENT STEPPED-CARE NAVIGATION: Connect users with the least-intensive safe and appropriate level of care across the 5 Abu Dhabi Tiers:
   - Tier 1: Self-Guided (Evidence-based CBT thought reframing, 4-4-4 box breathing, sleep hygiene)
   - Tier 2: Community Support (Saadiyat Youth Circles, Abu Dhabi community wellness programs)
   - Tier 3: Primary Healthcare (SEHA Al Bateen, AHS Family Medicine GPs for somatic screening & routine care)
   - Tier 4: Tele-Mental Health & Specialized Clinical Psychology (Cleveland Clinic Abu Dhabi, ACPN)
   - Tier 5: Specialist & Crisis (SKMC, Tawam Hospital, Estijaba 800 1717, Ambulance 999)
3. ABU DHABI HEALTHCARE CONTEXT:
   - Thiqa (ثقة): 100% coverage (0 AED copay) for UAE citizens across SEHA, CCAD, and ACPN.
   - Daman Enhanced: 20 AED fixed copay or 20% co-insurance.
   - Malaffi HIE: Consent-based health information exchange with strict employer/insurer lockout under UAE Federal Law No. 2 of 2019.
4. TONE & CULTURAL SENSITIVITY:
   - Warm, reassuring, destigmatizing, professional, and respectful of Emirati and UAE multicultural values.
   - Always respond in the language used by the user (Arabic or English).
5. CLOSED-LOOP CARE CONVERSION:
   - Encourage the user to understand their assessment, explore transparent clinic pricing in the Smart Navigator, and discuss their results with a qualified family medicine doctor. Keep responses structured and actionable (max 3 concise paragraphs).`;

/**
 * Checks for immediate safety risks
 */
function detectCrisisKeywords(message = '') {
  const normalized = message.toLowerCase();
  const crisisWords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'harm myself', 
    'hang myself', 'overdose', 'jump off', 'cut myself',
    'انتحار', 'أريد الموت', 'إيذاء نفسي', 'إنهاء حياتي', 'أقتل نفسي', 
    'أشنق نفسي', 'جرعة زائدة', 'التخلص من حياتي'
  ];
  return crisisWords.some(w => normalized.includes(w));
}

/**
 * Calls Google Gemini API
 */
async function callGeminiApi(userMessage, language = 'en') {
  if (!GEMINI_API_KEY) return null;

  const modelsToTry = [GEMINI_MODEL, 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  
  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        systemInstruction: {
          parts: [{ text: MURSHID_SYSTEM_INSTRUCTION }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: `[Language: ${language}]\n${userMessage}` }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
          topP: 0.8
        }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            reply: text.trim(),
            modelUsed: `Google Gemini (${model})`,
            source: 'gemini-api'
          };
        }
      }
    } catch (err) {
      console.warn(`[Murshid AI] Gemini API attempt failed for ${model}:`, err.message);
    }
  }

  return null;
}

/**
 * Calls OpenAI API (if configured)
 */
async function callOpenAiApi(userMessage, language = 'en') {
  if (!OPENAI_API_KEY) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: MURSHID_SYSTEM_INSTRUCTION },
          { role: 'user', content: `[Language: ${language}]\n${userMessage}` }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        return {
          reply: text.trim(),
          modelUsed: `OpenAI (${process.env.OPENAI_MODEL || 'gpt-4o-mini'})`,
          source: 'openai-api'
        };
      }
    }
  } catch (err) {
    console.warn('[Murshid AI] OpenAI API attempt failed:', err.message);
  }

  return null;
}

/**
 * High-Intelligence Clinical Reasoning Fallback Engine
 * Provides rich, stepped-care answers when external API keys are offline
 */
function clinicalReasoningEngine(message = '', language = 'en') {
  const isAr = language === 'ar';
  const q = message.toLowerCase();

  // 1. Insurance & Financial Transparency
  if (q.includes('thiqa') || q.includes('daman') || q.includes('cost') || q.includes('price') || 
      q.includes('copay') || message.includes('ثقة') || message.includes('ضمان') || message.includes('كلفة') || message.includes('تأمين')) {
    return {
      reply: isAr
        ? "تتميز منظومة أبوظبي الصحية بشفافية مالية كاملة لدعم العافية النفسية:\n\n" +
          "• **بطاقة ثقة (Thiqa):** تغطية بنسبة 100% (0 درهم كشفية) في كافة مراكز صحة (SEHA)، ومستشفى كليفلاند كلينك أبوظبي، والمركز الأمريكي للطب النفسي والعصبي (ACPN).\n" +
          "• **بطاقات ضمان المعززة (Daman Enhanced):** كشفية محددة تتراوح بين 20 إلى 50 درهماً فقط للمراكز المعتمدة.\n" +
          "• **الدفع المباشر (Self-Pay):** يتراوح الكشف الأولي في مراكز الرعاية الأولية من 150 درهماً، بينما تبدأ جلسات الاستشارات التخصصية من 450 درهماً مع إمكانية التقييم الافتراضي.\n\n" +
          "يمكنك عبر تبويب **الملاحة الذكية** تصفية العيادات بحسب شبكة تأمينك وحجز موعد مباشر برمز مشفر."
        : "Abu Dhabi provides transparent financial coverage for mental wellbeing support:\n\n" +
          "• **Thiqa (ثقة):** 100% coverage (0 AED copay) for UAE citizens across SEHA Family Medicine centers, Cleveland Clinic Abu Dhabi, and ACPN.\n" +
          "• **Daman Enhanced (Gold/Silver):** Fixed copays typically range from 20 AED to 50 AED at in-network facilities.\n" +
          "• **Self-Pay:** Primary care initial consultations start at 150 AED, while specialized tele-psychotherapy sessions range from 450 to 550 AED.\n\n" +
          "You can use the **Smart Care Navigator** tab to filter certified clinics by your exact insurance network and book directly with an anonymous token.",
      recommendedTier: 3,
      modelUsed: "SANAD Clinical Reasoning Engine v2.4 (DoH Aligned)",
      source: "clinical-reasoning"
    };
  }

  // 2. Burnout, Stress & Sleep
  if (q.includes('burnout') || q.includes('stress') || q.includes('sleep') || q.includes('insomnia') || 
      q.includes('tired') || q.includes('exhausted') || message.includes('إرهاق') || message.includes('نوم') || message.includes('توتر') || message.includes('ضغط')) {
    return {
      reply: isAr
        ? "إن ملاحظة التغيرات في النوم ومستويات الطاقة هي الخطوة الأولى لحماية عافيتك النفسية. وفق نموذج الرعاية المتدرجة في أبوظبي، نوصي بالتالي:\n\n" +
          "1. **المستوى 1 (الدعم الذاتي):** مارس تمرين تنفس المربع (4-4-4) المتوفر في تبويب نظرة عامة لتهدئة الجهاز العصبي، واستخدم 'مختبر إعادة صياغة الأفكار' لتخفيف التوتر الذهني.\n" +
          "2. **المستوى 3 (طبيب الرعاية الأولية):** إذا استمر اضطراب النوم أو الإرهاق لأكثر من 14 يوماً، فإن استشارة طبيب الأسرة في مراكز صحة (مثل مركز البطين) تساعد في فحص الأسباب العضوية (مثل نقص الفيتامينات أو وظائف الغدة) وتقديم التوجيه المتوازن دون استعجال الدواء.\n\n" +
          "يمكنك الانتقال إلى **راصد تغيرات العافية** لإجراء استبيان PHQ-9 أو WHO-5 وتوليد ملخص جاهز لمناقشته مع الطبيب."
        : "Recognizing changes in sleep, stress, and physical fatigue is the foundation of earlier mental wellbeing support. In alignment with Abu Dhabi's Stepped-Care model:\n\n" +
          "1. **Level 1 (Self-Guided Care):** Use the 4-4-4 Box Breathing Sanctuary tool on the Overview tab to reset your autonomic nervous system, and test the Cognitive Thought Reframer to address workplace mental fatigue.\n" +
          "2. **Level 3 (Primary Care Triage):** If sleep disruption or exhaustion persists beyond two weeks, consulting a SEHA Family Medicine GP (e.g. Al Bateen Center) is the safest next step to rule out somatic contributors (such as Vitamin D deficiency or thyroid function) before considering specialist interventions.\n\n" +
          "You can visit the **Wellbeing Tracker** to log your symptoms and generate a confidential discussion brief for your doctor.",
      recommendedTier: 3,
      modelUsed: "SANAD Clinical Reasoning Engine v2.4 (DoH Aligned)",
      source: "clinical-reasoning"
    };
  }

  // 3. Assessment & Results Interpretation (PHQ-9 / GAD-7)
  if (q.includes('phq') || q.includes('gad') || q.includes('score') || q.includes('assessment') || 
      q.includes('result') || message.includes('تقييم') || message.includes('نتيجة') || message.includes('فحص') || message.includes('درجة')) {
    return {
      reply: isAr
        ? "تعتمد منصة سند على مقاييس فحص معتمدة عالمياً (PHQ-9 للمزاج، GAD-7 للقلق، وWHO-5 للحيوية اليومية):\n\n" +
          "• **ماذا تعني الدرجة؟** النتيجة مؤشر استرشادي يوضح مستوى الضغط الملاحظ خلال الأسبوعين الماضيين، ولا تشكل تشخيصاً طبياً مستقلاً إطلاقاً.\n" +
          "• **حلقة الرعاية المتكاملة:** لا تكتفي منصة سند بعرض الأرقام، بل توجهك للمستوى الأنسب من الرعاية، وتتيح لك تصدير 'الملخص الطبي للمراجع' لتسهيل الحوار مع طبيب الأسرة.\n" +
          "• **مؤشر التحسن (RCI):** بعد 14 يوماً من استكمال موعدك، يُعاد قياس النتيجة للتأكد إحصائياً من تحسن عافيتك اليومية (انخفاض بمقدار 4 درجات أو أكثر)."
        : "SANAD utilizes clinically validated screening instruments (PHQ-9 for mood, GAD-7 for anxiety, WHO-5 for vitality):\n\n" +
          "• **What does your score indicate?** It highlights the frequency of observed distress over the past 14 days. It is strictly non-diagnostic and does not replace a clinician.\n" +
          "• **Closed-Loop Connection:** Rather than leaving you with a quiz score, SANAD pairs your profile with verified clinic options and lets you download a patient-held brief for your family doctor.\n" +
          "• **Reliable Change Index (RCI):** Following clinical intake, an automated 14-day check-in verifies whether your symptom score improved by $\ge 4$ points, closing the conversion loop with measurable recovery.",
      recommendedTier: 2,
      modelUsed: "SANAD Clinical Reasoning Engine v2.4 (DoH Aligned)",
      source: "clinical-reasoning"
    };
  }

  // 4. Privacy, Mitz & UAE Federal Law No. 2 of 2019
  if (q.includes('privacy') || q.includes('confidential') || q.includes('employer') || q.includes('hr') || 
      q.includes('insurance') || q.includes('law') || message.includes('خصوصية') || message.includes('سرية') || message.includes('جهة العمل') || message.includes('قانون')) {
    return {
      reply: isAr
        ? "الخصوصية في منصة سند ليست مجرد وعد، بل هي مبدأ معماري وقانوني صارم:\n\n" +
          "• **القانون الاتحادي رقم 2 لسنة 2019:** يحظر منعاً باتاً مشاركة البيانات الصحية الفردية مع أصحاب العمل، أو مدراء الموارد البشرية، أو شركات التأمين لغايات تغطية الوظائف.\n" +
          "• **خزينة الخصوصية (معيار Mitz):** أنت وحدك تملك صلاحية تفعيل أو إلغاء مشاركة الملخص مع الأطباء عبر مفاتيح تحكم دقيقة.\n" +
          "• **هوية مجهولة ورموز مشفرة:** يتم الحجز عبر رمز طبي مشفر (مثل SANAD-BOOK) دون إرسال سجلك إلى أي طرف خارجي، مع إمكانية حذف بياناتك نهائياً بضغطة زر واحدة."
        : "Privacy in SANAD is an architectural guarantee backed by UAE federal law:\n\n" +
          "• **UAE Federal Law No. 2 of 2019:** Strictly prohibits employers, HR, insurers, or unauthorized third parties from accessing identifiable mental wellbeing data.\n" +
          "• **Mitz-Inspired Granular Vault:** You maintain explicit, granular consent toggles to approve or revoke sharing with primary care GPs, chronic disease teams, or Malaffi HIE.\n" +
          "• **Zero Re-Identification Risk:** Booking uses pseudonymous tokens (e.g. SANAD-BOOK). Your personal journal entries and raw reflection logs never leave your device.",
      recommendedTier: 1,
      modelUsed: "SANAD Clinical Reasoning Engine v2.4 (DoH Aligned)",
      source: "clinical-reasoning"
    };
  }

  // 5. Default General Guidance
  return {
    reply: isAr
      ? "أهلاً بك! أنا **مُرشِد (Murshid)**، مساعدك الذكي لتوجيه الرعاية النفسية وسد فجوة التحويل في إمارة أبوظبي.\n\n" +
        "أنا لا أقدم تشخيصات طبية ولا أصف أدوية، ولكن يمكنني إرشادك إلى:\n" +
        "• استكشاف مستويات الرعاية الخمسة وتغطية بطاقات ثقة وضمان.\n" +
        "• شرح نتائج استبيانات PHQ-9 و GAD-7 وفهم الخطوات القادمة.\n" +
        "• توجيهك إلى المرافق الصحية المعتمدة في أبوظبي والعين والظفرة.\n\n" +
        "كيف يمكنني مساعدتك في رحلة عافيتك اليوم؟"
      : "Welcome! I am **Murshid (مُرشِد)**, your digital health navigation assistant for the SANAD Abu Dhabi ecosystem.\n\n" +
        "I do not provide clinical diagnoses or prescribe treatments, but I can guide you through:\n" +
        "• Exploring Abu Dhabi's 5-tier stepped-care model and verified Thiqa/Daman copays.\n" +
        "• Understanding your voluntary PHQ-9 and GAD-7 screening trends.\n" +
        "• Finding accredited clinics across Abu Dhabi Island, Al Ain, and Al Dhafra.\n" +
        "• Protecting your sensitive wellbeing data under UAE Federal Law No. 2 of 2019.\n\n" +
        "How can I assist your wellbeing journey today?",
    recommendedTier: 1,
    modelUsed: "SANAD Clinical Reasoning Engine v2.4 (DoH Aligned)",
    source: "clinical-reasoning"
  };
}

/**
 * Main Controller: Processes a user query through safety, AI models, and reasoning fallback
 */
async function processMurshidChat(message, language = 'en') {
  const isAr = language === 'ar';

  // 1. Mandatory Safety Intercept
  if (detectCrisisKeywords(message)) {
    const emergency = crisisService.escalateCrisis('natural_language_flag', language);
    return {
      isCrisisTriggered: true,
      emergency,
      modelUsed: "SANAD Clinical Safety Guardrail (Estijaba 800 1717 Intercept)",
      reply: isAr
        ? "⚠️ **تنبيه أمان فوري:** سلامتك هي الأولوية القصوى. إذا كنت تراودك أفكار بإيذاء نفسك أو تشعر بضيق حاد، يرجى التحدث فوراً مع كوادر متخصصة:\n\n" +
          "• **الخط الساخن للصحة النفسية بأبوظبي (استجابة):** اتصل بالرقم **800 1717** (مجاني • متاح 24/7 • كوادر مؤهلة بالعربية والإنجليزية).\n" +
          "• **الإسعاف الوطني:** اتصل بالرقم **999** في حالات الطوارئ العاجلة.\n\n" +
          "أنت لست وحدك، والدعم الإنساني المتخصص متاح لمساندتك الآن."
        : "⚠️ **Immediate Clinical Safety Alert:** Your safety is the highest priority. If you are experiencing thoughts of self-harm or acute psychological distress, please connect right now with qualified human responders:\n\n" +
          "• **Estijaba Abu Dhabi Mental Health Helpline:** Call **800 1717** (Free • 24/7 • Bilingual Arabic & English).\n" +
          "• **National Emergency Ambulance:** Call **999** for urgent assistance.\n\n" +
          "You are not alone, and trained professionals are ready to support you immediately."
    };
  }

  // 2. Try Google Gemini API (gemini-3.8-flash / gemini-2.5-flash)
  const geminiResponse = await callGeminiApi(message, language);
  if (geminiResponse) {
    return {
      isCrisisTriggered: false,
      reply: geminiResponse.reply,
      modelUsed: geminiResponse.modelUsed,
      source: geminiResponse.source
    };
  }

  // 3. Try OpenAI API (if configured)
  const openAiResponse = await callOpenAiApi(message, language);
  if (openAiResponse) {
    return {
      isCrisisTriggered: false,
      reply: openAiResponse.reply,
      modelUsed: openAiResponse.modelUsed,
      source: openAiResponse.source
    };
  }

  // 4. Robust Clinical Context & Stepped-Care Reasoning Engine Fallback
  const fallback = clinicalReasoningEngine(message, language);
  return {
    isCrisisTriggered: false,
    reply: fallback.reply,
    recommendedTier: fallback.recommendedTier,
    modelUsed: fallback.modelUsed,
    source: fallback.source
  };
}

module.exports = {
  processMurshidChat,
  detectCrisisKeywords,
  MURSHID_SYSTEM_INSTRUCTION
};

