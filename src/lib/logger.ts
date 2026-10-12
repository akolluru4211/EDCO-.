export type LogLevel = "info" | "warn" | "error" | "debug";

const SENSITIVE_KEYS = new Set([
  "dob",
  "date_of_birth",
  "password",
  "password_hash",
  "token",
  "access_token",
  "refresh_token",
  "secret",
  "service_role_key",
  "razorpay_signature",
  "credit_card",
  "journal_content",
  "transcript",
  "interview_transcript",
  "raw_transcript",
  "resume_snapshot",
  "resume_content",
  "full_resume",
  "cv_text",
  "direct_message_content",
  "video_url"
]);

export function scrubObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    // Check for email or token patterns if needed
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(scrubObject);
  }
  if (typeof obj === "object") {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        cleaned[key] = "[REDACTED_PII]";
      } else if (typeof value === "object" && value !== null) {
        cleaned[key] = scrubObject(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  return obj;
}

export function logStructured(level: LogLevel, message: string, metadata: Record<string, any> = {}) {
  const scrubbedMeta = scrubObject(metadata);
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...scrubbedMeta
  };

  const output = JSON.stringify(logEntry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }

  return logEntry;
}

export const logger = {
  info: (msg: string, meta?: Record<string, any>) => logStructured("info", msg, meta),
  warn: (msg: string, meta?: Record<string, any>) => logStructured("warn", msg, meta),
  error: (msg: string, meta?: Record<string, any>) => logStructured("error", msg, meta),
  debug: (msg: string, meta?: Record<string, any>) => logStructured("debug", msg, meta)
};
