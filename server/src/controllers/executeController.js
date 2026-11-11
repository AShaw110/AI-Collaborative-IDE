const pistonService = require('../services/pistonService');

/**
 * Validates execution payload and delegates sandboxed compilation/run to Piston.
 */
const executeCode = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Missing required field: 'code' must be a non-empty string."
      });
    }

    if (!language || typeof language !== 'string' || language.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Missing required field: 'language' must be a valid programming language identifier."
      });
    }

    const result = await pistonService.executeCode(language, code, stdin || '');

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(`[executeController:executeCode] Execution error: ${error.message}`);

    if (error.message.includes('is not supported')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(502).json({
      success: false,
      error: 'Upstream execution engine failure (Piston).',
      details: error.message
    });
  }
};

module.exports = {
  executeCode
};
