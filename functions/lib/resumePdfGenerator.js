"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResumePdf = void 0;
const https_1 = require("firebase-functions/v2/https");
const chromium_1 = __importDefault(require("@sparticuz/chromium"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
exports.generateResumePdf = (0, https_1.onCall)({
    memory: "1GiB",
    timeoutSeconds: 120,
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication required.");
    }
    const { htmlContent } = request.data;
    if (!htmlContent) {
        throw new https_1.HttpsError("invalid-argument", "HTML content is required for PDF generation.");
    }
    let browser = null;
    try {
        const executablePath = await chromium_1.default.executablePath();
        browser = await puppeteer_core_1.default.launch({
            args: chromium_1.default.args,
            defaultViewport: chromium_1.default.defaultViewport,
            executablePath: executablePath || undefined,
            headless: chromium_1.default.headless,
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
    }
    catch (error) {
        console.error("PDF generation failed:", error);
        throw new https_1.HttpsError("internal", `PDF generation error: ${error.message}`);
    }
    finally {
        if (browser) {
            await browser.close();
        }
    }
});
//# sourceMappingURL=resumePdfGenerator.js.map