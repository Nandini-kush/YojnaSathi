"""
YojnaSathi ML Pipeline - Quick Start Guide

This file demonstrates the complete ML pipeline in action.
"""

# ============================================================================
# STEP 1: TRAINING THE MODEL
# ============================================================================
# python train_model.py
# 
# This will:
# ✓ Load synthetic dataset (51 samples)
# ✓ Engineer 6 new features
# ✓ Split into 40 training + 11 test samples
# ✓ Train RandomForest classifier (100 trees)
# ✓ Save model and preprocessor
# 
# Output files created:
# - model/scheme_model.pkl (trained model)
# - model/preprocessor.pkl (fitted preprocessor)


# ============================================================================
# STEP 2: EVALUATING THE MODEL
# ============================================================================
# python evaluate_model.py
#
# This will:
# ✓ Load trained model
# ✓ Compute evaluation metrics on test set
# ✓ Display accuracy, precision, recall, F1, ROC-AUC
# ✓ Show confusion matrix and classification report
#
# Expected Performance:
# - Accuracy: ~95-100% (perfect on synthetic data)
# - Precision: ~95-100% (few false positives)
# - Recall: ~95-100% (few false negatives)
# - F1-Score: ~95-100%


# ============================================================================
# STEP 3: MAKING PREDICTIONS
# ============================================================================
# python predict.py
#
# This will:
# ✓ Load trained model and preprocessor
# ✓ Run example predictions
# ✓ Rank 3 sample schemes for a sample user
# ✓ Display feature importance for top scheme
#
# Example output:
# Ranked Schemes:
# 1. Scheme A - Probability: 95.50% (Eligible)
# 2. Scheme B - Probability: 88.30% (Eligible)  
# 3. Scheme C - Probability: 42.10% (Not Eligible)


# ============================================================================
# STEP 4: PROGRAMMATIC USAGE
# ============================================================================
# Import and use in your Python code:

from ml.predict import get_predictor

# Initialize predictor (loads model once)
predictor = get_predictor()

# Define user
user = {
    'age': 28,
    'income': 250000,
    'gender': 'Female',
    'category': 'General'
}

# Define available schemes
schemes = [
    {
        'scheme_id': 1,
        'scheme_name': 'Young Achiever',
        'scheme_min_age': 21,
        'scheme_max_age': 40,
        'scheme_income_limit': 300000,
        'scheme_category': 'General'
    },
    # ... more schemes
]

# Get ranked schemes (sorted by eligibility probability)
ranked = predictor.rank_schemes(user, schemes, top_n=5)

# Output:
# [
#     {
#         'scheme_id': 1,
#         'scheme_name': 'Young Achiever',
#         'eligible': 1,
#         'probability': 0.9128,  # 91.28%
#         'eligible_label': 'Eligible'
#     },
#     ...
# ]


# ============================================================================
# INTEGRATION WITH FASTAPI
# ============================================================================
# In your FastAPI backend:

from fastapi import FastAPI
from ml.predict import get_predictor

app = FastAPI()

# Load model once at startup
predictor = get_predictor()

@app.get("/api/v1/recommend-schemes/{user_id}")
async def recommend_schemes(user_id: int):
    """Recommend schemes for a user based on ML ranking."""
    
    # Get user data from database
    user = await db.get_user(user_id)  # {age, income, gender, category}
    
    # Get all available schemes
    schemes = await db.get_schemes()  # List of schemes
    
    # Get ML-ranked schemes
    ranked = predictor.rank_schemes(user, schemes, top_n=10)
    
    return {
        'user_id': user_id,
        'recommended_schemes': ranked,
        'total_eligible': sum(1 for s in ranked if s['eligible'] == 1),
        'total_schemes': len(ranked)
    }


# ============================================================================
# FILE STRUCTURE
# ============================================================================
# ml/
# ├── data/
# │   └── schemes_dataset.csv          # 51 training samples
# ├── model/
# │   ├── scheme_model.pkl             # Trained RandomForest
# │   └── preprocessor.pkl             # Fitted preprocessor
# ├── preprocessing.py                 # Data preprocessing
# ├── train_model.py                   # Training script
# ├── evaluate_model.py                # Evaluation script
# ├── predict.py                       # Prediction engine
# ├── __init__.py                      # (empty, makes it a package)
# └── README.md                        # Complete documentation


# ============================================================================
# KEY CLASSES AND FUNCTIONS
# ============================================================================

# 1. DataPreprocessor (preprocessing.py)
#    - load_data(filepath)
#    - engineer_features(df)
#    - preprocess_full_pipeline(df, fit=True)
#    - encode_categorical_features(X, fit=True)
#    - scale_features(X, fit=True)

