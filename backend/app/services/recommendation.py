"""
Recommendation engine for YojnaSathi.

Calculates how relevant a scheme is for a user
using a scoring-based approach.
"""

from typing import Dict


def calculate_scheme_score(user: Dict, scheme: Dict) -> int:
    score = 0

    # -----------------
    # Age match (30)
    # -----------------
    if scheme["min_age"] <= user["age"] <= scheme["max_age"]:
        score += 30

    # -----------------
    # Income match (30)
    # -----------------
    if user["income"] <= scheme["max_income"]:
        score += 30

    # -----------------
    # Category match (25)
    # -----------------
    if scheme["category"] == "All" or scheme["category"] == user["category"]:
        score += 25

    # -----------------
    # State match (15)
    # -----------------
    if scheme["state"] == "Central" or scheme["state"] == user.get("state"):
        score += 15

    return score

from typing import List


def recommend_schemes(user: dict, schemes: List[dict]) -> List[dict]:
    recommendations = []

    for scheme in schemes:
        score = calculate_scheme_score(user, scheme)

        if score > 0:
            scheme_with_score = scheme.copy()
            scheme_with_score["match_score"] = score
            recommendations.append(scheme_with_score)

    # Sort schemes by score (highest first)
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)

    return recommendations

