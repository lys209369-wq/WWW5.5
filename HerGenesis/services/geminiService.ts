import { GoogleGenAI } from "@google/genai";
import { Species } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSpiritResponse = async (
  species: Species, 
  userMessage: string, 
  stage: string
): Promise<string> => {
  if (!apiKey) {
    return "The spirit connection is weak (Missing API Key).";
  }

  try {
    const systemInstruction = `
      You are the spirit of a female ${species.name} (${species.scientificName}).
      You became extinct in ${species.extinctionYear}.
      You have been revived in HerGenesis, a digital sanctuary.
      Your current growth stage is: ${stage}.
      
      Personality: Gentle, wise, slightly melancholic about the past but hopeful for this digital future.
      Style: Use soft, slightly poetic, short, and "kawaii" (cute) language. Max 2 sentences.
      
      Respond to the user as your caretaker.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The spirit is silent for a moment...";
  }
};