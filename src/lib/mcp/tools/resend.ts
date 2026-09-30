/**
 * Resend MCP Tools
 * Model Context Protocol tools for sending transactional emails, managing subscribers,
 * and dispatching broadcast emails via Resend.
 */

import { MCPToolDefinition, MCPToolResult, MCPAuthContext } from "../types";
import { 
  sendEmailNotification, 
  addNewsletterSubscriber, 
  broadcastToSubscribers, 
  getNewsletterSubscribers,
  PRIMARY_ADMIN_EMAIL 
} from "@/lib/email-service";

export const resendTools: MCPToolDefinition[] = [
  {
    name: "resend_send_transactional_email",
    domain: "email",
    description: "Sends an individual transactional or alert email via Resend to a recipient, with automatic routing/copying to edworld.eden@gmail.com.",
    requiredRoles: ["ADMIN", "SUPER_ADMIN", "FOUNDER", "HR", "EMPLOYEE", "CLIENT"],
    isSensitive: true,
    parameters: {
      to: {
        type: "string",
        description: "Target recipient email address.",
        required: true,
      },
      subject: {
        type: "string",
        description: "Email subject line.",
        required: true,
      },
      htmlContent: {
        type: "string",
        description: "HTML formatted body of the email.",
        required: true,
      },
      category: {
        type: "string",
        description: "Category of email: 'contact', 'report', 'auth', 'ambassador', 'interview', or 'system'.",
        required: false,
        default: "system",
      },
    },
    handler: async (params: { to: string; subject: string; htmlContent: string; category?: any }, context: MCPAuthContext): Promise<MCPToolResult> => {
      const result = await sendEmailNotification({
        to: params.to,
        subject: params.subject,
        html: params.htmlContent,
        category: params.category || "system",
        metadata: {
          invokedBy: context.userId,
          invokerRole: context.role,
        },
      });

      return {
        success: result.success,
        data: {
          recipient: params.to,
          subject: params.subject,
          id: result.id || "local-dispatch",
          routedToMasterAdmin: PRIMARY_ADMIN_EMAIL,
        },
        error: result.error,
      };
    },
  },
  {
    name: "resend_add_subscriber",
    domain: "email",
    description: "Adds a user or candidate to the EdWorld Co subscriber and newsletter audience via Resend Contacts and database sync.",
    requiredRoles: ["CLIENT", "student", "working_professional", "EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      email: {
        type: "string",
        description: "Email address of the subscriber.",
        required: true,
      },
      name: {
        type: "string",
        description: "Name or display handle of the subscriber.",
        required: false,
      },
      interests: {
        type: "array",
        description: "Array of interest tags (e.g. ['internships', 'interviews', 'system-design']).",
        required: false,
      },
    },
    handler: async (params: { email: string; name?: string; interests?: string[] }, context: MCPAuthContext): Promise<MCPToolResult> => {
      const result = await addNewsletterSubscriber({
        email: params.email,
        name: params.name,
        interests: params.interests,
        source: "mcp-agent",
      });

      return {
        success: result.success,
        data: {
          subscriber: result.subscriber,
          message: "Subscriber registered successfully and synced to Resend audience.",
        },
        error: result.error,
      };
    },
  },
  {
    name: "resend_send_subscriber_broadcast",
    domain: "email",
    description: "Broadcasts a newsletter, career update, or product release email campaign to all verified subscribers via Resend.",
    requiredRoles: ["FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {
      subject: {
        type: "string",
        description: "Subject title for the subscriber campaign.",
        required: true,
      },
      headline: {
        type: "string",
        description: "Main header text inside the newsletter.",
        required: true,
      },
      htmlContent: {
        type: "string",
        description: "Main HTML body content.",
        required: true,
      },
      ctaText: {
        type: "string",
        description: "Call to action button label (e.g. 'Explore New Roles').",
        required: false,
      },
      ctaUrl: {
        type: "string",
        description: "Destination URL for the CTA button.",
        required: false,
      },
    },
    handler: async (params: { subject: string; headline: string; htmlContent: string; ctaText?: string; ctaUrl?: string }, context: MCPAuthContext): Promise<MCPToolResult> => {
      const result = await broadcastToSubscribers({
        subject: params.subject,
        title: params.headline,
        contentHtml: params.htmlContent,
        ctaText: params.ctaText,
        ctaUrl: params.ctaUrl,
        sentByUserId: context.userId,
      });

      return {
        success: result.success,
        data: {
          totalSent: result.totalSent,
          failedCount: result.failedCount,
          subscribersCount: result.subscribersCount,
          subject: params.subject,
        },
        error: result.error,
      };
    },
  },
  {
    name: "resend_list_subscribers",
    domain: "email",
    description: "Retrieves list of active subscribers and subscriber telemetry.",
    requiredRoles: ["FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN", "HR"],
    parameters: {
      limit: {
        type: "number",
        description: "Maximum number of subscribers to return.",
        required: false,
        default: 50,
      },
    },
    handler: async (params: { limit?: number }, context: MCPAuthContext): Promise<MCPToolResult> => {
      const subscribers = await getNewsletterSubscribers(params.limit || 50);
      return {
        success: true,
        data: {
          count: subscribers.length,
          subscribers,
        },
      };
    },
  },
];
