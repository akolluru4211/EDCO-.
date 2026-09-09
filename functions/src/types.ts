export type AgeBand = "13-15" | "16-18" | "18+";
export type SkillLevel = 0 | 1 | 2;
export type JobType = "internship" | "full-time" | "part-time";
export type ApplicationStatus = "applied" | "viewed" | "rejected" | "interview" | "offer";
export type PipelineStepStatus = "completed" | "failed" | "pending" | "unavailable";

export interface InterviewPipelineStatus {
  transcription: PipelineStepStatus;
  contentScoring: PipelineStepStatus;
  voiceDelivery: PipelineStepStatus;
  facialEngagement: PipelineStepStatus;
}

export interface JDAnalysisRequest {
  resumeContent: any;
  jobDescription: string;
  targetRole?: string;
  effectiveLevel?: number;
  resumeId?: string;
}

export interface InterviewScoringRequest {
  sessionId?: string;
  category: string;
  questionId: string;
  questionText: string;
  difficultyLevel: SkillLevel;
  audioBase64?: string;
  videoUrl?: string;
  rawTranscript?: string;
  durationSeconds?: number;
  isAudioOnly?: boolean;
}
