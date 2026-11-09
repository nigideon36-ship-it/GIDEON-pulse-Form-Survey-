import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// AI Survey Generation Endpoint
app.post('/api/ai/generate-survey', async (req, res) => {
  const { prompt, questionCount = 5, tone = 'professional', category = 'Customer Experience' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!aiClient) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Using smart client-side survey generator.',
    });
  }

  try {
    const systemInstruction = `You are an expert survey methodologist and questionnaire designer.
Generate a cohesive, highly effective survey based on the user's request.
Return strictly a valid JSON object (no markdown code fence, only raw JSON) with this exact schema:
{
  "title": string,
  "description": string,
  "category": "Customer Experience" | "Product & Engineering" | "Human Resources" | "Market Research" | "Event & Community",
  "questions": [
    {
      "id": string (unique slug like "q1", "q2"),
      "type": "short_text" | "long_text" | "multiple_choice" | "checkboxes" | "dropdown" | "rating" | "nps" | "yes_no",
      "title": string,
      "description": string (optional help text),
      "required": boolean,
      "options": string[] (required for multiple_choice, checkboxes, dropdown, otherwise empty array),
      "minRating": number (optional, e.g. 1),
      "maxRating": number (optional, e.g. 5)
    }
  ]
}
Design questions with precise wording, balanced options, and logical flow. Produce exactly ${questionCount} questions.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Design a ${tone} survey for the following requirements: "${prompt}". Category: ${category}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating survey via Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate survey with AI',
    });
  }
});

// AI Response Analytics & Synthesis Endpoint
app.post('/api/ai/analyze-responses', async (req, res) => {
  const { surveyTitle, questions, responses } = req.body;

  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'Responses are required' });
  }

  if (!aiClient) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured. Using client-side analytical insights engine.',
    });
  }

  try {
    const summaryData = {
      surveyTitle,
      totalResponses: responses.length,
      sampleAnswers: responses.slice(0, 30).map((r: any) => r.answers),
      questionsSummary: questions.map((q: any) => ({
        id: q.id,
        title: q.title,
        type: q.type,
      })),
    };

    const systemInstruction = `You are a Principal Customer Insights & Data Analyst.
Analyze the provided survey responses and synthesize high-level intelligence.
Return strictly a valid JSON object (no markdown formatting, only raw JSON) with this schema:
{
  "executiveSummary": string (2-3 concise, impactful sentences summarizing the sentiment and core findings),
  "sentiment": {
    "positivePercent": number,
    "neutralPercent": number,
    "negativePercent": number
  },
  "keyStrengths": string[] (3 bullet points of what respondents loved most),
  "frictionPoints": string[] (3 bullet points of complaints, gaps, or areas of confusion),
  "actionableRecommendations": [
    {
      "priority": "High" | "Medium" | "Low",
      "action": string,
      "expectedImpact": string
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analyze these survey results for "${surveyTitle}":\n${JSON.stringify(summaryData, null, 2)}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing responses with Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze responses with AI',
    });
  }
});

// Dev or Production Static Serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`PulseForm server running on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
