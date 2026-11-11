const axios = require('axios');

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

const LANGUAGE_CONFIG = {
  javascript: {
    language: 'javascript',
    version: '18.15.0',
    filename: 'main.js'
  },
  cpp: {
    language: 'c++',
    version: '10.2.0',
    filename: 'main.cpp'
  },
  python: {
    language: 'python',
    version: '3.10.0',
    filename: 'main.py'
  }
};

/**
 * Executes source code in a remote Piston v2 sandbox and normalizes compile/run output.
 *
 * @param {string} language
 * @param {string} sourceCode
 * @param {string} [stdin='']
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number, compileOutput: string|null }>}
 */
const executeCode = async (language, sourceCode, stdin = '') => {
  const normalizedLang = (language || '').toLowerCase().trim();
  const config = LANGUAGE_CONFIG[normalizedLang];

  if (!config) {
    const supported = Object.keys(LANGUAGE_CONFIG).join(', ');
    throw new Error(`Language '${language}' is not supported. Supported languages: ${supported}`);
  }

  const payload = {
    language: config.language,
    version: config.version,
    files: [
      {
        name: config.filename,
        content: sourceCode
      }
    ],
    stdin: stdin || ''
  };

  try {
    // 15s cap prevents hung worker connections if upstream Piston is degraded.
    const response = await axios.post(PISTON_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const data = response.data;
    const run = data.run || {};
    const compile = data.compile || null;

    return {
      stdout: run.stdout || '',
      stderr: run.stderr || '',
      exitCode: typeof run.code === 'number' ? run.code : 0,
      compileOutput: compile ? (compile.stderr || compile.stdout || compile.output || '') : null
    };
  } catch (axiosError) {
    let errorMessage = 'Failed to execute code via Piston execution engine';

    if (axiosError.response) {
      errorMessage = `Piston execution failed with status ${axiosError.response.status}: ${JSON.stringify(axiosError.response.data)}`;
    } else if (axiosError.request) {
      errorMessage = `Piston execution timed out or network connection refused: ${axiosError.message}`;
    } else {
      errorMessage = `Piston service request error: ${axiosError.message}`;
    }

    const err = new Error(errorMessage);
    err.originalError = axiosError;
    throw err;
  }
};

module.exports = {
  executeCode,
  LANGUAGE_CONFIG
};
