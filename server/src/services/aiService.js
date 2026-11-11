const { GoogleGenAI } = require('@google/genai');

// Lazy instantiation defers API key validation to request time so the server
// can boot and serve room/execution routes even when AI debugging is unconfigured.
const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is not configured or is using default placeholder. Please provide a valid Gemini API key in your .env file.'
    );
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes source code via Gemini and returns numbered debugging hints.
 *
 * @param {string} code
 * @param {string} language
 * @returns {Promise<string>}
 */
const analyzeCode = async (code, language) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Code content must be provided as a non-empty string.');
  }

  if (!language || typeof language !== 'string') {
    throw new Error('Programming language must be specified for accurate debugging.');
  }

  const ai = getClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  const prompt = `You are an expert code debugger. Analyze the following ${language} code for bugs, logic errors, performance issues, and security vulnerabilities. Provide clear, actionable debugging hints numbered 1-5. Code:
\`\`\`${language}
${code}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt
    });

    if (!response || !response.text) {
      throw new Error('No analysis text was returned by Gemini AI.');
    }

    return response.text;
  } catch (error) {
    console.error(`[AI Service Error] Gemini inference failed: ${error.message}`);

    const descriptiveError = new Error(
      `Gemini AI analysis failed: ${error.message}`
    );
    descriptiveError.status = error.status || 502;
    descriptiveError.originalError = error;
    throw descriptiveError;
  }
};

module.exports = {
  analyzeCode
};
