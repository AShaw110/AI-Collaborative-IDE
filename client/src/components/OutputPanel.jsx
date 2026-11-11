import React from 'react';

export default function OutputPanel({
  output = '',
  stderr = '',
  isRunning = false,
  onClear,
}) {
  let stdoutText = '';
  let stderrText = '';

  if (typeof output === 'object' && output !== null) {
    stdoutText = output.stdout || '';
    stderrText = output.stderr || stderr || '';
  } else {
    stdoutText = typeof output === 'string' ? output : String(output || '');
    stderrText = typeof stderr === 'string' ? stderr : '';
  }

  const hasContent = Boolean(stdoutText.trim() || stderrText.trim());

  return (
    <section
      role="region"
      aria-label="Code execution output"
      aria-live="polite"
      className="flex-1 min-h-0 flex flex-col bg-neutral-950 border-t lg:border-t-0 border-neutral-800 font-mono text-xs select-text overflow-hidden"
    >
      <div className="h-8 bg-neutral-900 border-b border-neutral-800 px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
            Execution Output
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasContent && onClear && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear execution output"
              className="text-[11px] text-neutral-400 hover:text-neutral-200 px-2 py-0.5 rounded hover:bg-neutral-800 transition focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 overflow-y-auto overflow-x-auto space-y-2 text-neutral-200">
        {isRunning && (
          <div
            role="status"
            aria-label="Executing code on remote sandbox"
            className="flex items-center gap-2.5 text-blue-400 py-1"
          >
            <svg
              className="w-4 h-4 animate-spin shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs">Executing program in sandbox...</span>
          </div>
        )}

        {stdoutText && (
          <div>
            <span className="sr-only">Standard Output:</span>
            <pre className="font-mono text-emerald-400 whitespace-pre-wrap break-words leading-relaxed selection:bg-emerald-900 selection:text-emerald-100">
              <code>{stdoutText}</code>
            </pre>
          </div>
        )}

        {stderrText && (
          <div className="mt-2 pt-2 border-t border-rose-950/50">
            <span className="sr-only">Standard Error:</span>
            <pre className="font-mono text-rose-400 whitespace-pre-wrap break-words leading-relaxed selection:bg-rose-950 selection:text-rose-100">
              <code>{stderrText}</code>
            </pre>
          </div>
        )}

        {!isRunning && !hasContent && (
          <div className="h-full flex items-center justify-center text-neutral-600 text-center py-6 select-none">
            <p>Output will appear here after clicking &quot;Run Code&quot;.</p>
          </div>
        )}
      </div>
    </section>
  );
}
