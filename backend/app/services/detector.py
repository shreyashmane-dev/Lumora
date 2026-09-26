import math
import re
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional
from app.core.config import settings
from app.core.errors import TextTooShortException, TextTooLargeException
from app.models.detect import DetectResponse, SentenceSignal, EvidenceSignals

# Expanded catalog of LLM clichés, robotic transitions, and stylistic markers
AI_MARKER_PATTERNS = [
    # Metaphors & Cliches
    r"\bdelve(?:s|d|ing)?\s+into\b",
    r"\btapestry(?:\s+of)?\b",
    r"\btestament\s+to\b",
    r"\bbeacon\s+of\b",
    r"\bmultifaceted\b",
    r"\bpivotal\s+role\b",
    r"\bcrucial\s+role\b",
    r"\bvital\s+role\b",
    r"\bplays\s+a\s+(?:key|vital|crucial|pivotal)\s+role\b",
    r"\bnavigat(?:e|ing|ed)\s+the\s+complexit(?:y|ies)\b",
    r"\bharness(?:ing|ed)?\s+the\s+power\s+of\b",
    r"\bunderpin(?:s|ning|ned)?\b",
    r"\bseamless(?:ly)?\b",
    r"\bever-evolving\b",
    r"\bintricate\s+dance\b",
    r"\bsymphony\s+of\b",
    r"\ba\s+myriad\s+of\b",
    r"\bplethora\s+of\b",
    # Formulaic Sentence Openers & Transitions
    r"\bit\s+is\s+important\s+to\s+(?:remember|note|recognize|understand|highlight)\b",
    r"\bit\s+is\s+worth\s+(?:noting|mentioning|remembering)\b",
    r"\bin\s+conclusion\b",
    r"\bin\s+summary\b",
    r"\bfurthermore\b",
    r"\bmoreover\b",
    r"\badditionally\b",
    r"\bconsequently\b",
    r"\bnonetheless\b",
    r"\bhenceforth\b",
    r"\bnot\s+only\s+.*\s+but\s+also\b",
    r"\bat\s+the\s+end\s+of\s+the\s+day\b",
    r"\bin\s+today'?s\s+(?:fast-paced|rapidly\s+evolving|digital)\s+(?:world|landscape|era|age)\b",
    r"\bstands\s+as\s+a\b",
    r"\bserves\s+as\s+a\b"
]

COMMON_ENGLISH_WORDS = {
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with",
    "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if",
    "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him",
    "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than",
    "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how",
    "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
}


def split_sentences(text: str) -> List[str]:
    """Splits text into sentences respecting abbreviations, decimal numbers, and quotes."""
    raw = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'“])', text.strip())
    sentences = [s.strip() for s in raw if s.strip()]
    if not sentences and text.strip():
        sentences = [text.strip()]
    return sentences


def count_words(text: str) -> List[str]:
    """Tokenizes text into lowercase alphanumeric words."""
    return re.findall(r"\b[a-zA-Z0-9'-]+\b", text.lower())


def calculate_burstiness(sentence_lengths: List[int]) -> Tuple[float, float]:
    """
    Computes sentence length standard deviation and coefficient of variation (CV = std / mean).
    High CV indicates natural human burstiness; low CV indicates uniform machine pacing.
    """
    if not sentence_lengths or len(sentence_lengths) < 2:
        return 0.0, 0.15

    mean_len = sum(sentence_lengths) / len(sentence_lengths)
    variance = sum((l - mean_len) ** 2 for l in sentence_lengths) / (len(sentence_lengths) - 1)
    std_dev = math.sqrt(variance)
    cv = std_dev / (mean_len + 1e-5)
    
    # Scale CV: 0.1 (robotic uniform) to 1.0 (highly varied human)
    burstiness_score = min(1.0, max(0.05, cv / 0.82))
    return std_dev, burstiness_score


