import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NormalizedChat, GenerationSettings, GenerationResult, Speaker, ChatTurn } from '../types';
import { OCR_SYSTEM_PROMPT, GENERATION_SYSTEM_PROMPT } from '../constants';

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export class GeminiService {
  /**
   * Extracts chat conversation from a screenshot using Vision capabilities.
   */
  async extractChatFromImage(base64Image: string): Promise<NormalizedChat> {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
            { text: OCR_SYSTEM_PROMPT },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              turns: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    speaker: { type: Type.STRING, enum: ['me', 'them'] },
                    text: { type: Type.STRING }
                  },
                  required: ['speaker', 'text']
                }
              }
            },
            required: ['turns']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const parsed = JSON.parse(text);
      
      const turns: ChatTurn[] = parsed.turns.map((t: any) => ({
        id: crypto.randomUUID(),
        speaker: t.speaker === 'me' ? Speaker.ME : Speaker.THEM,
        text: t.text
      }));

      return { turns };

    } catch (error) {
      console.error("OCR Extraction Failed:", error);
      throw new Error("Failed to extract text. Try cropping the image or typing manually.");
    }
  }

  /**
   * Generates reply suggestions based on chat history and user settings.
   */
  async generateReplies(chat: NormalizedChat, settings: GenerationSettings): Promise<GenerationResult> {
    try {
      // Safety Check for Disinterest (Client-side heuristic to force closure mode)
      const lastTurns = chat.turns.slice(-3); // Check last 3 messages
      const disinterestKeywords = ['stop', 'no', 'not interested', 'leave me alone', 'dont text', 'block'];
      const hasDisinterest = lastTurns.some(t => 
        t.speaker === Speaker.THEM && 
        disinterestKeywords.some(kw => t.text.toLowerCase().includes(kw))
      );

      let effectiveSettings = { ...settings };
      if (hasDisinterest) {
        effectiveSettings.spicyMode = false;
        effectiveSettings.intent = 'Close politely' as any;
      }

      const chatContext = JSON.stringify(chat.turns.map(t => ({
        speaker: t.speaker,
        text: t.text
      })));

      // Construct prompt with emphasis on Spicy Mode if active
      const promptData = `
        Conversation History:
        ${chatContext}

        User Settings:
        - Tone: ${effectiveSettings.tone}
        - Length: ${effectiveSettings.length}
        - Risk Level: ${effectiveSettings.boldness} (0.0 to 1.0)
        - Intent: ${effectiveSettings.intent}
        - Emoji Allowed: ${effectiveSettings.includeEmoji}
        - Language: ${effectiveSettings.language}
        
        CRITICAL INSTRUCTION:
        SPICY MODE is ${effectiveSettings.spicyMode ? "ENABLED (🔥)" : "DISABLED"}
        ${effectiveSettings.spicyMode ? "YOU MUST BE FLIRTY, CONFIDENT, AND TEASING. Do not be boring." : "Be friendly and helpful."}
      `;

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          mode: { type: Type.STRING, enum: ['normal', 'closure'] },
          detected_language: { type: Type.STRING },
          safety_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ['label', 'text']
            }
          },
          avoid: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ['text', 'reason']
            }
          }
        },
        required: ['mode', 'suggestions', 'detected_language']
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: promptData,
        config: {
          systemInstruction: GENERATION_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: effectiveSettings.spicyMode ? 1.0 : 0.75, // Max creativity for spicy
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      return JSON.parse(text) as GenerationResult;

    } catch (error) {
      console.error("Generation Failed:", error);
      throw new Error("Failed to generate replies. Please try again.");
    }
  }
}

export const geminiService = new GeminiService();