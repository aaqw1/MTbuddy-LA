
import { GoogleGenAI } from "@google/genai";

// Server-side only
// Using process.env.API_KEY directly in constructor as per SDK guidelines
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
