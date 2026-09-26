import pytest
from app.services.humanizer import HumanizerService
from app.models.humanize import HumanizeRequest, HumanizeStyle


def test_humanizer_rewrites_ai_markers():
    text = (
        "Furthermore, it is important to remember that this multifaceted strategy plays a crucial role "
        "in navigating the complexities of modern engineering. In conclusion, it serves as a testament to progress."
    )
    req = HumanizeRequest(text=text, style=HumanizeStyle.NATURAL)
    res = HumanizerService.humanize(req)

    assert "furthermore" not in res.rewritten_text.lower()
    assert "crucial role" not in res.rewritten_text.lower()
    assert "testament to" not in res.rewritten_text.lower()
    assert len(res.changes_diff) > 0
    assert res.meaning_preservation_score >= 0.70
    assert res.stats.words_modified + res.stats.words_removed + res.stats.words_added > 0


def test_humanizer_styles():
    text = (
        "It is important to remember that we should delve into the underlying problems carefully "
        "in order to facilitate better results for all team members."
    )
    for style in [HumanizeStyle.ACADEMIC, HumanizeStyle.PROFESSIONAL, HumanizeStyle.SIMPLE, HumanizeStyle.CASUAL]:
        req = HumanizeRequest(text=text, style=style)
        res = HumanizerService.humanize(req)
        assert res.style == style.value
        assert res.rewritten_text != ""
        assert res.meaning_preservation_score > 0.60
