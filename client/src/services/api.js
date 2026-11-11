import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  // Extended timeout to accommodate remote compilation and LLM inference latency.
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Fetches or initializes a collaboration room by ID.
 *
 * @param {string} roomId
 * @returns {Promise<{roomId: string, codeContent: string, language: string}>}
 */
export async function fetchRoom(roomId) {
  if (!roomId || typeof roomId !== 'string') {
    throw new Error('api.fetchRoom: A valid roomId string is required.');
  }

  const response = await apiClient.get(`/rooms/${encodeURIComponent(roomId)}`);
  return response.data?.room ?? response.data;
}

/**
 * Persists room source code and language selection.
 *
 * @param {string} roomId
 * @param {{ codeContent: string, language: string }} payload
 * @returns {Promise<{roomId: string, codeContent: string, language: string}>}
 */
export async function saveRoom(roomId, { codeContent, language }) {
  if (!roomId) {
    throw new Error('api.saveRoom: A valid roomId string is required.');
  }

  const response = await apiClient.put(`/rooms/${encodeURIComponent(roomId)}`, {
    codeContent,
    language,
  });
  return response.data?.room ?? response.data;
}

/**
 * Submits code for sandboxed execution via the backend Piston proxy.
 *
 * @param {{ code: string, language: string, stdin?: string }} params
 * @returns {Promise<{stdout: string, stderr: string, exitCode?: number, compileOutput?: string|null}>}
 */
export async function executeCode({ code, language, stdin = '' }) {
  if (!code && code !== '') {
    throw new Error('api.executeCode: Code string is required.');
  }
  if (!language) {
    throw new Error('api.executeCode: Language string is required.');
  }

  const response = await apiClient.post('/execute', {
    code,
    language,
    stdin,
  });
  return response.data?.data ?? response.data;
}

/**
 * Submits source code to the AI debugging endpoint.
 *
 * @param {{ code: string, language: string }} params
 * @returns {Promise<{hints: string}>}
 */
export async function debugCode({ code, language }) {
  if (!code && code !== '') {
    throw new Error('api.debugCode: Code string is required.');
  }
  if (!language) {
    throw new Error('api.debugCode: Language string is required.');
  }

  const response = await apiClient.post('/debug', {
    code,
    language,
  });
  return response.data;
}

export default {
  fetchRoom,
  saveRoom,
  executeCode,
  debugCode,
};
