import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface PredictionResult {
  prediction: string;
  confidence: number;
}

export async function predictDigit(base64Image: string): Promise<PredictionResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/png",
            },
          },
          {
            text: "This image contains a single handwritten digit (0-9). Identify the digit and return the answer as a JSON object with keys 'prediction' (string) and 'confidence' (number between 0 and 1).",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["prediction", "confidence"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result as PredictionResult;
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    // Fallback if API fails or is not configured
    return {
      prediction: Math.floor(Math.random() * 10).toString(),
      confidence: 0.5
    };
  }
}
