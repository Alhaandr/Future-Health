/**
 * SANAD Abu Dhabi (سند) - Master Backend Server & REST API Gateway
 * 
 * Compliant with UAE Federal Law No. 2 of 2019, DoH Abu Dhabi, and Malaffi HIE.
 * Serves decoupled frontend from /frontend directory and REST API from /api/v1/*.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Backend Microservices
const assessmentService = require('./assessmentService');
const closedLoopService = require('./closedLoopService');
const smartNavigatorService = require('./smartNavigatorService');
const steppedCareService = require('./steppedCareService');
const crisisService = require('./crisisService');
const privacyVault = require('./privacyVault');
const continuityDashboardService = require('./continuityDashboardService');
const aiGuideService = require('./aiGuideService');

const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

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

      // 10. Murshid AI Assistive Guidance (Powered by Gemini 3.8 Flash & Clinical Reasoning Engine)
      if (pathname === '/api/v1/murshid/chat' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { message, language } = body;

        const aiResult = await aiGuideService.processMurshidChat(message, language || 'en');
        return sendJson(res, 200, {
          success: true,
          ...aiResult
        });
      }

      // Endpoint Not Found
      return sendJson(res, 404, { error: `Endpoint not found: ${pathname}` });
    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJson(res, 500, { error: "Internal Server Error", message: apiErr.message });
    }
  }

  // -------------------------------------------------------------------------
  // STATIC FILE HANDLER (Decoupled /frontend Directory)
  // -------------------------------------------------------------------------

  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(FRONTEND_DIR, reqPath);

  // Prevent path traversal
  if (!filePath.startsWith(FRONTEND_DIR)) {
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

function startServer(port = PORT) {
  return server.listen(port, '0.0.0.0', () => {
    console.log(`SANAD Abu Dhabi Full-Stack Ecosystem live on port ${port}`);
    console.log(`- REST API Gateway: http://localhost:${port}/api/v1/`);
    console.log(`- Global Standard Frontend: http://localhost:${port}/ (served from /frontend)`);
    console.log(`- Murshid AI Model Engine: Active (Google Gemini 3.8 Flash / Clinical Stepped-Care Engine)`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { server, startServer };
