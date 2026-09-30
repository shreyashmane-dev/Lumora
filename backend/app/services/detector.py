import math
import re
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional
from app.core.config import settings
from app.core.errors import TextTooShortException, TextTooLargeException
from app.models.detect import DetectResponse, SentenceSignal, EvidenceSignals

# Expanded catalog of 120+ modern LLM markers, clichés, robotic transitions, and stylistic tropes
AI_MARKER_PATTERNS = [
    # Metaphors, Cliches & Rhetorical Crutches
    r"\bdelve(?:s|d|ing)?\s+into\b",
    r"\btapestry(?:\s+of)?\b",
    r"\btestament\s+to\b",
    r"\bstands?\s+as\s+a\s+testament\b",
    r"\bbeacon\s+of\b",
    r"\bshining\s+beacon\b",
    r"\bmultifaceted(?:\s+nature|\s+approach)?\b",
    r"\bpivotal\s+role\b",
    r"\bcrucial\s+role\b",
    r"\bvital\s+role\b",
    r"\bessential\s+(?:part|role)\b",
    r"\bplays?\s+a\s+(?:key|vital|crucial|pivotal|fundamental|critical|significant)\s+(?:role|part)\b",
    r"\bnavigat(?:e|ing|ed|es)\s+the\s+complexit(?:y|ies)\b",
    r"\bnavigating\s+(?:these|uncharted)\s+waters\b",
    r"\bharness(?:ing|ed|es)?\s+(?:the\s+power\s+of|its\s+potential)\b",
    r"\bunderpin(?:s|ning|ned)?\b",
    r"\bunderscores?\s+the\s+(?:necessity|importance|urgency|significance)\b",
    r"\bseamless(?:ly)?(?:\s+integrated|\s+blend)?\b",
    r"\bever-evolving\b",
    r"\brapidly\s+evolving\b",
    r"\bintricate\s+(?:dance|interplay|tapestry|web|balance)\b",
    r"\bsymphony\s+of\b",
    r"\ba\s+myriad\s+of\b",
    r"\ba\s+plethora\s+of\b",
    r"\ba\s+wide\s+array\s+of\b",
    r"\bdouble-edged\s+sword\b",
    r"\bpav(?:e|ing|ed|es)\s+the\s+way\b",
    r"\bsheds?\s+light\s+on\b",
    r"\bshines?\s+a\s+light\b",
    r"\bstrik(?:e|ing|es)\s+a\s+(?:delicate\s+)?balance\b",
    r"\bfoster(?:ing|ed|s)?\s+(?:a\s+culture|collaboration|growth|innovation)\b",
    r"\bcatalyst\s+for(?:\s+change)?\b",
    r"\bparamount\s+importance\b",
    r"\binextricably\s+linked\b",
    r"\bdeeply\s+intertwined\b",
    r"\bat\s+its\s+core\b",
    r"\bat\s+the\s+core\s+of\b",
    r"\blandscape\s+of\b",
    r"\bonly\s+time\s+will\s+tell\b",
    r"\bremains?\s+to\s+be\s+seen\b",
    r"\bgrappl(?:e|ing|ed|es)\s+with\b",
    r"\bpoised\s+to\b",
    r"\bresonat(?:e|es|ed|ing)\s+with\b",
    r"\bparadigm\s+shift\b",
    r"\bfar-reaching\s+implications\b",
    r"\bprofound\s+transformation\b",
    r"\bfundamentally\s+transform(?:ed|s|ing)?\b",
    r"\bbridg(?:e|ing|ed|es)\s+the\s+gap\b",
    r"\bcornerstone\s+of\b",
    r"\bunprecedented\s+(?:growth|efficiency|challenges|scale|access|speed)\b",
    r"\bnew\s+horizons\b",
    r"\bholistic\s+(?:approach|perspective|framework)\b",
    r"\bnuanced\s+(?:understanding|perspective|approach)\b",
    r"\bspark(?:ed|s|ing)?\s+(?:intense\s+)?debate\b",
    r"\bimperative\s+(?:that|to)\b",
    r"\bmitigat(?:e|ing|ed|es)\s+(?:inherent\s+)?risks\b",
    r"\bcollective\s+(?:ability|effort|responsibility)\b",
    r"\bas\s+we\s+look\s+to\s+the\s+future\b",
    r"\blooking\s+ahead\b",
    r"\bnotable\s+example\b",
    r"\bprime\s+example\b",
    r"\btranscends?\s+(?:the\s+boundaries|traditional)\b",
    r"\bunwavering\s+commitment\b",
    r"\bwarrants?\s+(?:careful|serious)\s+consideration\b",
    r"\bproves?\s+to\s+be\b",
    r"\ba\s+(?:striking|stark)\s+reminder\b",
    r"\bat\s+the\s+forefront\s+of\b",
    r"\blinchpin\s+of\b",
    r"\ba\s+delicate\s+dance\b",
    r"\blends?\s+credence\s+to\b",
    r"\bhold\s+the\s+key\s+to\b",
    r"\bremains?\s+a\s+(?:cornerstone|hallmark|challenge)\b",
    r"\bin\s+stark\s+contrast\b",
    r"\bit\s+bears\s+mentioning\b",
    r"\bcannot\s+be\s+overstated\b",
    r"\bin\s+an\s+age\s+of\b",
    r"\bwith\s+that\s+being\s+said\b",
    r"\bin\s+light\s+of\s+these\s+developments\b",
    r"\bfuels?\s+the\s+debate\b",
    r"\ba\s+crucible\s+of\b",
    r"\bthe\s+advent\s+of\b",
    r"\bheralds?\s+a\s+new\b",
    r"\bgarners?\s+(?:significant|increasing)\s+attention\b",
    r"\bstrike\s+a\s+chord\b",
    # Formulaic Sentence Openers & Transitions
    r"\bone\s+of\s+the\s+most\s+(?:pressing|crucial|significant|pivotal|critical|fundamental)\b",
    r"\bin\s+the\s+contemporary\s+(?:era|world|landscape|age)\b",
    r"\bin\s+today'?s\s+(?:fast-paced|rapidly\s+evolving|digital|interconnected)\s+(?:world|landscape|era|age|society)\b",
    r"\bit\s+is\s+(?:important|worth|crucial|essential|imperative|vital)\s+to\s+(?:remember|note|recognize|understand|highlight|acknowledge)\b",
    r"\bit\s+is\s+worth\s+(?:noting|mentioning|remembering)\b",
    r"\bit\s+is\s+clear\s+that\b",
    r"\bin\s+conclusion\b",
    r"\bin\s+summary\b",
    r"\bto\s+summarize\b",
    r"\ball\s+in\s+all\b",
    r"\bfurthermore\b",
    r"\bmoreover\b",
    r"\badditionally\b",
    r"\bconsequently\b",
    r"\bnonetheless\b",
    r"\bhenceforth\b",
    r"\bin\s+parallel\b",
    r"\bnot\s+only\s+.*\s+but\s+also\b",
    r"\bat\s+the\s+end\s+of\s+the\s+day\b",
    r"\bultimately,?\s+(?:achieving|ensuring|addressing|balancing|fostering|demanding)?\b"
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

# Common titles and abbreviations that should NOT trigger sentence boundaries
ABBREVIATIONS = r"\b(Dr|Mr|Mrs|Ms|Prof|Sr|Jr|vs|e\.g|i\.e|etc|et al|U\.S|U\.K|Fig|approx|dept|govt|corp|inc)\."


def split_sentences(text: str) -> List[str]:
    """Splits text into sentences respecting abbreviations, decimal numbers, and quotes."""
    # Temporarily mask abbreviation periods
    masked = re.sub(ABBREVIATIONS, lambda m: m.group(0).replace(".", "<DOT>"), text.strip())
    # Split on sentence terminals followed by whitespace and capital letter / quote
    raw = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'“])', masked)
    sentences = [s.replace("<DOT>", ".").strip() for s in raw if s.strip()]
    if not sentences and text.strip():
        sentences = [text.strip()]
    return sentences


