import type { Request, Response, NextFunction } from 'express';
import { ai, groq } from '../../config/ai.config';
import prisma from '../../config/db.config';
import { deductTokens } from '../../utils/token.utils';

// Helper to run AI generation with fallback
async function generateAIText(prompt: string, systemMessage = "You are a professional resume and career assistant."): Promise<string> {
  let generatedText = '';

  // 1. Try Groq (Llama 3.3)
  if (process.env.GROQ_API_KEY) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-specdec",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ]
      });
      generatedText = (completion.choices[0]?.message?.content || '').trim();
    } catch (groqErr: any) {
      console.error("Groq AI generation failed in optimize helper:", groqErr.message);
    }
  }

  // 2. Fallback to Gemini
  if (!generatedText && process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `${systemMessage}\n\nUser request:\n${prompt}`,
      });
      if (response.text) {
        generatedText = response.text.trim();
      }
    } catch (geminiErr: any) {
      console.error("Gemini AI generation failed in optimize helper:", geminiErr.message);
    }
  }

  if (!generatedText) {
    throw new Error('AI content generation failed across all available models.');
  }

  return generatedText;
}

// 1. Auto Job Description Generator
export async function generateJobDescription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { companyName, roles } = req.body;
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one role must be selected' });
    }

    // Deduct tokens
    try {
      await deductTokens(userId, 0.5);
    } catch (tokenErr: any) {
      return res.status(403).json({ success: false, errorType: 'INSUFFICIENT_TOKENS', message: tokenErr.message });
    }

    let profile = null;
    if (companyName) {
      profile = await prisma.companyProfile.findFirst({
        where: {
          name: {
            equals: companyName,
            mode: 'insensitive'
          }
        }
      });
    }

    let prompt = '';
    const rolesStr = roles.join(', ');

    if (profile) {
      prompt = `Generate a realistic and detailed job description for a role combining the following positions: "${rolesStr}" at the company "${profile.name}".
Company Profile Details:
- Industry: ${profile.industry}
- Hiring Style: ${profile.hiringStyle}
- Engineering Culture: ${profile.engineeringCulture}
- Technologies Used: ${profile.technologiesUsed.join(', ')}
- Preferred Skills: ${profile.preferredSkills.join(', ')}

Please structure the job description using standard Markdown. Include:
1. About ${profile.name} (incorporate their engineering culture and industry context)
2. Role Summary
3. Key Responsibilities
4. Required Skills & Technologies
5. Common Interview Focus area hints for candidates`;
    } else {
      prompt = `Generate a realistic and detailed job description for a role combining the following positions: "${rolesStr}".

Please structure the job description using standard Markdown. Include:
1. Role Summary
2. Key Responsibilities
3. Required Skills & Technologies
4. Suggested Interview Focus areas`;
    }

    const systemMessage = "You are a professional hiring manager and recruiting consultant.";
    const jd = await generateAIText(prompt, systemMessage);

    return res.json({
      success: true,
      data: {
        text: jd
      }
    });
  } catch (error) {
    next(error);
  }
}

// 2. Optimize Resume for Company & Roles
export async function optimizeResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { resumeId, content, companyName, roles } = req.body;
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ success: false, message: 'Roles are required for optimization' });
    }

    const rolesStr = roles.join(', ');

    // 1. Resolve resume content
    let originalContent: any = null;
    let resumeTitle = 'Optimized Resume';

    if (resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId }
      });
      if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }
      originalContent = resume.content;
      resumeTitle = resume.title;
    } else if (content) {
      originalContent = content;
    } else {
      return res.status(400).json({ success: false, message: 'Resume ID or raw content is required' });
    }

    // Deduct tokens
    try {
      await deductTokens(userId, 0.5);
    } catch (tokenErr: any) {
      return res.status(403).json({ success: false, errorType: 'INSUFFICIENT_TOKENS', message: tokenErr.message });
    }

    // 2. Fetch company intelligence profile
    let profile = null;
    if (companyName) {
      profile = await prisma.companyProfile.findFirst({
        where: {
          name: {
            equals: companyName,
            mode: 'insensitive'
          }
        }
      });
    }

    const companyContext = profile ? `
Target Company: ${profile.name}
Industry: ${profile.industry}
Key Technologies: ${profile.technologiesUsed.join(', ')}
Preferred Skills: ${profile.preferredSkills.join(', ')}
ATS Keywords to match: ${profile.atsKeywords.join(', ')}
Resume Optimization Keys: ${profile.resumeOptimizationKeys.join(', ')}
Engineering Culture: ${profile.engineeringCulture}
` : `Target Company Name: ${companyName || 'General'}`;

    const prompt = `You are an expert ATS resume optimizer.
Optimize the following resume JSON to tailor it for the target role: "${rolesStr}".

${companyContext}

Resume JSON content to optimize:
${JSON.stringify(originalContent)}

INSTRUCTIONS:
1. Tailor the professional summary to match the roles and company culture/technologies.
2. Enhance experience bullet points to highlight relevant impact, incorporating target ATS keywords and tech stack where appropriate while retaining candidate details.
3. Tailor the project techStack and description fields.
4. Keep the output as valid JSON matching the exact same schema.
5. Do NOT add any extra fields, wrapping elements, explanations, or markdown blocks (e.g. do not wrap the JSON in \`\`\`json). Output the pure JSON string only.`;

    const responseText = await generateAIText(prompt, "You are a professional ATS resume parsing and optimization engine.");
    
    // Parse the JSON result
    let optimizedContent: any = null;
    try {
      // Clean up markdown block wraps if the AI ignored instructions
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        optimizedContent = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
      } else {
        optimizedContent = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.error("JSON parsing of optimized resume failed. AI response was:", responseText);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to format the optimized content. Please try again.' 
      });
    }

    // 3. Save as version if resumeId was provided
    let savedVersion = null;
    if (resumeId) {
      savedVersion = await prisma.resumeVersion.create({
        data: {
          resumeId,
          company: companyName || 'General',
          role: rolesStr,
          content: optimizedContent,
          status: 'Active'
        }
      });
    }

    return res.json({
      success: true,
      data: {
        content: optimizedContent,
        version: savedVersion
      }
    });
  } catch (error) {
    next(error);
  }
}

