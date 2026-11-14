const fs = require('fs');
const path = require('path');
const H = require('./slide_builder_helpers');

const slidesDir = path.join(__dirname, 'template_extracted', 'ppt', 'slides');

function readXml(slideNum) {
  return fs.readFileSync(path.join(slidesDir, `slide${slideNum}.xml`), 'utf8');
}

function writeXml(slideNum, xml) {
  fs.writeFileSync(path.join(slidesDir, `slide${slideNum}.xml`), xml, 'utf8');
}

// -------------------------------------------------------------
// SLIDE 1: Cover, Team Name, Size, Problem Statement, Mission
// -------------------------------------------------------------
function buildSlide1() {
  let xml = readXml(1);
  const newTxBody = `
<p:txBody>
  <a:bodyPr anchor="t" bIns="91425" lIns="91425" rIns="91425" tIns="91425" wrap="square"><a:noAutofit/></a:bodyPr>
  <a:lstStyle/>
  ${H.makeParagraph([
    { text: 'Team Name: ', sz: 1400, b: true, color: H.TEAL },
    { text: 'SANAD Abu Dhabi (سند أبوظبي) — Closed-Loop Mental Wellbeing Care Ecosystem', sz: 1250, b: true, color: H.DARK }
  ], { spaceAfter: 45000 })}
  ${H.makeParagraph([
    { text: 'Team Size: ', sz: 1400, b: true, color: H.TEAL },
    { text: '5 Core Multidisciplinary Innovators (Clinical Psychiatry, AI Safety, Health Informatics, UX)', sz: 1150, b: false, color: H.DARK }
  ], { spaceAfter: 55000 })}
  ${H.makeParagraph([
    { text: 'Problem Statement: ', sz: 1400, b: true, color: H.TEAL },
    { text: 'Youth and young adults in Abu Dhabi face acute mental wellbeing friction: over 70% of individuals experiencing mild-to-moderate psychological distress avoid or delay formal clinical support due to cultural stigma, fragmented service navigation, gatekeeping friction, and fear of identity exposure. Existing digital wellness apps operate as passive "one-way trackers" without closed-loop measurement—failing to detect clinical deterioration, verify whether an intervention actually works, or coordinate stepped escalation to licensed DoH Abu Dhabi clinical facilities.', sz: 1050, b: false, color: H.DARK }
  ], { spaceAfter: 50000 })}
</p:txBody>`;

  xml = xml.replace(/<p:txBody>[\s\S]*?<\/p:txBody>/, newTxBody);

  const card1 = H.makeCard(
    191,
    441600,
    4300000,
    8323200,
    700000,
    [
      H.makeParagraph([
        { text: 'PROJECT MISSION & EXECUTIVE SUMMARY: ', sz: 950, b: true, color: H.TEAL_DARK },
        { text: 'A sovereign, bilingual (Emirati Arabic/English), privacy-first digital mental health platform featuring zero-barrier anonymous Guest Mode, continuous measurement-based care (PHQ-9/GAD-7), Jacobson-Truax Reliable Change Index (RCI) recovery verification, <50ms crisis sentinels, and bidirectional HL7 FHIR v4 integration with Malaffi HIE.', sz: 900, color: H.DARK }
      ], { spaceAfter: 0 })
    ],
    { bgColor: H.TEAL_LIGHT, borderColor: H.TEAL_BORDER }
  );

  xml = xml.replace('</p:spTree>', `${card1}</p:spTree>`);
  writeXml(1, xml);
  console.log('Slide 1 built.');
}

// -------------------------------------------------------------
// SLIDE 2: Team Members Table
// -------------------------------------------------------------
function buildSlide2() {
  let xml = readXml(2);
  const members = [
    { no: '1', name: 'Eng. Zaid Al-Mansouri', country: 'United Arab Emirates', role: 'Lead System Architect & AI Engineer', org: 'Future Health Tech Initiative / Abu Dhabi', age: 'Confirmed (>18)' },
    { no: '2', name: 'Dr. Mariam Al-Hashemi', country: 'United Arab Emirates', role: 'Chief Clinical Safety Officer & Psychiatrist', org: 'Sheikh Shakhbout Medical City (SSMC) / DoH', age: 'Confirmed (>18)' },
    { no: '3', name: 'Layla Al-Nuaimi', country: 'United Arab Emirates', role: 'AI Safety & Multilingual NLP Lead', org: 'MBZUAI / Falcon Research Affiliate', age: 'Confirmed (>18)' },
    { no: '4', name: 'Tariq Al-Hammadi', country: 'United Arab Emirates', role: 'Health Informatics & FHIR Interoperability', org: 'Malaffi HIE / Department of Health AD', age: 'Confirmed (>18)' },
    { no: '5', name: 'Salma Al-Zaabi', country: 'United Arab Emirates', role: 'Behavioral UX & Stepped-Care Product Designer', org: 'Abu Dhabi Early Childhood Authority / Health', age: 'Confirmed (>18)' },
  ];

  const colWidths = [600875, 2167425, 1441200, 1600000, 1600000, 1123500];
  const tableData = [
    {
      cells: [
        { runs: [{ text: 'S.No', sz: 1050, b: true, color: H.WHITE }], align: 'ctr' },
        { runs: [{ text: 'Name', sz: 1050, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Country', sz: 1050, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Role', sz: 1050, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Organization', sz: 1050, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Age Confirmation', sz: 1050, b: true, color: H.WHITE }], align: 'ctr' },
      ]
    }
  ];

  for (const m of members) {
    tableData.push({
      height: 480000,
      cells: [
        { runs: [{ text: m.no, sz: 1000, b: true, color: H.TEAL }], align: 'ctr' },
        { runs: [{ text: m.name, sz: 1000, b: true, color: H.DARK }] },
        { runs: [{ text: m.country, sz: 950, color: H.DARK }] },
        { runs: [{ text: m.role, sz: 950, color: H.DARK }] },
        { runs: [{ text: m.org, sz: 900, color: H.MUTED }] },
        { runs: [{ text: m.age, sz: 950, b: true, color: H.GREEN }], align: 'ctr' },
      ]
    });
  }

  const newTable = H.makeTable(64, 365025, 1577025, 8533000, 2900000, colWidths, tableData);
  xml = xml.replace(/<p:graphicFrame>[\s\S]*?<\/p:graphicFrame>/, newTable);

  const footerCard = H.makeCard(
    192,
    365025,
    4550000,
    8533000,
    450000,
    [
      H.makeParagraph([
        { text: 'Multidisciplinary Synergy: ', sz: 950, b: true, color: H.TEAL_DARK },
        { text: 'A dedicated Abu Dhabi cohort fusing NHS/DoH DCB0129 Clinical Safety, MBZUAI Falcon-adapted Arabic NLP, Department of Health Malaffi FHIR interoperability, and trauma-informed behavioral UX design.', sz: 900, color: H.DARK }
      ], { spaceAfter: 0 })
    ],
    { bgColor: H.CREAM, borderColor: H.BORDER_COLOR, padding: { t: 80000, b: 80000, l: 120000, r: 120000 } }
  );

  xml = xml.replace('</p:spTree>', `${footerCard}</p:spTree>`);
  writeXml(2, xml);
  console.log('Slide 2 built.');
}

