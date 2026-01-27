"""Compatibility shim: expose canonical EligibilityHistory model from ..db.models

Do not define models here to avoid duplicate model class definitions.
"""

from ..db.models import EligibilityHistory

__all__ = ["EligibilityHistory"]
