import { describe, expect, test } from 'bun:test';
import { agentConfigSchema, DEFAULT_AGENT_CONFIG, normalizeAgentConfig } from './agent-config';

describe('chatbot agent config', () => {
  test('uses defaults when an older database row has no agent settings', () => {
    expect(normalizeAgentConfig({})).toEqual(DEFAULT_AGENT_CONFIG);
  });

  test('rejects unknown tools and invalid retrieval limits', () => {
    expect(
      agentConfigSchema.safeParse({
        ...DEFAULT_AGENT_CONFIG,
        enabledTools: ['delete_database'],
      }).success,
    ).toBe(false);
    expect(
      agentConfigSchema.safeParse({ ...DEFAULT_AGENT_CONFIG, retrievalLimit: 99 }).success,
    ).toBe(false);
    expect(
      agentConfigSchema.safeParse({ ...DEFAULT_AGENT_CONFIG, confidenceThreshold: 0.1 }).success,
    ).toBe(false);
  });
});
