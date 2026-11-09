/**
 * SANAD Abu Dhabi - Care Continuity & Closed-Loop Impact Dashboard
 * 
 * CORE INNOVATION: Answering the 6 Closed-Loop Conversion Questions
 * for healthcare teams, care coordinators, and public health leadership.
 */

const closedLoopService = require('./closedLoopService');

// Simulated Longitudinal Care Records (Seed Data for demo analytics)
const LONGITUDINAL_COHORT_SUMMARY = {
  reportingPeriod: "Last 90 Days • Abu Dhabi Public Health Monitoring",
  totalScreeningsInitiated: 1842,
  
  // The 6 Closed-Loop Conversion Questions
  closedLoopQuestions: [
    {
      qIndex: 1,
      question: "Did the individual understand their screening result?",
      metricName: "Result Comprehension Rate",
      percentage: 92.4,
      numerator: 1702,
      denominator: 1842,
      status: "OPTIMAL",
      benchmark: "80%",
      clinicalMeaning: "Clear, non-diagnostic framing prevents anxiety spikes and promotes constructive action."
    },
    {
      qIndex: 2,
      question: "Did they find an appropriate, verified service?",
      metricName: "Smart Navigation Match Rate",
      percentage: 84.6,
      numerator: 1558,
      denominator: 1842,
      status: "OPTIMAL",
      benchmark: "70%",
      clinicalMeaning: "Transparent insurance copays and verified wait times reduce abandonment."
    },
    {
      qIndex: 3,
      question: "Were they able to access and book it?",
      metricName: "Referral Booking & Intake Rate",
      percentage: 76.8,
      numerator: 1414,
      denominator: 1842,
      status: "OPTIMAL",
      benchmark: "45%",
      clinicalMeaning: "Anonymous, zero-friction token booking overcomes workplace stigma."
    },
    {
      qIndex: 4,
      question: "Did the referral reach a healthcare professional?",
      metricName: "Clinician Receipt & Acknowledgment Rate",
      percentage: 72.1,
      numerator: 1328,
      denominator: 1842,
      status: "OPTIMAL",
      benchmark: "30%",
      clinicalMeaning: "Bidirectional integration with SEHA, CCAD, and ACPN guarantees referral receipt."
    },
    {
      qIndex: 5,
      question: "Was the individual followed up within the clinical window?",
      metricName: "Verified 14-Day Follow-Up Completion",
      percentage: 68.4,
      numerator: 1260,
      denominator: 1842,
      status: "HIGH_PERFORMANCE",
      benchmark: "20%",
      clinicalMeaning: "Proactive, automated care coordination alerts bridge the drop-off gap."
    },
    {
      qIndex: 6,
      question: "Did their wellbeing or daily functioning improve?",
      metricName: "Reliable Change Index (RCI Improvement)",
      percentage: 54.2,
      numerator: 998,
      denominator: 1842,
      status: "CLINICALLY_SIGNIFICANT",
      benchmark: "35%",
      clinicalMeaning: "Statistically verified reduction of >=4 points on PHQ-9/GAD-7 at 6 and 12 weeks."
    }
  ],

  // Real-time Care Coordinator Active Monitoring
  careCoordinationQueue: [
    {
      caseId: "CASE-AD-8821",
      patientPseudonym: "ANON-8821",
      tier: 4,
      clinic: "Cleveland Clinic Abu Dhabi",
      clinician: "Dr. Marcus Vance",
      status: "CONSULTATION_COMPLETED",
      followUpStatus: "DUE_IN_2_DAYS",
      baselinePHQ9: 16,
      followUpPHQ9: null,
      actionRequired: "Send gentle in-app 14-day reflection check-in"
    },
    {
      caseId: "CASE-AD-9104",
      patientPseudonym: "ANON-9104",
      tier: 3,
      clinic: "SEHA Al Bateen Health Center",
      clinician: "Dr. Sultan Al-Nuaimi",
      status: "REFERRAL_DISPATCHED",
      followUpStatus: "PENDING_CLINICIAN_INTAKE",
      baselinePHQ9: 12,
      followUpPHQ9: null,
      actionRequired: "Automated ping to clinic coordinator (Over 24h wait)"
    },
    {
      caseId: "CASE-AD-7319",
      patientPseudonym: "ANON-7319",
      tier: 4,
      clinic: "ACPN Abu Dhabi",
      clinician: "Dr. Laila Mansoor",
      status: "LOOP_CLOSED_IMPROVED",
      followUpStatus: "COMPLETED",
      baselinePHQ9: 14,
      followUpPHQ9: 6,
      scoreDelta: -8,
      isRCIImproved: true,
      actionRequired: "None (Successful recovery trajectory logged)"
    }
  ],

  // Public Health Comparison
  conversionComparison: {
    conventionalScreeningApp: {
      funnelConversionRate: "12% - 15%",
      dropOffPoint: "Between result presentation and appointment booking (The Conversion Gap)"
    },
    sanadClosedLoopEcosystem: {
      funnelConversionRate: "68.4%",
      dropOffMitigation: "Human-in-the-Loop tracking + transparent smart navigation + Mitz privacy vault"
    }
  }
};

function getContinuityDashboardData() {
  const liveFunnel = closedLoopService.getConversionFunnelStats();
  
  return {
    summary: LONGITUDINAL_COHORT_SUMMARY,
    liveTelemetry: liveFunnel,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getContinuityDashboardData
};

