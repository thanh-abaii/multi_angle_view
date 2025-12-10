import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The model specifically requested: "nano banana" maps to 'gemini-2.5-flash-image'
const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generates a new image based on a source image and a specific angle prompt.
 * 
 * @param base64Image The source image in base64 format (raw data, no prefix).
 * @param mimeType The mime type of the source image.
 * @param anglePrompt Description of the target camera angle.
 * @returns The base64 data URL of the generated image.
 */
export const generateAngleImage = async (
  base64Image: string,
  mimeType: string,
  anglePrompt: string
): Promise<string> => {
  try {
    const prompt = `Generate a high-quality, photorealistic version of the subject in this image from a ${anglePrompt}. Maintain the same subject identity, colors, and style. Output ONLY the image.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
        ],
      },
      config: {
        // Nano Banana does not support responseMimeType or responseSchema
        // We rely on the model returning an image part
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content generated");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Model response did not contain an image.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
