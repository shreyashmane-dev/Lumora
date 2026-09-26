const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface SentenceSignal {
  index: number;
  text: string;
  ai_probability: number;
  suspicion_level: "low" | "medium" | "high";
  perplexity_indicator: number;
}

export interface EvidenceSignals {
  burstiness_score: number;
  perplexity_proxy: number;
  lexical_diversity: number;
  sentence_variance: number;
  repetition_index: number;
}

export interface DetectResponse {
  classification: "Likely Human" | "Uncertain / Mixed" | "Likely AI-Generated";
  ai_probability: number;
  confidence: number;
  is_uncertain: boolean;
  word_count: number;
  character_count: number;
  signals: EvidenceSignals;
  sentence_analysis: SentenceSignal[];
  evaluation_summary: string;
  model_version: string;
  timestamp: string;
}

export interface DiffSpan {
  type: "equal" | "added" | "removed" | "modified";
  original?: string;
  revised?: string;
}

export interface DiffStats {
  words_added: number;
  words_removed: number;
  words_modified: number;
  words_unchanged: number;
  similarity_percentage: number;
}

export interface HumanizeResponse {
  original_text: string;
  rewritten_text: string;
  style: string;
  changes_diff: DiffSpan[];
  meaning_preservation_score: number;
  readability_before: number;
  readability_after: number;
  stats: DiffStats;
  model_version: string;
  timestamp: string;
}

export interface AnalyzeResponse {
  word_count: number;
  character_count: number;
  sentence_count: number;
  average_sentence_length: number;
  sentence_length_std_dev: number;
  shortest_sentence_length: number;
  longest_sentence_length: number;
  unique_word_count: number;
  type_token_ratio: number;
  hapax_legomena_ratio: number;
  flesch_reading_ease: number;
  flesch_kincaid_grade: number;
  burstiness_score: number;
  structural_repetition_score: number;
  anaphora_detected: string[];
  signals_vs_conclusions: {
    objective_signals: Record<string, any>;
    interpretive_guidance: Record<string, string>;
  };
  model_version: string;
  timestamp: string;
}

export interface KeyItem {
  id: string;
  name: string;
  prefix: string;
  environment: string;
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
  monthly_quota: number;
  monthly_used: number;
}

export async function detectText(text: string, apiKey?: string): Promise<DetectResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(`${API_BASE}/v1/detect`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to analyze text.");
  }
  return data;
}

export async function humanizeText(
  text: string,
  style: string = "natural",
  customInstructions?: string,
  apiKey?: string
): Promise<HumanizeResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(`${API_BASE}/v1/humanize`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text, style, custom_instructions: customInstructions })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to rewrite text.");
  }
  return data;
}

export async function analyzeWriting(text: string, apiKey?: string): Promise<AnalyzeResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(`${API_BASE}/v1/analyze`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to analyze writing profile.");
  }
  return data;
}

export async function createApiKey(name: string, environment: string = "live"): Promise<any> {
  const res = await fetch(`${API_BASE}/v1/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, environment })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to create API key.");
  }
  return data;
}

export async function listApiKeys(): Promise<KeyItem[]> {
  const res = await fetch(`${API_BASE}/v1/keys`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to fetch API keys.");
  }
  return data.keys || [];
}

export async function revokeApiKey(keyId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/keys/${keyId}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error?.message || "Failed to revoke API key.");
  }
}

export async function getUsageMetrics(apiKey?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(`${API_BASE}/v1/usage`, { headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to fetch usage metrics.");
  }
  return data;
}

export async function getSystemStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/v1/status`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Failed to fetch system status.");
  }
  return data;
}
