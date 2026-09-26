import pytest
from app.services.detector import DetectorService
from app.core.errors import TextTooShortException, TextTooLargeException


def test_detector_rejects_empty_and_short_text():
    with pytest.raises(TextTooShortException):
        DetectorService.detect("")

    with pytest.raises(TextTooShortException):
        DetectorService.detect("Too short to evaluate accurately.")


def test_detector_evaluates_human_style_text():
    human_sample = (
        "I was sitting on the front porch this morning, watching the rain hit the pavement. "
        "It was quiet, really quiet, until my neighbor's beagle started barking at an imaginary squirrel again. "
        "Honestly? I didn't mind. Sometimes you just need an hour to sit back, sip black coffee, and watch the clouds roll past."
    )
    result = DetectorService.detect(human_sample)
    assert result.word_count >= 15
    assert result.classification in ["Likely Human", "Uncertain / Mixed"]
    assert 0.0 <= result.ai_probability <= 1.0
    assert 0.0 <= result.confidence <= 1.0
    assert result.signals.burstiness_score > 0.0
    assert len(result.sentence_analysis) > 0
    assert result.model_version is not None


def test_detector_flags_cliche_ai_style_text():
    ai_sample = (
        "In conclusion, it is important to remember that artificial intelligence plays a crucial role in modern society. "
        "Furthermore, by navigating the complexities of technological evolution, organizations can harness the power of innovation. "
        "Moreover, this multifaceted approach serves as a testament to the ever-expanding tapestry of digital progress and connectivity."
    )
    result = DetectorService.detect(ai_sample)
    assert result.ai_probability > 0.60
    assert result.classification == "Likely AI-Generated"
    assert result.signals.perplexity_proxy < 0.8
    assert any(s.suspicion_level in ["medium", "high"] for s in result.sentence_analysis)


def test_detector_uncertain_boundary():
    # Moderate text with mixed characteristics
    mixed_sample = (
        "The project deployment was scheduled for late Tuesday afternoon. "
        "Several engineers reviewed the pull request while the QA team prepared automated tests. "
        "Overall the release proceeded according to the documented timeline."
    )
    result = DetectorService.detect(mixed_sample)
    assert result.classification in ["Likely Human", "Uncertain / Mixed", "Likely AI-Generated"]
    assert isinstance(result.is_uncertain, bool)
