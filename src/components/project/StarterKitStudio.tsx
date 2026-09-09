"use client";

import React, { useState } from "react";
import { StarterKitProject } from "@/lib/types";
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Award, 
  ArrowRight, 
  Code2, 
  BookOpen, 
  Download, 
  Printer, 
  Compass,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export const STARTER_KITS: StarterKitProject[] = [
  {
    id: "sk-portfolio",
    title: "Responsive Personal Portfolio Website",
    category: "Web Development",
    difficulty: "Beginner",
    estimatedHours: 4,
    description: "Build a modern, mobile-responsive portfolio website showcasing your skills, coursework, and personal goals.",
    skillsLearned: ["HTML5", "CSS3 / Tailwind", "Responsive Grid Layouts", "Web Accessibility"],
    milestones: [
      {
        id: "m1",
        title: "Structure the HTML Layout & Header",
        description: "Create semantic HTML tags for your navigation bar, about me hero section, and project cards.",
        starterCodeSnippet: `<header className="flex justify-between items-center p-6 bg-slate-900 text-white">\n  <h1 className="text-xl font-bold">My Portfolio</h1>\n  <nav className="space-x-4">\n    <a href="#about">About</a>\n    <a href="#projects">Projects</a>\n  </nav>\n</header>`,
      },
      {
        id: "m2",
        title: "Style with Responsive Flexbox & Cards",
        description: "Apply CSS styling so project cards adapt smoothly between mobile phones and desktop laptops.",
        starterCodeSnippet: `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">\n  <div className="p-4 rounded-xl border border-slate-200 shadow-sm">\n    <h3 className="font-bold">Project 1</h3>\n  </div>\n</div>`,
      },
      {
        id: "m3",
        title: "Deploy Live to Vercel or GitHub Pages",
        description: "Publish your website to the public web and share your live link with mentors and peers.",
        starterCodeSnippet: `# Deploy via terminal\nvercel deploy --prod`,
      },
    ],
  },
  {
    id: "sk-task-tracker",
    title: "Interactive Full-Stack Task Tracker",
    category: "Frontend & State Management",
    difficulty: "Intermediate",
    estimatedHours: 6,
    description: "Create an interactive task management application with state persistence, filtering, and priority tags.",
    skillsLearned: ["React State & Hooks", "LocalStorage CRUD", "Event Handling", "Component Composition"],
    milestones: [
      {
        id: "m1",
        title: "Design State & Todo List Rendering",
        description: "Initialize React state to store tasks and map over the array to render clean task rows.",
        starterCodeSnippet: `const [tasks, setTasks] = useState([]);\nconst addTask = (title) => setTasks([...tasks, { id: Date.now(), title, done: false }]);`,
      },
      {
        id: "m2",
        title: "Implement Toggle, Edit & Delete Actions",
        description: "Add interactive checkbox toggles, task completion filters, and delete confirmation buttons.",
      },
      {
        id: "m3",
        title: "Persist Tasks to Browser LocalStorage",
        description: "Use useEffect to synchronize task items into localStorage so tasks remain saved after page refreshes.",
        starterCodeSnippet: `useEffect(() => {\n  localStorage.setItem('my_tasks', JSON.stringify(tasks));\n}, [tasks]);`,
      },
    ],
  },
  {
    id: "sk-weather-app",
    title: "Real-time Weather & Climate Visualizer",
    category: "APIs & Asynchronous JavaScript",
    difficulty: "Intermediate",
    estimatedHours: 5,
    description: "Fetch live global weather data using async APIs and display temperature charts and weather forecasts.",
    skillsLearned: ["Fetch API", "Async / Await", "JSON Parsing", "Data Visualizations"],
    milestones: [
      {
        id: "m1",
        title: "Connect to OpenWeatherMap API",
        description: "Write asynchronous fetch functions to query weather conditions by city name.",
        starterCodeSnippet: `async function fetchWeather(city) {\n  const res = await fetch(\`https://api.openweathermap.org/data/2.5/weather?q=\${city}&units=metric&appid=API_KEY\`);\n  return res.json();\n}`,
      },
      {
        id: "m2",
        title: "Render Forecast Cards with Dynamic Icons",
        description: "Display temperature, humidity, wind speed, and dynamic weather condition icons.",
      },
      {
        id: "m3",
        title: "Add Error Handling & City Autocomplete",
        description: "Handle invalid city queries gracefully with user-friendly error banners and search suggestions.",
      },
    ],
  },
];

