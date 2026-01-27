"""
ML Service Layer - Handles scheme recommendations using trained ML model.

This service loads the trained ML model once at module initialization
and provides high-level functions for making predictions and rankings.

Key Design Principles:
- Model is loaded ONCE at module import time
- No model retraining or updates
- ML logic stays in ml/ folder, only prediction interface here
- Clean separation: ML code vs API code
"""

import os
import sys
import logging
from typing import List, Dict, Optional

# Add root directory to path to import ml module
# The ml module is at the project root /ml/
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    # Import ML predictor from ml module at project root
    from ml.predict import get_predictor, SchemePredictor
    ML_AVAILABLE = True
except Exception as e:
    logging.error(f"Failed to load ML module: {e}")
    ML_AVAILABLE = False

logger = logging.getLogger(__name__)


class MLServiceException(Exception):
    """Exception raised when ML service fails."""
    pass


class MLService:
    """
    Service for ML-based scheme recommendations.
    
    Wraps the trained ML model and provides domain-specific functions
    for the API layer.
    """
    
    def __init__(self):
        """Initialize ML service with trained predictor."""
        if not ML_AVAILABLE:
            raise MLServiceException(
                "ML module not available. Check ml/ folder exists with trained model."
            )
        
        try:
            # Get absolute path to ml directory and add it to sys.path
            # This ensures preprocessing module can be imported when unpickling
            import os
            current_dir = os.path.dirname(os.path.abspath(__file__))  # backend/app/services
            backend_dir = os.path.dirname(current_dir)  # backend/app
            app_dir = os.path.dirname(backend_dir)  # backend
            project_root = os.path.dirname(app_dir)  # project root
            
            ml_dir = os.path.join(project_root, "ml")
            ml_model_dir = os.path.join(ml_dir, "model")
            
            # Add ml directory to sys.path so preprocessing module can be imported
            if ml_dir not in sys.path:
                sys.path.insert(0, ml_dir)
            
            model_path = os.path.join(ml_model_dir, "scheme_model.pkl")
            preprocessor_path = os.path.join(ml_model_dir, "preprocessor.pkl")
            
            self.predictor = SchemePredictor(
                model_path=model_path,
                preprocessor_path=preprocessor_path
            )
            logger.info(f"✓ ML Service initialized with model from: {ml_model_dir}")
        except FileNotFoundError as e:
            raise MLServiceException(f"ML model artifacts not found: {e}")
        except Exception as e:
            raise MLServiceException(f"Failed to initialize ML predictor: {e}")
    
    def recommend_schemes_for_user(
        self,
        user_data: Dict,
        schemes: List[Dict],
        top_n: int = 5
    ) -> List[Dict]:
        """
        Get ranked scheme recommendations for a user.
        
        The user_data should contain:
        - age: int (years)
        - income: float (annual or monthly - use consistent units)
        - gender: str ('Male' or 'Female')
        - category: str ('General', 'OBC', 'SC', 'ST')
        
        Each scheme in schemes list should contain:
        - scheme_id: int
        - scheme_name: str
        - scheme_min_age: int
        - scheme_max_age: int
        - scheme_income_limit: float
        - scheme_category: str
        
        Args:
            user_data: Dictionary with user's personal information
            schemes: List of scheme dictionaries
            top_n: Number of top recommendations to return (default: 5)
        
        Returns:
            List of schemes ranked by eligibility probability (highest first)
            Each scheme includes:
            - scheme_id, scheme_name, eligible (bool), probability (float)
        
        Raises:
            MLServiceException: If prediction fails
        """
        if not schemes:
            logger.warning("No schemes provided for recommendation")
            return []
        
        try:
            # Validate user data has required fields
            required_fields = ['age', 'income', 'gender', 'category']
            missing = [f for f in required_fields if f not in user_data]
            if missing:
                raise MLServiceException(
                    f"User data missing required fields: {missing}"
                )
            
            # Use ML model to rank schemes
            ranked = self.predictor.rank_schemes(
                user_data=user_data,
                schemes=schemes,
                top_n=top_n
            )
            
            # Convert to API response format
            recommendations = []
            for scheme in ranked:
                recommendations.append({
                    'scheme_id': scheme.get('scheme_id'),
                    'scheme_name': scheme.get('scheme_name'),
                    'eligible': scheme.get('eligible') == 1,
                    'probability': scheme.get('probability'),
                })
            
            logger.debug(f"Generated {len(recommendations)} recommendations for user")
            return recommendations
            
        except Exception as e:
            logger.error(f"ML prediction failed: {e}")
            raise MLServiceException(f"Failed to generate recommendations: {e}")
    
    def check_scheme_eligibility(
        self,
        user_data: Dict,
        scheme: Dict
    ) -> Dict:
        """
        Check eligibility of a user for a single scheme.
        
        Args:
            user_data: Dictionary with user's personal information
            scheme: Dictionary with scheme information
        
        Returns:
            Dictionary with:
            - eligible: bool
            - probability: float (0-1)
            - top_features: List of top contributing features (optional)
        
        Raises:
            MLServiceException: If prediction fails
        """
        try:
            # Get prediction
            result = self.predictor.predict_single(user_data, scheme)
            
            # Get explanation
            explanation = self.predictor.explain_prediction(user_data, scheme)
            
            return {
                'eligible': explanation.get('eligible') == 1,
                'probability': explanation.get('probability'),
                'top_contributing_features': explanation.get('top_contributing_features', [])
            }
            
        except Exception as e:
            logger.error(f"Failed to check scheme eligibility: {e}")
            raise MLServiceException(f"Eligibility check failed: {e}")


# ============================================================================
# Module-level initialization
# ============================================================================
# Load ML service once when this module is imported
# This ensures the model is loaded only once at app startup
_ml_service: Optional[MLService] = None


def get_ml_service() -> MLService:
    """
    Get the singleton ML service instance.
    
    The service is initialized only once when first requested,
    ensuring the ML model is loaded only once during app startup.
    
    Returns:
        MLService: Initialized ML service instance
    
    Raises:
        MLServiceException: If ML service cannot be initialized
    """
    global _ml_service
    
    if _ml_service is None:
        _ml_service = MLService()
        logger.info("ML Service initialized and cached")
    
    return _ml_service


def initialize_ml_service():
    """
    Explicitly initialize ML service at app startup.
    
    Call this in your FastAPI startup event to ensure the model
    is loaded early and any errors are caught during startup
    rather than during request handling.
    """
    try:
        service = get_ml_service()
        logger.info("✓ ML Service initialized at startup")
        return service
    except Exception as e:
        logger.error(f"Failed to initialize ML Service at startup: {e}")
        raise
