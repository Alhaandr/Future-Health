/**
 * Local Verification Test for Vercel Serverless Function Handler
 */

const vercelHandler = require('./api/index');
const EventEmitter = require('events');

function createMockReqRes(options) {
  const req = new EventEmitter();
  req.url = options.url;
  req.method = options.method || 'GET';
  req.headers = options.headers || { 'content-type': 'application/json' };
  req.body = options.body || null;

  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    writeHead: function(status, headers) {
      this.statusCode = status;
      if (headers) Object.assign(this.headers, headers);
      return this;
    },
    setHeader: function(k, v) {
      this.headers[k.toLowerCase()] = v;
    },
    end: function(data) {
      if (data) this.body += data;
      this.emit('finish');
    }
  };
  Object.setPrototypeOf(res, EventEmitter.prototype);
  EventEmitter.call(res);

  return { req, res };
}

async function runTests() {
  console.log('--- Testing Vercel Handler: GET /api/v1/stepped-care/tiers ---');
  {
    const { req, res } = createMockReqRes({ url: '/api/v1/stepped-care/tiers', method: 'GET' });
    const p = new Promise(resolve => res.on('finish', resolve));
    vercelHandler(req, res);
    await p;
    console.log(`Status: ${res.statusCode}`);
    const data = JSON.parse(res.body);
    console.log(`Tiers Count: ${data.tiers ? data.tiers.length : 'N/A'}`);
    if (res.statusCode !== 200) throw new Error('Failed GET tiers');
  }

  console.log('\n--- Testing Vercel Handler: POST /api/v1/assessments/evaluate ---');
  {
    const { req, res } = createMockReqRes({
      url: '/api/v1/assessments/evaluate',
      method: 'POST',
      body: {
        instrument: 'phq9',
        answers: [1, 2, 1, 0, 1, 1, 0, 0, 0],
        clientPseudonym: 'test_user_vercel'
      }
    });
    const p = new Promise(resolve => res.on('finish', resolve));
    vercelHandler(req, res);
    await p;
    console.log(`Status: ${res.statusCode}`);
    const data = JSON.parse(res.body);
    console.log(`Evaluation Total Score: ${data.evaluation ? data.evaluation.totalScore : 'N/A'}`);
    console.log(`Stepped Tier: ${data.careLoop ? data.careLoop.currentTier : 'N/A'}`);
    if (res.statusCode !== 200) throw new Error('Failed POST evaluate');
  }

  console.log('\n--- Testing Vercel Handler: POST /api/v1/murshid/chat ---');
  {
    const { req, res } = createMockReqRes({
      url: '/api/v1/murshid/chat',
      method: 'POST',
      body: {
        message: 'How much does mental health care cost with Thiqa or Daman?',
        language: 'en'
      }
    });
    const p = new Promise(resolve => res.on('finish', resolve));
    vercelHandler(req, res);
    await p;
    console.log(`Status: ${res.statusCode}`);
    const data = JSON.parse(res.body);
    console.log(`AI Reply Model: ${data.modelUsed}`);
    console.log(`Reply snippet: ${data.reply.slice(0, 100)}...`);
    if (res.statusCode !== 200) throw new Error('Failed POST murshid/chat');
  }

  console.log('\n==================================================================');
  console.log('ALL VERCEL SERVERLESS HANDLER TESTS PASSED (100%)!');
  console.log('==================================================================');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
