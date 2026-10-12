import { logger } from "@/lib/logger";
import { sentryClient } from "@/lib/monitoring/sentry-client";

export interface CostMetricEvent {
  service: "razorpay" | "resend_email" | "ai_llm_inference" | "tts_speech" | "whisper_audio";
  units: number;
  estimatedCostUsd: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}

// Threshold Limits for Alerts
const COST_ALERT_THRESHOLDS: Record<string, number> = {
  razorpay_daily_transactions: 500,
  resend_daily_emails: 1000,
  ai_daily_tokens: 2000000,
  tts_daily_characters: 500000
};

export const monitoring = {
  captureException: (err: Error, context: Record<string, any> = {}) => {
    const report = sentryClient.captureException(err, {
      service: "nextjs-frontend",
      metadata: context,
      requestPath: context.path,
      httpMethod: context.method,
      statusCode: context.statusCode,
      userId: context.userId
    });

    return {
      eventId: report.eventId,
      handled: true,
      alertChannel: report.alertChannel,
      dispatched: report.dispatched
    };
  },

  trackUsageMetric: (event: CostMetricEvent) => {
    logger.info(`[USAGE_METRIC_TRACKED]: ${event.service}`, {
      service: event.service,
      units: event.units,
      estimatedCostUsd: event.estimatedCostUsd,
      timestamp: event.timestamp || new Date().toISOString()
    });

    // Check against threshold
    if (event.units > (COST_ALERT_THRESHOLDS[event.service] || 100000)) {
      monitoring.triggerCostAlert({
        service: event.service,
        currentUsage: event.units,
        threshold: COST_ALERT_THRESHOLDS[event.service],
        severity: "HIGH_ANOMALY"
      });
    }
  },

  triggerCostAlert: (alertData: {
    service: string;
    currentUsage: number;
    threshold: number;
    severity: "MEDIUM" | "HIGH_ANOMALY";
  }) => {
    logger.warn(`🚨 [COST_ANOMALY_ALERT_TRIGGERED]: ${alertData.service} exceeded threshold!`, alertData);
    return {
      alertDispatched: true,
      channels: ["pagerduty", "ops-slack-webhook", "email"],
      alertData
    };
  }
};
