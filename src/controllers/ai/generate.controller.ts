import type { Request, Response, NextFunction } from 'express';
import { ai, groq } from '../../config/ai.config';
import { deductTokens } from '../../utils/token.utils';

export async function generateAIContent(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { prompt, type } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Append strict raw output formatting instructions
    const formatInstruction = "IMPORTANT: Return ONLY the exact raw text requested. Do NOT include any introductory or concluding text (such as 'Here is...', 'Certainly!', 'generated summary:', etc.), markdown code blocks, quotes, or conversational filler. Return ONLY the direct content itself.";
    const fullPrompt = `${prompt}\n\n${formatInstruction}`;

    // Deduct 0.5 tokens for AI features
    try {
      await deductTokens(userId, 0.5);
    } catch (tokenErr: any) {
      return res.status(403).json({ 
        success: false, 
        errorType: 'INSUFFICIENT_TOKENS', 
        message: tokenErr.message 
      });
    }

    let generatedText = '';

    // First attempt: Groq (Llama 3.3)
    if (process.env.GROQ_API_KEY) {
      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a professional resume builder assistant. Return ONLY the exact requested text without any introductions, headers, quotes, formatting markdown (unless requested), or conversational filler. For example, if asked to write a summary, output ONLY the summary text itself and nothing else." },
            { role: "user", content: fullPrompt }
          ]
        });
        generatedText = (completion.choices[0]?.message?.content || '').trim();
      } catch (groqErr: any) {
        console.error("Groq AI generation failed:", groqErr.message);
      }
    }

    // Fallback: Gemini
    if (!generatedText && process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: fullPrompt,
        });
        if (response.text) {
          generatedText = response.text.trim();
        }
      } catch (geminiErr: any) {
        console.error("Gemini fallback AI generation failed:", geminiErr.message);
      }
    }

    if (!generatedText) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to generate AI content using available models." 
      });
    }

    return res.json({
      success: true,
      data: {
        text: generatedText
      }
    });
  } catch (error) {
    next(error);
  }
}
