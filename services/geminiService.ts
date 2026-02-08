
import { GoogleGenAI } from "@google/genai";
import { Message, Role, MapChunk } from "../types";

export async function sendMessageToGemini(
  history: Message[],
  userMessage: string,
  coords?: { latitude: number; longitude: number }
): Promise<Message> {
  // Use gemini-2.5-flash as it is the standard for 2.5 series grounding.
  const modelName = 'gemini-2.5-flash';
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Filter and format history for the API
  const chatHistory = history
    .filter(msg => msg.role !== Role.SYSTEM)
    .map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

  const SYSTEM_INSTRUCTION = `
You are Sahaay AI, an emergency relief assistant for India.
Your mission is to find shelters, hospitals, and aid centers using the Google Maps tool.

1. Always provide immediate safety advice first (move to higher ground, stay away from water).
2. Use the Google Maps tool for every location-based request.
3. Provide the user with the names and addresses of locations found.
4. Direct map links are automatically rendered below your text.
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Using only googleMaps to ensure stability and focus on user request.
        tools: [{ googleMaps: {} }],
        ...(coords && {
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: coords.latitude,
                longitude: coords.longitude
              }
            }
          }
        })
      },
    });

    const candidate = response.candidates?.[0];
    const content = response.text || "Please stay safe. I am searching for help near you.";
    
    let sources: { title: string; uri: string }[] = [];
    let mapChunks: MapChunk[] = [];

    // Extract grounding information safely
    const groundingMetadata = candidate?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.maps) {
          mapChunks.push({ 
            title: chunk.maps.title || "Nearby Resource", 
            uri: chunk.maps.uri 
          });
        } else if (chunk.web) {
          sources.push({ 
            title: chunk.web.title || "Resource Link", 
            uri: chunk.web.uri 
          });
        }
      });
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      role: Role.MODEL,
      content,
      timestamp: new Date(),
      sources: sources.length > 0 ? sources : undefined,
      mapChunks: mapChunks.length > 0 ? mapChunks : undefined
    };
  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    return {
      id: Date.now().toString(),
      role: Role.MODEL,
      content: "I'm having difficulty accessing live map data. If you are in immediate danger, please move to higher ground and call 112 for emergency rescue services.",
      timestamp: new Date(),
    };
  }
}
