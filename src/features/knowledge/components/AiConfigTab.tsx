'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bot, CheckCircle, KeyRound, Loader2, Ruler, Save, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  CHATBOT_TOOLS,
  CHATBOT_TOOL_INFO,
  DEFAULT_AGENT_CONFIG,
  type AgentConfig,
} from '@/lib/ai/agent-config';
import {
  CHUNK_VECTOR_DIMENSION,
  DEFAULT_BASE_URL,
  type LlmProvider,
} from '../constants/llm-providers';
import { LlmSlotCard, type LlmSlotValue } from './LlmSlotCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LlmConfigResponse {
  mainProvider: LlmProvider;
  mainBaseUrl: string;
  mainApiKeySet: boolean;
  mainModel: string;
  fallbackProvider: LlmProvider | null;
  fallbackBaseUrl: string;
  fallbackApiKeySet: boolean;
  fallbackModel: string;
  embeddingProvider: LlmProvider;
  embeddingBaseUrl: string;
  embeddingApiKeySet: boolean;
  embeddingModel: string;
  embeddingDimension: number;
  typesafeApiKeySet: boolean;
  agentConfig: AgentConfig;
}

const emptySlot = (provider: LlmProvider, model: string): LlmSlotValue => ({
  provider,
  baseUrl: DEFAULT_BASE_URL[provider],
  apiKey: '',
  apiKeySet: false,
  model,
  modelOptions: [],
  loadingModels: false,
});

