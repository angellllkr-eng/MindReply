"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, BrainCircuit, Copy, Network, Play } from "lucide-react";

type OrchestrationResult = {
  id: string;
  status: string;
  risk: string;
  agents: Array<{ role: string; name: string; diagnosis: string; actions: string[]; verification: string }>;
  nextActions: Array<{ id: string; owner: string; title: string; priority: string }>;
  metricLogged: boolean;
};

type LoopResult = {
  id: string;
  status: string;
  cycles: number;
  iterations: Array<{ cycle: number; phase: string; observation: string; decision: string }>;
  metricLogged: boolean;
};

type ActiveAgentStatus = {
  totalActiveAgents: number;
  byLane: Record<string, number>;
  accelerationTarget: string;
  acceleration?: {
    mode: string;
    multiplier: number;
    command: string;
    target: string;
    directActions: Array<{ label: string; href: string; owner: string; outcome: string }>;
    laneObjectives: Array<{ lane: string; priority: string; targetMinutes: number; directive: string }>;
  };
};

type ExecutionQueue = {
  status: string;
  mode: string;
  fallbackCount: number;
  itemCount: number;
  items: Array<{
    id: string;
    priority: "P0" | "P1";
    lane: string;
    ownerId: string;
    ownerRole: string;
    service: string;
    action: string;
    actionRoute: string;
    evidenceRequired: string[];
    etaMinutes: number;
    revenueImpact: string;
  }>;
};

