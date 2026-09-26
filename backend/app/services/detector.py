import math
import re
from datetime import datetime, timezone
from typing import List, Tuple
from app.core.config import settings
from app.core.errors import TextTooShortException, TextTooLargeException
from app.models.detect import DetectResponse, SentenceSignal, EvidenceSignals


AI_MARKER_PATTERNS = [
    r"\bdelve(?:s|d|ing)?\s+into\b",
    r"\btapestry\b",
    r"\btestament\s+to\b",
    r"\bit\s+is\s+important\s+to\s+(?:remember|note|recognize|understand)\b",
    r"\bin\s+conclusion\b",
    r"\bfurthermore\b",
    r"\bmoreover\b",
    r"\bplays\s+a\s+(?:vital|crucial|pivotal|key)\s+role\b",
    r"\bnavigat(?:e|ing)\s+the\s+complexit(?:y|ies)\b",
    r"\bmultifaceted\b",
    r"\bseamless(?:ly)?\b",
    r"\bharness(?:ing)?\s+the\s+power\b",
    r"\bbeacon\s+of\b",
    r"\bunderpin(?:s|ning|ned)?\b",
    r"\bin\s+summary\b",
    r"\bnot\s+only\s+.*\s+but\s+also\b",
    r"\bit\s+is\s+worth\s+noting\b"
]


def split_sentences(text: str) -> List[str]:
    """Splits text into sentences while respecting common punctuation and abbreviations."""
    raw = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'“])', text.strip())
    sentences = [s.strip() for s in raw if s.strip()]
    if not sentences and text.strip():
        sentences = [text.strip()]
    return sentences


def count_words(text: str) -> List[str]:
    """Extracts alphanumeric words in lowercase."""
    return re.findall(r'\b[a-zA-Z0-9\'-]+\b', text.lower())


def compute_signals(text: str, sentences: List[str], words: List[str]) -> Tuple[EvidenceSignals, float, float]:
    """
    Computes statistical and stylometric signals for AI detection.
    Returns EvidenceSignals, raw_ai_score, and confidence.
    """
    total_words = len(words)
    if total_words == 0:
        return EvidenceSignals(
            burstiness_score=0.5,
            perplexity_proxy=0.5,
            lexical_diversity=0.5,
            sentence_variance=0.0,
            repetition_index=0.0
        ), 0.5, 0.2

    # 1. Sentence length variance & Burstiness
    sentence_lengths = [len(count_words(s)) for s in sentences if count_words(s)]
    if not sentence_lengths:
        sentence_lengths = [total_words]
    
    mean_length = sum(sentence_lengths) / len(sentence_lengths)
    if len(sentence_lengths) > 1:
        variance = sum((l - mean_length) ** 2 for l in sentence_lengths) / (len(sentence_lengths) - 1)
        std_dev = math.sqrt(variance)
        # Coefficient of variation (CV)
        cv = std_dev / (mean_length + 1e-5)
    else:
        variance = 0.0
        std_dev = 0.0
        cv = 0.1  # Low variation if single sentence

    # Burstiness score: higher means more varied (more human-like)
    # Scaled to 0.0 (very uniform, AI-like) to 1.0 (very bursty, human-like)
    burstiness_score = min(1.0, max(0.05, cv / 0.85))

    # 2. Lexical Diversity (Type-Token Ratio adjusted for length)
    unique_words = set(words)
    raw_ttr = len(unique_words) / total_words
    # Root TTR (Guiraud's index normalized)
    guiraud = len(unique_words) / math.sqrt(total_words)
    # Human text usually has higher idiosyncratic vocabulary breadth
    lexical_diversity = min(1.0, max(0.1, guiraud / 9.0))

    # 3. Perplexity Proxy / AI transition marker density
    marker_matches = 0
    for pattern in AI_MARKER_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        marker_matches += len(matches)

    marker_density = (marker_matches / total_words) * 100
    # Lower perplexity proxy indicates text matches common LLM template outputs
    # 0.0 = highly formulaic, 1.0 = highly original / idiosyncratic
    perplexity_proxy = max(0.05, min(1.0, 1.0 - (marker_density / 3.0)))

    # 4. Structural Repetition
    # Check for sentence beginnings uniformity
    first_words = []
    for s in sentences:
        sw = count_words(s)
        if sw:
            first_words.append(sw[0])
    
    if len(first_words) > 1:
        anaphora_count = len(first_words) - len(set(first_words))
        anaphora_ratio = anaphora_count / len(first_words)
    else:
        anaphora_ratio = 0.0

    # N-gram repetition
    trigrams = [tuple(words[i:i+3]) for i in range(len(words)-2)]
    trigram_rep = (len(trigrams) - len(set(trigrams))) / (len(trigrams) + 1e-5) if trigrams else 0.0
    repetition_index = min(1.0, max(0.0, (anaphora_ratio * 0.6) + (trigram_rep * 0.4)))

    signals = EvidenceSignals(
        burstiness_score=round(burstiness_score, 3),
        perplexity_proxy=round(perplexity_proxy, 3),
        lexical_diversity=round(lexical_diversity, 3),
        sentence_variance=round(std_dev, 2),
        repetition_index=round(repetition_index, 3)
    )

    # Statistical Ensemble & Probability Calculation
    # AI characteristics: low burstiness, low perplexity proxy, high repetition, moderate-to-low lexical diversity
    ai_burstiness_indicator = 1.0 - burstiness_score
    ai_perplexity_indicator = 1.0 - perplexity_proxy
    ai_repetition_indicator = repetition_index
    ai_lexical_indicator = 1.0 - lexical_diversity

    raw_ai_prob = (
        ai_burstiness_indicator * 0.38 +
        ai_perplexity_indicator * 0.32 +
        ai_repetition_indicator * 0.15 +
        ai_lexical_indicator * 0.15
    )

    # Calibrate probability using a sigmoid transform
    # z = (x - center) * slope
    z = (raw_ai_prob - 0.45) * 6.5
    calibrated_prob = 1.0 / (1.0 + math.exp(-z))
    calibrated_prob = max(0.02, min(0.98, calibrated_prob))

    # Confidence calculation:
    # 1) Length factor: confidence increases with text length up to ~150 words
    length_confidence = min(1.0, total_words / 120.0)
    # 2) Distance from decision boundary: scores near 0.50 are inherently more uncertain
    certainty_factor = abs(calibrated_prob - 0.50) * 2.0
    confidence = (length_confidence * 0.55) + (certainty_factor * 0.45)
    confidence = max(0.20, min(0.96, confidence))

    return signals, calibrated_prob, confidence


