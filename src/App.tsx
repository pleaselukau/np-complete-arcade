import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow">
        <h1 className="text-3xl font-bold">NP-Complete Arcade</h1>
        <p className="mt-2 text-slate-300">
          Phase 0: Tailwind is working ✅
        </p>
        <button className="mt-6 rounded-xl bg-white px-4 py-2 text-slate-900 font-medium">
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App