export default function OrchestratorPage() {
  const [objective, setObjective] = useState("Stabilize MindReply production deployment across Vercel and Azure while preserving the premium communication intelligence experience.");
  const [orchestration, setOrchestration] = useState<OrchestrationResult | null>(null);
  const [loop, setLoop] = useState<LoopResult | null>(null);
  const [agentStatus, setAgentStatus] = useState<ActiveAgentStatus | null>(null);
  const [executionQueue, setExecutionQueue] = useState<ExecutionQueue | null>(null);
  const [loading, setLoading] = useState<"orchestrate" | "loop" | null>(null);

  useEffect(() => {
    fetch("/api/agents/active")
      .then((response) => response.json())
      .then((data) => setAgentStatus(data))
      .catch(() => setAgentStatus(null));

    fetch("/api/agents/execution-queue")
      .then((response) => response.json())
      .then((data) => setExecutionQueue(data))
      .catch(() => setExecutionQueue(null));
  }, []);

  async function runOrchestrator() {
    if (!objective.trim()) return;
    setLoading("orchestrate");
    try {
      const response = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, urgency: "high" }),
      });
      setOrchestration(await response.json());
    } finally {
      setLoading(null);
    }
  }

  async function runLoop() {
    if (!objective.trim()) return;
    setLoading("loop");
    try {
      const response = await fetch("/api/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, cycles: 4 }),
      });
      setLoop(await response.json());
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <section className="py-14 px-4" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(43 80% 60%)" }}>MR-Core</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3" style={{ color: "hsl(43 70% 88%)" }}>Autonomous Orchestrator</h1>
          <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "rgba(248,245,240,0.72)" }}>Coordinate architecture, integration, research, marketing, and deployment agents from one production-safe operator surface.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className="rounded-2xl border bg-white p-5 md:col-span-2" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Active Staff Layer</p>
            <p className="mt-2 font-serif text-4xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>{agentStatus?.totalActiveAgents ?? 60}</p>
            <p className="mt-1 text-sm" style={{ color: "hsl(220 25% 45%)" }}>operating desks across revenue, platform, trust, and intelligence.</p>
          </div>
          {["revenue", "platform", "trust", "intelligence"].map((lane) => (
            <div key={lane} className="rounded-2xl border bg-white p-5" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(220 25% 45%)" }}>{lane}</p>
              <p className="mt-3 font-serif text-3xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>{agentStatus?.byLane?.[lane] ?? "-"}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-2xl border p-5" style={{ borderColor: "rgba(201,169,97,0.35)", background: "hsl(43 80% 60% / 0.12)" }}>
          <p className="text-sm font-semibold" style={{ color: "hsl(220 45% 13%)" }}>{agentStatus?.accelerationTarget ?? "82x faster triage through visible owner, evidence, and handoff routing."}</p>
        </div>

        <section className="mb-6 rounded-2xl border bg-white p-5" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Acceleration Command</p>
              <h2 className="mt-1 font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>{agentStatus?.acceleration?.mode ?? "x66 acceleration"}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>
                {agentStatus?.acceleration?.command ?? "Collapse observation to action: every desk must report owner, route, evidence, and next revenue move."}
              </p>
            </div>
            <div className="rounded-2xl px-5 py-4 text-center" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest">Mode</p>
              <p className="font-serif text-4xl font-bold">x{agentStatus?.acceleration?.multiplier ?? 66}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {(agentStatus?.acceleration?.laneObjectives ?? []).map((item) => (
              <div key={item.lane} className="rounded-xl border p-4" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(43 80% 45%)" }}>{item.lane} - {item.priority}</p>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{item.directive}</p>
                <p className="mt-3 text-xs font-semibold" style={{ color: "hsl(220 45% 13%)" }}>Target: {item.targetMinutes} min</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(agentStatus?.acceleration?.directActions ?? []).map((action) => (
              <Link key={action.href} href={action.href} className="rounded-xl border p-4 transition hover:-translate-y-0.5 hover:border-[hsl(43_80%_60%)]" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <p className="text-sm font-bold" style={{ color: "hsl(220 45% 13%)" }}>{action.label}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "hsl(43 80% 38%)" }}>{action.owner}</p>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{action.outcome}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-2xl border bg-white p-5" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(43 80% 45%)" }}>Live Execution Queue</p>
              <h2 className="mt-1 font-serif text-2xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>
                {executionQueue?.mode ?? "x66 execution queue"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>
                Owned action queue for revenue conversion, provider readiness, product delivery, and visible evidence. P0 items stay above passive research.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
              {[
                { label: "Items", value: executionQueue?.itemCount ?? "-" },
                { label: "Fallback", value: executionQueue?.fallbackCount ?? "-" },
                { label: "Status", value: executionQueue?.status ?? "loading" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border px-4 py-3" style={{ borderColor: "hsl(40 25% 88%)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(220 25% 45%)" }}>{item.label}</p>
                  <p className="mt-1 font-serif text-xl font-bold capitalize" style={{ color: "hsl(220 45% 13%)" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {(executionQueue?.items ?? []).slice(0, 8).map((item) => (
              <Link key={item.id} href={item.actionRoute} className="rounded-xl border p-4 transition hover:-translate-y-0.5 hover:border-[hsl(43_80%_60%)]" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: item.priority === "P0" ? "hsl(0 75% 94%)" : "hsl(43 80% 92%)", color: item.priority === "P0" ? "hsl(0 55% 36%)" : "hsl(38 75% 32%)" }}>{item.priority}</span>
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: "hsl(220 45% 96%)", color: "hsl(220 45% 25%)" }}>{item.lane}</span>
                  <span className="text-[11px] font-semibold" style={{ color: "hsl(220 25% 45%)" }}>{item.etaMinutes} min</span>
                </div>
                <h3 className="text-sm font-bold" style={{ color: "hsl(220 45% 13%)" }}>{item.service}</h3>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{item.action}</p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "hsl(43 80% 38%)" }}>{item.ownerId} - {item.ownerRole}</p>
                <p className="mt-2 text-[11px]" style={{ color: "hsl(220 25% 45%)" }}>Evidence: {item.evidenceRequired.slice(0, 3).join(", ")}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="bg-white border rounded-2xl p-6 mb-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "hsl(220 25% 45%)" }}>Objective</label>
          <textarea value={objective} onChange={(event) => setObjective(event.target.value)} rows={4} className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[hsl(43_80%_60%)] resize-none" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)", background: "hsl(40 20% 96%)" }} />
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button onClick={runOrchestrator} disabled={loading !== null || !objective.trim()} className="flex-1 rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
              <Network size={16} /> {loading === "orchestrate" ? "Coordinating..." : "Run Multi-Agent Orchestration"}
            </button>
            <button onClick={runLoop} disabled={loading !== null || !objective.trim()} className="flex-1 rounded-lg py-3 text-sm font-semibold border flex items-center justify-center gap-2 disabled:opacity-40" style={{ borderColor: "hsl(220 55% 20%)", color: "hsl(220 55% 20%)" }}>
              <BrainCircuit size={16} /> {loading === "loop" ? "Reasoning..." : "Run Background Reasoning Loop"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border rounded-2xl p-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-2xl font-bold flex items-center gap-2" style={{ color: "hsl(220 45% 13%)" }}><Activity size={20} /> Agent Reports</h2>
              {orchestration && <span className="text-xs font-semibold uppercase" style={{ color: "hsl(43 80% 45%)" }}>{orchestration.risk} risk</span>}
            </div>
            {orchestration ? (
              <div className="space-y-4">
                {orchestration.agents.map((agent) => (
                  <article key={agent.role} className="rounded-xl border p-4" style={{ borderColor: "hsl(40 25% 88%)" }}>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: "hsl(220 45% 13%)" }}>{agent.name}</h3>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: "hsl(220 25% 45%)" }}>{agent.diagnosis}</p>
                    <ul className="space-y-1">
                      {agent.actions.slice(0, 2).map((action) => <li key={action} className="text-xs flex gap-2" style={{ color: "hsl(220 45% 13%)" }}><span style={{ color: "hsl(43 80% 45%)" }}>-</span>{action}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>Run orchestration to assign the objective across the MindReply execution desks.</p>
            )}
          </section>

          <section className="bg-white border rounded-2xl p-6" style={{ borderColor: "hsl(40 25% 88%)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-2xl font-bold flex items-center gap-2" style={{ color: "hsl(220 45% 13%)" }}><Play size={20} /> Execution Loop</h2>
              {loop && <button onClick={() => navigator.clipboard.writeText(JSON.stringify(loop, null, 2))} className="text-xs flex items-center gap-1" style={{ color: "hsl(220 25% 45%)" }}><Copy size={12} /> Copy JSON</button>}
            </div>
            {loop ? (
              <div className="space-y-3">
                {loop.iterations.map((iteration) => (
                  <article key={iteration.cycle} className="rounded-xl border p-4" style={{ borderColor: "hsl(40 25% 88%)" }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "hsl(43 80% 45%)" }}>Cycle {iteration.cycle}: {iteration.phase}</p>
                    <p className="text-xs mb-2" style={{ color: "hsl(220 25% 45%)" }}>{iteration.observation}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "hsl(220 45% 13%)" }}>{iteration.decision}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>Run a reasoning loop to turn the objective into a bounded diagnose, design, execute, and verify sequence.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
