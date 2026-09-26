import pytest
from app.services.analyzer import AnalyzerService


def test_analyzer_generates_complete_profile():
    sample = (
        "Good writing is about clarity and rhythm. Sometimes you write a short, sharp sentence. "
        "Other times you create an expansive, descriptive journey that invites the reader to step into another world entirely. "
        "Each variation serves an intentional purpose."
    )
    res = AnalyzerService.analyze(sample)
    assert res.word_count > 20
    assert res.sentence_count >= 3
    assert res.type_token_ratio > 0.0
    assert res.burstiness_score > 0.0
    assert res.flesch_reading_ease > 0.0

    # Ensure strict separation of signals vs conclusions as specified in TRD
    assert "objective_signals" in res.signals_vs_conclusions.model_dump()
    assert "interpretive_guidance" in res.signals_vs_conclusions.model_dump()
    assert "burstiness_index" in res.signals_vs_conclusions.objective_signals
    assert "attribution_note" in res.signals_vs_conclusions.interpretive_guidance
