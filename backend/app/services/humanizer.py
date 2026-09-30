import re
import math
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Optional
from app.core.config import settings
from app.core.errors import TextTooShortException, TextTooLargeException
from app.models.humanize import HumanizeRequest, HumanizeResponse, HumanizeStyle
from app.services.diff_engine import compute_text_diff

CLICHE_REPLACEMENTS: Dict[str, Dict[str, str]] = {
    "natural": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "explore",
        r"\btapestry(?:\s+of)?\b": "blend of",
        r"\btestament\s+to\b": "clear evidence of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "notably,",
        r"\bit\s+is\s+important\s+to\s+remember\s+that\b": "keep in mind that",
        r"\bit\s+is\s+worth\s+noting\s+that\b": "worth remembering,",
        r"\bin\s+conclusion\b": "ultimately",
        r"\bin\s+summary\b": "all told",
        r"\bfurthermore\b": "what's more,",
        r"\bmoreover\b": "in addition,",
        r"\badditionally\b": "also,",
        r"\bplays\s+a\s+(?:vital|crucial|pivotal|key)\s+role\s+in\b": "is essential for",
        r"\bnavigat(?:e|ing)\s+the\s+complexit(?:y|ies)\s+of\b": "handling the nuances of",
        r"\bmultifaceted\b": "layered",
        r"\bseamlessly\b": "naturally",
        r"\bharness(?:ing)?\s+the\s+power\s+of\b": "leveraging",
        r"\bbeacon\s+of\b": "standard for",
        r"\bunderpin(?:s|ning|ned)?\b": "supports",
        r"\bin\s+today'?s\s+fast-paced\s+world\b": "today",
        r"\ba\s+myriad\s+of\b": "numerous",
        r"\bstands\s+as\s+a\b": "remains a",
        r"\bserves\s+as\s+a\b": "acts as a"
    },
    "academic": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "examine",
        r"\btapestry(?:\s+of)?\b": "matrix of",
        r"\btestament\s+to\b": "demonstration of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "significantly,",
        r"\bin\s+conclusion\b": "in conclusion",
        r"\bfurthermore\b": "moreover,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "substantially influences",
        r"\bnavigat(?:e|ing)\s+the\s+complexities\s+of\b": "addressing the analytical challenges of",
        r"\bseamlessly\b": "cohesively",
        r"\bharnessing\b": "utilizing",
        r"\bshows\b": "demonstrates",
        r"\bproves\b": "substantiates"
    },
    "professional": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "address",
        r"\btapestry(?:\s+of)?\b": "ecosystem of",
        r"\btestament\s+to\b": "reflection of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "key point:",
        r"\bin\s+conclusion\b": "bottom line:",
        r"\bfurthermore\b": "additionally,",
        r"\bmoreover\b": "also,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "directly impacts",
        r"\bnavigat(?:e|ing)\s+the\s+complexities\s+of\b": "managing",
        r"\bmultifaceted\b": "comprehensive",
        r"\bseamlessly\b": "efficiently",
        r"\ba\s+lot\s+of\b": "substantial"
    },
    "simple": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "look into",
        r"\btapestry(?:\s+of)?\b": "mix of",
        r"\btestament\s+to\b": "proof of",
        r"\bit\s+is\s+important\s+to\s+(?:remember|note)\s+that\b": "remember,",
        r"\bin\s+conclusion\b": "finally,",
        r"\bfurthermore\b": "also,",
        r"\bmoreover\b": "plus,",
        r"\bplays\s+a\s+(?:vital|crucial|pivotal|key)\s+role\s+in\b": "is very important for",
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
        r"\btapestry(?:\s+of)?\b": "blend of",
        r"\btestament\s+to\b": "shoutout to",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "by the way,",
        r"\bin\s+conclusion\b": "so at the end of the day,",
        r"\bfurthermore\b": "and besides,",
        r"\bmoreover\b": "plus,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "matters a lot for",
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
        r"\btapestry(?:\s+of)?\b": "rich texture of",
        r"\btestament\s+to\b": "hallmark of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "notably,",
        r"\bin\s+conclusion\b": "in the end,",
        r"\bfurthermore\b": "beyond that,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "is vital for",
        r"\bseamlessly\b": "effortlessly"
    },
    "executive": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "target",
        r"\btapestry(?:\s+of)?\b": "portfolio of",
        r"\btestament\s+to\b": "validation of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "critical priority:",
        r"\bin\s+conclusion\b": "strategic takeaway:",
        r"\bfurthermore\b": "in addition,",
        r"\bplays\s+a\s+(?:vital|crucial|pivotal|key)\s+role\s+in\b": "drives",
        r"\bnavigat(?:e|ing)\s+the\s+complexit(?:y|ies)\s+of\b": "executing through",
        r"\bmultifaceted\b": "cross-functional",
        r"\bseamlessly\b": "efficiently",
        r"\bharness(?:ing)?\s+the\s+power\s+of\b": "capitalizing on"
    },
    "creative": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "wander into",
        r"\btapestry(?:\s+of)?\b": "mosaic of",
        r"\btestament\s+to\b": "monument to",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "noticeably,",
        r"\bin\s+conclusion\b": "at the close of it all,",
        r"\bfurthermore\b": "what is more,",
        r"\bmoreover\b": "and still,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "breathes life into",
        r"\bnavigating\b": "steering through",
        r"\bseamlessly\b": "like second nature",
        r"\bintricate\b": "delicate"
    },
    "journalistic": {
        r"\bdelve(?:s|d|ing)?\s+into\b": "investigate",
        r"\btapestry(?:\s+of)?\b": "spectrum of",
        r"\btestament\s+to\b": "evidence of",
        r"\bit\s+is\s+important\s+to\s+note\s+that\b": "notably,",
        r"\bin\s+conclusion\b": "the central outcome is that",
        r"\bfurthermore\b": "meanwhile,",
        r"\bmoreover\b": "additionally,",
        r"\bplays\s+a\s+crucial\s+role\s+in\b": "serves as a primary catalyst for",
        r"\bnavigating\b": "addressing",
        r"\bseamlessly\b": "smoothly"
    }
}


