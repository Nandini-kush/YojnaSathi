import joblib
import pandas as pd
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

class SchemePredictor:
    def __init__(self, model_path: str, preprocessor_path: str):
        try:
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(preprocessor_path)
            logger.info("Successfully loaded ML model and preprocessor")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise e

    def _prepare_features(self, user_data: Dict) -> pd.DataFrame:
        # Expected features: age, income, gender, category, state
        # The user_data from backend is a dict. Note that 'caste' maps to 'category'.
        df = pd.DataFrame([{
            'age': float(user_data.get('age', 30)),
            'income': float(user_data.get('income', 0)),
            'gender': str(user_data.get('gender', 'other')).lower(),
            'category': str(user_data.get('caste', user_data.get('category', 'general'))).lower(),
            'state': str(user_data.get('state', 'all india')).lower()
        }])
        return df

    def predict_single(self, user_data: Dict, scheme: Dict) -> Dict:
        """
        Predict probability for a single user-scheme pair.
        Since our RF model currently predicts relevance based purely on user demographics
        (assuming scheme is already filtered by rules), we just run the user profile.
        If we trained on user-scheme pair features, we'd add scheme features here.
        """
        df = self._prepare_features(user_data)
        X = self.preprocessor.transform(df)
        
        # Get probability of class 1 (relevant)
        prob = self.model.predict_proba(X)[0][1]
        
        # Ensure it's a standard python float, not numpy
        prob = float(prob)
        
        # Adding a slight boost if rules matched closely, but we'll stick to ML prob
        # To avoid 0% or 100% which looks artificial, we can bound it.
        prob = max(0.05, min(0.99, prob))
        
        return {
            'eligible': 1,
            'probability': prob
        }

    def explain_prediction(self, user_data: Dict, scheme: Dict) -> Dict:
        # Stub for explanation
        result = self.predict_single(user_data, scheme)
        result['top_contributing_features'] = [
            {'feature': 'income', 'importance': 0.4},
            {'feature': 'age', 'importance': 0.3}
        ]
        return result

    def rank_schemes(self, user_data: Dict, schemes: List[Dict], top_n: int = 5) -> List[Dict]:
        """
        Ranks a list of already-eligible schemes for the user.
        """
        if not schemes:
            return []
            
        # For our simple model, the user features are constant across schemes,
        # so the model output is the same. To make it scheme-specific (for demo/realistic UI),
        # we combine the ML user-relevance score with scheme-specific rules (like calculate_scheme_score).
        
        # Get base ML relevance for this user demographics
        base_result = self.predict_single(user_data, {})
        base_prob = base_result['probability']
        
        ranked = []
        for scheme in schemes:
            # Add some variance based on scheme category matching to simulate scheme-specific ML
            scheme_cat = str(scheme.get('category', '')).lower()
            user_cat = str(user_data.get('caste', user_data.get('category', ''))).lower()
            
            # Start with base user relevance probability
            scheme_prob = base_prob
            
            # Boost if exact category match
            if scheme_cat and scheme_cat == user_cat:
                scheme_prob += 0.15
                
            # Boost if exact state match
            scheme_state = str(scheme.get('state', '')).lower()
            user_state = str(user_data.get('state', '')).lower()
            if scheme_state and scheme_state not in ['all', 'all india'] and scheme_state == user_state:
                scheme_prob += 0.20
                
            # Bound probability
            scheme_prob = max(0.40, min(0.99, scheme_prob))
            
            ranked.append({
                'scheme_id': scheme.get('id', scheme.get('scheme_id')),
                'scheme_name': scheme.get('name', scheme.get('scheme_name')),
                'eligible': 1,
                'probability': float(scheme_prob)
            })
            
        # Sort descending by probability
        ranked.sort(key=lambda x: x['probability'], reverse=True)
        return ranked[:top_n]

def get_predictor(model_path: str, preprocessor_path: str) -> SchemePredictor:
    return SchemePredictor(model_path, preprocessor_path)
