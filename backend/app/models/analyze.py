from typing import List, Dict, Any
from pydantic import BaseModel, Field


class SignalsVsConclusions(BaseModel):
    objective_signals: Dict[str, Any] = Field(
        ...,
        description="Factual measurements derived directly from text structure and vocabulary."
    )
    interpretive_guidance: Dict[str, Any] = Field(
        ...,
        description="Contextual explanations of what these signals typically indicate without claiming authorship certainty."
    )


class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="The text to analyze across stylometric and structural dimensions.")


class AnalyzeResponse(BaseModel):
    word_count: int
    character_count: int
    sentence_count: int
    average_sentence_length: float
    sentence_length_std_dev: float
    shortest_sentence_length: int
    longest_sentence_length: int
    unique_word_count: int
    type_token_ratio: float
    hapax_legomena_ratio: float
    flesch_reading_ease: float
    flesch_kincaid_grade: float
    burstiness_score: float
    structural_repetition_score: float
    anaphora_detected: List[str]
    signals_vs_conclusions: SignalsVsConclusions
    model_version: str
    timestamp: str
