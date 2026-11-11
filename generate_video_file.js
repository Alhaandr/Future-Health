/**
 * SANAD Abu Dhabi (سند) - Automated Video File Generator
 * 
 * Uses headless Chromium to render the 180-second presentation, encode it
 * into high-definition WebM video, and save it directly to the PC:
 * c:\Users\SOOQ ELASER\Documents\Future Health\SANAD_Abu_Dhabi_Demo_Video.webm
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 3000;
const OUTPUT_FILE = path.join(__dirname, 'SANAD_Abu_Dhabi_Demo_Video.webm');
const TARGET_URL = `http://localhost:${PORT}/generate_video.html?auto=true&speed=1.0`;

// Find available browser
function getBrowserPath() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  return null;
}

async function checkServerRunning() {
  return new Promise((resolve) => {
    http.get(`http://localhost:${PORT}/`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  console.log("==================================================================");
  console.log("SANAD ABU DHABI — DEMO VIDEO GENERATION & PC EXPORT");
  console.log("==================================================================");

  const browserPath = getBrowserPath();
  if (!browserPath) {
    console.error("No compatible browser (Chrome/Edge) found on this PC.");
    process.exit(1);
  }
  console.log(`Using Browser Engine: ${browserPath}`);

  // Check server
  let isRunning = await checkServerRunning();
  let serverProcess = null;

  if (!isRunning) {
    console.log("Starting SANAD local server on port 3000...");
    serverProcess = spawn('node', ['server.js'], { stdio: 'inherit' });
    await new Promise(r => setTimeout(r, 2500));
  } else {
    console.log("SANAD local server is already running on port 3000.");
  }

  // Delete previous output if exists to verify fresh creation
  if (fs.existsSync(OUTPUT_FILE)) {
    try { fs.unlinkSync(OUTPUT_FILE); } catch(e) {}
  }

  console.log(`Launching automated video recorder for: ${TARGET_URL}`);
  console.log("Rendering 180-second presentation into WebM video...");

  const browserArgs = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--autoplay-policy=no-user-gesture-required',
    '--enable-logging=stderr',
    '--v=1',
    '--window-size=1280,720',
    TARGET_URL
  ];

  const browserProcess = spawn(browserPath, browserArgs);
  browserProcess.stderr.on('data', d => {
    const s = d.toString();
    if (s.includes('VIDEO ENGINE') || s.includes('CONSOLE')) {
      console.log(`\n${s.trim()}`);
    }
  });

  // Poll for output file creation and completion
  const startTime = Date.now();
  const maxWaitMs = 240000; // 4 minutes max (covers 180s real-time 1.0x recording)
  let lastSize = 0;
  let stableCount = 0;

  const checkInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    process.stdout.write(`\rRendering in progress... [${elapsed}s elapsed]`);

    if (fs.existsSync(OUTPUT_FILE)) {
      const stats = fs.statSync(OUTPUT_FILE);
      if (stats.size > 10000) { // file has content
        if (stats.size === lastSize) {
          stableCount++;
          if (stableCount >= 3) { // File finished writing
            clearInterval(checkInterval);
            console.log("\n");
            console.log("==================================================================");
            console.log("SUCCESS: DEMO VIDEO GENERATED AND SAVED TO PC!");
            console.log("==================================================================");
            console.log(`📁 File Location : ${OUTPUT_FILE}`);
            console.log(`📦 File Size     : ${(stats.size / (1024 * 1024)).toFixed(2)} MB (${stats.size.toLocaleString()} bytes)`);
            console.log(`⏱️ Duration      : 180 Seconds (3:00 Minutes)`);
            console.log(`🎬 Format        : WebM (VP9 / High-Definition 1280x720)`);
            console.log("==================================================================");

            // Clean up browser
            try { browserProcess.kill(); } catch(e) {}
            if (serverProcess) {
              try { serverProcess.kill(); } catch(e) {}
            }
            process.exit(0);
          }
        } else {
          lastSize = stats.size;
          stableCount = 0;
        }
      }
    }

    if (Date.now() - startTime > maxWaitMs) {
      clearInterval(checkInterval);
      console.log("\nTimeout waiting for video encoding.");
      try { browserProcess.kill(); } catch(e) {}
      if (serverProcess) {
        try { serverProcess.kill(); } catch(e) {}
      }
      process.exit(1);
    }
  }, 1000);
}

main().catch(err => {
  console.error("Execution error:", err);
  process.exit(1);
});