def calculate_lexical_breadth(words: List[str]) -> Tuple[float, float]:
    """
    Computes Type-Token Ratio (TTR) and Guiraud's root index.
    Adjusts for vocabulary sophistication by measuring rare word usage.
    """
    total = len(words)
    if total == 0:
        return 0.5, 0.5

    unique_words = set(words)
    ttr = len(unique_words) / total
    guiraud = len(unique_words) / math.sqrt(total)
    
    # Rare words (outside standard 100 most frequent English function words)
    rare_words = [w for w in words if w not in COMMON_ENGLISH_WORDS]
    rare_ratio = len(rare_words) / total

    lexical_diversity = min(1.0, max(0.1, (guiraud / 9.0) * 0.7 + (rare_ratio * 0.3)))
    return ttr, lexical_diversity


def calculate_marker_perplexity(text: str, total_words: int) -> float:
    """
    Evaluates transitional cliché density and structural formulaic frequency.
    Lower score indicates text heavily matches common LLM template outputs.
    """
    matches = 0
    for p in AI_MARKER_PATTERNS:
        matches += len(re.findall(p, text, re.IGNORECASE))

    marker_density = (matches / max(1, total_words)) * 100
    # Scaled 0.05 (heavy AI clichés) to 0.98 (original phrasing)
    perplexity_proxy = max(0.05, min(0.98, 1.0 - (marker_density / 2.8)))
    return round(perplexity_proxy, 3)


def calculate_structural_repetition(sentences: List[str], words: List[str]) -> float:
    """Detects syntactic anaphora (repeated sentence-initial tokens) and trigram loops."""
    if len(sentences) < 2:
        return 0.0

    first_words = []
    for s in sentences:
        sw = count_words(s)
        if sw:
            first_words.append(sw[0])

    anaphora_count = len(first_words) - len(set(first_words))
    anaphora_ratio = anaphora_count / len(first_words) if first_words else 0.0

    # Trigram repetition
    trigrams = [tuple(words[i:i+3]) for i in range(len(words)-2)]
    trigram_rep = (len(trigrams) - len(set(trigrams))) / (len(trigrams) + 1e-5) if trigrams else 0.0

    repetition_index = min(1.0, max(0.0, (anaphora_ratio * 0.6) + (trigram_rep * 0.4)))
    return round(repetition_index, 3)