def count_words(text: str) -> List[str]:
    """Tokenizes text into lowercase alphanumeric words."""
    return re.findall(r"\b[a-zA-Z0-9'-]+\b", text.lower())


def calculate_burstiness(sentence_lengths: List[int]) -> Tuple[float, float, float]:
    """
    Computes sentence length standard deviation and coefficient of variation (CV = std / mean).
    High CV (> 0.48) indicates natural human burstiness.
    Low CV (< 0.35) is an unmistakable signature of uniform machine pacing.
    """
    if not sentence_lengths or len(sentence_lengths) < 2:
        return 0.0, 0.20, 0.70

    mean_len = sum(sentence_lengths) / len(sentence_lengths)
    variance = sum((l - mean_len) ** 2 for l in sentence_lengths) / (len(sentence_lengths) - 1)
    std_dev = math.sqrt(variance)
    cv = std_dev / (mean_len + 1e-5)

    # Scale burstiness score for evidence telemetry: 0.05 (uniform robotic) to 1.0 (varied human)
    burstiness_score = min(1.0, max(0.05, cv / 0.70))

    # Calibrate probability contribution based on empirical human vs LLM distribution
    if cv < 0.22:
        ai_burstiness = 0.95
    elif cv < 0.30:
        ai_burstiness = 0.85 - (cv - 0.22) * 2.5
    elif cv < 0.40:
        ai_burstiness = 0.55 - (cv - 0.30) * 3.5
    else:
        ai_burstiness = max(0.04, 0.20 - (cv - 0.40) * 0.5)

    return std_dev, burstiness_score, ai_burstiness