def analyze_sentences(sentences: List[str]) -> List[SentenceSignal]:
    """Computes segment-by-segment suspiciousness for highlighted display."""
    sentence_signals = []
    
    for i, s in enumerate(sentences):
        words = count_words(s)
        word_count = len(words)
        if word_count < 3:
            sentence_signals.append(
                SentenceSignal(
                    index=i,
                    text=s,
                    ai_probability=0.20,
                    suspicion_level="low",
                    perplexity_indicator=0.8
                )
            )
            continue

        # Check local markers
        local_markers = sum(len(re.findall(p, s, re.IGNORECASE)) for p in AI_MARKER_PATTERNS)
        
        # Word length regularity
        avg_wlen = sum(len(w) for w in words) / word_count
        
        # Sentence probability score
        s_prob = 0.35
        if local_markers > 0:
            s_prob += 0.35 * local_markers
        if 16 <= word_count <= 26:  # Typical uniform LLM sentence length
            s_prob += 0.15
        elif word_count < 8 or word_count > 35:  # Human sentence extremes
            s_prob -= 0.15

        s_prob = max(0.05, min(0.95, s_prob))

        if s_prob >= 0.70:
            suspicion = "high"
        elif s_prob >= 0.45:
            suspicion = "medium"
        else:
            suspicion = "low"

        sentence_signals.append(
            SentenceSignal(
                index=i,
                text=s,
                ai_probability=round(s_prob, 3),
                suspicion_level=suspicion,
                perplexity_indicator=round(1.0 - s_prob, 3)
            )
        )

    return sentence_signals


class DetectorService:
    @staticmethod
    def detect(text: str) -> DetectResponse:
        # Input validation
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
        signals, ai_prob, confidence = compute_signals(text, sentences, words)
        sentence_analysis = analyze_sentences(sentences)

        # Classification decision based on calibrated probability & confidence
        # Follows ML/AI Spec: "Never claim authorship certainty. Uncertainty is a valid result."
        if confidence < 0.45 or (0.40 <= ai_prob <= 0.60):
            classification = "Uncertain / Mixed"
            is_uncertain = True
            evaluation_summary = (
                f"The text exhibits mixed stylometric characteristics (AI probability: {int(ai_prob*100)}%). "
                "Syntactic variation and vocabulary markers fall within ambiguous bounds. "
                "This often occurs in edited AI content, formal technical documentation, or concise human drafts."
            )
        elif ai_prob >= 0.60:
            classification = "Likely AI-Generated"
            is_uncertain = False
            evaluation_summary = (
                f"The text displays structural patterns and rhythmic regularities characteristic of machine-generated prose "
                f"(AI probability: {int(ai_prob*100)}%, confidence: {int(confidence*100)}%). "
                "Contributing signals include uniform sentence pacing, predictable transitional phrasing, or recurring syntactic templates."
            )
        else:
            classification = "Likely Human"
            is_uncertain = False
            evaluation_summary = (
                f"The text exhibits high syntactic variation and vocabulary breadth typical of human authorship "
                f"(AI probability: {int(ai_prob*100)}%, confidence: {int(confidence*100)}%). "
                "Strong burstiness across sentence lengths and natural lexical divergence indicate human prose."
            )

        return DetectResponse(
            classification=classification,
            ai_probability=round(ai_prob, 3),
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
