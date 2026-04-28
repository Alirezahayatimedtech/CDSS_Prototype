import { describe, expect, it } from 'vitest';
import { createCaseInputFromScenario, spaceAgentScenarios } from '../data/scenarios.js';
import { REQUIRED_DOWNLINK_FIELDS } from '../data/validationCases.js';
import { runSpaceAgent } from '../engine/spaceAgentEngine.js';

describe('SpaceAgent preset behavior', () => {
  for (const scenario of spaceAgentScenarios) {
    it(`maps ${scenario.id} to the expected syndrome and triage`, () => {
      const output = runSpaceAgent(createCaseInputFromScenario(scenario.id));
      expect(output.mostLikelySyndrome.name).toBe(scenario.expected.leadingSyndrome);
      expect(output.overallTriage.level).toBe(scenario.expected.triage);
    });
  }
});

describe('SpaceAgent guardrails', () => {
  it('never returns low triage for the urgent respiratory red-flag case', () => {
    const output = runSpaceAgent(createCaseInputFromScenario('respiratory_urgent'));
    expect(output.overallTriage.level).not.toBe('Low');
    expect(['Urgent', 'Emergency']).toContain(output.overallTriage.level);
  });

  it('blocks autonomous medication execution in the medication-reaction case', () => {
    const output = runSpaceAgent(createCaseInputFromScenario('medication_reaction'));
    expect(output.guardrails.blockedActions.some((action) => action.toLowerCase().includes('medication'))).toBe(true);
    expect(output.crewActions.some((action) => action.toLowerCase().includes('medication'))).toBe(false);
  });

  it('raises uncertainty and requests missing data in the missing-data case', () => {
    const output = runSpaceAgent(createCaseInputFromScenario('missing_data'));
    expect(output.uncertainty.uncertaintyLevel).toBe('High');
    expect(output.uncertainty.drivers.some((driver) => driver.toLowerCase().includes('missing'))).toBe(true);
    expect(output.uncertainty.recommendedReducers.some((item) => item.toLowerCase().includes('collect') || item.toLowerCase().includes('repeat'))).toBe(true);
  });

  it('removes infeasible isolation-only actions in the constrained-support case', () => {
    const output = runSpaceAgent(createCaseInputFromScenario('constrained_support'));
    expect(output.crewActions.some((action) => action.toLowerCase().includes('dedicated isolation area'))).toBe(false);
    expect(output.guardrails.blockedActions.some((action) => action.toLowerCase().includes('isolation'))).toBe(true);
  });

  it('includes all required fields in every downlink summary', () => {
    for (const scenario of spaceAgentScenarios) {
      const output = runSpaceAgent(createCaseInputFromScenario(scenario.id));
      for (const field of REQUIRED_DOWNLINK_FIELDS) {
        expect(output.downlinkSummary.fields[field], `${scenario.id} is missing ${field}`).toBeTruthy();
      }
    }
  });
});
