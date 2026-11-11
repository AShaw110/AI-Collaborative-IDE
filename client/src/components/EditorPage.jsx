import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Toolbar from './Toolbar.jsx';
import CodeEditor from './CodeEditor.jsx';
import OutputPanel from './OutputPanel.jsx';
import DebugPanel from './DebugPanel.jsx';
import useSocket from '../hooks/useSocket.js';
import useDebounce from '../hooks/useDebounce.js';
import { fetchRoom, saveRoom, executeCode, debugCode } from '../services/api.js';

export default function EditorPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState({ stdout: '', stderr: '' });
  const [debugHints, setDebugHints] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Guards auto-save against firing before initial hydration and tracks the last
  // persisted snapshot to skip redundant PUT requests after initial load.
  const hasLoadedRef = useRef(false);
  const lastSavedRef = useRef({ code: '', language: 'javascript' });

  const handleRemoteCodeUpdate = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleRemoteLanguageUpdate = useCallback((newLanguage) => {
    setLanguage(newLanguage);
  }, []);

  const { emitCodeChange, emitLanguageChange, isRemoteUpdate, isConnected } =
    useSocket(roomId, handleRemoteCodeUpdate, handleRemoteLanguageUpdate);

  useEffect(() => {
    if (!roomId) {
      navigate('/', { replace: true });
      return;
    }

    // Reset hydration state on room switch so stale room data is never saved to the new room.
    hasLoadedRef.current = false;
    let isCancelled = false;

    const loadRoom = async () => {
      try {
        setIsLoading(true);
        setError('');

        const roomData = await fetchRoom(roomId);

        if (!isCancelled) {
          const initialCode = roomData.codeContent || '';
          const initialLanguage = roomData.language || 'javascript';
          lastSavedRef.current = { code: initialCode, language: initialLanguage };
          setCode(initialCode);
          setLanguage(initialLanguage);
          hasLoadedRef.current = true;
        }
      } catch (err) {
        console.error('[EditorPage] Failed to load room:', err);
        if (!isCancelled) {
          setError(
            err.response?.data?.error ||
            err.message ||
            'Failed to load room. Please try again.'
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRoom();

    return () => {
      isCancelled = true;
    };
  }, [roomId, navigate]);

  // Safety reset: if a remote update matched the current editor buffer, Monaco may skip
  // firing onChange; clearing the flag post-commit avoids dropping the next local keystroke.
  useEffect(() => {
    isRemoteUpdate.current = false;
  }, [code, isRemoteUpdate]);

  // 500ms debounce coalesces typing bursts into a single persistence write without
  // delaying DB durability on idle pauses.
  const debouncedCode = useDebounce(code, 500);

  useEffect(() => {
    if (!hasLoadedRef.current || !roomId) return;
    if (
      debouncedCode === lastSavedRef.current.code &&
      language === lastSavedRef.current.language
    ) {
      return;
    }

    const performSave = async () => {
      try {
        await saveRoom(roomId, {
          codeContent: debouncedCode,
          language,
        });
        lastSavedRef.current = { code: debouncedCode, language };
      } catch (err) {
        console.warn('[EditorPage] Auto-save failed:', err.message);
      }
    };

    performSave();
  }, [debouncedCode, language, roomId]);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
    } else {
      emitCodeChange(newCode);
    }
  }, [emitCodeChange, isRemoteUpdate]);

  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    emitLanguageChange(newLanguage);
  }, [emitLanguageChange]);

  const handleRunCode = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setOutput({ stdout: '', stderr: '' });

    try {
      const result = await executeCode({ code, language });

      setOutput({
        stdout: result.stdout || '',
        stderr: result.stderr || result.compileOutput || '',
      });
    } catch (err) {
      console.error('[EditorPage] Code execution failed:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Execution failed. Please try again.';
      setOutput({ stdout: '', stderr: `Error: ${errorMessage}` });
    } finally {
      setIsRunning(false);
    }
  }, [code, language, isRunning]);

  const handleDebugCode = useCallback(async () => {
    if (isDebugging) return;

    setIsDebugging(true);
    setDebugHints('');

    try {
      const result = await debugCode({ code, language });
      setDebugHints(result.hints || 'No issues detected.');
    } catch (err) {
      console.error('[EditorPage] AI debugging failed:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'AI analysis failed. Please check your API key and try again.';
      setDebugHints(`Error: ${errorMessage}`);
    } finally {
      setIsDebugging(false);
    }
  }, [code, language, isDebugging]);

  const handleClearOutput = useCallback(() => {
    setOutput({ stdout: '', stderr: '' });
  }, []);

  const handleCloseDebug = useCallback(() => {
    setDebugHints('');
  }, []);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading room data"
        className="flex-1 flex flex-col items-center justify-center bg-neutral-950 text-neutral-400 gap-4"
      >
        <svg
          className="w-10 h-10 animate-spin text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm font-mono">
          Loading room <span className="text-blue-400 font-semibold">{roomId}</span>...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex-1 flex flex-col items-center justify-center bg-neutral-950 text-neutral-300 gap-4 p-6"
      >
        <svg
          className="w-12 h-12 text-rose-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-rose-400">Failed to Load Room</h2>
        <p className="text-sm text-center max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Return to landing page"
          className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
      <Toolbar
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRunCode}
        onDebug={handleDebugCode}
        isRunning={isRunning}
        isDebugging={isDebugging}
        roomId={roomId}
      />

      <div
        aria-live="polite"
        className="h-6 bg-neutral-900/50 border-b border-neutral-800/50 px-4 flex items-center gap-2 text-[10px] shrink-0 select-none"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isConnected ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'
          }`}
          aria-hidden="true"
        />
        <span className="text-neutral-500">
          {isConnected
            ? `Connected to room "${roomId}"`
            : 'Connecting to collaboration server...'}
        </span>
      </div>

      {/* min-h-0 allows flex children to shrink below intrinsic content height so inner scrollbars work. */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 min-h-[300px] lg:min-h-0 flex flex-col">
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
          />
        </div>

        <div className="w-full lg:w-96 flex flex-col shrink-0 lg:border-l border-neutral-800 min-h-[200px] lg:min-h-0">
          <OutputPanel
            output={output}
            isRunning={isRunning}
            onClear={handleClearOutput}
          />

          <DebugPanel
            hints={debugHints}
            isDebugging={isDebugging}
            onClose={handleCloseDebug}
          />
        </div>
      </div>
    </div>
  );
}
