import React from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGE_MAP = {
  javascript: 'javascript',
  js: 'javascript',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'cpp',
  python: 'python',
  py: 'python',
};

export default function CodeEditor({
  code = '',
  language = 'javascript',
  onChange,
}) {
  const mappedLanguage = LANGUAGE_MAP[language?.toLowerCase()] || 'javascript';

  const handleEditorChange = (value) => {
    if (typeof onChange === 'function') {
      onChange(value ?? '');
    }
  };

  return (
    <section
      role="region"
      aria-label="Code editor"
      className="flex-1 min-h-0 w-full h-full relative bg-neutral-900 overflow-hidden flex flex-col"
    >
      <Editor
        height="100%"
        width="100%"
        language={mappedLanguage}
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          tabSize: 2,
          insertSpaces: true,
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          bracketPairColorization: { enabled: true },
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          ariaLabel: 'Collaborative code editor workspace. Press Escape or Ctrl+M to toggle Tab key trapping.',
        }}
        loading={
          <div
            role="status"
            aria-live="polite"
            className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-400 gap-3"
          >
            <svg
              className="w-8 h-8 animate-spin text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs font-mono">Initializing Monaco Editor...</span>
          </div>
        }
      />
    </section>
  );
}
