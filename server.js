/**
 * SANAD Abu Dhabi (سند) - Master Full-Stack Server
 * 
 * Unifies the Global Standard Frontend with the Closed-Loop Mental Wellbeing Backend.
 * Compliant with UAE Federal Law No. 2 of 2019, DoH Abu Dhabi & Malaffi HIE.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Backend Microservices
const assessmentService = require('./backend/assessmentService');
const closedLoopService = require('./backend/closedLoopService');
const smartNavigatorService = require('./backend/smartNavigatorService');
const steppedCareService = require('./backend/steppedCareService');
const crisisService = require('./backend/crisisService');
const privacyVault = require('./backend/privacyVault');
const continuityDashboardService = require('./backend/continuityDashboardService');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Helper: Parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

// Helper: Send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Pre-flight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Token',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // -------------------------------------------------------------------------
  // REST API ROUTER (/api/v1/*)
  // -------------------------------------------------------------------------

  if (pathname.startsWith('/api/v1/')) {
    try {
      // 1. Assessment Evaluation & Closed-Loop Initiation
      if (pathname === '/api/v1/assessments/evaluate' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { instrument, answers, clientPseudonym } = body;

        if (!instrument || !answers) {
          return sendJson(res, 400, { error: "Missing required fields: instrument and answers." });
        }

        const evaluation = assessmentService.evaluateAssessment(instrument, answers, clientPseudonym);
        const careLoop = closedLoopService.initiateCareLoop(evaluation, clientPseudonym);

        return sendJson(res, 200, {
          success: true,
          evaluation,
          careLoop: {
            loopId: careLoop.loopId,
            currentStatus: careLoop.currentStatus,
            milestones: careLoop.milestones
          }
        });
      }

      // 2. Closed-Loop Milestones Progression
      if (pathname === '/api/v1/closed-loop/milestone' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { loopId, milestoneType, payload } = body;

        let updatedLoop;
        if (milestoneType === 'RESULT_UNDERSTOOD') {
          updatedLoop = closedLoopService.recordResultUnderstood(loopId);
        } else if (milestoneType === 'SERVICE_SELECTED') {
          updatedLoop = closedLoopService.recordServiceSelected(loopId, payload || {});
        } else if (milestoneType === 'REFERRAL_BOOKING') {
          updatedLoop = closedLoopService.recordReferralBooking(loopId, payload || {});
        } else if (milestoneType === 'PROVIDER_RECEIPT') {
          updatedLoop = closedLoopService.recordProviderReceipt(loopId, payload.clinicianId, payload.clinicianName);
        } else if (milestoneType === 'CONSULTATION_ATTENDED') {
          updatedLoop = closedLoopService.recordConsultationAttended(loopId, payload.summary);
        } else if (milestoneType === 'OUTCOME_FOLLOWUP') {
          updatedLoop = closedLoopService.recordOutcomeFollowUp(loopId, payload.score);
        } else {
          return sendJson(res, 400, { error: `Unsupported milestone: ${milestoneType}` });
        }

        return sendJson(res, 200, { success: true, careLoop: updatedLoop });
      }

      // 3. Closed-Loop Funnel Analytics
      if (pathname === '/api/v1/closed-loop/funnel' && req.method === 'GET') {
        const funnel = closedLoopService.getConversionFunnelStats();
        return sendJson(res, 200, { success: true, funnel });
      }

      // 4. Smart Care Navigator (Transparent pricing, eligibility, wait times)
      if (pathname === '/api/v1/navigator/services' && req.method === 'GET') {
        const results = smartNavigatorService.navigateServices(query);
        return sendJson(res, 200, { success: true, ...results });
      }

      // 5. Stepped-Care Tiers & Clinician Directory
      if (pathname === '/api/v1/stepped-care/tiers' && req.method === 'GET') {
        return sendJson(res, 200, { success: true, tiers: steppedCareService.getTiers() });
      }

      if (pathname === '/api/v1/clinicians' && req.method === 'GET') {
        const clinicians = steppedCareService.getClinicians(query);
        return sendJson(res, 200, { success: true, clinicians });
      }

      // 6. Anonymous Tele-Mental Health Booking
      if (pathname === '/api/v1/appointments/book' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { clinicianId, slotTime, clientToken, loopId } = body;

        const booking = steppedCareService.bookAppointment(clinicianId, slotTime, clientToken);
        if (loopId) {
          closedLoopService.recordReferralBooking(loopId, {
            bookingToken: booking.bookingToken,
            appointmentTime: booking.slotTime,
            clinicianId: booking.clinicianId
          });
        }

        return sendJson(res, 201, { success: true, booking });
      }

      // 7. Human Crisis Escalation Gateway (Estijaba 800 1717 / 999)
      if (pathname === '/api/v1/crisis/escalate' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { triggerType, language, clientToken } = body;
        const incident = crisisService.escalateCrisis(triggerType, language, clientToken);
        return sendJson(res, 201, { success: true, incident });
      }

      if (pathname === '/api/v1/crisis/audit' && req.method === 'GET') {
        const ledger = crisisService.getAuditLedger();
        return sendJson(res, 200, { success: true, ledger });
      }

      // 8. Privacy-Controlled Wellbeing Vault (Mitz-inspired)
      if (pathname === '/api/v1/vault/consent' && req.method === 'GET') {
        const token = query.clientToken || 'ANON-GUEST';
        const vault = privacyVault.getOrCreateVaultConsent(token);
        return sendJson(res, 200, { success: true, vault });
      }

      if (pathname === '/api/v1/vault/consent' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { clientToken, categoryKey, isAllowed } = body;
        const vault = privacyVault.updateCategoryConsent(clientToken || 'ANON-GUEST', categoryKey, isAllowed);
        return sendJson(res, 200, { success: true, vault });
      }

      if (pathname === '/api/v1/vault/purge' && req.method === 'DELETE') {
        const token = query.clientToken || 'ANON-GUEST';
        const purgeReport = privacyVault.cryptographicShred(token);
        return sendJson(res, 200, { success: true, purgeReport });
      }

      // 9. Care Continuity & Impact Dashboard
      if (pathname === '/api/v1/dashboard/continuity' && req.method === 'GET') {
        const dashboard = continuityDashboardService.getContinuityDashboardData();
        return sendJson(res, 200, { success: true, ...dashboard });
      }

      // 10. Murshid AI Assistive Guidance with Crisis Firewall
      if (pathname === '/api/v1/murshid/chat' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { message, language } = body;
        const isAr = language === 'ar';
        const queryLower = (message || '').toLowerCase();

        // Safety Intercept
        const crisisWords = ['suicide', 'kill myself', 'end my life', 'want to die', 'انتحار', 'أريد الموت', 'إيذاء نفسي'];
        if (crisisWords.some(w => queryLower.includes(w))) {
          const emergency = crisisService.escalateCrisis('natural_language_flag', language);
          return sendJson(res, 200, {
            isCrisisTriggered: true,
            emergency,
            reply: isAr
              ? "⚠️ تم تفعيل بروتوكول السلامة الإكلينيكية الفوري. يُرجى الاتصال الفوري بخدمة استجابة 8001717 أو الإسعاف 999."
              : "⚠️ Immediate Clinical Safety Protocol Triggered. Please connect right now with Estijaba 800 1717 or National Ambulance 999."
          });
        }

        // Bounded Non-Diagnostic Guidance
        let reply = "";
        if (queryLower.includes('burnout') || queryLower.includes('sleep') || message.includes('إرهاق') || message.includes('نوم')) {
          reply = isAr
            ? "للتعامل مع الإرهاق وضغوط العمل، يُقترح البدء بأدوات المستوى 1 (تمرين تنفس المربع في الصفحة الرئيسية) وجلسات النوم الصحي. إذا استمرت الأعراض لأكثر من أسبوعين، استخدم دليل الملاحة الذكي لحجز استشارة رعاية أولية (المستوى 3) في أقرب مركز صحي من صحة."
            : "For workplace burnout and sleep difficulties, we suggest Level 1 self-care tools (such as 4-4-4 Box Breathing on the Overview tab). If fatigue persists beyond two weeks, our Smart Care Navigator can connect you with a SEHA Primary Care GP (Level 3) for holistic evaluation.";
        } else if (queryLower.includes('thiqa') || queryLower.includes('daman') || message.includes('ثقة') || message.includes('ضمان')) {
          reply = isAr
            ? "تغطي بطاقة ثقة (Thiqa) الرعاية النفسية في مراكز صحة وكليفلاند كلينك والمركز الأمريكي بنسبة 100% (0 درهم كشفية). وتغطي بطاقات ضمان المعتمدة (Daman Enhanced) الجلسات بكشفية تتراوح بين 20 إلى 50 درهماً حسب الباقة."
            : "Thiqa provides 100% coverage (0 AED copay) for mental wellbeing services at SEHA, Cleveland Clinic Abu Dhabi, and ACPN. Daman Enhanced plans cover sessions with verified copays between 20 and 50 AED depending on your plan endorsements.";
        } else {
          reply = isAr
            ? "أنا هنا لمساعدتك على استكشاف خيارات الرعاية، وفحص تكاليف بطاقات التأمين، والتحقق من أوقات الانتظار عبر منظومة الرعاية المتدرجة بأبوظبي."
            : "I am here to guide your navigation: showing verified clinic options, insurance copay transparency, and wait times across Abu Dhabi's 5-tier stepped-care network.";
        }

        return sendJson(res, 200, { isCrisisTriggered: false, reply });
      }

      // Endpoint Not Found
      return sendJson(res, 404, { error: `Endpoint not found: ${pathname}` });
    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJson(res, 500, { error: "Internal Server Error", message: apiErr.message });
    }
  }

  // -------------------------------------------------------------------------
  // STATIC FILE HANDLER (Global Standard Frontend)
  // -------------------------------------------------------------------------

  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(BASE_DIR, reqPath);

  // Prevent path traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SANAD Abu Dhabi Full-Stack Ecosystem live on port ${PORT}`);
  console.log(`- REST API Gateway: http://localhost:${PORT}/api/v1/`);
  console.log(`- Global Standard Frontend: http://localhost:${PORT}/`);
});
