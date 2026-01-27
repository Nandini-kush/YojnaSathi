"""
Feature extraction for ML models.

Converts user + scheme data into numeric features.
"""

from typing import Dict, List


def extract_features(user: Dict, scheme: Dict) -> Dict:
    return {
        "user_age": user["age"],
        "user_income": user["income"],
        "category_match": int(
            scheme["category"] == "All" or scheme["category"] == user["category"]
        ),
        "state_match": int(
            scheme["state"] == "Central" or scheme["state"] == user.get("state")
        ),
        "income_ratio": user["income"] / scheme["max_income"],
        "age_within_range": int(
            scheme["min_age"] <= user["age"] <= scheme["max_age"]
        )
    }


def build_feature_dataset(user: Dict, schemes: List[Dict]) -> List[Dict]:
    dataset = []

    for scheme in schemes:
        features = extract_features(user, scheme)
        features["scheme_id"] = scheme["scheme_id"]
        dataset.append(features)

    return dataset
