"""
Training data preparation for ML model.
"""

from typing import Dict, List
from ..services.recommendation import calculate_scheme_score
from ..services.features import extract_features


"""
Build training data for ML model.
Each row represents (user, scheme) pair.
"""

def build_training_data(user, schemes):
    rows = []

    for scheme in schemes:
        # Feature checks
        age_ok = int(scheme["min_age"] <= user["age"] <= scheme["max_age"])
        income_ok = int(user["income"] <= scheme["max_income"])
        category_ok = int(
            scheme["category"] == "All" or scheme["category"] == user["category"]
        )

        # Label: relevant or not
        relevant = age_ok and income_ok and category_ok

        row = {
            # 🔹 ML FEATURES
            "age": user["age"],
            "income": user["income"],
            "min_age": scheme["min_age"],
            "max_age": scheme["max_age"],
            "max_income": scheme["max_income"],
            "category_match": category_ok,

            # 🔹 METADATA (not used in ML)
            "scheme_id": scheme["scheme_id"],
            "scheme_name": scheme["scheme_name"],

            # 🔹 LABEL
            "label": 1 if relevant else 0
        }

        rows.append(row)

    return rows
