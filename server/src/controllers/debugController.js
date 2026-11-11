const aiService = require('../services/aiService');

/**
 * Submits code and language context to the AI service and returns debugging hints.
 */
const debugCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: 'code' must be a non-empty string."
      });
    }

    if (!language || typeof language !== 'string' || language.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: 'language' must be a valid programming language identifier."
      });
    }

    const hints = await aiService.analyzeCode(code, language);

    return res.status(200).json({
      success: true,
      hints
    });
  } catch (error) {
    console.error(`[debugController:debugCode] Debugging error: ${error.message}`);

    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Gemini API key is missing or unconfigured on the server.'
      });
    }

    return res.status(502).json({
      success: false,
      error: 'Upstream AI service error (Google Gemini).',
      details: error.message
    });
  }
};

module.exports = {
  debugCode
};