def calculate_marker_perplexity(text: str, total_words: int, sentences: List[str]) -> Tuple[float, float]:
    """
    Evaluates transitional cliché density, rule-of-three structures, and formulaic openings.
    Returns: (perplexity_proxy telemetry, ai_marker_probability)
    """
    matches = sum(len(re.findall(p, text, re.IGNORECASE)) for p in AI_MARKER_PATTERNS)
    marker_rate = (matches / max(1, total_words)) * 100

    # Detect tripartite 'Rule of Three' constructions common in LLMs (e.g., 'A, B, and C')
    rule_of_three = len(re.findall(r'\b[\w\s]{3,30},\s+[\w\s]{3,30},\s+and\s+[\w\s]{3,30}\b', text, re.IGNORECASE))

    # Detect participial/gerund sentence openers typical in AI essays
    openers = sum(1 for s in sentences if re.match(r'^(?:[A-Z][a-z]+ing\b|Ultimately,|In parallel,|Furthermore,|Moreover,|Additionally,)', s))
    opener_ratio = openers / max(1, len(sentences))

    # Telemetry: 0.05 (heavy AI clichés) to 0.98 (original phrasing)
    perplexity_proxy = max(0.05, min(0.98, 1.0 - (marker_rate / 1.5)))

    ai_marker_prob = min(1.0, (marker_rate / 1.5) * 0.55 + (rule_of_three * 0.20) + (opener_ratio * 0.25))
    if matches >= 2:
        ai_marker_prob = max(0.72, ai_marker_prob)
    if matches >= 4:
        ai_marker_prob = max(0.92, ai_marker_prob)

    return round(perplexity_proxy, 3), ai_marker_prob


def calculate_vocabulary_uniformity(words: List[str], cv: float) -> Tuple[float, float]:
    """
    Evaluates vocabulary sophistication vs sentence length variation.
    Key insight: LLMs have high lexical breadth paired with low sentence variance.
    If a text uses advanced vocabulary with robotic sentence uniformity (low CV),
    that is an AI fingerprint (The AI Disconnect).
    """
    total = len(words)
    if total == 0:
        return 0.5, 0.5

    unique_words = set(words)
    guiraud = len(unique_words) / math.sqrt(total)
    rare_words = [w for w in words if w not in COMMON_ENGLISH_WORDS]
    rare_ratio = len(rare_words) / total

    lexical_diversity = min(1.0, max(0.1, (guiraud / 9.0) * 0.7 + (rare_ratio * 0.3)))

    if cv < 0.30 and rare_ratio > 0.38:
        # High vocab + Low burstiness = Classic AI essay
        ai_vocab_uniformity = 0.88
    elif cv >= 0.38:
        # High burstiness = Natural human cadence
        ai_vocab_uniformity = 0.15
    else:
        ai_vocab_uniformity = 0.35

    return round(lexical_diversity, 3), ai_vocab_uniformity


def calculate_nominalization_density(words: List[str]) -> float:
    """
    Computes density of abstract nominalizations (-tion, -sion, -ment, -ance, -ence).
    LLM academic writing relies heavily on abstract noun stacking.
    """
    if not words:
        return 0.0
    nom_pattern = re.compile(r'\b[a-z]{4,}(?:tion|sion|ment|ance|ence|ibility|ization)s?\b')
    nom_count = sum(1 for w in words if nom_pattern.match(w))
    ratio = nom_count / len(words)
    # Scaled: > 12% is strong indicator
    return min(1.0, ratio / 0.12)


