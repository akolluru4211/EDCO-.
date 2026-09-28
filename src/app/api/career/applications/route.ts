import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: applications, error: dbError } = await supabase
      .from("job_applications_pipeline")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      applications: applications || []
    });
  } catch (err: any) {
    console.error("[Applications GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      jobTitle,
      jobLocation,
      salaryRange,
      jobUrl,
      source = "manual",
      status = "saved",
      notes,
      resumeId,
      nextActionDate,
      nextActionLabel
    } = body;

    if (!companyName || !jobTitle) {
      return NextResponse.json({ error: "Company name and job title are required" }, { status: 400 });
    }

    const { data: newApp, error: insertError } = await supabase
      .from("job_applications_pipeline")
      .insert({
        user_id: user.id,
        company_name: companyName.trim(),
        job_title: jobTitle.trim(),
        job_location: jobLocation?.trim() || null,
        salary_range: salaryRange?.trim() || null,
        job_url: jobUrl?.trim() || null,
        source,
        status,
        applied_at: status === "applied" ? new Date().toISOString() : null,
        notes: notes?.trim() || null,
        resume_id: resumeId || null,
        next_action_date: nextActionDate || null,
        next_action_label: nextActionLabel?.trim() || null
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Log application event
    try {
      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        actor_role: "user",
        action: "career.application_created",
        target_type: "job_application",
        target_id: newApp.id,
        metadata: { companyName, jobTitle, status }
      });
    } catch (e) {
      console.warn("Audit log note:", e);
    }

    return NextResponse.json({
      success: true,
      application: newApp
    });
  } catch (err: any) {
    console.error("[Applications POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to create application" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, notes, interviewPrepNotes, nextActionDate, nextActionLabel } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (status !== undefined) {
      updatePayload.status = status;
      if (status === "applied") {
        updatePayload.applied_at = new Date().toISOString();
      }
    }
    if (notes !== undefined) updatePayload.notes = notes;
    if (interviewPrepNotes !== undefined) updatePayload.interview_prep_notes = interviewPrepNotes;
    if (nextActionDate !== undefined) updatePayload.next_action_date = nextActionDate;
    if (nextActionLabel !== undefined) updatePayload.next_action_label = nextActionLabel;

    const { data: updatedApp, error: updateError } = await supabase
      .from("job_applications_pipeline")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      application: updatedApp
    });
  } catch (err: any) {
    console.error("[Applications PATCH Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("job_applications_pipeline")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("[Applications DELETE Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to delete application" }, { status: 500 });
  }
}
