from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class HumanizeStyle(str, Enum):
    NATURAL = "natural"
    ACADEMIC = "academic"
    PROFESSIONAL = "professional"
    EXECUTIVE = "executive"
    CREATIVE = "creative"
    JOURNALISTIC = "journalistic"
    SIMPLE = "simple"
    CASUAL = "casual"
    NATIVE_ENGLISH = "native_english"
    CUSTOM = "custom"


class HumanizeRequest(BaseModel):
    text: str = Field(..., description="The original text to rewrite naturally while preserving semantic meaning.")
    style: HumanizeStyle = Field(default=HumanizeStyle.NATURAL, description="Target rewriting style.")
    custom_instructions: Optional[str] = Field(None, description="Custom rewriting instructions if style is 'custom'.")


class DiffSpan(BaseModel):
    type: str = Field(..., description="'equal', 'added', 'removed', or 'modified'")
    original: Optional[str] = None
    revised: Optional[str] = None


class DiffStats(BaseModel):
    words_added: int
    words_removed: int
    words_modified: int
    words_unchanged: int
    similarity_percentage: float


class HumanizeResponse(BaseModel):
    original_text: str
    rewritten_text: str
    style: str
    changes_diff: List[DiffSpan]
    meaning_preservation_score: float = Field(..., ge=0.0, le=1.0, description="Semantic similarity between original and rewrite.")
    readability_before: float
    readability_after: float
    stats: DiffStats
    model_version: str
    timestamp: str
    ai_score_before: Optional[float] = None
    ai_score_after: Optional[float] = None
    human_authenticity_score: Optional[float] = None
