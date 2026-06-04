import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AgentChat from './components/AgentChat';
import SubconsciousMetrics from './components/SubconsciousMetrics';
import Lexicons from './components/Lexicons';
import MicroTools from './components/MicroTools';
import Membership from './components/Membership';

function App() {
  const [credits, setCredits] = useState(5);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar credits={credits} />
      
      <main>
        <Hero />
        
        <section id="agent" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-2 mb-8 justify-center">
              <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">MRagent is online</span>
            </div>
            <AgentChat credits={credits} setCredits={setCredits} />
          </div>
        </section>

        <SubconsciousMetrics />
        <Lexicons />
        <MicroTools credits={credits} setCredits={setCredits} />
        <Membership />
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-6 text-center">
          <p>© 2026 MindReply. Executive Communication Intelligence.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
