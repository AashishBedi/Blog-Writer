
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are an expert blog post writer. Generate a comprehensive, engaging, and well-structured blog post on the given topic. 
Use markdown for formatting. 
- Use '##' for main headings.
- Use '###' for subheadings.
- Use '**text**' for bold text.
- Use '* ' for unordered list items.
- Ensure the content is informative and easy to read.
- Do not use '#' for the main title, just start with the content.`;

export const generateBlogPost = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                topP: 0.95,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to generate blog post from AI. Please check your API key and try again.");
    }
};
