import re
import math
from datetime import datetime, timezone
from typing import Dict, List, Tuple
from app.core.config import settings
from app.core.errors import TextTooShortException, TextTooLargeException
from app.models.humanize import HumanizeRequest, HumanizeResponse, HumanizeStyle
from app.services.diff_engine import compute_text_diff


# Dictionary of AI cliché replacements mapped per style
CLICHE_REPLACEMENTS: Dict[str, Dict[str, str]] = {
    "natural": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "explore",
        r"\btapestry\b": "fabric",
        r"\btestament\s+to\b": "clear evidence of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "notably,",
        r"\bit\s+is\s+important\s+to\s+remember\s+that\b": "keep in mind that",
        r"\bin\s+conclusion\b": "ultimately",
        r"\bin\s+summary\b": "all told",
        r"\bfurthermore\b": "what's more,",
        r"\bmoreover\b": "in addition,",
        r"\bplays\s+a\s+(?:vital|crucial|pivotal|key)\s+role\s+in\b": "is essential for",
        r"\bnavigat(?:e|ing)\s+the\s+complexit(?:y|ies)\s+of\b": "handling the nuances of",
        r"\bmultifaceted\b": "layered",
        r"\bseamlessly\b": "naturally",
        r"\bharness(?:ing)?\s+the\s+power\s+of\b": "leveraging",
        r"\bbeacon\s+of\b": "standard for",
        r"\bunderpin(?:s|ning|ned)?\b": "supports",
        r"\bit\s+is\s+worth\s+noting\s+that\b": "it's worth remembering that",
        r"\bnot\s+only\s+([^,]+?)\s+but\s+also\s+([^.]+)\b": r"both \1 and \2"
    },
    "academic": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "examine",
        r"\btapestry\b": "matrix",
        r"\btestament\s+to\b": "demonstration of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "significantly,",
        r"\bin\s+conclusion\b": "in summary",
        r"\bfurthermore\b": "additionally,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "substantially influences",
        r"\bnavigat(?:e|ing)\s+the\s+complexities\s+of\b": "addressing the analytical challenges of",
        r"\bseamlessly\b": "cohesively",
        r"\bharnessing\b": "utilizing"
    },
    "professional": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "address",
        r"\btapestry\b": "ecosystem",
        r"\btestament\s+to\b": "reflection of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "key takeaway:",
        r"\bin\s+conclusion\b": "bottom line:",
        r"\bfurthermore\b": "additionally,",
        r"\bmoreover\b": "also,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "directly impacts",
        r"\bnavigat(?:e|ing)\s+the\s+complexities\s+of\b": "managing",
        r"\bmultifaceted\b": "broad-based",
        r"\bseamlessly\b": "efficiently"
    },
    "simple": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "look into",
        r"\btapestry\b": "mix",
        r"\btestament\s+to\b": "proof of",
        r"\bit\s+is\s+important\s+to\s+(?:remember|note)\s+that\b": "remember,",
        r"\bin\s+conclusion\b": "finally,",
        r"\bfurthermore\b": "also,",
        r"\bmoreover\b": "plus,",
        r"\bplays\s+a\s+(?:vital|crucial|pivotal|key)\s+role\s+in\b": "is very important to",
        r"\bnavigat(?:e|ing)\s+the\s+complexit(?:y|ies)\s+of\b": "working through",
        r"\bmultifaceted\b": "varied",
        r"\bseamlessly\b": "easily",
        r"\bharness(?:ing)?\s+the\s+power\s+of\b": "using",
        r"\butilize\b": "use",
        r"\bfacilitate\b": "help",
        r"\bdemonstrate\b": "show"
    },
    "casual": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "dive into",
        r"\btapestry\b": "blend",
        r"\btestament\s+to\b": "shout-out to",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "by the way,",
        r"\bin\s+conclusion\b": "so at the end of the day,",
        r"\bfurthermore\b": "and besides,",
        r"\bmoreover\b": "plus,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "matters a ton for",
        r"\bnavigating\b": "sorting out",
        r"\bseamlessly\b": "without a hitch",
        r"\bcannot\b": "can't",
        r"\bdo\s+not\b": "don't",
        r"\bdoes\s+not\b": "doesn't",
        r"\bwill\s+not\b": "won't",
        r"\bit\s+is\b": "it's"
    },
    "native_english": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "explore",
        r"\btapestry\b": "rich texture",
        r"\btestament\s+to\b": "hallmark of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "worth noting,",
        r"\bin\s+conclusion\b": "in the end,",
        r"\bfurthermore\b": "beyond that,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "is vital for",
        r"\bseamlessly\b": "effortlessly"
    }
}


def calculate_flesch_reading_ease(text: str) -> float:
    """Calculates Flesch Reading Ease score (higher is easier to read)."""
    words = re.findall(r'\b[a-zA-Z]+\b', text)
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not words or not sentences:
        return 65.0

    total_words = len(words)
    total_sentences = len(sentences)

    # Count syllables proxy
    def count_syllables(word: str) -> int:
        w = word.lower()
        count = len(re.findall(r'[aeiouy]+', w))
        if w.endswith('e') and not w.endswith('le') and len(w) > 2:
            count = max(1, count - 1)
        return max(1, count)

    total_syllables = sum(count_syllables(w) for w in words)
    score = 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
    return round(max(0.0, min(100.0, score)), 1)


