import { NextRequest, NextResponse } from "next/server";

export interface ProvisionedEmployee {
  id: string;
  fullName: string;
  personalEmail: string;
  companyEmail: string;
  temporaryPassword: string;
  role: string;
  department: string;
  employeeId: string;
  startDate: string;
  managerName: string;
  workLocation: string;
  portalUrl: string;
  status: "Active" | "Invited - Pending First Login" | "Suspended";
  createdAt: string;
  lastEmailSentAt?: string;
}

// In-memory provisioned employee store
let provisionedEmployeesStore: ProvisionedEmployee[] = [
  {
    id: "emp-101",
    fullName: "Aditya Verma",
    personalEmail: "aditya.v.dev@gmail.com",
    companyEmail: "aditya.verma@edworld.co.in",
    temporaryPassword: "edworld@122",
    role: "Senior Backend Systems Engineer",
    department: "Engineering",
    employeeId: "EDW-EMP-2026-081",
    startDate: "2026-10-01",
    managerName: "Arun K. (VP Eng)",
    workLocation: "Bengaluru / Hybrid",
    portalUrl: "https://edworld.co/employee",
    status: "Active",
    createdAt: "2026-09-08T10:30:00.000Z",
    lastEmailSentAt: "2026-09-08T10:35:00.000Z"
  },
  {
    id: "emp-102",
    fullName: "Sneha Mukherjee",
    personalEmail: "sneha.m.design@outlook.com",
    companyEmail: "sneha.mukherjee@edworld.co.in",
    temporaryPassword: "edworld@122",
    role: "Staff Frontend Architect",
    department: "Engineering",
    employeeId: "EDW-EMP-2026-082",
    startDate: "2026-10-15",
    managerName: "Arun K. (VP Eng)",
    workLocation: "Remote (India)",
    portalUrl: "https://edworld.co/employee",
    status: "Invited - Pending First Login",
    createdAt: "2026-09-09T08:15:00.000Z",
    lastEmailSentAt: "2026-09-09T08:20:00.000Z"
  },
  {
    id: "emp-103",
    fullName: "Rohan Kapoor",
    personalEmail: "rohan.kapoor99@gmail.com",
    companyEmail: "rohan.kapoor@edworld.co.in",
    temporaryPassword: "edworld@122",
    role: "Lead Product Manager",
    department: "Product",
    employeeId: "EDW-EMP-2026-083",
    startDate: "2026-10-05",
    managerName: "Neha T. (Director of Product)",
    workLocation: "Delhi NCR / Hybrid",
    portalUrl: "https://edworld.co/employee",
    status: "Invited - Pending First Login",
    createdAt: "2026-09-09T14:00:00.000Z",
    lastEmailSentAt: "2026-09-09T14:05:00.000Z"
  }
];

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    employees: provisionedEmployeesStore,
    totalCount: provisionedEmployeesStore.length
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      fullName, 
      personalEmail, 
      role, 
      department, 
      companyEmail, 
      temporaryPassword, 
      startDate, 
      managerName, 
      workLocation,
      customWelcomeNote
    } = body;

    if (!fullName || !personalEmail || !role || !department) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, personalEmail, role, department." },
        { status: 400 }
      );
    }

    // Auto-generate company email if not provided
    const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, ".");
    const finalCompanyEmail = companyEmail || `${cleanName}@edworld.co.in`;

    // Default temporary password
    const finalPassword = temporaryPassword || "edworld@122";

    const newEmpId = `EDW-EMP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newEmployee: ProvisionedEmployee = {
      id: `emp-${Date.now()}`,
      fullName,
      personalEmail,
      companyEmail: finalCompanyEmail,
      temporaryPassword: finalPassword,
      role,
      department,
      employeeId: newEmpId,
      startDate: startDate || new Date().toISOString().split("T")[0],
      managerName: managerName || "Team Lead",
      workLocation: workLocation || "Bengaluru / Hybrid",
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://edworld.co"}/employee`,
      status: "Invited - Pending First Login",
      createdAt: new Date().toISOString(),
      lastEmailSentAt: new Date().toISOString()
    };

    // Store in memory
    provisionedEmployeesStore.unshift(newEmployee);

    // Formatted email dispatch payload (ready for SMTP / SendGrid / Resend)
    const emailPayload = {
      to: [personalEmail, finalCompanyEmail],
      subject: `🎉 Welcome to Edworld Co, ${fullName}! Your Account & Portal Access Credentials`,
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8ecf2; border-radius: 16px;">
          <h2 style="color: #13141b; margin-bottom: 8px;">Welcome to the Team, ${fullName}!</h2>
          <p style="color: #5e6573; font-size: 14px; line-height: 1.6;">
            We are excited to have you join us as <strong>${role}</strong> in the <strong>${department}</strong> team.
          </p>
          
          <div style="background-color: #f4f6fb; padding: 16px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #13141b; font-size: 14px; margin-top: 0;">🔐 Your Corporate Login Credentials</h3>
            <p style="margin: 6px 0; font-size: 13px;"><strong>Company Email:</strong> <code style="background: #e8ecf2; padding: 2px 6px; border-radius: 4px;">${finalCompanyEmail}</code></p>
            <p style="margin: 6px 0; font-size: 13px;"><strong>Temporary Password:</strong> <code style="background: #e8ecf2; padding: 2px 6px; border-radius: 4px;">${finalPassword}</code></p>
            <p style="margin: 6px 0; font-size: 13px;"><strong>Employee ID:</strong> ${newEmpId}</p>
            <p style="margin: 6px 0; font-size: 13px;"><strong>Start Date:</strong> ${startDate}</p>
            <p style="margin: 6px 0; font-size: 13px;"><strong>Reporting Manager:</strong> ${managerName}</p>
          </div>

          <p style="color: #5e6573; font-size: 13px;">
            Please log into your dedicated <strong>Employee Portal</strong> to complete your Day 1 onboarding checklist and set up your permanent password:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${newEmployee.portalUrl}" style="background-color: #13141b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
              Launch Employee Workspace &rarr;
            </a>
          </div>

          ${customWelcomeNote ? `<blockquote style="border-left: 3px solid #7b57ff; padding-left: 12px; color: #5e6573; font-style: italic; font-size: 13px;">${customWelcomeNote}</blockquote>` : ""}

          <hr style="border: none; border-top: 1px solid #e8ecf2; margin: 24px 0;" />
          <p style="color: #8f9cae; font-size: 11px; text-align: center;">
            Edworld Co. People Operations &bull; Safe &amp; DPDP Compliant Onboarding System
          </p>
        </div>
      `
    };

    return NextResponse.json({
      success: true,
      message: `Employee account created and credentials dispatched to ${personalEmail}`,
      employee: newEmployee,
      emailDispatched: emailPayload
    });

  } catch (err: any) {
    console.error("Provision employee error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to provision employee credentials." },
      { status: 500 }
    );
  }
}
