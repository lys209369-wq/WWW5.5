import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Task } from '../types';

export const generateWeeklyReview = async (tasks: Task[]): Promise<any> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const completedTasks = tasks.filter(t => t.completed).map(t => `${t.title} (${t.category})`).join(', ');
  const pendingTasks = tasks.filter(t => !t.completed).map(t => `${t.title} (${t.category})`).join(', ');

  const prompt = `
    User's Weekly Tasks:
    Completed: ${completedTasks || "None"}
    Pending: ${pendingTasks || "None"}

    Act as a "Growth Coach". Analyze the user's week based on their tasks. 
    Provide a structured summary focusing on knowledge acquisition and mindset.
    Be encouraging but realistic.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      keyTakeaways: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of 3 core achievements or learnings.",
      },
      growthConnections: {
        type: Type.STRING,
        description: "How these tasks connect to broader personal growth.",
      },
      scenarioReview: {
        type: Type.STRING,
        description: "Review of a specific challenge or success pattern observed.",
      },
      suggestions: {
        type: Type.STRING,
        description: "1-2 actionable tips for next week.",
      },
      closingComment: {
        type: Type.STRING,
        description: "A short, punchy motivational closing.",
      },
    },
    required: ["keyTakeaways", "growthConnections", "scenarioReview", "suggestions", "closingComment"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};