import { MCPToolDefinition, MCPAuthContext, MCPToolResult } from "../types";
import { 
  getTeacherClasses, 
  getStudentsByClass, 
  getGradeRecords, 
  saveGradeRecord, 
  getLessonPlans, 
  saveLessonPlan, 
  getParentMessages, 
  sendParentMessage 
} from "@/lib/db-service";

export const teacherTools: MCPToolDefinition[] = [
  {
    name: "get_classes",
    domain: "teacher",
    description: "Retrieves classrooms assigned to the authenticated teacher.",
    requiredRoles: ["TEACHER", "teacher", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      teacherId: { type: "string", description: "Teacher ID (defaults to current context user)", required: false }
    },
    handler: async (): Promise<MCPToolResult> => {
      const classes = await getTeacherClasses();
      return { success: true, data: classes || [] };
    }
  },

  {
    name: "get_students",
    domain: "teacher",
    description: "Retrieves enrolled student roster for a specific classroom ID.",
    requiredRoles: ["TEACHER", "teacher", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      classId: { type: "string", description: "Class ID", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const students = await getStudentsByClass(params.classId);
      return { success: true, data: students || [] };
    }
  },

  {
    name: "get_attendance",
    domain: "teacher",
    description: "Retrieves student attendance records for a classroom.",
    requiredRoles: ["TEACHER", "teacher", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      classId: { type: "string", description: "Class ID", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const students = await getStudentsByClass(params.classId);
      return {
        success: true,
        data: {
          classId: params.classId,
          enrolledCount: students.length,
          sourceTransparency: "Queried from institutional classroom enrollment records."
        }
      };
    }
  },

  {
    name: "get_gradebook",
    domain: "teacher",
    description: "Retrieves submitted grades, quest rubrics, and marks for students in a class.",
    requiredRoles: ["TEACHER", "teacher", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      classId: { type: "string", description: "Class ID", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const grades = await getGradeRecords(params.classId);
      return { success: true, data: grades || [] };
    }
  },

  {
    name: "get_assignments",
    domain: "teacher",
    description: "Retrieves lesson plans and assignments prepared for a classroom.",
    requiredRoles: ["TEACHER", "teacher", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      classId: { type: "string", description: "Class ID", required: true }
    },
    handler: async (): Promise<MCPToolResult> => {
      const plans = await getLessonPlans();
      return { success: true, data: plans || [] };
    }
  },

  {
    name: "create_assignment",
    domain: "teacher",
    description: "Creates and publishes a new lesson assignment or quest for students.",
    requiredRoles: ["TEACHER", "teacher", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {
      classId: { type: "string", description: "Class ID", required: true },
      title: { type: "string", description: "Lesson / Assignment title", required: true },
      subject: { type: "string", description: "Subject name", required: true },
      description: { type: "string", description: "Assignment description", required: true }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const newPlan = await saveLessonPlan({
        teacherId: ctx.userId,
        subject: params.subject,
        gradeLevel: "Grade 9",
        topic: params.title,
        objectives: [params.description],
        activities: ["Interactive discussion", "Hands-on assignment"],
        resources: ["Course textbook", "Edworld lab"],
        homework: params.description,
        date: new Date().toISOString().split("T")[0],
        status: "PLANNED"
      });
      return { success: true, data: newPlan };
    }
  },

  {
    name: "get_parent_messages",
    domain: "teacher",
    description: "Retrieves guardian correspondence and inquiry communications.",
    requiredRoles: ["TEACHER", "teacher", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      teacherId: { type: "string", description: "Teacher ID", required: false }
    },
    handler: async (): Promise<MCPToolResult> => {
      const messages = await getParentMessages();
      return { success: true, data: messages || [] };
    }
  },

  {
    name: "generate_class_report",
    domain: "teacher",
    description: "Compiles aggregate performance analysis for a specific classroom.",
    requiredRoles: ["TEACHER", "teacher", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {
      classId: { type: "string", description: "Class ID", required: true }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const [students, grades] = await Promise.all([
        getStudentsByClass(params.classId),
        getGradeRecords(params.classId)
      ]);

      const avgScore = grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + ((g.marksObtained / (g.maxMarks || 100)) * 100), 0) / grades.length)
        : 0;

      return {
        success: true,
        data: {
          classId: params.classId,
          generatedBy: ctx.userId,
          totalStudents: students.length,
          gradedTasksCount: grades.length,
          averageScorePercent: avgScore,
          sourceTransparency: "Compiled strictly from recorded student gradebook entries."
        }
      };
    }
  }
];