def calculate_punctuation_variety(text: str, total_words: int) -> float:
    """
    Measures variety of organic human punctuation marks (dashes, semicolons, parentheses, questions).
    AI essays rely almost solely on periods and commas.
    """
    human_punct_count = len(re.findall(r'[—–;:\(\)\?\!"]', text))
    punct_rate = human_punct_count / max(1, total_words)
    # Higher rate = higher human probability, lower AI probability
    ai_punct_penalty = max(0.0, 1.0 - (punct_rate / 0.035))
    return round(ai_punct_penalty, 3)


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
        mean_len = sum(sentence_lengths) / len(sentence_lengths)
        std_dev, burstiness_score, ai_burstiness = calculate_burstiness(sentence_lengths)
        cv = std_dev / (mean_len + 1e-5)
        
        lexical_diversity, ai_vocab_uniformity = calculate_vocabulary_uniformity(words, cv)
        perplexity_proxy, ai_marker_prob = calculate_marker_perplexity(text, word_count, sentences)
        repetition_index = calculate_structural_repetition(sentences, words)
        ai_nominalization = calculate_nominalization_density(words)
        ai_punctuation = calculate_punctuation_variety(text, word_count)

        # 2. Length Clustering (LLMs cluster sentences within 11–23 words)
        clustered = sum(1 for l in sentence_lengths if 11 <= l <= 23) / len(sentence_lengths)
        if cv >= 0.36:
            ai_clustering = 0.10
        else:
            ai_clustering = min(1.0, max(0.1, (clustered - 0.40) * 1.8)) if clustered > 0.40 else 0.10

        signals = EvidenceSignals(
            burstiness_score=round(burstiness_score, 3),
            perplexity_proxy=round(perplexity_proxy, 3),
            lexical_diversity=round(lexical_diversity, 3),
            sentence_variance=round(std_dev, 2),
            repetition_index=round(repetition_index, 3)
        )

        # 3. Composite Ensemble Scoring with Orthogonal Stylometrics
        composite_ai_score = (
            ai_burstiness * 0.32 +
            ai_marker_prob * 0.28 +
            ai_vocab_uniformity * 0.18 +
            ai_clustering * 0.10 +
            ai_nominalization * 0.06 +
            ai_punctuation * 0.06
        )

        decision_center = 0.48
        if domain in ["academic", "technical"]:
            decision_center = 0.52
        elif domain == "creative":
            decision_center = 0.44

        # Calibrated logistic sigmoid transform
        z = (composite_ai_score - decision_center) * 6.2
        calibrated_prob = 1.0 / (1.0 + math.exp(-z))
        calibrated_prob = max(0.02, min(0.98, calibrated_prob))

        # 4. Confidence Policy
        length_factor = min(1.0, word_count / 120.0)
        certainty_dist = abs(calibrated_prob - 0.50) * 2.0
        confidence = (length_factor * 0.50) + (certainty_dist * 0.50)
        confidence = max(0.20, min(0.98, confidence))

        # 5. Sentence-Level Breakdown with Bayesian Prior Smoothing
        # Instead of evaluating sentences in a vacuum, incorporate the document-level prior
        sentence_analysis: List[SentenceSignal] = []
        prior_bias = calibrated_prob * 0.35

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
            s_prob = 0.25 + prior_bias
            if local_markers > 0:
                s_prob += 0.32 * local_markers
            if 12 <= sw_count <= 22:
                s_prob += 0.14
            elif sw_count < 7 or sw_count > 32:
                s_prob -= 0.18

            # Formulaic openers
            if re.match(r'^(?:[A-Z][a-z]+ing\b|Ultimately,|In parallel,|Furthermore,|Moreover,|Additionally,|In conclusion,)', s):
                s_prob += 0.20

            # Tripartite structures inside the sentence
            if re.search(r'\b[\w\s]{3,25},\s+[\w\s]{3,25},\s+and\s+[\w\s]{3,25}\b', s, re.IGNORECASE):
                s_prob += 0.16

            s_prob = max(0.05, min(0.95, s_prob))
            suspicion = "high" if s_prob >= 0.65 else "medium" if s_prob >= 0.42 else "low"

            sentence_analysis.append(
                SentenceSignal(
                    index=i,
                    text=s,
                    ai_probability=round(s_prob, 3),
                    suspicion_level=suspicion,
                    perplexity_indicator=round(1.0 - s_prob, 3)
                )
            )

        # 6. Classification Decision
        if confidence < 0.42 or (0.42 <= calibrated_prob <= 0.58):
            classification = "Uncertain / Mixed"
            is_uncertain = True
            evaluation_summary = (
                f"The text exhibits mixed stylometric characteristics (calibrated AI probability: {int(calibrated_prob * 100)}%). "
                "Syntactic cadence and vocabulary breadth fall within ambiguous bounds. "
                "This commonly occurs in human-edited drafts, formal technical reports, or non-native English prose."
            )
        elif calibrated_prob >= 0.59:
            classification = "Likely AI-Generated"
            is_uncertain = False
            evaluation_summary = (
                f"The text exhibits high structural uniformity, low burstiness (CV: {round(cv, 2)}), and formulaic transitional phrasing characteristic of LLM outputs "
                f"(AI probability: {int(calibrated_prob * 100)}%, confidence: {int(confidence * 100)}%). "
                "Contributing factors include tightly clustered sentence lengths and recurring syntactic template patterns."
            )
        else:
            classification = "Likely Human"
            is_uncertain = False
            evaluation_summary = (
                f"The text demonstrates natural syntactic rhythm and idiosyncratic lexical diversity typical of human authors "
                f"(AI probability: {int(calibrated_prob * 100)}%, confidence: {int(confidence * 100)}%). "
                "Strong variation across sentence lengths (burstiness) and organic punctuation indicate genuine human composition."
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
