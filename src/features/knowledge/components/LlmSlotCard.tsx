'use client';

import { ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LLM_PROVIDERS, type LlmProvider } from '../constants/llm-providers';

export interface LlmSlotValue {
  provider: LlmProvider;
  baseUrl: string;
  apiKey: string;
  apiKeySet: boolean;
  model: string;
  modelOptions: string[];
  loadingModels: boolean;
}

interface LlmSlotCardProps {
  title: string;
  description: string;
  idPrefix: string;
  value: LlmSlotValue;
  onChange: (patch: Partial<LlmSlotValue>) => void;
  onProviderChange: (provider: LlmProvider) => void;
  onFetchModels: () => void;
  children?: React.ReactNode;
}

export function LlmSlotCard({
  title,
  description,
  idPrefix,
  value,
  onChange,
  onProviderChange,
  onFetchModels,
  children,
}: LlmSlotCardProps) {
  const canFetchModels = value.apiKey.length > 0 || value.apiKeySet;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-provider`}>Provider</Label>
          <Select
            value={value.provider}
            onValueChange={(next) => onProviderChange(next as LlmProvider)}
          >
            <SelectTrigger id={`${idPrefix}-provider`}>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {LLM_PROVIDERS.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-base-url`}>Base URL</Label>
          <Input
            id={`${idPrefix}-base-url`}
            type="url"
            placeholder={
              value.provider === 'gemini'
                ? 'https://generativelanguage.googleapis.com/v1beta'
                : 'https://api.openai.com'
            }
            value={value.baseUrl}
            onChange={(event) => onChange({ baseUrl: event.target.value })}
          />
          <p className="text-xs text-[var(--text-secondary)]">
            Leave empty to use the provider default.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-api-key`}>API Key</Label>
          <Input
            id={`${idPrefix}-api-key`}
            type="password"
            autoComplete="off"
            placeholder={value.apiKeySet ? 'Saved. Enter a new key to replace it' : 'Enter API key'}
            value={value.apiKey}
            onChange={(event) => onChange({ apiKey: event.target.value })}
          />
          {value.apiKeySet && (
            <p className="text-xs text-[var(--text-secondary)]">
              A key is already stored. Leave this empty to keep it.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-model`}>Model</Label>
          <div className="flex gap-2">
            {value.modelOptions.length > 0 ? (
              <Select value={value.model} onValueChange={(next) => onChange({ model: next })}>
                <SelectTrigger id={`${idPrefix}-model`} className="flex-1">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {value.modelOptions.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={`${idPrefix}-model`}
                className="flex-1"
                placeholder="Model name"
                value={value.model}
                onChange={(event) => onChange({ model: event.target.value })}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={onFetchModels}
              disabled={value.loadingModels || !canFetchModels}
              title={canFetchModels ? 'Fetch available models' : 'Enter an API key first'}
            >
              {value.loadingModels ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Fetch
            </Button>
          </div>
        </div>

        {children}
      </CardContent>
    </Card>
  );
}
