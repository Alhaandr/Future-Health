/**
 * SANAD Abu Dhabi (سند) - Pitch Deck PDF Generator
 * Converts the 16-slide presentation deck into high-fidelity PDF documents.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function getBrowserPath() {
  const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(chrome)) return chrome;
  if (fs.existsSync(edge)) return edge;
  return null;
}

async function convertToPdf() {
  const browserPath = getBrowserPath();
  if (!browserPath) {
    console.error('Error: No supported browser found for PDF generation.');
    process.exit(1);
  }

  const htmlPath = path.join(__dirname, 'frontend', 'pitch_deck.html');
  const targetUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  const tempPdf = path.join(__dirname, 'temp_output.pdf');

  if (fs.existsSync(tempPdf)) {
    try { fs.unlinkSync(tempPdf); } catch(e) {}
  }

  console.log('Generating presentation PDF via headless browser engine...');
  console.log(`Source URL: ${targetUrl}`);
  console.log(`Browser: ${browserPath}`);

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--run-all-compositor-stages-before-draw',
    '--no-pdf-header-footer',
    `--print-to-pdf=${tempPdf}`,
    targetUrl
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(browserPath, args, { stdio: 'inherit' });

    proc.on('close', (code) => {
      console.log(`Browser process exited with code: ${code}`);
      if (fs.existsSync(tempPdf)) {
        const stats = fs.statSync(tempPdf);
        if (stats.size > 1000) {
          console.log(`Temporary PDF generated successfully: ${stats.size} bytes`);
          resolve(tempPdf);
        } else {
          reject(new Error(`PDF file generated but too small: ${stats.size} bytes`));
        }
      } else {
        reject(new Error('PDF output file was not created.'));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    const generatedPdf = await convertToPdf();

    // Destination files
    const targets = [
      'Future_Health_SANAD_Abu_Dhabi_Submission_Deck.pdf',
      'Future_Health_SANAD_Abu_Dhabi_Submission_Deck_Copy.pdf',
      'SANAD_Abu_Dhabi_Pitch_Deck.pdf',
      'SANAD_Abu_Dhabi_Pitch_Deck_Copy.pdf',
      path.join('frontend', 'Future_Health_SANAD_Abu_Dhabi_Submission_Deck.pdf'),
      path.join('frontend', 'SANAD_Abu_Dhabi_Pitch_Deck.pdf')
    ];

    console.log('\nDistributing and verifying PDF copies:');
    for (const t of targets) {
      const destPath = path.isAbsolute(t) ? t : path.join(__dirname, t);
      fs.copyFileSync(generatedPdf, destPath);
      const st = fs.statSync(destPath);
      console.log(`✓ ${t} (${(st.size / 1024).toFixed(1)} KB)`);
    }

    try { fs.unlinkSync(generatedPdf); } catch(e) {}

    console.log('\n==================================================================');
    console.log('SUCCESS: Pitch Deck converted to PDF and verified across all targets!');
    console.log('==================================================================');
  } catch (err) {
    console.error('Conversion failed:', err);
    process.exit(1);
  }
}

main();

