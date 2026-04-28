import React, { useMemo, useState } from 'react';
import AgentTracePanel from './components/AgentTracePanel.jsx';
import CMOView from './components/CMOView.jsx';
import CrewView from './components/CrewView.jsx';
import DAGEvidencePanel from './components/DAGEvidencePanel.jsx';
import InputPanel from './components/InputPanel.jsx';
import ModelCardPanel from './components/ModelCardPanel.jsx';
import ScenarioSelector from './components/ScenarioSelector.jsx';
import ValidationPanel from './components/ValidationPanel.jsx';
import { spaceAgentModelCard } from './data/modelCard.js';
import { createCaseInputFromScenario, getScenarioById, spaceAgentScenarios } from './data/scenarios.js';
import { validationCases } from './data/validationCases.js';
import { runSpaceAgent } from './engine/spaceAgentEngine.js';

const tabs = [
  { id: 'crew', label: 'Crew' },
  { id: 'cmo', label: 'CMO' },
  { id: 'trace', label: 'Trace' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'validation', label: 'Validation' },
  { id: 'model', label: 'Model Card' },
];

export default function SpaceAgentPrototype() {
  const [selectedScenarioId, setSelectedScenarioId] = useState('respiratory_watch');
  const [activeTab, setActiveTab] = useState('crew');
  const [caseInput, setCaseInput] = useState(() => createCaseInputFromScenario('respiratory_watch'));

  const analysis = useMemo(() => runSpaceAgent(caseInput), [caseInput]);
  const selectedScenario = useMemo(() => getScenarioById(selectedScenarioId), [selectedScenarioId]);
  const selectedValidationCase = useMemo(
    () => validationCases.find((item) => item.id === selectedScenarioId) || validationCases[0],
    [selectedScenarioId]
  );

  const handleScenarioSelect = (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    setCaseInput(createCaseInputFromScenario(scenarioId));
  };

  const handleReset = () => {
    setCaseInput(createCaseInputFromScenario(selectedScenarioId));
  };

  const handleRootFieldChange = (key, value) => {
    setCaseInput((previous) => ({ ...previous, [key]: value }));
  };

  const handleNestedFieldChange = (section, key, value) => {
    setCaseInput((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">SpaceAgent workspace</div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Agentic clinical decision support for space medicine research.
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              This workspace is a non-clinical research console for planner-executor-verifier reasoning across crew symptoms,
              mission constraints, biomarkers, guardrails, and structured downlink communication.
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 lg:max-w-md">
            Not a medical device. Not clinically validated. Medication, advanced testing, and high-risk escalation remain under
            qualified human medical review.
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current triage</div>
            <div className="mt-2 text-xl font-semibold text-slate-950">{analysis.overallTriage.level}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leading syndrome</div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{analysis.mostLikelySyndrome.name}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confidence</div>
            <div className="mt-2 text-xl font-semibold text-slate-950">{analysis.uncertainty.confidenceLabel}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scenario target</div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{selectedScenario.expected.leadingSyndrome}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-2">
          <ScenarioSelector
            scenarios={spaceAgentScenarios}
            selectedScenarioId={selectedScenarioId}
            onSelect={handleScenarioSelect}
          />
          <InputPanel
            caseInput={caseInput}
            onRootFieldChange={handleRootFieldChange}
            onNestedFieldChange={handleNestedFieldChange}
            onReset={handleReset}
          />
        </div>

        <div className="space-y-6 xl:col-span-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'crew' && <CrewView output={analysis} />}
          {activeTab === 'cmo' && <CMOView output={analysis} caseInput={caseInput} />}
          {activeTab === 'trace' && <AgentTracePanel output={analysis} />}
          {activeTab === 'evidence' && <DAGEvidencePanel output={analysis} />}
          {activeTab === 'validation' && (
            <ValidationPanel
              output={analysis}
              scenario={selectedScenario}
              validationCase={selectedValidationCase}
            />
          )}
          {activeTab === 'model' && <ModelCardPanel modelCard={spaceAgentModelCard} />}
        </div>
      </div>
    </div>
  );
}