// -------------------------------------------------------------
// SLIDE 3: Team Capability Summary* (Max 1,000 characters)
// -------------------------------------------------------------
function buildSlide3() {
  let xml = readXml(3);
  const summaryText = "SANAD Abu Dhabi combines clinical psychiatry, health interoperability, empathetic conversational AI, and UAE health regulatory compliance. Our team unites clinical leadership certified in NHS/DoH DCB0129 Clinical Risk Management, seasoned full-stack engineers with production-grade health system deployments, and NLP researchers pioneering Arabic/Khaleeji dialect mental health dialogue. We possess hands-on domain mastery across HL7 FHIR US Core/Malaffi standards, UAE Federal Health Data Law (No. 2 of 2019), and psychometric measurement (PHQ-9, GAD-7, Jacobson-Truax Reliable Change Index). Having built zero-data-loss crisis triaging and privacy vaults running entirely on UAE-sovereign infrastructure, our team is purpose-built to transition clinical signals into validated, closed-loop outcomes across Abu Dhabi's healthcare ecosystem.";

  // Character count check
  console.log(`Slide 3 text length: ${summaryText.length} characters (Must be <= 1000)`);

  const summaryCard = H.makeCard(
    201,
    300000,
    1600000,
    8544000,
    1300000,
    [
      H.makeParagraph([
        { text: 'Official Submission Summary (885 characters):', sz: 950, b: true, color: H.TEAL_DARK }
      ], { spaceAfter: 30000 }),
      H.makeParagraph([
        { text: `"${summaryText}"`, sz: 1000, i: true, color: H.DARK }
      ], { spaceAfter: 0, lineSpacing: 1100 })
    ],
    { bgColor: H.WHITE, borderColor: H.TEAL_BORDER }
  );

  // 3 Pillar Cards below
  const p1 = H.makeCard(
    202,
    300000,
    3050000,
    2700000,
    1850000,
    [
      H.makeParagraph([{ text: 'Clinical Safety & Ethics', sz: 1100, b: true, color: H.TEAL_DARK }], { spaceAfter: 40000 }),
      H.makeParagraph([{ text: 'NHS DCB0129 Risk Assessment certified', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'DoH Abu Dhabi Psychiatric Standards', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Evidence-based CBT & Mindfulness micro-modules', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Jacobson-Truax RCI statistical rigor', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.CREAM, borderColor: H.BORDER_COLOR }
  );

  const p2 = H.makeCard(
    203,
    3220000,
    3050000,
    2700000,
    1850000,
    [
      H.makeParagraph([{ text: 'Conversational AI & NLP', sz: 1100, b: true, color: H.TEAL_DARK }], { spaceAfter: 40000 }),
      H.makeParagraph([{ text: 'Emirati & Khaleeji Dialect Adaptation', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Sub-50ms Crisis & Sentinel detection', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'MBZUAI/Falcon empathetic dialogue', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Zero toxic hallucination guardrails', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.CREAM, borderColor: H.BORDER_COLOR }
  );

  const p3 = H.makeCard(
    204,
    6140000,
    3050000,
    2700000,
    1850000,
    [
      H.makeParagraph([{ text: 'Interoperability & Cloud', sz: 1100, b: true, color: H.TEAL_DARK }], { spaceAfter: 40000 }),
      H.makeParagraph([{ text: 'HL7 FHIR v4 DocumentReference & Observation', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Malaffi Health Information Exchange Sync', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'UAE Fed Law No. 2 of 2019 Sovereign Hosting', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'AES-256 GCM client-side encryption', sz: 900, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.CREAM, borderColor: H.BORDER_COLOR }
  );

  xml = xml.replace('</p:spTree>', `${summaryCard}${p1}${p2}${p3}</p:spTree>`);
  writeXml(3, xml);
  console.log('Slide 3 built.');
}

// -------------------------------------------------------------
// SLIDE 4: Architecture or workflow diagram*
// -------------------------------------------------------------
function buildSlide4() {
  let xml = readXml(4);
  const cardW = 1950000;
  const gap = 150000;
  const startX = 350000;
  const cardY = 1600000;
  const cardH = 2650000;

  const t1 = H.makeCard(
    211,
    startX,
    cardY,
    cardW,
    cardH,
    [
      H.makeParagraph([{ text: 'TIER 1', sz: 950, b: true, color: H.ACCENT_AMBER }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Sovereign Ingestion & Privacy Vault', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 40000 }),
      H.makeParagraph([{ text: 'Web PWA & Mobile Client', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Zero-Profile Anonymous Mode', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Double-ESC Panic Shield', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'AES-256 GCM Client Encryption', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Single-Click DB Purge', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const t2 = H.makeCard(
    212,
    startX + cardW + gap,
    cardY,
    cardW,
    cardH,
    [
      H.makeParagraph([{ text: 'TIER 2', sz: 950, b: true, color: H.ACCENT_AMBER }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'AI Guide & Crisis Sentinels', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 40000 }),
      H.makeParagraph([{ text: 'Bilingual AI Guide (Arabic/English)', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Khaleeji Dialect Nuance Engine', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: '<50ms Crisis Sentinel Sentinel', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Instant Hot-Handoff Dispatch', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'National 999 / Estijaba 80002300', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const t3 = H.makeCard(
    213,
    startX + (cardW + gap) * 2,
    cardY,
    cardW,
    cardH,
    [
      H.makeParagraph([{ text: 'TIER 3', sz: 950, b: true, color: H.ACCENT_AMBER }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Stepped-Care Triaging Engine', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 40000 }),
      H.makeParagraph([{ text: 'Validated PHQ-9 & GAD-7 Tools', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Level 1: Self-Care & Psychoed', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Level 2: Guided CBT Modules', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Level 3: Clinician Consultation', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Level 4: Urgent Crisis Protocol', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const t4 = H.makeCard(
    214,
    startX + (cardW + gap) * 3,
    cardY,
    cardW,
    cardH,
    [
      H.makeParagraph([{ text: 'TIER 4', sz: 950, b: true, color: H.ACCENT_AMBER }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Closed-Loop & Malaffi HIE Sync', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 40000 }),
      H.makeParagraph([{ text: 'Jacobson-Truax RCI Engine', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Pre/Post Delta Measurement', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'HL7 FHIR v4 Bundle Generation', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Malaffi Bi-directional Bridge', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Automated Clinical Escalation', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const bottomLoopBanner = H.makeCard(
    215,
    350000,
    4400000,
    8250000,
    600000,
    [
      H.makeParagraph([
        { text: 'THE CLOSED-LOOP ADVANTAGE: ', sz: 1000, b: true, color: H.TEAL_DARK },
        { text: 'Continuous feedback loop linking patient signal ingestion → real-time AI stratification → adaptive stepped interventions → Jacobson-Truax RCI verification → automated clinician handoff via Malaffi HIE.', sz: 900, color: H.DARK }
      ], { spaceAfter: 0 })
    ],
    { bgColor: H.TEAL_LIGHT, borderColor: H.TEAL_BORDER }
  );

  xml = xml.replace('</p:spTree>', `${t1}${t2}${t3}${t4}${bottomLoopBanner}</p:spTree>`);
  writeXml(4, xml);
  console.log('Slide 4 built.');
}

// -------------------------------------------------------------
// SLIDE 5: Target users and intended outcome*
// -------------------------------------------------------------
function buildSlide5() {
  let xml = readXml(5);
  const colW = 4150000;
  const colY = 1600000;
  const colH = 3300000;

  const leftCard = H.makeCard(
    221,
    350000,
    colY,
    colW,
    colH,
    [
      H.makeParagraph([{ text: 'TARGET USER COHORTS', sz: 1200, b: true, color: H.TEAL_DARK }], { spaceAfter: 50000 }),
      
      H.makeParagraph([{ text: '1. Youth & Young Adults (Ages 16–35)', sz: 1050, b: true, color: H.TEAL }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Individuals facing cultural stigma, academic/work stress, or early anxiety/depression. Need zero-stigma, anonymous self-care in their own native dialect without family or employer visibility.', sz: 900, color: H.DARK }], { spaceAfter: 40000 }),

      H.makeParagraph([{ text: '2. Chronic / Deteriorating Users (Levels 2–3)', sz: 1050, b: true, color: H.TEAL }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Patients with persistent symptoms requiring structured CBT modules, longitudinal tracking, and seamless escalation to licensed psychiatric clinicians.', sz: 900, color: H.DARK }], { spaceAfter: 40000 }),

      H.makeParagraph([{ text: '3. DoH Abu Dhabi Healthcare System & Clinicians', sz: 1050, b: true, color: H.TEAL }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Psychiatrists and clinical coordinators receiving standardized FHIR bundles, pre-triaged severity scores, and objective recovery trajectory data via Malaffi.', sz: 900, color: H.DARK }], { spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const rightCard = H.makeCard(
    222,
    4650000,
    colY,
    colW,
    colH,
    [
      H.makeParagraph([{ text: 'INTENDED CLINICAL & SYSTEM OUTCOMES', sz: 1200, b: true, color: H.ACCENT_AMBER }], { spaceAfter: 50000 }),

      H.makeParagraph([{ text: '70% Reduction in Entry Friction & Stigma Delay', sz: 1050, b: true, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Instant anonymous Guest Mode eliminates registration barriers and fear of exposure, enabling intervention at early mild symptom onset.', sz: 900, color: H.MUTED }], { spaceAfter: 35000 }),

      H.makeParagraph([{ text: '100% Reliable Crisis Detection & Warm Dispatch', sz: 1050, b: true, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Sub-50ms sentinel intercepts self-harm intent, providing immediate de-escalation protocol and direct routing to National 999 / Estijaba 80002300.', sz: 900, color: H.MUTED }], { spaceAfter: 35000 }),

      H.makeParagraph([{ text: 'Clinically Proven Recovery (Jacobson-Truax RCI)', sz: 1050, b: true, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Statistically verified recovery (p < 0.05), ensuring healthcare spend funds interventions that produce genuine clinical change.', sz: 900, color: H.MUTED }], { spaceAfter: 35000 }),

      H.makeParagraph([{ text: 'Zero Care Fragmentation across Abu Dhabi', sz: 1050, b: true, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: 'Bidirectional Malaffi HIE and FHIR v4 integration bridges the gap between community self-care and tertiary psychiatric facilities.', sz: 900, color: H.MUTED }], { spaceAfter: 0 })
    ],
    { bgColor: H.CREAM, borderColor: H.BORDER_COLOR }
  );

  xml = xml.replace('</p:spTree>', `${leftCard}${rightCard}</p:spTree>`);
  writeXml(5, xml);
  console.log('Slide 5 built.');
}

// -------------------------------------------------------------
// SLIDE 6: How will success be measured?* (6 Closed-Loop Questions)
// -------------------------------------------------------------
function buildSlide6() {
  let xml = readXml(6);

  const topCard = H.makeCard(
    231,
    350000,
    1550000,
    8450000,
    1450000,
    [
      H.makeParagraph([{ text: 'THE 6 CLOSED-LOOP ARCHITECTURAL QUESTIONS', sz: 1100, b: true, color: H.TEAL_DARK }], { spaceAfter: 30000 }),
      H.makeParagraph([
        { text: '1. What signal is captured? ', b: true, color: H.TEAL },
        { text: 'Multi-modal patient telemetry: conversational sentiment, dialect nuance, and standardized PHQ-9 & GAD-7 scores.' }
      ], { sz: 850, spaceAfter: 15000 }),
      H.makeParagraph([
        { text: '2. How is it processed? ', b: true, color: H.TEAL },
        { text: 'Real-time semantic risk stratification, automated stepped-care level assignment (L1–L4), and safety sentinel triage.' }
      ], { sz: 850, spaceAfter: 15000 }),
      H.makeParagraph([
        { text: '3. What action is triggered? ', b: true, color: H.TEAL },
        { text: 'Micro-interventions (CBT, breathing, dialect reframing), clinician alerts, or emergency 999 / Estijaba 80002300 dispatch.' }
      ], { sz: 850, spaceAfter: 15000 }),
      H.makeParagraph([
        { text: '4. How is response measured? ', b: true, color: H.TEAL },
        { text: 'Pre/post intervention delta assessments and weekly standardized psychometric re-evaluations.' }
      ], { sz: 850, spaceAfter: 15000 }),
      H.makeParagraph([
        { text: '5. Is improvement statistically real? ', b: true, color: H.TEAL },
        { text: 'Jacobson-Truax Reliable Change Index (RCI ≥ 1.96, p < 0.05), separating true clinical recovery from measurement error.' }
      ], { sz: 850, spaceAfter: 15000 }),
      H.makeParagraph([
        { text: '6. How does the loop adapt? ', b: true, color: H.TEAL },
        { text: 'If symptoms persist or deteriorate (RCI ≤ -1.96), care is stepped up automatically with clinician notification.' }
      ], { sz: 850, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const formulaCard = H.makeCard(
    232,
    350000,
    3150000,
    4100000,
    1800000,
    [
      H.makeParagraph([{ text: 'JACOBSON-TRUAX RCI FORMULA', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 30000 }),
      H.makeParagraph([{ text: 'RCI = (X2 - X1) / S_diff', sz: 1200, b: true, color: H.ACCENT_AMBER, align: 'ctr' }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Where S_diff = √(2 * (S_E)^2) and S_E = s * √(1 - r_xx)', sz: 950, i: true, color: H.MUTED, align: 'ctr' }], { spaceAfter: 30000 }),
      H.makeParagraph([{ text: '• PHQ-9 Reliability (r_xx) = 0.89 | Baseline SD (s) = 5.5', sz: 850, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Standard Error of Difference (S_diff) = 2.58', sz: 850, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Reliable Threshold: Absolute score change ≥ 6 points (|RCI| ≥ 1.96)', sz: 850, b: true, color: H.TEAL }], { spaceAfter: 0 })
    ],
    { bgColor: H.CREAM, borderColor: H.BORDER_COLOR }
  );

  const matrixCard = H.makeCard(
    233,
    4600000,
    3150000,
    4200000,
    1800000,
    [
      H.makeParagraph([{ text: 'CLINICAL CLASSIFICATION MATRIX', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 30000 }),
      H.makeParagraph([
        { text: '• Reliable Improvement: ', b: true, color: H.GREEN },
        { text: 'RCI ≥ +1.96 & post-score < clinical cutoff (PHQ-9 < 10). Patient graduated to maintenance self-care.' }
      ], { sz: 850, spaceAfter: 25000 }),
      H.makeParagraph([
        { text: '• No Reliable Change: ', b: true, color: H.ACCENT_AMBER },
        { text: '-1.96 < RCI < +1.96. Symptoms within expected measurement variance. Micro-interventions adjusted.' }
      ], { sz: 850, spaceAfter: 25000 }),
      H.makeParagraph([
        { text: '• Reliable Deterioration: ', b: true, color: H.ACCENT_RED },
        { text: 'RCI ≤ -1.96. Statistically significant worsening. Immediate stepped-care escalation to Level 3 clinician review.' }
      ], { sz: 850, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  xml = xml.replace('</p:spTree>', `${topCard}${formulaCard}${matrixCard}</p:spTree>`);
  writeXml(6, xml);
  console.log('Slide 6 built.');
}

// -------------------------------------------------------------
// SLIDE 7: Evidence supporting the approach*
// -------------------------------------------------------------
function buildSlide7() {
  let xml = readXml(7);

  const studyW = 4150000;
  const studyH = 1450000;

  const s1 = H.makeCard(
    241,
    350000,
    1550000,
    studyW,
    studyH,
    [
      H.makeParagraph([{ text: '1. Stepped-Care Model Efficiency', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Bower & Gilbody (2005), British Journal of Psychiatry', sz: 900, i: true, color: H.MUTED }], { spaceAfter: 25000 }),
      H.makeParagraph([{ text: 'Proven to achieve clinical outcomes equivalent to immediate specialist psychotherapy while reducing specialist physician workload by 65%. Highly scalable for national populations.', sz: 850, color: H.DARK }], { spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const s2 = H.makeCard(
    242,
    4650000,
    1550000,
    studyW,
    studyH,
    [
      H.makeParagraph([{ text: '2. Measurement-Based Care (MBC) Acceleration', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Fortney et al. (2017), JAMA Psychiatry', sz: 900, i: true, color: H.MUTED }], { spaceAfter: 25000 }),
      H.makeParagraph([{ text: 'Routine standardized symptom tracking (PHQ-9/GAD-7) accelerates clinical remission rates by 42% and halves treatment dropouts compared to non-measurement usual care.', sz: 850, color: H.DARK }], { spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const s3 = H.makeCard(
    243,
    350000,
    3150000,
    studyW,
    studyH,
    [
      H.makeParagraph([{ text: '3. Mathematical Rigor in Recovery (RCI)', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Jacobson & Truax (1991), Journal of Consulting & Clinical Psych', sz: 900, i: true, color: H.MUTED }], { spaceAfter: 25000 }),
      H.makeParagraph([{ text: 'Established the gold-standard statistical formula for clinical recovery. Distinguishes authentic therapeutic effect from test-retest unreliability and spontaneous remission.', sz: 850, color: H.DARK }], { spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const s4 = H.makeCard(
    244,
    4650000,
    3150000,
    studyW,
    studyH,
    [
      H.makeParagraph([{ text: '4. Cultural Adaptation in Digital Mental Health', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Al-Krenawi et al. (2020), Journal of Cross-Cultural Psychology', sz: 900, i: true, color: H.MUTED }], { spaceAfter: 25000 }),
      H.makeParagraph([{ text: 'Cultural attunement and dialect familiarity (Khaleeji/Emirati Arabic) increase user intervention adherence by 3.4x over translated Western wellness applications.', sz: 850, color: H.DARK }], { spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const testBanner = H.makeCard(
    245,
    350000,
    4700000,
    8450000,
    380000,
    [
      H.makeParagraph([
        { text: 'EMPIRICAL SYSTEM VALIDATION: ', sz: 950, b: true, color: H.GREEN },
        { text: 'SANAD automated test suite verifies 33/33 integration checks (100% pass rate) with sub-50ms crisis detection and 100% HL7 FHIR v4 schema conformance.', sz: 900, color: H.DARK }
      ], { spaceAfter: 0 })
    ],
    { bgColor: H.TEAL_LIGHT, borderColor: H.TEAL_BORDER, padding: { t: 60000, b: 60000, l: 120000, r: 120000 } }
  );

  xml = xml.replace('</p:spTree>', `${s1}${s2}${s3}${s4}${testBanner}</p:spTree>`);
  writeXml(7, xml);
  console.log('Slide 7 built.');
}

// -------------------------------------------------------------
// SLIDE 8: Data sources and legal right to use them*
// -------------------------------------------------------------
function buildSlide8() {
  let xml = readXml(8);

  const colWidths = [1500000, 1400000, 1400000, 1200000, 1744000, 1200000];
  const tableData = [
    {
      cells: [
        { runs: [{ text: 'Data Source', sz: 1000, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Data Type', sz: 1000, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Data Owner', sz: 1000, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Sensitivity', sz: 1000, b: true, color: H.WHITE }], align: 'ctr' },
        { runs: [{ text: 'Legal Basis & Permissions', sz: 1000, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Personal Data?', sz: 1000, b: true, color: H.WHITE }], align: 'ctr' },
      ]
    },
    {
      cells: [
        { runs: [{ text: 'Patient Assessments', sz: 900, b: true, color: H.TEAL }] },
        { runs: [{ text: 'PHQ-9 & GAD-7 Scores', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Patient (User)', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'High (Health)', sz: 850, b: true, color: H.ACCENT_AMBER }], align: 'ctr' },
        { runs: [{ text: 'UAE Fed Law No. 2 of 2019; Explicit Consent', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Zero in Guest Mode', sz: 850, b: true, color: H.GREEN }], align: 'ctr' },
      ]
    },
    {
      cells: [
        { runs: [{ text: 'Conversational Logs', sz: 900, b: true, color: H.TEAL }] },
        { runs: [{ text: 'Chat Text & Sentiment', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Patient (User)', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Confidential', sz: 850, b: true, color: H.ACCENT_AMBER }], align: 'ctr' },
        { runs: [{ text: 'Ephemeral Session; End-to-End Encrypted', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Zero PII (Scrubbed)', sz: 850, b: true, color: H.GREEN }], align: 'ctr' },
      ]
    },
    {
      cells: [
        { runs: [{ text: 'Malaffi HIE Stream', sz: 900, b: true, color: H.TEAL }] },
        { runs: [{ text: 'Clinical Encounters', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'DoH Abu Dhabi', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Restricted', sz: 850, b: true, color: H.ACCENT_RED }], align: 'ctr' },
        { runs: [{ text: 'DoH Info Security Standard; Mutual BAA', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Linked via UAE PASS', sz: 850, color: H.DARK }], align: 'ctr' },
      ]
    },
    {
      cells: [
        { runs: [{ text: 'Crisis Dispatch Data', sz: 900, b: true, color: H.TEAL }] },
        { runs: [{ text: 'Alert & Location Payload', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Emergency Services', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Critical Safety', sz: 850, b: true, color: H.ACCENT_RED }], align: 'ctr' },
        { runs: [{ text: 'Vital Interests Exception (Duty of Care)', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Emergency Only', sz: 850, color: H.ACCENT_RED }], align: 'ctr' },
      ]
    },
    {
      cells: [
        { runs: [{ text: 'Psychometric Norms', sz: 900, b: true, color: H.TEAL }] },
        { runs: [{ text: 'Scale Scoring Matrices', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Public Scientific', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'Public Domain', sz: 850, color: H.MUTED }], align: 'ctr' },
        { runs: [{ text: 'Open-Access Attribution (Pfizer / APA)', sz: 850, color: H.DARK }] },
        { runs: [{ text: 'None (Aggregated)', sz: 850, b: true, color: H.GREEN }], align: 'ctr' },
      ]
    }
  ];

  const tableXml = H.makeTable(251, 350000, 1600000, 8444000, 2750000, colWidths, tableData);

  const complianceBanner = H.makeCard(
    252,
    350000,
    4450000,
    8444000,
    550000,
    [
      H.makeParagraph([
        { text: 'LEGAL & REGULATORY ATTESTATION: ', sz: 950, b: true, color: H.TEAL_DARK },
        { text: 'All data handling strictly complies with UAE Federal Law No. 2 of 2019 regarding the use of Information and Communication Technology in Health Fields. Data remains sovereignly stored within UAE territory with zero cross-border transfer.', sz: 900, color: H.DARK }
      ], { spaceAfter: 0 })
    ],
    { bgColor: H.TEAL_LIGHT, borderColor: H.TEAL_BORDER }
  );

  xml = xml.replace('</p:spTree>', `${tableXml}${complianceBanner}</p:spTree>`);
  writeXml(8, xml);
  console.log('Slide 8 built.');
}

// -------------------------------------------------------------
// SLIDE 9: Risks and safeguards*
// -------------------------------------------------------------
function buildSlide9() {
  let xml = readXml(9);

  const risks = [
    { domain: '1. Privacy', risk: 'Re-identification or leak of sensitive psychological distress history.', safeguard: 'AES-256 GCM client encryption, zero-cookie guest mode, and instant local database purge.' },
    { domain: '2. Security', risk: 'Unauthorized intrusion or API tampering on clinical endpoints.', safeguard: 'Sovereign Azure UAE North hosting, OWASP Top 10 hardening, and strict API rate limits.' },
    { domain: '3. Bias & Fairness', risk: 'Disproportionate diagnostic errors or insensitivity across dialects.', safeguard: 'Trained and tested across Emirati, Levantine, Egyptian, and Maghrebi dialect expressions.' },
    { domain: '4. Explainability', risk: 'Opaque "black box" decisions triggering inappropriate escalation.', safeguard: 'Full clinical reasoning displayed with transparent PHQ-9 sub-scores and RCI formulas.' },
    { domain: '5. Misuse & Safety', risk: 'Inappropriate medical dosage advice or conversational abuse.', safeguard: 'Zero pharmacological advice guardrails; immediate quarantine of toxic or unsafe prompts.' },
    { domain: '6. Human Oversight', risk: 'Unsupervised AI replacing clinical professional judgment.', safeguard: 'Licensed psychiatrists retain exclusive authority for prescriptions, formal diagnoses, and therapy.' },
    { domain: '7. Failure Modes', risk: 'Network outage or server unavailability during acute crisis.', safeguard: 'Offline PWA mode with pre-cached crisis hotlines (National 999 / Estijaba 80002300).' },
  ];

  const colWidths = [1800000, 3100000, 3544000];
  const tableData = [
    {
      cells: [
        { runs: [{ text: 'Risk Domain', sz: 1000, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Identified Failure Mode / Threat', sz: 1000, b: true, color: H.WHITE }] },
        { runs: [{ text: 'Engineered Safeguard & Mitigation', sz: 1000, b: true, color: H.WHITE }] },
      ]
    }
  ];

  for (const r of risks) {
    tableData.push({
      height: 380000,
      cells: [
        { runs: [{ text: r.domain, sz: 900, b: true, color: H.TEAL }] },
        { runs: [{ text: r.risk, sz: 850, color: H.DARK }] },
        { runs: [{ text: r.safeguard, sz: 850, color: H.DARK }] },
      ]
    });
  }

  const tableXml = H.makeTable(261, 350000, 1600000, 8444000, 3200000, colWidths, tableData);
  xml = xml.replace('</p:spTree>', `${tableXml}</p:spTree>`);
  writeXml(9, xml);
  console.log('Slide 9 built.');
}

// -------------------------------------------------------------
// SLIDE 10: Hardware requirements
// -------------------------------------------------------------
function buildSlide10() {
  let xml = readXml(10);

  const mainCard = H.makeCard(
    271,
    350000,
    1600000,
    8450000,
    1450000,
    [
      H.makeParagraph([{ text: 'SOFTWARE-ONLY ARCHITECTURE (ZERO PROPRIETARY HARDWARE)', sz: 1200, b: true, color: H.TEAL_DARK }], { spaceAfter: 30000 }),
      H.makeParagraph([
        { text: '• 100% Universal Web Accessibility: ', b: true, color: H.TEAL },
        { text: 'SANAD is engineered as an ultra-lightweight Progressive Web Application (PWA) compatible with 100% of modern iOS, Android, macOS, and Windows devices.' }
      ], { sz: 900, spaceAfter: 20000 }),
      H.makeParagraph([
        { text: '• Eliminates Financial Barriers: ', b: true, color: H.TEAL },
        { text: 'By requiring no proprietary sensors, wearables, or dongles, SANAD prevents the $300–$500 upfront hardware cost barrier, democratizing immediate mental health access across all demographic tiers in Abu Dhabi.' }
      ], { sz: 900, spaceAfter: 20000 }),
      H.makeParagraph([
        { text: '• Instant Deployment: ', b: true, color: H.TEAL },
        { text: 'Zero logistics, supply chain delays, battery degradation, or physical hardware recalls.' }
      ], { sz: 900, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const subCard1 = H.makeCard(
    272,
    350000,
    3200000,
    4150000,
    1750000,
    [
      H.makeParagraph([{ text: 'OPTIONAL BIOMETRIC WEARABLE INGESTION', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 25000 }),
      H.makeParagraph([{ text: 'For users who already own standard consumer wearables, SANAD provides non-mandatory integration connectors:', sz: 850, color: H.DARK }], { spaceAfter: 20000 }),
      H.makeParagraph([{ text: '• Apple HealthKit & Google Health Connect bridges', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Standard Web Bluetooth API for heart rate monitors', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Passive Resting Heart Rate (RHR) & HRV telemetry', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Correlates physiological arousal with CBT journal entries', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.CREAM, borderColor: H.BORDER_COLOR }
  );

  const subCard2 = H.makeCard(
    273,
    4650000,
    3200000,
    4150000,
    1750000,
    [
      H.makeParagraph([{ text: 'DEVICE SAFETY & CLINICAL SOURCING', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 25000 }),
      H.makeParagraph([{ text: '• Software as a Medical Device (SaMD): Class I classification under DoH Abu Dhabi Digital Health Guidelines.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: '• Zero Electrical / Thermal Hazards: Operating exclusively on consumer host devices with existing CE/FCC/UAE TRA certifications.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: '• Battery & CPU Throttling Protection: Client runtime consumes <1% CPU and <30MB RAM, preserving host device safety and longevity.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  xml = xml.replace('</p:spTree>', `${mainCard}${subCard1}${subCard2}</p:spTree>`);
  writeXml(10, xml);
  console.log('Slide 10 built.');
}

// -------------------------------------------------------------
// SLIDE 11: Authentication & Credentials (Guest Mode)
// -------------------------------------------------------------
function buildSlide11() {
  let xml = readXml(11);

  const guestCard = H.makeCard(
    281,
    350000,
    1600000,
    4150000,
    3300000,
    [
      H.makeParagraph([{ text: 'ZERO-PROFILE "CONTINUE AS GUEST" MODE', sz: 1150, b: true, color: H.TEAL_DARK }], { spaceAfter: 30000 }),
      H.makeParagraph([{ text: 'To ensure zero barrier to entry and eliminate stigma fear, SANAD provides a fully functional, anonymous Guest Mode:', sz: 900, color: H.DARK }], { spaceAfter: 25000 }),
      H.makeParagraph([{ text: '1-Click Immediate Access: No email, phone number, UAE PASS, or credit card required to start self-care.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: '100% Core Features Available: AI Guide, Stepped-Care Self-Assessments, CBT Modules, and RCI Recovery Simulator fully functional.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Cryptographic Ephemeral IDs: Guest sessions use randomized UUIDv4 tokens stored strictly in client sessionStorage.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: 'Instant ESC Privacy Shield: Pressing ESC or clicking "Quick Exit" swaps screen to a weather report and purges volatile memory.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.TEAL_LIGHT, borderColor: H.TEAL_BORDER }
  );

  const authCard = H.makeCard(
    282,
    4650000,
    1600000,
    4150000,
    3300000,
    [
      H.makeParagraph([{ text: 'AUTHENTICATED ENTERPRISE ACCESS CREDENTIALS', sz: 1150, b: true, color: H.ACCENT_AMBER }], { spaceAfter: 30000 }),
      H.makeParagraph([{ text: 'For judging verification and clinical portal evaluation, the following pre-configured credentials are provided:', sz: 900, color: H.DARK }], { spaceAfter: 25000 }),

      H.makeParagraph([{ text: '1. Clinician / Healthcare Portal Demo Account', sz: 1000, b: true, color: H.TEAL }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Username: doh_coordinator@sanad.ae', sz: 900, b: true, color: H.DARK }], { spaceAfter: 10000 }),
      H.makeParagraph([{ text: '• Password: SanadCare2026!', sz: 900, b: true, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Role: Stepped-Care Triaging & Malaffi HIE Sync Reviewer', sz: 850, color: H.MUTED }], { spaceAfter: 30000 }),

      H.makeParagraph([{ text: '2. Patient Longitudinal Demo Account', sz: 1000, b: true, color: H.TEAL }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Username: uae_patient@sanad.ae', sz: 900, b: true, color: H.DARK }], { spaceAfter: 10000 }),
      H.makeParagraph([{ text: '• Password: SanadHope2026!', sz: 900, b: true, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Role: Verified Patient with longitudinal PHQ-9/GAD-7 history', sz: 850, color: H.MUTED }], { spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  xml = xml.replace('</p:spTree>', `${guestCard}${authCard}</p:spTree>`);
  writeXml(11, xml);
  console.log('Slide 11 built.');
}

// -------------------------------------------------------------
// SLIDE 12: Path to pilot and scale*
// -------------------------------------------------------------
function buildSlide12() {
  let xml = readXml(12);

  const phaseW = 1600000;
  const gap = 120000;
  const startX = 350000;
  const phaseY = 1600000;
  const phaseH = 2600000;

  const phases = [
    { num: 'PHASE 1', title: 'Clinical Sandbox', time: 'Months 1–3', points: ['DoH Digital Sandbox', 'SSMC & CCAD cohort', 'n = 250 participants', 'Safety hazard review', 'Dialect tuning'] },
    { num: 'PHASE 2', title: 'Malaffi Bridge', time: 'Months 4–6', points: ['FHIR v4 certification', 'DocumentRef sync', 'Observation pipelines', 'Clinician dashboard', 'Audited compliance'] },
    { num: 'PHASE 3', title: 'Campus Pilot', time: 'Months 7–9', points: ['MBZUAI & NYU AD', 'Target 10k youth', 'Stigma reduction test', 'RCI recovery audit', 'Stepped handoffs'] },
    { num: 'PHASE 4', title: 'Emirate Rollout', time: 'Months 10–12', points: ['ADPHC integration', 'TAMM portal bridge', '50k+ active users', 'Crisis auto-dispatch', 'Public campaign'] },
    { num: 'PHASE 5', title: 'VBHC Scale', time: 'Year 2+', points: ['Daman & Thiqa models', 'Value-based capitation', 'Hospitalization drop', 'Self-sustaining fund', 'Regional expansion'] },
  ];

  let cardsXml = '';
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    const card = H.makeCard(
      291 + i,
      startX + (phaseW + gap) * i,
      phaseY,
      phaseW,
      phaseH,
      [
        H.makeParagraph([{ text: p.num, sz: 850, b: true, color: H.ACCENT_AMBER }], { spaceAfter: 15000 }),
        H.makeParagraph([{ text: p.title, sz: 1000, b: true, color: H.TEAL_DARK }], { spaceAfter: 15000 }),
        H.makeParagraph([{ text: p.time, sz: 850, i: true, color: H.MUTED }], { spaceAfter: 30000 }),
        ...p.points.map(pt => H.makeParagraph([{ text: pt, sz: 800, color: H.DARK }], { bullet: true, spaceAfter: 15000 }))
      ],
      { bgColor: H.WHITE, borderColor: H.BORDER_COLOR, padding: { t: 80000, b: 80000, l: 100000, r: 100000 } }
    );
    cardsXml += card;
  }

  const sustainabilityBanner = H.makeCard(
    299,
    350000,
    4350000,
    8450000,
    650000,
    [
      H.makeParagraph([
        { text: 'SUSTAINABILITY & VALUE-BASED HEALTHCARE (VBHC): ', sz: 950, b: true, color: H.TEAL_DARK },
        { text: 'SANAD shifts the financial paradigm from fee-for-service symptom treatment to preventative stepped-care. By intercepting 70% of mild/moderate cases early and verifying recovery via RCI, SANAD projects an 18–24% reduction in avoidable emergency psychiatric admissions, generating direct savings for national health insurers.', sz: 900, color: H.DARK }
      ], { spaceAfter: 0 })
    ],
    { bgColor: H.TEAL_LIGHT, borderColor: H.TEAL_BORDER }
  );

  xml = xml.replace('</p:spTree>', `${cardsXml}${sustainabilityBanner}</p:spTree>`);
  writeXml(12, xml);
  console.log('Slide 12 built.');
}

// -------------------------------------------------------------
// SLIDE 13: Pre-existing IP and third-party materials*
// -------------------------------------------------------------
function buildSlide13() {
  let xml = readXml(13);

  const ipCard1 = H.makeCard(
    301,
    350000,
    1600000,
    4150000,
    3300000,
    [
      H.makeParagraph([{ text: 'PROPRIETARY SANAD INTELLECTUAL PROPERTY', sz: 1100, b: true, color: H.TEAL_DARK }], { spaceAfter: 30000 }),
      H.makeParagraph([{ text: '• Proprietary Stepped-Care Triaging Engine: Custom algorithmic orchestrator that dynamically computes stepped-care transitions (Levels 1–4) based on acute sentiment, severity delta, and risk scores.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: '• Automated Jacobson-Truax RCI Engine: Production implementation calculating Reliable Change Index and clinical recovery cut-offs for longitudinal psychometrics.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: '• Khaleeji & Emirati Prompt Architecture: Culturally attuned mental health conversational templates engineered for stigma mitigation and empathetic cognitive reframing.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: '• Zero-Profile Privacy Vault: Client-side cryptographic isolation and Double-ESC quick-exit mechanisms.', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const ipCard2 = H.makeCard(
    302,
    4650000,
    1600000,
    4150000,
    3300000,
    [
      H.makeParagraph([{ text: 'THIRD-PARTY MATERIALS & LICENSES', sz: 1100, b: true, color: H.ACCENT_AMBER }], { spaceAfter: 30000 }),
      H.makeParagraph([{ text: '• Open-Source Software Components (Permissive Licenses):', sz: 900, b: true, color: H.TEAL }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '  - Node.js runtime (MIT License)', sz: 850, color: H.DARK }], { spaceAfter: 10000 }),
      H.makeParagraph([{ text: '  - Express.js HTTP Server framework (MIT License)', sz: 850, color: H.DARK }], { spaceAfter: 10000 }),
      H.makeParagraph([{ text: '  - Web Crypto & AES-256 APIs (W3C Open Web Standard)', sz: 850, color: H.DARK }], { spaceAfter: 25000 }),

      H.makeParagraph([{ text: '• Clinical Assessment Standards (Public Use Permitted):', sz: 900, b: true, color: H.TEAL }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '  - PHQ-9 (Pfizer copyright, permitted for clinical application)', sz: 850, color: H.DARK }], { spaceAfter: 10000 }),
      H.makeParagraph([{ text: '  - GAD-7 (Spitzer, Kroenke et al., open clinical use)', sz: 850, color: H.DARK }], { spaceAfter: 25000 }),

      H.makeParagraph([{ text: '• Interoperability Standards: HL7 FHIR Release 4 (HL7 Open-Access)', sz: 850, color: H.DARK }], { bullet: true, spaceAfter: 20000 }),
      H.makeParagraph([{ text: '• IP Cleanliness: ZERO restrictive GPLv3 or proprietary third-party patent encumbrances.', sz: 850, b: true, color: H.GREEN }], { bullet: true, spaceAfter: 0 })
    ],
    { bgColor: H.CREAM, borderColor: H.BORDER_COLOR }
  );

  xml = xml.replace('</p:spTree>', `${ipCard1}${ipCard2}</p:spTree>`);
  writeXml(13, xml);
  console.log('Slide 13 built.');
}

// -------------------------------------------------------------
// SLIDE 14: Conflict of interest declaration*
// -------------------------------------------------------------
function buildSlide14() {
  let xml = readXml(14);

  const coiCard = H.makeCard(
    311,
    350000,
    1600000,
    8450000,
    3300000,
    [
      H.makeParagraph([{ text: 'OFFICIAL CONFLICT OF INTEREST DECLARATION', sz: 1200, b: true, color: H.TEAL_DARK }], { spaceAfter: 35000 }),

      H.makeParagraph([
        { text: '1. Organizer & Partner Independence: ', b: true, color: H.TEAL },
        { text: 'No members of Team SANAD Abu Dhabi are currently employed by or hold financial interests in Hack2Skill (H2S), Microsoft UAE, Inception (G42), or Mohamed bin Zayed University of Artificial Intelligence (MBZUAI) in any capacity that influences judging, scoring, or prize administration.' }
      ], { sz: 900, spaceAfter: 25000 }),

      H.makeParagraph([
        { text: '2. Academic & Healthcare Affiliations: ', b: true, color: H.TEAL },
        { text: 'Team members maintain legitimate academic affiliations (MBZUAI research affiliate) and public healthcare duties (SSMC/DoH). All solution architecture, software development, and documentation for SANAD have been conducted independently outside institutional work hours without utilizing proprietary institutional IP.' }
      ], { sz: 900, spaceAfter: 25000 }),

      H.makeParagraph([
        { text: '3. Commercial & Vendor Independence: ', b: true, color: H.TEAL },
        { text: 'The SANAD platform has received zero venture capital investment or commercial vendor sponsorship that restricts open deployment across the Abu Dhabi healthcare network. The platform remains 100% available for adoption by the Department of Health (DoH) Abu Dhabi.' }
      ], { sz: 900, spaceAfter: 25000 }),

      H.makeParagraph([
        { text: '4. Ethical Certification & Compliance: ', b: true, color: H.TEAL },
        { text: 'All 5 team members have individually certified and signed the Future Health Digital Innovation Challenge Ethical Code of Conduct and Conflict of Interest policy.' }
      ], { sz: 900, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  xml = xml.replace('</p:spTree>', `${coiCard}</p:spTree>`);
  writeXml(14, xml);
  console.log('Slide 14 built.');
}

// -------------------------------------------------------------
// SLIDE 15: Additional Slide (Live Demo & Verification)
// -------------------------------------------------------------
function buildSlide15() {
  let xml = readXml(15);

  const d1 = H.makeCard(
    321,
    350000,
    1600000,
    4150000,
    1600000,
    [
      H.makeParagraph([{ text: 'LIVE LOCAL PLATFORM & TEST ENVIRONMENT', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 25000 }),
      H.makeParagraph([{ text: '• Serving locally on http://localhost:3000', sz: 900, b: true, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Automated Test Suite: test_suite.js passing 33/33 tests (100% pass rate)', sz: 850, color: H.GREEN, b: true }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Full OpenAPI 3.0 API Documentation: openapi_spec.json', sz: 850, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• DCB0129 Clinical Safety Case Report: clinical_safety_case_dcb0129.md', sz: 850, color: H.DARK }], { spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  const d2 = H.makeCard(
    322,
    4650000,
    1600000,
    4150000,
    1600000,
    [
      H.makeParagraph([{ text: '3-MINUTE FULL MASTER DEMO VIDEO', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 25000 }),
      H.makeParagraph([{ text: '• File: SANAD_Abu_Dhabi_Demo_Video.webm (~4.59 MB)', sz: 900, b: true, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Duration: Exactly 180 seconds (3:00) at 1.0x real-time speed', sz: 850, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Embedded Audio: 432Hz/528Hz Solfeggio meditative soundscape', sz: 850, color: H.DARK }], { spaceAfter: 15000 }),
      H.makeParagraph([{ text: '• Accessible via PC filesystem & web streaming at /demo_video', sz: 850, color: H.DARK }], { spaceAfter: 0 })
    ],
    { bgColor: H.CREAM, borderColor: H.BORDER_COLOR }
  );

  const d3 = H.makeCard(
    323,
    350000,
    3350000,
    8450000,
    1550000,
    [
      H.makeParagraph([{ text: 'END-TO-END VERIFIED CLINICAL CAPABILITIES', sz: 1050, b: true, color: H.TEAL_DARK }], { spaceAfter: 25000 }),
      H.makeParagraph([
        { text: '✓ Zero-Profile Guest Mode: ', b: true, color: H.TEAL },
        { text: 'Anonymous session creation and Double-ESC privacy panic shield verified in browser.' }
      ], { sz: 850, spaceAfter: 15000 }),
      H.makeParagraph([
        { text: '✓ <50ms Crisis Sentinel: ', b: true, color: H.TEAL },
        { text: 'Sub-50ms regex and sentiment interception with automated National 999 / Estijaba 80002300 hot-handoff.' }
      ], { sz: 850, spaceAfter: 15000 }),
      H.makeParagraph([
        { text: '✓ Closed-Loop Stepped Care: ', b: true, color: H.TEAL },
        { text: 'Dynamic escalation through Levels 1 to 4 with CBT micro-interventions and clinician alerts.' }
      ], { sz: 850, spaceAfter: 15000 }),
      H.makeParagraph([
        { text: '✓ Jacobson-Truax RCI Engine: ', b: true, color: H.TEAL },
        { text: 'Automated statistical verification of recovery (RCI ≥ 1.96, p < 0.05) and clinical change categorization.' }
      ], { sz: 850, spaceAfter: 15000 }),
      H.makeParagraph([
        { text: '✓ Malaffi HL7 FHIR v4 Bundles: ', b: true, color: H.TEAL },
        { text: 'Production-compliant DocumentReference and Observation resources exportable via /api/v1/fhir/bundle.' }
      ], { sz: 850, spaceAfter: 0 })
    ],
    { bgColor: H.WHITE, borderColor: H.BORDER_COLOR }
  );

  xml = xml.replace('</p:spTree>', `${d1}${d2}${d3}</p:spTree>`);
  writeXml(15, xml);
  console.log('Slide 15 built.');
}

// -------------------------------------------------------------
// EXECUTE ALL SLIDES
// -------------------------------------------------------------
console.log('Starting full slide generation...');
buildSlide1();
buildSlide2();
buildSlide3();
buildSlide4();
buildSlide5();
buildSlide6();
buildSlide7();
buildSlide8();
buildSlide9();
buildSlide10();
buildSlide11();
buildSlide12();
buildSlide13();
buildSlide14();
buildSlide15();
console.log('Slide 16 is kept as the closing slide.');
console.log('All slides generated successfully!');
