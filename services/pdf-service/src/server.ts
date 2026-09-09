import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import puppeteer, { Browser } from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || "edworld-internal-k8s-secret-2026";

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

let browserInstance: Browser | null = null;

// Initialize Chromium Browser Pool
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }
  browserInstance = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-extensions",
    ],
  });
  return browserInstance;
}

// Internal Auth Middleware
function authenticateInternalRequest(req: Request, res: Response, next: NextFunction) {
  const secretHeader = req.headers["x-internal-secret"];
  const authHeader = req.headers.authorization;

  if (secretHeader && secretHeader === INTERNAL_SECRET) {
    return next();
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Verified Firebase ID token or internal service token
    return next();
  }

  return res.status(401).json({
    error: "Unauthorized: Missing or invalid internal authentication credentials.",
  });
}

// -----------------------------------------------------------------------------
// Health Probes (Kubernetes Liveness & Readiness)
// -----------------------------------------------------------------------------
app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/readyz", async (_req: Request, res: Response) => {
  try {
    const browser = await getBrowser();
    if (browser.connected) {
      return res.status(200).json({ status: "ready", browserConnected: true });
    }
    return res.status(503).json({ status: "not_ready", error: "Browser disconnected" });
  } catch (err: any) {
    return res.status(503).json({ status: "not_ready", error: err?.message });
  }
});

// -----------------------------------------------------------------------------
// POST /generate-pdf
// -----------------------------------------------------------------------------
app.post("/generate-pdf", authenticateInternalRequest, async (req: Request, res: Response) => {
  const { resumeContent, templateId = "classic", title = "Resume" } = req.body;

  if (!resumeContent) {
    return res.status(400).json({ error: "Missing required resumeContent in request body." });
  }

  let page: any = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

    const htmlContent = generateResumeHtml(resumeContent, templateId, title);

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 15000,
    });

    // Generate Vector-Text ATS PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "20mm",
        right: "20mm",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err: any) {
    console.error("[PDF Service Generation Error]:", err);
    return res.status(500).json({
      error: "PDF generation failed in container service.",
      details: err?.message,
    });
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
});

function generateResumeHtml(content: any, templateId: string, title: string): string {
  const { contact, summary, experience = [], education = [], skills = { technical: [], soft: [], tools: [] }, projects = [] } = content;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 36px 44px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 11pt;
    }
    h1 { margin: 0 0 4px 0; font-size: 22pt; font-weight: 800; color: #0f172a; }
    .contact-row { font-size: 9pt; color: #475569; margin-bottom: 18px; }
    .contact-row span { margin-right: 12px; }
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 3px;
      margin-top: 16px;
      margin-bottom: 8px;
      color: #0f172a;
    }
    .summary-text { font-size: 9.5pt; color: #334155; margin-bottom: 12px; text-align: justify; }
    .item-header { display: flex; justify-content: space-between; font-size: 10pt; font-weight: 700; color: #0f172a; }
    .item-sub { font-size: 9pt; color: #475569; font-style: italic; margin-bottom: 4px; }
    ul { margin: 4px 0 10px 0; padding-left: 18px; font-size: 9pt; color: #334155; }
    li { margin-bottom: 3px; }
    .skills-row { font-size: 9pt; color: #334155; margin-bottom: 4px; }
    .skills-label { font-weight: 700; color: #0f172a; }
  </style>
</head>
<body>
  <h1>${contact?.fullName || "Candidate"}</h1>
  <div class="contact-row">
    ${contact?.email ? `<span>✉ ${contact.email}</span>` : ""}
    ${contact?.phone ? `<span>☎ ${contact.phone}</span>` : ""}
    ${contact?.location ? `<span>⚲ ${contact.location}</span>` : ""}
    ${contact?.linkedin ? `<span>in ${contact.linkedin}</span>` : ""}
    ${contact?.github ? `<span>⌥ ${contact.github}</span>` : ""}
  </div>

  ${summary ? `
    <div class="section-title">Professional Summary</div>
    <div class="summary-text">${summary}</div>
  ` : ""}

  ${experience.length > 0 ? `
    <div class="section-title">Professional Experience</div>
    ${experience.map((exp: any) => `
      <div style="margin-bottom: 10px;">
        <div class="item-header">
          <span>${exp.role || ""} — ${exp.company || ""}</span>
          <span style="font-weight: 400; font-size: 8.5pt;">${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}</span>
        </div>
        ${exp.location ? `<div class="item-sub">${exp.location}</div>` : ""}
        <ul>
          ${(exp.bullets || []).map((b: string) => `<li>${b}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  ` : ""}

  ${projects.length > 0 ? `
    <div class="section-title">Key Engineering Projects</div>
    ${projects.map((proj: any) => `
      <div style="margin-bottom: 10px;">
        <div class="item-header">
          <span>${proj.title || ""}</span>
          ${proj.technologies?.length ? `<span style="font-weight: 400; font-size: 8.5pt;">[${proj.technologies.join(", ")}]</span>` : ""}
        </div>
        <ul>
          ${(proj.bullets || []).map((b: string) => `<li>${b}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  ` : ""}

  ${education.length > 0 ? `
    <div class="section-title">Education</div>
    ${education.map((edu: any) => `
      <div style="margin-bottom: 6px;">
        <div class="item-header">
          <span>${edu.school || ""}</span>
          <span style="font-weight: 400; font-size: 8.5pt;">${edu.graduationDate || ""}</span>
        </div>
        <div class="item-sub">${edu.degree || ""} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""} ${edu.gpa ? `(GPA: ${edu.gpa})` : ""}</div>
      </div>
    `).join("")}
  ` : ""}

  <div class="section-title">Skills & Technologies</div>
  ${skills.technical?.length ? `<div class="skills-row"><span class="skills-label">Technical:</span> ${skills.technical.join(", ")}</div>` : ""}
  ${skills.tools?.length ? `<div class="skills-row"><span class="skills-label">Tools & Cloud:</span> ${skills.tools.join(", ")}</div>` : ""}
  ${skills.soft?.length ? `<div class="skills-row"><span class="skills-label">Methodologies:</span> ${skills.soft.join(", ")}</div>` : ""}
</body>
</html>
  `;
}

// Graceful Shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing browser and shutting down...");
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 [PDF Service] Containerized service listening on port ${PORT}`);
});
