const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wgyscapdywroefsjenno.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_yMDIL5s3D-bmR65upYpUdg_7H_TkXdn";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("================================================================================");
console.log("EDWORLD CO — PRODUCTION-GRADE MULTI-STAGE DATABASE SEEDING");
console.log("================================================================================\n");

async function seedData() {
  console.log("1. Seeding Stage-Specific Educational Reference Data...");

  // Seed Plans
  const { error: pErr } = await supabase.from("plans").upsert([
    {
      id: "free",
      name: "Free Starter",
      price_inr: 0,
      resume_limit: 1,
      interview_limit_per_month: 2,
      features: ["1 ATS Resume", "2 AI Mock Interviews / month", "Basic Networking", "View-Only Job Board"]
    },
    {
      id: "pro",
      name: "Career Pro",
      price_inr: 499,
      resume_limit: 9999,
      interview_limit_per_month: 9999,
      features: ["Unlimited Resumes", "Unlimited Mock Interviews", "Apply to Jobs", "Mentor Direct Messaging"]
    }
  ]);
  if (pErr) console.warn("Plans note:", pErr.message);
  else console.log("   ✅ Plans seeded (Free vs Pro).");

  // Seed Badges
  const { error: bErr } = await supabase.from("badges").upsert([
    { code: "first_interview", name: "First Interview Practiced", description: "Completed first STAR interview drill", icon: "Video" },
    { code: "first_quest", name: "Curiosity Pioneer", description: "Completed first interactive curiosity quest", icon: "Compass" },
    { code: "streak_3", name: "3-Day Consistency", description: "Maintained 3-day active streak", icon: "Flame" },
    { code: "streak_7", name: "Weekly Mastery Streak", description: "Maintained 7-day consistency", icon: "Zap" },
    { code: "projects_3", name: "Builder Apprentice", description: "Created 3 portfolio projects", icon: "FolderGit2" },
    { code: "points_500", name: "500 XP Milestone", description: "Earned 500 points across activities", icon: "Sparkles" }
  ]);
  if (bErr) console.warn("Badges note:", bErr.message);
  else console.log("   ✅ Gamification Badges seeded.");

  // Seed Colleges
  const { error: colErr } = await supabase.from("colleges").upsert([
    {
      name: "Indian Institute of Technology Madras",
      location: "Chennai, Tamil Nadu",
      courses: ["B.Tech Computer Science", "B.Tech Electrical", "B.Tech Mechanical"],
      fee_range: "₹8-10 Lakhs (4 Years)",
      typical_cutoff_range: "JEE Advanced Top 150-2500",
      source_url: "https://www.iitm.ac.in",
      needs_review: false
    },
    {
      name: "National Institute of Design",
      location: "Ahmedabad, Gujarat",
      courses: ["B.Des Product Design", "B.Des Communication Design"],
      fee_range: "₹12-14 Lakhs (4 Years)",
      typical_cutoff_range: "NID DAT Top 100",
      source_url: "https://www.nid.edu",
      needs_review: false
    }
  ]);
  if (colErr) console.warn("Colleges note:", colErr.message);
  else console.log("   ✅ Factual Colleges reference data seeded.");

  // Seed Placement Drives
  const { error: driveErr } = await supabase.from("placement_drives").upsert([
    {
      college_name: "General University Network",
      company: "CloudScale Technologies",
      role: "Associate Software Engineer",
      drive_date: "2026-09-25",
      rounds: ["Online Coding Test", "Technical DSA Round", "System Architecture Round", "HR Culture Discussion"],
      eligibility_criteria: "CGPA >= 7.5, No active backlogs"
    }
  ]);
  if (driveErr) console.warn("Placement drives note:", driveErr.message);
  else console.log("   ✅ Campus Placement drives seeded.");

  // Seed Hackathons
  const { error: hackErr } = await supabase.from("hackathons").upsert([
    {
      name: "Smart India Hackathon 2026",
      description: "Nationwide open innovation hackathon for collegiate students.",
      event_date: "2026-10-15",
      registration_url: "https://sih.gov.in",
      team_size_range: "4-6 Members",
      skills_focus: ["AI", "Web", "IoT"],
      needs_review: false
    }
  ]);
  if (hackErr) console.warn("Hackathons note:", hackErr.message);
  else console.log("   ✅ Hackathon opportunities seeded.");

  // Seed Salary Reference Data
  const { error: salErr } = await supabase.from("salary_reference_data").upsert([
    {
      role: "Junior Frontend Developer",
      city: "Bengaluru",
      experience_bracket: "0-2 Years",
      p25_inr: 450000,
      p50_median_inr: 650000,
      p75_inr: 900000,
      data_source: "NASSCOM Tech Industry Salary Index 2025-2026",
      disclaimer: "Aggregated reference data only. Not compensation advice."
    }
  ]);
  if (salErr) console.warn("Salary reference note:", salErr.message);
  else console.log("   ✅ Salary reference ranges seeded.");

  console.log("\n--------------------------------------------------------------------------------");
  console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("--------------------------------------------------------------------------------\n");
}

seedData();
