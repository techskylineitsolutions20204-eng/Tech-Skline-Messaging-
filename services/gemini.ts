import { GoogleGenAI } from "@google/genai";

// NOTE: The API key is obtained from the environment variable process.env.API_KEY.
// This is injected by the runtime environment.
const apiKey = process.env.API_KEY || '';

export const ai = new GoogleGenAI({ apiKey });

export const MODEL_CHAT = 'gemini-2.5-flash';
export const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025';
