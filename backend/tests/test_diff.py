from app.services.diff_engine import compute_text_diff


def test_diff_identifies_modifications_and_removals():
    orig = "Furthermore, it is important to remember that this plays a crucial role."
    rev = "Notably, this is essential."

    spans, stats = compute_text_diff(orig, rev)
    assert len(spans) > 0
    assert stats.words_unchanged >= 1
    assert stats.words_removed + stats.words_modified + stats.words_added > 0
    assert 0.0 <= stats.similarity_percentage <= 100.0


def test_diff_handles_identical_text():
    sample = "The quick brown fox jumps over the lazy dog."
    spans, stats = compute_text_diff(sample, sample)
    assert len(spans) == 1
    assert spans[0].type == "equal"
    assert stats.similarity_percentage == 100.0
    assert stats.words_added == 0
    assert stats.words_removed == 0
