/**
 * SANAD Abu Dhabi - Human Crisis Escalation & Estijaba 800 1717 Gateway
 * Safety-First Clinical Governance & Tamper-Evident Audit Logging
 */

const crypto = require('crypto');

// In-memory crisis dispatch audit ledger
const crisisAuditLedger = [];
const SECRET_AUDIT_SALT = "DOH-SANAD-CRISIS-INTEGRITY-KEY-2027";

const VERIFIED_EMERGENCY_CONTACTS = {
  estijaba: {
    name: "Estijaba (DoH Abu Dhabi Mental Health Helpline)",
    hotline: "800 1717",
    tollFree: true,
    operatingHours: "24/7/365",
    languages: ["Arabic", "English"],
    services: ["Emergency Triage", "Psychiatric Nurse Consultation", "Mobile Team Dispatch"]
  },
  ambulance: {
    name: "National Emergency Ambulance",
    hotline: "999",
    operatingHours: "24/7/365",
    responseTargetMinutes: 8
  },
  aman: {
    name: "Abu Dhabi Police Community Service (Aman)",
    hotline: "800 2626",
    description: "Confidential domestic safety and community protection"
  }
};

function escalateCrisis(triggerType, language = 'en', clientToken = null) {
  const incidentId = 'CRISIS-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  const timestamp = new Date().toISOString();

  // Create HMAC signature for tamper-evident government auditability
  const signature = crypto
    .createHmac('sha256', SECRET_AUDIT_SALT)
    .update(`${incidentId}:${triggerType}:${timestamp}`)
    .digest('hex');

  const incident = {
    incidentId,
    triggerType: triggerType || "manual_escalation",
    language,
    clientToken: clientToken || "ANON-GUEST",
    timestamp,
    status: "ESCALATION_ACTIVE_HUMAN_HANDOFF",
    emergencyContacts: VERIFIED_EMERGENCY_CONTACTS,
    integrityChecksum: signature,
    botDisabled: true
  };

  crisisAuditLedger.unshift(incident);
  return incident;
}

function getAuditLedger(limit = 20) {
  return crisisAuditLedger.slice(0, limit);
}

module.exports = {
  VERIFIED_EMERGENCY_CONTACTS,
  escalateCrisis,
  getAuditLedger
};

