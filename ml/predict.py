"""
Prediction module for YojnaSathi ML pipeline.
Makes eligibility predictions and ranks schemes for users.
"""

import joblib
import pandas as pd
import os


class SchemePredictor:
    """Handles eligibility predictions and scheme ranking."""

    def __init__(
        self,
        model_path: str = "model/scheme_model.pkl",
        preprocessor_path: str = "model/preprocessor.pkl",
    ):
        self.model_path = model_path
        self.preprocessor_path = preprocessor_path
        self.model = None
        self.preprocessor = None
        self.load_artifacts()

    def load_artifacts(self):
        """Load trained model and preprocessor."""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}")

        if not os.path.exists(self.preprocessor_path):
            raise FileNotFoundError(
                f"Preprocessor not found at {self.preprocessor_path}"
            )

        self.model = joblib.load(self.model_path)
        self.preprocessor = joblib.load(self.preprocessor_path)

        print(f"✓ Model loaded from: {self.model_path}")
        print(f"✓ Preprocessor loaded from: {self.preprocessor_path}")

    def predict_single(self, user_data: dict, scheme_data: dict) -> dict:
        """Predict eligibility for one (user, scheme) pair."""

        combined = {**user_data, **scheme_data}
        df = pd.DataFrame([combined])

        # Feature engineering
        df = self.preprocessor.engineer_features(df)

        feature_cols = [
            "age",
            "income",
            "gender",
            "category",
            "scheme_min_age",
            "scheme_max_age",
            "scheme_income_limit",
            "age_scheme_gap",
            "age_from_max",
            "age_eligibility_window",
            "income_ratio",
            "income_above_limit",
            "category_match",
        ]

        X = df[feature_cols].copy()
        X = self.preprocessor.encode_categorical_features(X, fit=False)
        X = self.preprocessor.scale_features(X, fit=False)

        pred = self.model.predict(X)[0]
        prob = self.model.predict_proba(X)[0][1]

        return {
            "eligible": int(pred),
            "eligible_label": "Eligible" if pred == 1 else "Not Eligible",
            "probability": float(prob),
        }

    def predict_batch(self, user_data: dict, schemes: list) -> list:
        """Predict eligibility across multiple schemes."""
        results = []
        for scheme in schemes:
            result = self.predict_single(user_data, scheme)
            result["scheme_id"] = scheme.get("scheme_id")
            result["scheme_name"] = scheme.get("scheme_name")
            results.append(result)
        return results

    def rank_schemes(
        self, user_data: dict, schemes: list, top_n: int | None = None
    ) -> list:
        """Rank schemes by eligibility probability."""
        results = self.predict_batch(user_data, schemes)
        df = pd.DataFrame(results).sort_values(
            by="probability", ascending=False
        )

        if top_n:
            df = df.head(top_n)

        return df.to_dict(orient="records")

    def explain_prediction(self, user_data: dict, scheme_data: dict) -> dict:
        """Explain a single prediction using feature importance."""
        result = self.predict_single(user_data, scheme_data)

        feature_names = [
            "age",
            "income",
            "gender",
            "category",
            "scheme_min_age",
            "scheme_max_age",
            "scheme_income_limit",
            "age_scheme_gap",
            "age_from_max",
            "age_eligibility_window",
            "income_ratio",
            "income_above_limit",
            "category_match",
        ]

        importance = self.model.feature_importances_
        pairs = sorted(
            zip(feature_names, importance),
            key=lambda x: x[1],
            reverse=True,
        )[:5]

        result["top_contributing_features"] = [
            {"feature": f, "importance": float(i)} for f, i in pairs
        ]

        return result


def get_predictor() -> SchemePredictor:
    """Factory method for FastAPI usage."""
    return SchemePredictor()


# -------------------------------------------------------
# TESTING (RUN ONLY WHEN FILE IS EXECUTED DIRECTLY)
# -------------------------------------------------------
if __name__ == "__main__":
    predictor = get_predictor()

    user = {
        "age": 28,
        "income": 250000,
        "gender": "Female",
        "category": "General",
    }

    schemes = [
        {
            "scheme_id": 1,
            "scheme_name": "Young Achiever Scheme",
            "scheme_min_age": 21,
            "scheme_max_age": 40,
            "scheme_income_limit": 300000,
            "scheme_category": "General",
        },
        {
            "scheme_id": 2,
            "scheme_name": "General Welfare Scheme",
            "scheme_min_age": 18,
            "scheme_max_age": 50,
            "scheme_income_limit": 250000,
            "scheme_category": "General",
        },
        {
            "scheme_id": 3,
            "scheme_name": "OBC Empowerment",
            "scheme_min_age": 21,
            "scheme_max_age": 55,
            "scheme_income_limit": 250000,
            "scheme_category": "OBC",
        },
    ]

    ranked = predictor.rank_schemes(user, schemes)

    print("\nRANKED SCHEMES")
    print("-" * 60)
    for i, s in enumerate(ranked, 1):
        print(f"{i}. {s['scheme_name']} → {s['probability']:.2%}")