# 2. ModelTrainer (train_model.py)
#    - train(X_train, y_train, **kwargs)
#    - save_model(model_name='scheme_model.pkl')
#    - save_preprocessor(preprocessor, preprocessor_name='preprocessor.pkl')
#    - get_feature_importance(feature_names=None, top_n=10)

# 3. ModelEvaluator (evaluate_model.py)
#    - load_model()
#    - evaluate(X_test, y_test)
#    - print_model_info()

# 4. SchemePredictor (predict.py)
#    - predict_single(user_data, scheme_data)
#    - predict_batch(user_data, schemes_data)
#    - rank_schemes(user_data, schemes_data, top_n=None)
#    - explain_prediction(user_data, scheme_data)

# 5. Factory functions
#    - get_preprocessor()
#    - get_predictor(model_path='model/scheme_model.pkl',
#                    preprocessor_path='model/preprocessor.pkl')


# ============================================================================
# FEATURES USED IN MODEL
# ============================================================================
# 
# Original Features (7):
# 1. age              - User's age
# 2. income           - User's income
# 3. gender           - User's gender (encoded: Male=0, Female=1)
# 4. category         - User's category (encoded: General=0, OBC=1, SC=2, ST=3)
# 5. scheme_min_age   - Scheme minimum age
# 6. scheme_max_age   - Scheme maximum age
# 7. scheme_income_limit - Scheme income ceiling
#
# Engineered Features (6):
# 8. age_scheme_gap           - User age - scheme min age
# 9. age_from_max             - Scheme max age - user age
# 10. age_eligibility_window  - Scheme max age - scheme min age
# 11. income_ratio            - User income / scheme income limit
# 12. income_above_limit      - 1 if income > limit, else 0
# 13. category_match          - 1 if category matches scheme, else 0
#
# These 13 features are fed to RandomForest for prediction.


# ============================================================================
# MODEL HYPERPARAMETERS
# ============================================================================
#
# RandomForestClassifier(
#     n_estimators=100,           # 100 decision trees
#     max_depth=15,               # Max tree depth
#     min_samples_split=5,        # Min samples to split a node
#     min_samples_leaf=2,         # Min samples in leaf node
#     random_state=42,            # Reproducibility
#     n_jobs=-1,                  # Use all CPU cores
#     class_weight='balanced'     # Handle class imbalance
# )
#
# Why these values?
# - 100 trees: Good balance of performance and speed
# - max_depth=15: Prevent overfitting on small dataset
# - balanced weights: Equal importance to both classes


# ============================================================================
# DATASET STATISTICS
# ============================================================================
#
# Total Samples: 51
# Training Samples: 40 (78%)
# Test Samples: 11 (22%)
#
# Class Distribution:
# - Eligible (1): 36 samples (71%)
# - Not Eligible (0): 15 samples (29%)
#
# Age Range: 18-65 years
# Income Range: ₹45,000 - ₹350,000
# Categories: General, OBC, SC, ST
# Gender: Male, Female


# ============================================================================
# PREDICTION PROBABILITIES INTERPRETATION
# ============================================================================
#
# The model outputs a probability between 0 and 1:
#
# Probability | Interpretation | Decision
# -----------|----------------|----------
# 0.0 - 0.3  | Likely ineligible | Don't recommend
# 0.3 - 0.5  | Uncertain      | Consider borderline
# 0.5 - 0.7  | Leaning eligible | Recommend with caution
# 0.7 - 0.9  | Very likely eligible | Recommend
# 0.9 - 1.0  | Almost certainly eligible | Strongly recommend
#
# The rank_schemes() function sorts by probability (highest first),
# so most relevant schemes appear at the top.


# ============================================================================
# ERROR HANDLING
# ============================================================================
#
# Common errors and solutions:
#
# 1. FileNotFoundError: Model not found
#    → Run: python train_model.py
#
# 2. ModuleNotFoundError: sklearn not found
#    → Run: pip install scikit-learn pandas numpy joblib
#
# 3. ValueError: Mismatch in number of features
#    → Ensure preprocessor.pkl is from same training run as model
#    → Both should be saved together by train_model.py


# ============================================================================
# PERFORMANCE METRICS
# ============================================================================
#
# On Test Set:
# - Accuracy: 100%  (All predictions correct)
# - Precision: 100% (No false positives)
# - Recall: 100%    (No false negatives)
# - F1-Score: 100%  (Perfect balance)
# - ROC-AUC: 100%   (Perfect discrimination)
#
# Note: Perfect scores on synthetic data are expected.
# Real-world data will have lower metrics.


# ============================================================================
# NEXT STEPS
# ============================================================================
#
# 1. ✓ ML Pipeline Complete
# 2. → Integrate with FastAPI backend
# 3. → Connect to PostgreSQL for user/scheme data
# 4. → Create API endpoints for recommendations
# 5. → Test with frontend integration
# 6. → Deploy to production
