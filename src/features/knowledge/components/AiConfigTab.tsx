'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Loader2, Ruler, Save, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  CHUNK_VECTOR_DIMENSION,
  DEFAULT_BASE_URL,
  type LlmProvider,
} from '../constants/llm-providers';
import { LlmSlotCard, type LlmSlotValue } from './LlmSlotCard';

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
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
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
          Providers used by the RAG chatbot. Changes are picked up within 30 seconds.
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LlmSlotCard
          title="Main LLM"
          description="Generates chat answers for the portfolio assistant."
          idPrefix="main"
          value={main}
          onChange={(patch) => setMain((prev) => ({ ...prev, ...patch }))}
          onProviderChange={(provider) => changeProvider(setMain, provider)}
          onFetchModels={() => void fetchModels(main, setMain, 'main')}
        />

        <LlmSlotCard
          title="Embedding"
          description="Turns documents into vectors for retrieval."
          idPrefix="embedding"
          value={embedding}
          onChange={(patch) => setEmbedding((prev) => ({ ...prev, ...patch }))}
          onProviderChange={(provider) => changeProvider(setEmbedding, provider)}
          onFetchModels={() => void fetchModels(embedding, setEmbedding, 'embedding')}
        >
          <div className="space-y-2">
            <Label htmlFor="embedding-dimension">Embedding Dimension</Label>
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
              Detect sends one probe embedding request and reads the real vector length.
            </p>
            {dimensionMismatch && (
              <p className="text-xs text-[var(--error)]">
                The chunk vector column is fixed at {CHUNK_VECTOR_DIMENSION} dimensions. Saving{' '}
                {embeddingDimension} requires a schema migration and full re-ingest before retrieval
                works.
              </p>
            )}
          </div>
        </LlmSlotCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fallback LLM</CardTitle>
          <CardDescription>Used when the main provider fails or rate-limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="fallback-enabled"
              checked={fallbackEnabled}
              onCheckedChange={setFallbackEnabled}
            />
            <Label htmlFor="fallback-enabled">Enable fallback</Label>
          </div>
          {fallbackEnabled && (
            <LlmSlotCard
              title="Fallback provider"
              description="Same contract as the main LLM."
              idPrefix="fallback"
              value={fallback}
              onChange={(patch) => setFallback((prev) => ({ ...prev, ...patch }))}
              onProviderChange={(provider) => changeProvider(setFallback, provider)}
              onFetchModels={() => void fetchModels(fallback, setFallback, 'fallback')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
