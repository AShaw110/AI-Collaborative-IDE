import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import EditorPage from './components/EditorPage.jsx';

export default function App() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm transition"
      >
        Skip to main content
      </a>

      <main id="main-content" className="flex-1 flex flex-col w-full min-h-0" tabIndex="-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
    </div>
  );
}