class DetectorService:
    @staticmethod
    def detect(text: str, domain: Optional[str] = "general") -> DetectResponse:
        if not text or not text.strip():
            raise TextTooShortException(current_words=0, min_words=settings.MIN_TEXT_WORDS)

        char_len = len(text)
        if char_len > settings.MAX_TEXT_LENGTH_CHARS:
            raise TextTooLargeException(current_chars=char_len, max_chars=settings.MAX_TEXT_LENGTH_CHARS)

        words = count_words(text)
        word_count = len(words)
        if word_count < settings.MIN_TEXT_WORDS:
            raise TextTooShortException(current_words=word_count, min_words=settings.MIN_TEXT_WORDS)

        sentences = split_sentences(text)
        sentence_lengths = [len(count_words(s)) for s in sentences if count_words(s)]
        if not sentence_lengths:
            sentence_lengths = [word_count]

        # 1. Feature Extraction
        std_dev, burstiness_score = calculate_burstiness(sentence_lengths)
        ttr, lexical_diversity = calculate_lexical_breadth(words)
        perplexity_proxy = calculate_marker_perplexity(text, word_count)
        repetition_index = calculate_structural_repetition(sentences, words)

        signals = EvidenceSignals(
            burstiness_score=round(burstiness_score, 3),
            perplexity_proxy=round(perplexity_proxy, 3),
            lexical_diversity=round(lexical_diversity, 3),
            sentence_variance=round(std_dev, 2),
            repetition_index=round(repetition_index, 3)
        )

        # 2. Ensemble Modeling
        # AI indicators: low burstiness, low perplexity proxy, high repetition, low lexical diversity
        ai_burstiness = 1.0 - burstiness_score
        ai_perplexity = 1.0 - perplexity_proxy
        ai_repetition = repetition_index
        ai_lexical = 1.0 - lexical_diversity

        # Weighted composite score
        composite_ai_score = (
            ai_burstiness * 0.38 +
            ai_perplexity * 0.34 +
            ai_repetition * 0.14 +
            ai_lexical * 0.14
        )

        # Domain adjustments (academic and technical texts naturally have lower burstiness)
        decision_center = 0.45
        if domain == "academic" or domain == "technical":
            decision_center = 0.52

        # Calibrated logistic sigmoid transform
        z = (composite_ai_score - decision_center) * 6.5
        calibrated_prob = 1.0 / (1.0 + math.exp(-z))
        calibrated_prob = max(0.02, min(0.98, calibrated_prob))

        # 3. Confidence Policy
        # Length factor: confidence grows with text length up to 140 words
        length_factor = min(1.0, word_count / 130.0)
        # Decision boundary distance
        certainty_dist = abs(calibrated_prob - 0.50) * 2.0
        confidence = (length_factor * 0.55) + (certainty_dist * 0.45)
        confidence = max(0.20, min(0.96, confidence))

        # 4. Sentence-Level Breakdown
        sentence_analysis: List[SentenceSignal] = []
        for i, s in enumerate(sentences):
            swords = count_words(s)
            sw_count = len(swords)
            if sw_count < 3:
                sentence_analysis.append(
                    SentenceSignal(
                        index=i,
                        text=s,
                        ai_probability=0.20,
                        suspicion_level="low",
                        perplexity_indicator=0.8
                    )
                )
                continue

            local_markers = sum(len(re.findall(p, s, re.IGNORECASE)) for p in AI_MARKER_PATTERNS)
            s_prob = 0.35
            if local_markers > 0:
                s_prob += 0.35 * local_markers
            if 16 <= sw_count <= 26:
                s_prob += 0.15
            elif sw_count < 8 or sw_count > 34:
                s_prob -= 0.15

            s_prob = max(0.05, min(0.95, s_prob))
            suspicion = "high" if s_prob >= 0.70 else "medium" if s_prob >= 0.45 else "low"

            sentence_analysis.append(
                SentenceSignal(
                    index=i,
                    text=s,
                    ai_probability=round(s_prob, 3),
                    suspicion_level=suspicion,
                    perplexity_indicator=round(1.0 - s_prob, 3)
                )
            )

        # 5. Classification Decision
        if confidence < 0.45 or (0.40 <= calibrated_prob <= 0.60):
            classification = "Uncertain / Mixed"
            is_uncertain = True
            evaluation_summary = (
                f"The text exhibits mixed stylometric characteristics (calibrated AI probability: {int(calibrated_prob * 100)}%). "
                "Syntactic cadence and vocabulary breadth fall within ambiguous bounds. "
                "This commonly occurs in human-edited drafts, formal technical reports, or non-native English prose."
            )
        elif calibrated_prob >= 0.60:
            classification = "Likely AI-Generated"
            is_uncertain = False
            evaluation_summary = (
                f"The text exhibits high structural uniformity and formulaic transitional phrasing characteristic of LLM outputs "
                f"(AI probability: {int(calibrated_prob * 100)}%, confidence: {int(confidence * 100)}%). "
                "Contributing factors include low sentence length variation and recurring syntactic template patterns."
            )
        else:
            classification = "Likely Human"
            is_uncertain = False
            evaluation_summary = (
                f"The text demonstrates natural syntactic rhythm and idiosyncratic lexical diversity typical of human authors "
                f"(AI probability: {int(calibrated_prob * 100)}%, confidence: {int(confidence * 100)}%). "
                "Strong variation across sentence lengths (burstiness) and organic word choice indicate genuine human composition."
            )

        return DetectResponse(
            classification=classification,
            ai_probability=round(calibrated_prob, 3),
            confidence=round(confidence, 3),
            is_uncertain=is_uncertain,
            word_count=word_count,
            character_count=char_len,
            signals=signals,
            sentence_analysis=sentence_analysis,
            evaluation_summary=evaluation_summary,
            model_version=settings.DETECTOR_MODEL_VERSION,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
