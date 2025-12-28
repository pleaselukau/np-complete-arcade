import './App.css'
import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow">
        <h1 className="text-3xl font-bold">NP-Complete Arcade</h1>
        <p className="mt-2 text-slate-300">
          Phase 0: Tailwind  and ShadCN/UI working ✅
        </p>
        <Button className="mt-6" variant="secondary">
          Shadcn Button
        </Button>
      </div>
    </div>
  );
}

export default App