def calculate_flesch_reading_ease(text: str) -> float:
    words = re.findall(r"\b[a-zA-Z]+\b", text)
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    if not words or not sentences:
        return 65.0

    def count_syllables(w: str) -> int:
        w = w.lower()
        cnt = len(re.findall(r"[aeiouy]+", w))
        if w.endswith("e") and not w.endswith("le") and len(w) > 2:
            cnt = max(1, cnt - 1)
        return max(1, cnt)

    total_words = len(words)
    total_sentences = len(sentences)
    total_syllables = sum(count_syllables(w) for w in words)

    score = 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
    return round(max(0.0, min(100.0, score)), 1)


def calculate_meaning_preservation(original: str, revised: str) -> float:
    orig_words = set(re.findall(r"\b[a-zA-Z0-9'-]{3,}\b", original.lower()))
    rev_words = set(re.findall(r"\b[a-zA-Z0-9'-]{3,}\b", revised.lower()))

    # Preserved numbers and proper nouns
    orig_entities = set(re.findall(r"\b(?:[0-9]+|[A-Z][a-z]+)\b", original))
    rev_entities = set(re.findall(r"\b(?:[0-9]+|[A-Z][a-z]+)\b", revised))

    entity_recall = (
        len(orig_entities.intersection(rev_entities)) / len(orig_entities)
        if orig_entities
        else 1.0
    )

    jaccard = (
        len(orig_words.intersection(rev_words)) / len(orig_words.union(rev_words))
        if orig_words
        else 1.0
    )

    score = (entity_recall * 0.55) + (min(1.0, jaccard * 1.55) * 0.45)
    return round(min(0.99, max(0.70, score)), 3)


def rewrite_text_by_style(text: str, style: HumanizeStyle, custom_instructions: Optional[str] = None) -> str:
    style_key = style.value if style.value in CLICHE_REPLACEMENTS else "natural"
    replacements = CLICHE_REPLACEMENTS.get(style_key, CLICHE_REPLACEMENTS["natural"])

    rewritten = text
    for pattern, repl in replacements.items():
        rewritten = re.sub(pattern, repl, rewritten, flags=re.IGNORECASE)

    # Sentence segmentation and cadence adjustment
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'“])', rewritten.strip())
    transformed: List[str] = []

    for i, s in enumerate(sentences):
        st = s.strip()
        if not st:
            continue

        # Capitalize leading character
        st = st[0].upper() + st[1:] if len(st) > 1 else st.upper()

        if style == HumanizeStyle.CASUAL:
            if i == 0 and len(st) > 40 and not st.lower().startswith(("here's", "honestly")):
                st = st.replace("This is", "Here's")
        elif style == HumanizeStyle.SIMPLE:
            st = re.sub(r"\bin\s+order\s+to\b", "to", st, flags=re.IGNORECASE)
            st = re.sub(r"\bdue\s+to\s+the\s+fact\s+that\b", "because", st, flags=re.IGNORECASE)
            st = re.sub(r"\bat\s+the\s+present\s+time\b", "now", st, flags=re.IGNORECASE)
        elif style == HumanizeStyle.PROFESSIONAL:
            st = re.sub(r"\ba\s+lot\s+of\b", "substantial", st, flags=re.IGNORECASE)
            st = re.sub(r"\blook\s+at\b", "evaluate", st, flags=re.IGNORECASE)
        elif style == HumanizeStyle.ACADEMIC:
            st = re.sub(r"\bshows\b", "demonstrates", st, flags=re.IGNORECASE)
            st = re.sub(r"\bproves\b", "substantiates", st, flags=re.IGNORECASE)

        transformed.append(st)

    result = " ".join(transformed)
    result = re.sub(r"\s+", " ", result)
    result = re.sub(r"\s+([,.;!?])", r"\1", result)
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

        words = re.findall(r"\b[a-zA-Z0-9'-]+\b", text)
        if len(words) < settings.MIN_TEXT_WORDS:
            raise TextTooShortException(current_words=len(words), min_words=settings.MIN_TEXT_WORDS)

        rewritten = rewrite_text_by_style(text, request.style, request.custom_instructions)
        diff_spans, stats = compute_text_diff(text, rewritten)

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
