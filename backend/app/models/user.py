"""Compatibility shim: expose the canonical User model from ..db.models

Do not define models here to avoid duplicate model class definitions.
"""

from ..db.models import User

__all__ = ["User"]
