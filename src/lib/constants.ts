import { CareerStage } from "./types";

export interface InterviewCategoryDef {
  id: string;
  name: string;
  description: string;
  desc?: string;
  iconName: string;
  roles: string[];
}

export const AVAILABLE_CATEGORIES: InterviewCategoryDef[] = [
  {
    id: "swe",
    name: "Software Engineering",
    description: "System design, full-stack algorithms, data structures, and production architecture.",
    desc: "System design, full-stack algorithms, data structures, and production architecture.",
    iconName: "Code2",
    roles: ["Frontend", "Backend", "Full Stack", "DevOps", "Mobile"]
  },
  {
    id: "ai-ml",
    name: "AI and Machine Learning",
    description: "Transformers, PyTorch model architectures, inference pipelines, and LLM evaluation.",
    desc: "Transformers, PyTorch model architectures, inference pipelines, and LLM evaluation.",
    iconName: "BrainCircuit",
    roles: ["ML Engineer", "AI Researcher", "Data Scientist", "NLP Engineer"]
  },
  {
    id: "product",
    name: "Product Management",
    description: "Product roadmap prioritization, execution metrics, user empathy, and A/B testing strategy.",
    desc: "Product roadmap prioritization, execution metrics, user empathy, and A/B testing strategy.",
    iconName: "Compass",
    roles: ["APM", "Technical PM", "Senior Product Manager", "Group PM"]
  },
  {
    id: "behavioral",
    name: "Leadership and Behavioral",
    description: "Cross-functional collaboration, crisis management, STAR framework leadership stories.",
    desc: "Cross-functional collaboration, crisis management, STAR framework leadership stories.",
    iconName: "Users",
    roles: ["Engineering Manager", "Tech Lead", "Team Lead", "Founder"]
  }
];

export const CAREER_STAGE_NAMES: Record<CareerStage, string> = {
  JUNIOR: "Junior (School / Ages 13-17)",
  STUDENT: "College & University Student",
  PROFESSIONAL: "Working Professional"
};
