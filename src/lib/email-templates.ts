/**
 * Centralized Branded Email Template Generator
 * Follows EdWorld Co. visual standard with single-column responsive HTML layout,
 * branded headers, high contrast CTAs, and security footers.
 */

export interface EmailLayoutProps {
  previewText: string;
  title: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}

export function renderBrandedEmailHtml(props: EmailLayoutProps): string {
  const { previewText, title, contentHtml, ctaText, ctaUrl, footerNote } = props;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://edworldco.in";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F4F6FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #13141B; }
    .wrapper { width: 100%; max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E8ECF2; }
    .header { padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #F4F6FB; }
    .logo-text { font-size: 22px; font-weight: 900; color: #13141B; letter-spacing: -0.5px; }
    .logo-accent { color: #00D2B4; }
    .body-content { padding: 32px; font-size: 14px; line-height: 1.6; color: #5E6573; }
    .body-content h1 { font-size: 20px; font-weight: 800; color: #13141B; margin-top: 0; margin-bottom: 16px; }
    .body-content p { margin-bottom: 16px; }
    .body-content strong { color: #13141B; }
    .cta-container { text-align: center; margin: 32px 0 16px; }
    .cta-button { display: inline-block; background-color: #13141B; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { padding: 24px 32px; text-align: center; font-size: 11px; color: #8E95A5; border-top: 1px solid #F4F6FB; }
    .footer a { color: #5E6573; text-decoration: underline; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${previewText}
  </div>
  <table width="100%" border="0" cellspacing="0" cellpadding="24" style="background-color: #F4F6FB;">
    <tr>
      <td align="center">
        <div class="wrapper">
          <div class="header">
            <div class="logo-text">Edworld <span class="logo-accent">Co.</span></div>
            <div style="font-size: 10px; font-weight: 700; color: #8E95A5; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">Skills & Career OS</div>
          </div>
          <div class="body-content">
            <h1>${title}</h1>
            ${contentHtml}
            ${ctaText && ctaUrl ? `
              <div class="cta-container">
                <a href="${ctaUrl}" class="cta-button" target="_blank">${ctaText}</a>
              </div>
            ` : ""}
          </div>
          <div class="footer">
            <p>${footerNote || "You received this email because of your verified account on Edworld Co."}</p>
            <p>&copy; ${new Date().getFullYear()} EdWorld Co. All rights reserved. &bull; <a href="${appUrl}/privacy">Privacy Policy</a> &bull; <a href="${appUrl}/terms">Terms</a></p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generates branded email for Ambassador Approval notification
 */
export function renderAmbassadorApprovedEmail(params: { name: string; collegeName: string; referralCode: string }): string {
  return renderBrandedEmailHtml({
    previewText: "Congratulations! You are officially an EdWorld Campus Ambassador.",
    title: "Welcome to the EdWorld Campus Ambassador Program",
    contentHtml: `
      <p>Hi <strong>${params.name}</strong>,</p>
      <p>We are excited to inform you that your application to represent <strong>${params.collegeName}</strong> has been reviewed and <strong>approved</strong>!</p>
      <div style="background-color: #F4F6FB; border: 1px solid #E8ECF2; border-radius: 16px; padding: 18px; margin: 20px 0; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; color: #8E95A5; text-transform: uppercase; letter-spacing: 1px;">Your Exclusive Campus Referral Code</div>
        <div style="font-size: 22px; font-weight: 900; color: #13141B; font-family: monospace; margin-top: 6px;">${params.referralCode}</div>
      </div>
      <p>You can now access your dedicated Ambassador Resource Hub to copy promotional materials, track attributed signups in real-time, and unlock your verified profile badge.</p>
    `,
    ctaText: "Open Ambassador Hub",
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://edworldco.in"}/ambassador/hub`,
  });
}

/**
 * Generates branded email for Mock Interview Performance Scorecard
 */
export function renderInterviewScorecardEmail(params: { name: string; sessionTitle: string; overallScore: number; sessionId: string }): string {
  return renderBrandedEmailHtml({
    previewText: `Your scorecard for ${params.sessionTitle} is now available.`,
    title: "Your Mock Interview Performance Summary",
    contentHtml: `
      <p>Hi <strong>${params.name}</strong>,</p>
      <p>Your recent mock interview session <strong>${params.sessionTitle}</strong> has been evaluated by our adaptivity engine.</p>
      <div style="background-color: #F4F6FB; border: 1px solid #E8ECF2; border-radius: 16px; padding: 18px; margin: 20px 0; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; color: #8E95A5; text-transform: uppercase; letter-spacing: 1px;">Overall Performance Score</div>
        <div style="font-size: 32px; font-weight: 900; color: #13141B; margin-top: 4px;">${params.overallScore} <span style="font-size: 16px; color: #8E95A5;">/ 100</span></div>
      </div>
      <p>Review your detailed question-by-question breakdown, speech cadence telemetry, STAR structure feedback, and recommended drill roadmap.</p>
    `,
    ctaText: "View Full Scorecard",
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://edworldco.in"}/interviews/results/${params.sessionId}`,
  });
}
