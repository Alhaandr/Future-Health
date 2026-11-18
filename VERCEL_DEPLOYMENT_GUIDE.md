# SANAD Abu Dhabi — Vercel Deployment Guide
### Complete Step-by-Step Instructions for Production Cloud Deployment

This project is pre-configured for deployment on **Vercel** with a decoupled architecture:
- **Frontend:** Static web assets served directly via global Edge CDN (`/frontend`).
- **Backend REST API:** Node.js Serverless Functions (`/api/index.js` routing all `/api/v1/*` requests).
- **Pitch Deck & Showcase:** Pre-rendered HTML5 presentation deck (`/pitch_deck`) and 3-minute video player (`/demo_showcase`).

---

## 🛠️ Architecture Overview on Vercel

```
  User Request (Browser / API Client)
                 │
                 ▼
  Vercel Global Edge Network (vercel.json)
                 ├── Static Routes:
                 │    ├── /               ──▶ /frontend/index.html
                 │    ├── /pitch_deck     ──▶ /frontend/pitch_deck.html
                 │    ├── /demo_showcase  ──▶ /frontend/demo_showcase.html
                 │    └── /*.css, /*.js   ──▶ /frontend/*
                 │
                 └── API Routes:
                      └── /api/v1/*       ──▶ /api/index.js (Serverless Function)
                                                    │
                                                    ▼
                                            backend/server.js
                                            (Stepped-Care, RCI,
                                             Murshid AI, Crisis Sentinel)
```

---

## 🚀 Method 1: Deploy via Vercel Web Dashboard (Recommended & Easiest)

This method connects your GitHub repository directly to Vercel for continuous deployment on every `git push`.

### Step 1: Push Your Code to GitHub
Ensure your latest changes are pushed to your remote branch:
```bash
git add .
git commit -m "feat(vercel): configure serverless API handler and vercel.json rewrites"
git push origin dev-branch
```

### Step 2: Import Project in Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click the **"Add New..."** button (top right) and select **"Project"**.
3. Under **"Import Git Repository"**, locate **`Future-Health`** (or your repository name) and click **"Import"**.

### Step 3: Configure Project Settings
In the configuration screen:
* **Project Name:** `future-health-sanad` (or your preferred name)
* **Framework Preset:** Select **"Other"** (Vercel will automatically read `vercel.json`)
* **Root Directory:** `./` (Leave as default project root)
* **Build and Output Settings:**
  * Build Command: Leave empty (or `npm run build`)
  * Output Directory: Leave empty
  * Install Command: Leave empty (zero external npm dependencies required)

### Step 4: Configure Environment Variables (Optional)
Expand the **"Environment Variables"** section if you wish to enable live Gemini AI integration:
| Variable Name | Example Value | Description |
|:---|:---|:---|
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Default AI model for Murshid conversational guide |
| `OPENAI_API_KEY` | `sk-...` | *(Optional)* Fallback OpenAI key if needed |

> **Note on Zero-Key Resilience:** If no API keys are configured, SANAD automatically operates its built-in **Clinical Reasoning Engine**, providing accurate stepped-care and financial navigation without errors.

### Step 5: Click Deploy
1. Click **"Deploy"**.
2. Deployment completes in approximately 20–40 seconds.
3. You will receive your live production URL (e.g., `https://future-health-sanad.vercel.app`).

---

## 💻 Method 2: Deploy via Vercel CLI (Command Line)

If you prefer deploying directly from your terminal:

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
# or run directly with npx
```

### Step 2: Login & Deploy Preview
Run from the project root directory:
```bash
npx vercel
```
Follow the interactive prompts:
* *Set up and deploy?* **`y`**
* *Which scope?* (Select your Vercel account/team)
* *Link to existing project?* **`n`**
* *What's your project's name?* **`sanad-abu-dhabi`**
* *In which directory is your code located?* **`./`**

### Step 3: Deploy to Production
To promote your deployment to the live production URL:
```bash
npx vercel --prod
```

---

## 🔍 Verification & Post-Deployment Testing

Once deployed, verify the endpoints on your Vercel domain (`https://<your-project>.vercel.app`):

| Target Test | Endpoint URL | Expected Result |
|:---|:---|:---|
| **Main App** | `https://<domain>/` | Loads the SANAD bilingual web application. |
| **Pitch Deck** | `https://<domain>/pitch_deck` | 16-Slide interactive presentation deck in 16:9 widescreen. |
| **Demo Showcase** | `https://<domain>/demo_showcase` | 3-minute video player with Solfeggio soundscape. |
| **Stepped-Care Tiers** | `https://<domain>/api/v1/stepped-care/tiers` | Returns HTTP 200 with 5 Abu Dhabi clinical tiers. |
| **Assessment Evaluation** | `https://<domain>/api/v1/assessments/evaluate` | Evaluates PHQ-9/GAD-7 payloads and triggers closed-loop tracking. |
| **Murshid AI Guide** | `https://<domain>/api/v1/murshid/chat` | Returns structured, non-diagnostic guidance in Arabic/English. |
| **Continuity Dashboard** | `https://<domain>/api/v1/dashboard/continuity` | Returns aggregate closed-loop referral and recovery analytics. |

---

## ⚙️ Configuration File References

### 1. `vercel.json`
Controls URL rewriting between static web views and serverless functions:
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/pitch_deck", "destination": "/frontend/pitch_deck.html" },
    { "source": "/demo_showcase", "destination": "/frontend/demo_showcase.html" },
    { "source": "/generate_video", "destination": "/frontend/generate_video.html" },
    { "source": "/demo_video.webm", "destination": "/SANAD_Abu_Dhabi_Demo_Video.webm" },
    { "source": "/SANAD_Abu_Dhabi_Demo_Video.webm", "destination": "/SANAD_Abu_Dhabi_Demo_Video.webm" },
    { "source": "/", "destination": "/frontend/index.html" },
    { "source": "/(.*)", "destination": "/frontend/$1" }
  ]
}
```

### 2. `api/index.js`
Adapts the full-stack server logic into a Vercel Serverless Function:
```javascript
const { requestHandler } = require('../backend/server');

module.exports = async (req, res) => {
  return requestHandler(req, res);
};
```

---

## 🛡️ Vercel Environment Security & Privacy
* **Zero Cross-Border Data Leakage:** All client sessions in Guest Mode use ephemeral cryptographic IDs (`UUIDv4`) stored strictly in the user's browser `sessionStorage`.
* **CORS & Headers:** Automatic permissive headers configured in `vercel.json` for seamless API invocation across subdomains.
* **Stateless Scaling:** Serverless functions scale to zero when idle, minimizing infrastructure cost while delivering sub-second response times across the UAE and globally.
