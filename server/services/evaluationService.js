const { GoogleGenerativeAI } = require('@google/generative-ai');
const RUBRIC = require('../config/rubric');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildPrompt = (problem, submissionContent) => {
  const rubricList = RUBRIC.map(
    (r, i) => `${i + 1}. ${r.key} — ${r.label}: ${r.description}`
  ).join('\n');

  return `You are an expert Low-Level Design (LLD) reviewer evaluating a learner's design submission.

PROBLEM: ${problem.title}
DESCRIPTION: ${problem.description}
REQUIREMENTS:
${problem.requirements.map((r) => `- ${r}`).join('\n')}

LEARNER'S SUBMISSION:
${submissionContent}

Evaluate the submission strictly against this fixed rubric. For EACH criterion below, give a score from 1 to 5, point to specific evidence from the submission, note any concern, and give one actionable suggestion.

RUBRIC:
${rubricList}

Respond with ONLY valid JSON in exactly this shape, no markdown, no extra text:
{
  "results": [
    { "criterion": "requirement_understanding", "score": 1-5, "evidence": "string", "concern": "string", "suggestion": "string" },
    ... one object per rubric criterion, same order ...
  ],
  "overallScore": 1-5 average,
  "summary": "2-3 sentence overall summary"
}`;
};

const evaluateSubmission = async (problem, submissionContent) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = buildPrompt(problem, submissionContent);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(text);
  return parsed;
};

module.exports = { evaluateSubmission, buildPrompt };