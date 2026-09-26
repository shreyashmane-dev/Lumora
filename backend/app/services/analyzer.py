import math
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.core.errors import TextTooShortException, TextTooLargeException
from app.models.analyze import AnalyzeResponse, SignalsVsConclusions


def count_words(text: str) -> List[str]:
    return re.findall(r'\b[a-zA-Z0-9\'-]+\b', text.lower())


def split_sentences(text: str) -> List[str]:
    raw = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'“])', text.strip())
    sentences = [s.strip() for s in raw if s.strip()]
    if not sentences and text.strip():
        sentences = [text.strip()]
    return sentences


def count_syllables(word: str) -> int:
    w = word.lower()
    count = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and not w.endswith('le') and len(w) > 2:
        count = max(1, count - 1)
    return max(1, count)


class AnalyzerService:
    @staticmethod
    def analyze(text: str) -> AnalyzeResponse:
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
        sentence_count = len(sentences)

        # Sentence length stats
        sentence_lengths = [len(count_words(s)) for s in sentences if count_words(s)]
        if not sentence_lengths:
            sentence_lengths = [word_count]

        avg_sentence_len = sum(sentence_lengths) / len(sentence_lengths)
        if len(sentence_lengths) > 1:
            variance = sum((l - avg_sentence_len) ** 2 for l in sentence_lengths) / (len(sentence_lengths) - 1)
            std_dev = math.sqrt(variance)
            cv = std_dev / (avg_sentence_len + 1e-5)
        else:
            variance = 0.0
            std_dev = 0.0
            cv = 0.1

        shortest_s = min(sentence_lengths)
        longest_s = max(sentence_lengths)
        burstiness_score = round(min(1.0, max(0.05, cv / 0.85)), 3)

        # Vocabulary stats
        word_freq: Dict[str, int] = {}
        for w in words:
            word_freq[w] = word_freq.get(w, 0) + 1

        unique_count = len(word_freq)
        ttr = round(unique_count / word_count, 3)

        hapax_count = sum(1 for count in word_freq.values() if count == 1)
        hapax_ratio = round(hapax_count / word_count, 3)

        # Readability stats
        total_syllables = sum(count_syllables(w) for w in words)
        flesch_reading_ease = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (total_syllables / word_count)
        flesch_reading_ease = round(max(0.0, min(100.0, flesch_reading_ease)), 1)

        flesch_kincaid_grade = 0.39 * (word_count / sentence_count) + 11.8 * (total_syllables / word_count) - 15.59
        flesch_kincaid_grade = round(max(1.0, min(20.0, flesch_kincaid_grade)), 1)

        # Structural repetition & Anaphora
        first_words = []
        for s in sentences:
            sw = count_words(s)
            if sw:
                first_words.append(sw[0])

        anaphora_detected = []
        if len(first_words) > 1:
            fw_freq = {}
            for fw in first_words:
                fw_freq[fw] = fw_freq.get(fw, 0) + 1
            for fw, freq in fw_freq.items():
                if freq >= 2:
                    anaphora_detected.append(f"Sentence starter '{fw}' repeated {freq} times")

        trigrams = [tuple(words[i:i+3]) for i in range(len(words)-2)]
        rep_ratio = (len(trigrams) - len(set(trigrams))) / (len(trigrams) + 1e-5) if trigrams else 0.0
        structural_rep_score = round(min(1.0, max(0.0, rep_ratio * 2.5)), 3)

        # Signals vs Conclusions (Strict separation required by API Spec)
        objective_signals = {
            "burstiness_index": burstiness_score,
            "lexical_richness_ttr": ttr,
            "hapax_legomena_ratio": hapax_ratio,
            "structural_repetition_rate": structural_rep_score,
            "flesch_reading_ease": flesch_reading_ease,
            "flesch_kincaid_grade": flesch_kincaid_grade,
            "sentence_length_variance": round(std_dev, 2)
        }

        interpretive_guidance = {
            "sentence_variation": (
                "High sentence length variance reflects diverse human rhythm; low variance indicates uniform machine-like cadence."
                if burstiness_score < 0.35 else
                "Sentence lengths are well-diversified with organic pacing."
            ),
            "vocabulary_diversity": (
                "Vocabulary diversity is moderate to high, showing good lexical range."
                if ttr > 0.45 else
                "Vocabulary exhibits significant repetition or constrained lexical choices."
            ),
            "readability_profile": (
                f"Text is calibrated for approximately Grade {int(flesch_kincaid_grade)} reading level (Flesch score: {flesch_reading_ease})."
            ),
            "attribution_note": (
                "These signals represent statistical stylometrics. They do not constitute deterministic proof of authorship or tool identity."
            )
        }

        return AnalyzeResponse(
            word_count=word_count,
            character_count=char_len,
            sentence_count=sentence_count,
            average_sentence_length=round(avg_sentence_len, 1),
            sentence_length_std_dev=round(std_dev, 2),
            shortest_sentence_length=shortest_s,
            longest_sentence_length=longest_s,
            unique_word_count=unique_count,
            type_token_ratio=ttr,
            hapax_legomena_ratio=hapax_ratio,
            flesch_reading_ease=flesch_reading_ease,
            flesch_kincaid_grade=flesch_kincaid_grade,
            burstiness_score=burstiness_score,
            structural_repetition_score=structural_rep_score,
            anaphora_detected=anaphora_detected,
            signals_vs_conclusions=SignalsVsConclusions(
                objective_signals=objective_signals,
                interpretive_guidance=interpretive_guidance
            ),
            model_version=settings.ANALYZER_MODEL_VERSION,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