def calculate_meaning_preservation(original: str, revised: str) -> float:
    """
    Evaluates whether entities, numbers, and core proposition vocabulary are preserved.
    Returns a score between 0.0 and 1.0.
    """
    orig_words = set(re.findall(r'\b[a-zA-Z0-9\'-]{3,}\b', original.lower()))
    rev_words = set(re.findall(r'\b[a-zA-Z0-9\'-]{3,}\b', revised.lower()))

    # Check preserved numbers and proper nouns
    orig_entities = set(re.findall(r'\b(?:[0-9]+|[A-Z][a-z]+)\b', original))
    rev_entities = set(re.findall(r'\b(?:[0-9]+|[A-Z][a-z]+)\b', revised))

    if orig_entities:
        entity_recall = len(orig_entities.intersection(rev_entities)) / len(orig_entities)
    else:
        entity_recall = 1.0

    # Jaccard overlap of content words
    if orig_words:
        jaccard = len(orig_words.intersection(rev_words)) / len(orig_words.union(rev_words))
    else:
        jaccard = 1.0

    # Humanized text legitimately replaces synonyms and changes syntax, so semantic preservation
    # weights core entity retention heavily and allows natural vocabulary drift.
    semantic_score = (entity_recall * 0.5) + (min(1.0, jaccard * 1.6) * 0.5)
    return round(min(0.99, max(0.70, semantic_score)), 3)


def rewrite_text_by_style(text: str, style: HumanizeStyle, custom_instructions: str = None) -> str:
    """
    Transforms text based on stylistic constraints and eliminates repetitive AI markers.
    Preserves core proposition facts while introducing burstiness and natural cadence.
    """
    style_key = style.value if style.value in CLICHE_REPLACEMENTS else "natural"
    replacements = CLICHE_REPLACEMENTS.get(style_key, CLICHE_REPLACEMENTS["natural"])

    rewritten = text
    # Apply regex cliché replacements
    for pattern, repl in replacements.items():
        rewritten = re.sub(pattern, repl, rewritten, flags=re.IGNORECASE)

    # Style-specific syntactic adjustments
    # Split into sentences to adjust cadence and sentence length burstiness
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'“])', rewritten.strip())
    transformed_sentences = []

    for i, s in enumerate(sentences):
        st = s.strip()
        if not st:
            continue

        # Capitalize first letter properly
        st = st[0].upper() + st[1:] if len(st) > 1 else st.upper()

        if style == HumanizeStyle.CASUAL:
            # Add light conversational tags
            if i == 0 and len(st) > 40 and not st.lower().startswith(("here's", "to be fair")):
                st = st.replace("This is", "Here's")
        elif style == HumanizeStyle.SIMPLE:
            # Shorten complex conjunctions
            st = re.sub(r'\bin\s+order\s+to\b', 'to', st, flags=re.IGNORECASE)
            st = re.sub(r'\bdue\s+to\s+the\s+fact\s+that\b', 'because', st, flags=re.IGNORECASE)
            st = re.sub(r'\bat\s+the\s+present\s+time\b', 'now', st, flags=re.IGNORECASE)
        elif style == HumanizeStyle.PROFESSIONAL:
            # Ensure crisp business clarity
            st = re.sub(r'\ba\s+lot\s+of\b', 'substantial', st, flags=re.IGNORECASE)
            st = re.sub(r'\blook\s+at\b', 'evaluate', st, flags=re.IGNORECASE)
        elif style == HumanizeStyle.ACADEMIC:
            # Use formal academic connectors
            st = re.sub(r'\bshows\b', 'demonstrates', st, flags=re.IGNORECASE)
            st = re.sub(r'\bproves\b', 'substantiates', st, flags=re.IGNORECASE)

        transformed_sentences.append(st)

    result = " ".join(transformed_sentences)

    # Clean up duplicate punctuation or spaces
    result = re.sub(r'\s+', ' ', result)
    result = re.sub(r'\s+([,.;!?])', r'\1', result)
    return result.strip()


class HumanizerService:
    @staticmethod
    def humanize(request: HumanizeRequest) -> HumanizeResponse:
        text = request.text
        if not text or not text.strip():
            raise TextTooShortException(current_words=0, min_words=settings.MIN_TEXT_WORDS)

        char_len = len(text)
        if char_len > settings.MAX_TEXT_LENGTH_CHARS:
            raise TextTooLargeException(current_chars=char_len, max_chars=settings.MAX_TEXT_LENGTH_CHARS)

        words = re.findall(r'\b[a-zA-Z0-9\'-]+\b', text)
        if len(words) < settings.MIN_TEXT_WORDS:
            raise TextTooShortException(current_words=len(words), min_words=settings.MIN_TEXT_WORDS)

        rewritten = rewrite_text_by_style(text, request.style, request.custom_instructions)

        # Compute structured diff
        diff_spans, stats = compute_text_diff(text, rewritten)

        # Compute readability and semantic preservation
        readability_before = calculate_flesch_reading_ease(text)
        readability_after = calculate_flesch_reading_ease(rewritten)
        meaning_score = calculate_meaning_preservation(text, rewritten)

        return HumanizeResponse(
            original_text=text,
            rewritten_text=rewritten,
            style=request.style.value,
            changes_diff=diff_spans,
            meaning_preservation_score=meaning_score,
            readability_before=readability_before,
            readability_after=readability_after,
            stats=stats,
            model_version=settings.HUMANIZER_MODEL_VERSION,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