// 3. Optimize Cover Letter for Company & Roles
export async function optimizeCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { coverLetterId, content, companyName, roles } = req.body;
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ success: false, message: 'Roles are required for optimization' });
    }

    const rolesStr = roles.join(', ');

    // 1. Resolve cover letter content
    let originalContent: any = null;
    let coverLetterTitle = 'Optimized Cover Letter';
    let template = 'Modern';

    if (coverLetterId) {
      const coverLetter = await prisma.coverLetter.findUnique({
        where: { id: coverLetterId, userId }
      });
      if (!coverLetter) {
        return res.status(404).json({ success: false, message: 'Cover letter not found' });
      }
      originalContent = coverLetter.content;
      coverLetterTitle = coverLetter.title;
      template = coverLetter.template;
    } else if (content) {
      originalContent = content;
    } else {
      return res.status(400).json({ success: false, message: 'Cover Letter ID or raw content is required' });
    }

    // Deduct tokens
    try {
      await deductTokens(userId, 0.5);
    } catch (tokenErr: any) {
      return res.status(403).json({ success: false, errorType: 'INSUFFICIENT_TOKENS', message: tokenErr.message });
    }

    // 2. Fetch company intelligence profile
    let profile = null;
    if (companyName) {
      profile = await prisma.companyProfile.findFirst({
        where: {
          name: {
            equals: companyName,
            mode: 'insensitive'
          }
        }
      });
    }

    const companyContext = profile ? `
Target Company: ${profile.name}
Industry: ${profile.industry}
Key Technologies: ${profile.technologiesUsed.join(', ')}
Preferred Skills: ${profile.preferredSkills.join(', ')}
Culture details: ${profile.engineeringCulture}
Recommended Tone: ${profile.coverLetterTone}
` : `Target Company Name: ${companyName || 'General'}`;

    const prompt = `You are a professional career consultant.
Optimize the following Cover Letter JSON content to tailor it for the target role: "${rolesStr}".

${companyContext}

Cover Letter JSON content to optimize:
${JSON.stringify(originalContent)}

INSTRUCTIONS:
1. Revise the introduction, bodies (body1, body2, body3), and conclusion paragraphs (or manualContent if mode is "manual") to align with target role and company context.
2. Emphasize why the candidate is a strong fit for the company's projects/culture.
3. Match the writing style with the recommended tone.
4. Keep the output as valid JSON matching the exact same schema.
5. Do NOT add any extra fields, explanations, or markdown blocks. Output the pure JSON string only.`;

    const responseText = await generateAIText(prompt, "You are a professional cover letter writing expert.");
    
    // Parse the JSON result
    let optimizedContent: any = null;
    try {
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        optimizedContent = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
      } else {
        optimizedContent = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.error("JSON parsing of optimized cover letter failed. AI response was:", responseText);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to format the optimized content. Please try again.' 
      });
    }

    // 3. Save as new cover letter project if coverLetterId was provided
    let savedLetter = null;
    if (coverLetterId) {
      savedLetter = await prisma.coverLetter.create({
        data: {
          userId,
          title: `${coverLetterTitle} (Optimized for ${companyName || 'Target'})`,
          company: companyName || 'Target',
          template,
          content: optimizedContent,
          isDraft: false,
          isMagic: true
        }
      });
    }

    return res.json({
      success: true,
      data: {
        content: optimizedContent,
        coverLetter: savedLetter
      }
    });
  } catch (error) {
    next(error);
  }
}
