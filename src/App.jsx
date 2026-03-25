import React, { useEffect, useState } from 'react';
import CDSSInfectionRiskPrototype from '../cdss_infection_risk_prototype.jsx';
import SansRiskGraph from './SansRiskGraph.jsx';

const workspaces = [
  {
    id: 'sans',
    label: 'SANS DAG',
    description: 'Appendix C graph explorer with speculative-edge controls.',
  },
  {
    id: 'infection',
    label: 'Infection CDSS',
    description: 'Existing infection-risk prototype preserved as a second workspace.',
  },
];

const workspaceIds = new Set(workspaces.map((item) => item.id));

function getWorkspaceFromLocation() {
  if (typeof window === 'undefined') return 'sans';

  const params = new URLSearchParams(window.location.search);
  const requestedWorkspace = params.get('workspace');

  if (requestedWorkspace && workspaceIds.has(requestedWorkspace)) {
    return requestedWorkspace;
  }

  return 'sans';
}

export default function App() {
  const [workspace, setWorkspace] = useState(getWorkspaceFromLocation);

  useEffect(() => {
    const syncWorkspaceFromLocation = () => {
      setWorkspace(getWorkspaceFromLocation());
    };

    window.addEventListener('popstate', syncWorkspaceFromLocation);
    return () => window.removeEventListener('popstate', syncWorkspaceFromLocation);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('workspace', workspace);
    window.history.replaceState({}, '', url);
  }, [workspace]);

  return (
    <div className="min-h-screen p-4 text-slate-900 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                CDSS Graph Studio
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                Mission risk interfaces for NASA health-system reasoning.
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                This repo now ships two workspaces: a new interactive SANS causal graph and the existing
                infection-risk decision-support prototype.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {workspaces.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWorkspace(item.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    workspace === item.id
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {workspaces.find((item) => item.id === workspace)?.description}
          </div>
        </div>

        {workspace === 'sans' ? <SansRiskGraph /> : <CDSSInfectionRiskPrototype />}
      </div>
    </div>
  );
}
