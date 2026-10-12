/**
 * Deep Data Sanitization & PII Defense Engine
 * 
 * Provides:
 * 1. Prototype pollution protection (__proto__, constructor, prototype)
 * 2. Deep recursive input string sanitization (HTML/Script neutralization, null-byte stripping)
 * 3. PII masking & DOB redaction for minors & general users
 * 4. Automated API response scrubbing for credentials, hashes, and internal secrets
 */

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const SENSITIVE_COLUMNS = new Set([
  "password",
  "password_hash",
  "encrypted_password",
  "confirmation_token",
  "recovery_token",
  "secret",
  "api_key",
  "service_role_key",
  "raw_token",
  "refresh_token"
]);

/**
 * Sanitizes a single string value:
 * - Strips null bytes and invisible control characters
 * - Neutralizes script tags and inline event handlers
 */
export function sanitizeInputString(str: string): string {
  if (typeof str !== "string") return str;

  return str
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Escape or neutralize script and dangerous tags
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gi, "")
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "")
    .trim();
}

/**
 * Recursively traverses and sanitizes any JavaScript object or array:
 * - Drops prototype pollution vectors (__proto__, constructor, prototype)
 * - Sanitizes all string values
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeInputString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Prototype pollution defense
      if (DANGEROUS_KEYS.has(key)) {
        continue;
      }
      cleaned[key] = sanitizeObject(value);
    }
    return cleaned as T;
  }

  return obj;
}

/**
 * Masks an email address for safe display (e.g. j***n@example.com)
 */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "******@hidden.com";
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Masks a phone number (e.g. ******4321)
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return "**********";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length <= 4) return "******";
  return `******${cleaned.slice(-4)}`;
}

/**
 * Scrubs any sensitive credentials, password hashes, and raw DOB from API responses.
 * Also enforces COPPA/minors' data protection: minors' personal phone/contact is stripped.
 */
export function sanitizeApiResponse<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeApiResponse(item)) as unknown as T;
  }

  if (typeof data === "object") {
    const scrubbed: Record<string, any> = {};
    const record = data as Record<string, any>;
    const isMinor = record.age_band === "13-15" || record.age_band === "16-18";

    for (const [key, value] of Object.entries(record)) {
      const lowerKey = key.toLowerCase();

      // Omit secret credentials and hashes completely
      if (SENSITIVE_COLUMNS.has(lowerKey)) {
        continue;
      }

      // Redact raw DOB (preserve only age_band)
      if (lowerKey === "dob" || lowerKey === "date_of_birth") {
        continue;
      }

      // Minors safety: redact private phone numbers from external exposure
      if (isMinor && (lowerKey === "phone" || lowerKey === "phone_number")) {
        continue;
      }

      if (typeof value === "object" && value !== null) {
        scrubbed[key] = sanitizeApiResponse(value);
      } else {
        scrubbed[key] = value;
      }
    }

    return scrubbed as T;
  }

  return data;
}
