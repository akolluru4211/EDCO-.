import { onCall, HttpsError } from "firebase-functions/v2/https";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const generateResumePdf = onCall(
  {
    memory: "1GiB",
    timeoutSeconds: 120,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const { htmlContent } = request.data;
    if (!htmlContent) {
      throw new HttpsError("invalid-argument", "HTML content is required for PDF generation.");
    }

    let browser = null;
    try {
      const executablePath = await chromium.executablePath();
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath || undefined,
        headless: chromium.headless,
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "15mm",
          bottom: "15mm",
          left: "15mm",
          right: "15mm",
        },
      });

      return {
        base64Pdf: Buffer.from(pdfBuffer).toString("base64"),
      };
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      throw new HttpsError("internal", `PDF generation error: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
);