export function AiConfigTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [main, setMain] = useState<LlmSlotValue>(emptySlot('openai-compatible', ''));
  const [embedding, setEmbedding] = useState<LlmSlotValue>(emptySlot('openai-compatible', ''));
  const [fallback, setFallback] = useState<LlmSlotValue>(emptySlot('openai-compatible', ''));
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  const [embeddingDimension, setEmbeddingDimension] = useState(CHUNK_VECTOR_DIMENSION);
  const [probing, setProbing] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  const [typesafeApiKey, setTypesafeApiKey] = useState('');
  const [typesafeApiKeySet, setTypesafeApiKeySet] = useState(false);
  const [clearTypesafeApiKey, setClearTypesafeApiKey] = useState(false);
  const [activeSection, setActiveSection] = useState('providers');
  const [testingJev, setTestingJev] = useState(false);
  const [jevTestMessage, setJevTestMessage] = useState<string | null>(null);
  const [jevTestFailed, setJevTestFailed] = useState(false);

  const dimensionMismatch = embeddingDimension !== CHUNK_VECTOR_DIMENSION;

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch('/api/v1/admin/llm-config');
        const payload = (await res.json()) as { data: LlmConfigResponse | null };
        if (!active || !payload.data) return;

        const d = payload.data;
        setMain((prev) => ({
          ...prev,
          provider: d.mainProvider,
          baseUrl: d.mainBaseUrl,
          apiKeySet: d.mainApiKeySet,
          model: d.mainModel,
        }));
        setEmbedding((prev) => ({
          ...prev,
          provider: d.embeddingProvider,
          baseUrl: d.embeddingBaseUrl,
          apiKeySet: d.embeddingApiKeySet,
          model: d.embeddingModel,
        }));
        if (d.fallbackProvider) {
          setFallbackEnabled(true);
          setFallback((prev) => ({
            ...prev,
            provider: d.fallbackProvider as LlmProvider,
            baseUrl: d.fallbackBaseUrl,
            apiKeySet: d.fallbackApiKeySet,
            model: d.fallbackModel,
          }));
        }
        setEmbeddingDimension(d.embeddingDimension);
        setTypesafeApiKeySet(d.typesafeApiKeySet);
        setAgentConfig(d.agentConfig ?? DEFAULT_AGENT_CONFIG);
      } catch {
        if (active) setError('Failed to load AI config');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const fetchModels = useCallback(
    async (
      slot: LlmSlotValue,
      setter: React.Dispatch<React.SetStateAction<LlmSlotValue>>,
      slotName: 'main' | 'fallback' | 'embedding',
    ) => {
      setter((prev) => ({ ...prev, loadingModels: true }));
      setError(null);
      try {
        const res = await fetch('/api/v1/admin/llm-config/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: slot.provider,
            baseUrl: slot.baseUrl,
            apiKey: slot.apiKey,
            slot: slotName,
          }),
        });
        const payload = (await res.json()) as {
          data?: { models?: string[] };
          error?: { message?: string };
        };
        if (!res.ok) {
          throw new Error(payload.error?.message ?? `Failed to load models (${res.status})`);
        }
        setter((prev) => ({
          ...prev,
          modelOptions: payload.data?.models ?? [],
          loadingModels: false,
        }));
      } catch (err) {
        setter((prev) => ({ ...prev, modelOptions: [], loadingModels: false }));
        setError(err instanceof Error ? err.message : 'Failed to load models');
      }
    },
    [],
  );

  const probeDimension = useCallback(async () => {
    setProbing(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/llm-config/embedding-dimension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: embedding.provider,
          baseUrl: embedding.baseUrl,
          apiKey: embedding.apiKey,
          model: embedding.model,
        }),
      });
      const payload = (await res.json()) as {
        data?: { dimension?: number };
        error?: { message?: string };
      };
      if (!res.ok || !payload.data?.dimension) {
        throw new Error(payload.error?.message ?? 'Dimension probe failed');
      }
      setEmbeddingDimension(payload.data.dimension);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dimension probe failed');
    } finally {
      setProbing(false);
    }
  }, [embedding.provider, embedding.baseUrl, embedding.apiKey, embedding.model]);

  const changeProvider = (
    setter: React.Dispatch<React.SetStateAction<LlmSlotValue>>,
    provider: LlmProvider,
  ) => {
    setter((prev) => ({
      ...prev,
      provider,
      baseUrl: DEFAULT_BASE_URL[provider],
      modelOptions: [],
      model: '',
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch('/api/v1/admin/llm-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainProvider: main.provider,
          mainBaseUrl: main.baseUrl,
          mainApiKey: main.apiKey,
          mainModel: main.model,
          fallbackProvider: fallbackEnabled ? fallback.provider : null,
          fallbackBaseUrl: fallbackEnabled ? fallback.baseUrl : '',
          fallbackApiKey: fallbackEnabled ? fallback.apiKey : '',
          fallbackModel: fallbackEnabled ? fallback.model : '',
          embeddingProvider: embedding.provider,
          embeddingBaseUrl: embedding.baseUrl,
          embeddingApiKey: embedding.apiKey,
          embeddingModel: embedding.model,
          embeddingDimension,
          agentConfig,
          typesafeApiKey,
          clearTypesafeApiKey,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: { message?: string } };
        throw new Error(body.error?.message ?? 'Save failed');
      }

      setSaved(true);
      setMain((prev) => ({ ...prev, apiKey: '', apiKeySet: prev.apiKeySet || prev.apiKey !== '' }));
      setEmbedding((prev) => ({
        ...prev,
        apiKey: '',
        apiKeySet: prev.apiKeySet || prev.apiKey !== '',
      }));
      setFallback((prev) => ({
        ...prev,
        apiKey: '',
        apiKeySet: prev.apiKeySet || prev.apiKey !== '',
      }));
      setTypesafeApiKey('');
      setTypesafeApiKeySet(clearTypesafeApiKey ? false : typesafeApiKeySet || typesafeApiKey !== '');
      setClearTypesafeApiKey(false);
      setJevTestMessage(null);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTestJev = async () => {
    setTestingJev(true);
    setJevTestMessage(null);
    setJevTestFailed(false);
    try {
      const res = await fetch('/api/v1/admin/llm-config/test-jev', { method: 'POST' });
      const payload = (await res.json()) as {
        data?: { model?: string };
        error?: { message?: string };
        message?: string;
      };
      if (!res.ok) throw new Error(payload.error?.message ?? 'JEv connection check failed.');
      setJevTestMessage(`Connected to ${payload.data?.model ?? agentConfig.jevModel}.`);
    } catch (err) {
      setJevTestFailed(true);
      setJevTestMessage(err instanceof Error ? err.message : 'JEv connection check failed.');
    } finally {
      setTestingJev(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading AI config...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Manage the assistant in four sections. Saved changes reach the chat service within 10 seconds.
        </p>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Config'}
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--success)]/40 bg-[var(--success)]/10 px-4 py-3 text-sm text-[var(--success)]">
          <CheckCircle className="h-4 w-4" />
          Config saved.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--error)]/40 bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="providers">Models & providers</TabsTrigger>
          <TabsTrigger value="jev">JEv routing</TabsTrigger>
          <TabsTrigger value="safety">Safety rules</TabsTrigger>
          <TabsTrigger value="tools">Tools & knowledge</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LlmSlotCard
              title="Main model"
              description="Writes the assistant's final response."
              idPrefix="main"
              value={main}
              onChange={(patch) => setMain((prev) => ({ ...prev, ...patch }))}
              onProviderChange={(provider) => changeProvider(setMain, provider)}
              onFetchModels={() => void fetchModels(main, setMain, 'main')}
            />

            <LlmSlotCard
              title="Embedding model"
              description="Finds matching passages in portfolio documents when search is selected."
              idPrefix="embedding"
              value={embedding}
              onChange={(patch) => setEmbedding((prev) => ({ ...prev, ...patch }))}
              onProviderChange={(provider) => changeProvider(setEmbedding, provider)}
              onFetchModels={() => void fetchModels(embedding, setEmbedding, 'embedding')}
            >
              <div className="space-y-2">
                <Label htmlFor="embedding-dimension">Vector dimension</Label>
                <div className="flex gap-2">
                  <Input
                    id="embedding-dimension"
                    className="flex-1"
                    type="number"
                    value={embeddingDimension}
                    onChange={(event) =>
                      setEmbeddingDimension(Number(event.target.value) || CHUNK_VECTOR_DIMENSION)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void probeDimension()}
                    disabled={probing || embedding.model.length === 0}
                    title="Ask the provider for the real vector size"
                  >
                    {probing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ruler className="h-4 w-4" />}
                    Detect
                  </Button>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Detect sends one test embedding request. The database currently supports {CHUNK_VECTOR_DIMENSION} dimensions; changing it requires a migration and full re-index.
                </p>
                {dimensionMismatch && (
                  <p className="text-xs text-[var(--error)]">
                    Current database vectors have {CHUNK_VECTOR_DIMENSION} dimensions. Do not save a different value until the database is migrated and all documents are re-indexed.
                  </p>
                )}
              </div>
            </LlmSlotCard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fallback model</CardTitle>
              <CardDescription>Used when the main model is unavailable or rate-limited.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch id="fallback-enabled" checked={fallbackEnabled} onCheckedChange={setFallbackEnabled} />
                <Label htmlFor="fallback-enabled">Use a fallback model</Label>
              </div>
              {fallbackEnabled && (
                <LlmSlotCard
                  title="Fallback provider"
                  description="Must return the same chat response format as the main model."
                  idPrefix="fallback"
                  value={fallback}
                  onChange={(patch) => setFallback((prev) => ({ ...prev, ...patch }))}
                  onProviderChange={(provider) => changeProvider(setFallback, provider)}
                  onFetchModels={() => void fetchModels(fallback, setFallback, 'fallback')}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jev" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>TypeSafe JEv connection</CardTitle>
              <CardDescription>
                JEv classifies whether a message is safe, whether portfolio search is needed, and which action fits. Add the TypeSafe API key here; Admin encrypts it at rest and sends it to RAG only through the authenticated internal API. The saved key is never returned by the config API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="typesafe-api-key">TypeSafe API key</Label>
                  <Input
                    id="typesafe-api-key"
                    type="password"
                    autoComplete="new-password"
                    value={typesafeApiKey}
                    placeholder={typesafeApiKeySet && !clearTypesafeApiKey ? 'Saved key — enter a new key to replace it' : 'Paste TypeSafe API key'}
                    onChange={(event) => {
                      setTypesafeApiKey(event.target.value);
                      setClearTypesafeApiKey(false);
                      setJevTestMessage(null);
                    }}
                    maxLength={4096}
                  />
                  <p className="text-xs text-[var(--text-secondary)]">
                    {typesafeApiKeySet && !clearTypesafeApiKey
                      ? 'A key is saved. Leave this blank to keep it.'
                      : 'The key is sent only to TypeSafe from the server.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jev-model">JEv model ID</Label>
                  <Input
                    id="jev-model"
                    value={agentConfig.jevModel}
                    onChange={(event) =>
                      setAgentConfig((current) => ({ ...current, jevModel: event.target.value }))
                    }
                    maxLength={100}
                  />
                  <p className="text-xs text-[var(--text-secondary)]">
                    The model used for input routing and optional answer review.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]" role="status">
                  <KeyRound className="h-4 w-4" />
                  {clearTypesafeApiKey
                    ? 'Saved key will be removed when you save.'
                    : typesafeApiKeySet
                      ? 'Admin API key is saved.'
                      : 'No Admin API key is saved.'}
                </div>
                {typesafeApiKeySet && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setClearTypesafeApiKey((current) => !current);
                      setTypesafeApiKey('');
                      setJevTestMessage(null);
                    }}
                  >
                    {clearTypesafeApiKey ? 'Keep saved key' : 'Remove saved key'}
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => void handleTestJev()} disabled={!typesafeApiKeySet || clearTypesafeApiKey || testingJev || saving}>
                  {testingJev ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                  {testingJev ? 'Checking…' : 'Test saved connection'}
                </Button>
                {jevTestMessage && (
                  <span className={`text-sm ${jevTestFailed ? 'text-[var(--error)]' : 'text-[var(--success)]'}`} role="status">
                    {jevTestMessage}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                The connection test sends a fixed system check, not a visitor message. The Admin key takes priority over the temporary RAG environment fallback. Leave TypeSafe Zero Data Retention enabled before sending visitor content to JEv.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Routing instructions</CardTitle>
              <CardDescription>
                These instructions guide JEv when it selects search, profile, pricing, booking, contact, or guestbook. Tool availability below still limits what can run.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="jev-routing-schema"
                aria-label="JEv routing instructions"
                value={agentConfig.routingInstructions}
                onChange={(event) => setAgentConfig((current) => ({ ...current, routingInstructions: event.target.value }))}
                maxLength={3000}
                rows={7}
              />
              <div className="max-w-xs space-y-2">
                <Label htmlFor="agent-confidence">Decision threshold</Label>
                <Input
                  id="agent-confidence"
                  type="number"
                  min={0.5}
                  max={0.99}
                  step={0.01}
                  value={agentConfig.confidenceThreshold}
                  onChange={(event) => setAgentConfig((current) => ({
                    ...current,
                    confidenceThreshold: Math.min(0.99, Math.max(0.5, Number(event.target.value) || 0.5)),
                  }))}
                />
                <p className="text-xs text-[var(--text-secondary)]">
                  JEv scores a decision from 0 to 1. A route is accepted at or above this score. The same threshold applies to input blocking and answer review.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input checks</CardTitle>
              <CardDescription>
                JEv checks the current message and up to two earlier user messages. Email addresses and phone numbers are redacted first; the request is capped at 2,000 characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="jev-input-safety">Block when a message asks the assistant to…</Label>
              <Textarea
                id="jev-input-safety"
                className="mt-2"
                value={agentConfig.inputSafetyInstructions}
                onChange={(event) => setAgentConfig((current) => ({ ...current, inputSafetyInstructions: event.target.value }))}
                maxLength={3000}
                rows={7}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Answer review</CardTitle>
              <CardDescription>
                Optional second JEv request checks the final answer before it is shown. Email and phone numbers are redacted and the text is capped at 4,000 characters. This adds latency and provider usage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="output-guardrail">Review final answers with JEv</Label>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Turn this off to skip the extra JEv request after an answer is generated.
                  </p>
                </div>
                <Switch
                  id="output-guardrail"
                  checked={agentConfig.outputGuardrailEnabled}
                  onCheckedChange={(outputGuardrailEnabled) => setAgentConfig((current) => ({ ...current, outputGuardrailEnabled }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jev-output-safety">Block answers that…</Label>
                <Textarea
                  id="jev-output-safety"
                  value={agentConfig.outputSafetyInstructions}
                  onChange={(event) => setAgentConfig((current) => ({ ...current, outputSafetyInstructions: event.target.value }))}
                  maxLength={3000}
                  rows={7}
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                If JEv is enabled but cannot be reached, chat fails closed in production and asks the visitor to try again or use the contact page.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available tools</CardTitle>
              <CardDescription>
                JEv can route only to enabled tools. Turning a tool off also blocks its pending confirmation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {CHATBOT_TOOLS.map((tool) => (
                <div key={tool} className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <Label htmlFor={`tool-${tool}`}>{CHATBOT_TOOL_INFO[tool].label}</Label>
                    <p className="max-w-3xl text-sm text-[var(--text-secondary)]">{CHATBOT_TOOL_INFO[tool].description}</p>
                  </div>
                  <Switch
                    id={`tool-${tool}`}
                    checked={agentConfig.enabledTools.includes(tool)}
                    onCheckedChange={(checked) => setAgentConfig((current) => ({
                      ...current,
                      enabledTools: checked
                        ? [...new Set([...current.enabledTools, tool])]
                        : current.enabledTools.filter((item) => item !== tool),
                    }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio knowledge search</CardTitle>
              <CardDescription>
                This is the only route that searches embedded documents. Embeddings are loaded on demand, not on every chat message.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="retrieval-enabled">Allow portfolio search</Label>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Disable to stop vector retrieval even when JEv selects this route.
                  </p>
                </div>
                <Switch
                  id="retrieval-enabled"
                  checked={agentConfig.retrievalEnabled}
                  onCheckedChange={(retrievalEnabled) => setAgentConfig((current) => ({ ...current, retrievalEnabled }))}
                />
              </div>
              <div className="max-w-xs space-y-2">
                <Label htmlFor="retrieval-limit">Maximum references per answer</Label>
                <Input
                  id="retrieval-limit"
                  type="number"
                  min={1}
                  max={10}
                  value={agentConfig.retrievalLimit}
                  onChange={(event) => setAgentConfig((current) => ({
                    ...current,
                    retrievalLimit: Math.min(10, Math.max(1, Number(event.target.value) || 1)),
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
