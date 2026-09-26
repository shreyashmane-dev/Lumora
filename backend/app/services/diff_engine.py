import difflib
import re
from typing import List, Tuple
from app.models.humanize import DiffSpan, DiffStats


def tokenize_words(text: str) -> List[str]:
    """Tokenizes text preserving whitespace tokens to enable accurate reconstruction."""
    return re.findall(r'\S+|\s+', text)


def compute_text_diff(original: str, revised: str) -> Tuple[List[DiffSpan], DiffStats]:
    """
    Computes a structured diff between original and revised text.
    Classifies segments into 'equal', 'added', 'removed', or 'modified'.
    """
    orig_tokens = tokenize_words(original)
    rev_tokens = tokenize_words(revised)

    matcher = difflib.SequenceMatcher(None, orig_tokens, rev_tokens)
    diff_spans: List[DiffSpan] = []

    words_added = 0
    words_removed = 0
    words_modified = 0
    words_unchanged = 0

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        orig_chunk = "".join(orig_tokens[i1:i2])
        rev_chunk = "".join(rev_tokens[j1:j2])

        orig_word_count = len(re.findall(r'\b\w+\b', orig_chunk))
        rev_word_count = len(re.findall(r'\b\w+\b', rev_chunk))

        if tag == "equal":
            diff_spans.append(DiffSpan(type="equal", original=orig_chunk, revised=rev_chunk))
            words_unchanged += orig_word_count
        elif tag == "replace":
            diff_spans.append(DiffSpan(type="modified", original=orig_chunk, revised=rev_chunk))
            words_modified += max(orig_word_count, rev_word_count)
        elif tag == "delete":
            diff_spans.append(DiffSpan(type="removed", original=orig_chunk, revised=None))
            words_removed += orig_word_count
        elif tag == "insert":
            diff_spans.append(DiffSpan(type="added", original=None, revised=rev_chunk))
            words_added += rev_word_count

    total_words_original = len(re.findall(r'\b\w+\b', original)) or 1
    similarity_percentage = round(matcher.ratio() * 100, 1)

    stats = DiffStats(
        words_added=words_added,
        words_removed=words_removed,
        words_modified=words_modified,
        words_unchanged=words_unchanged,
        similarity_percentage=similarity_percentage
    )

    return diff_spans, stats
