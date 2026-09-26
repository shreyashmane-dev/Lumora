from typing import List, Optional
from pydantic import BaseModel, Field


class DetectRequest(BaseModel):
    text: str = Field(..., description="The raw text to analyze for AI-generation probability.")


class SentenceSignal(BaseModel):
    index: int
    text: str
    ai_probability: float = Field(..., ge=0.0, le=1.0)
    suspicion_level: str = Field(..., description="'low', 'medium', or 'high'")
    perplexity_indicator: float


class EvidenceSignals(BaseModel):
    burstiness_score: float = Field(..., description="Variance in sentence rhythm and structure.")
    perplexity_proxy: float = Field(..., description="Statistical measure of word prediction surprise.")
    lexical_diversity: float = Field(..., description="Type-token ratio representing vocabulary breadth.")
    sentence_variance: float = Field(..., description="Standard deviation of sentence lengths.")
    repetition_index: float = Field(..., description="Frequency of recurring n-grams and uniform phrasing.")


class DetectResponse(BaseModel):
    classification: str = Field(..., description="'Likely Human', 'Uncertain / Mixed', or 'Likely AI-Generated'")
    ai_probability: float = Field(..., ge=0.0, le=1.0, description="Calibrated probability of machine generation.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in the statistical evaluation.")
    is_uncertain: bool = Field(..., description="True if evidence is ambiguous or near decision threshold.")
    word_count: int
    character_count: int
    signals: EvidenceSignals
    sentence_analysis: List[SentenceSignal]
    evaluation_summary: str
    model_version: str
    timestamp: str