interface StarterKitStudioProps {
  userName?: string;
}

export default function StarterKitStudio({ userName = "Explorer Learner" }: StarterKitStudioProps) {
  const [selectedKit, setSelectedKit] = useState<StarterKitProject>(STARTER_KITS[0]);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [showCertificate, setShowCertificate] = useState(false);

  const toggleMilestone = (milestoneId: string) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [milestoneId]: !prev[milestoneId],
    }));
  };

  const isKitCompleted = selectedKit.milestones.every((m) => completedMilestones[m.id]);
  const completedCount = selectedKit.milestones.filter((m) => completedMilestones[m.id]).length;

  return (
    <div className="space-y-8">
      {/* Track Header Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <span>Explorer Track &bull; Guided Project Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Guided Starter-Kit Projects
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build hands-on, step-by-step coding projects and earn official Edworld Co Skill Completion Certificates.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shrink-0">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Curated for 16-18 Explorers</span>
        </div>
      </div>

      {/* Starter Kits Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STARTER_KITS.map((kit) => {
          const isSelected = selectedKit.id === kit.id;
          return (
            <button
              key={kit.id}
              onClick={() => {
                setSelectedKit(kit);
                setShowCertificate(false);
              }}
              className={`p-5 rounded-3xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                  : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-slate-800 text-brand-300" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {kit.category.toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    {kit.estimatedHours} Hours
                  </span>
                </div>
                <h3 className="font-bold text-sm leading-snug">{kit.title}</h3>
                <p
                  className={`text-xs line-clamp-2 ${
                    isSelected ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {kit.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2">
                {kit.skillsLearned.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className={`text-[9px] px-2 py-0.5 rounded-md ${
                      isSelected ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Starter Kit Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                {selectedKit.difficulty} Level
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {completedCount} of {selectedKit.milestones.length} Milestones Complete
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">{selectedKit.title}</h3>
          </div>

          {isKitCompleted && (
            <button
              onClick={() => setShowCertificate(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md animate-in fade-in"
            >
              <Award className="w-4 h-4 text-brand-300" />
              <span>Claim Completion Certificate</span>
            </button>
          )}
        </div>

        {/* Milestones Checklist */}
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Step-by-Step Project Milestones
          </h4>

          <div className="space-y-3">
            {selectedKit.milestones.map((milestone, idx) => {
              const isChecked = !!completedMilestones[milestone.id];
              return (
                <div
                  key={milestone.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isChecked
                      ? "bg-emerald-50/60 border-emerald-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleMilestone(milestone.id)}
                      className="mt-0.5 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isChecked ? "text-emerald-950 line-through" : "text-slate-900"
                          }`}
                        >
                          Milestone {idx + 1}: {milestone.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Step {idx + 1}/3</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {milestone.description}
                      </p>

                      {milestone.starterCodeSnippet && (
                        <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
                          <pre>{milestone.starterCodeSnippet}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Modal View */}
        {showCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-2xl w-full bg-white rounded-3xl p-8 space-y-6 shadow-2xl border-4 border-slate-900 text-center relative overflow-hidden">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                  EDWORLD CO &bull; SKILL COMPLETION CREDENTIAL
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Certificate of Project Completion
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Credential ID: EDW-SKILL-{Date.now().toString(36).toUpperCase()}
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  This certifies that
                </p>
                <p className="text-xl font-black text-slate-900">{userName}</p>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  has successfully built, debugged, and completed all hands-on technical milestones for{" "}
                  <strong>{selectedKit.title}</strong>, demonstrating practical skills in{" "}
                  {selectedKit.skillsLearned.join(", ")}.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-4 pt-2 border-t border-slate-100">
                <span>Issued: {new Date().toLocaleDateString()}</span>
                <span>Verified by Edworld Co Explorer Track</span>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
