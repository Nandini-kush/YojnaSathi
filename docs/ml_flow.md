# ML Pipeline Documentation - YojnaSathi

## Overview

The ML pipeline predicts government scheme eligibility and ranks schemes by probability of user benefit using a scikit-learn RandomForest classifier.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         ML PIPELINE ARCHITECTURE                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  TRAINING PHASE (Offline)                          │
│  ────────────────────────────                       │
│                                                      │
│  Historical Data                                     │
│  (Scheme applications + outcomes)                   │
│           ↓                                          │
│  Preprocessing                                       │
│  (Feature engineering, scaling)                     │
│           ↓                                          │
│  Model Training                                      │
│  (RandomForest classifier)                          │
│           ↓                                          │
│  Model Evaluation                                    │
│  (Cross-validation, metrics)                        │
│           ↓                                          │
│  Model Artifacts Saved                              │
│  (scheme_model.pkl, preprocessor.pkl)              │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  INFERENCE PHASE (Online)                          │
│  ─────────────────────────                          │
│                                                      │
│  User Profile Input                                 │
│  (Demographics, income, location)                   │
│           ↓                                          │
│  Feature Extraction & Preprocessing                 │
│  (Apply saved preprocessor)                         │
│           ↓                                          │
│  Model Prediction                                   │
│  (Get probability for each scheme)                  │
│           ↓                                          │
│  Ranking & Filtering                                │
│  (Sort by probability, apply thresholds)           │
│           ↓                                          │
│  User Recommendations                               │
│  (Top N schemes with explanations)                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
/ml/
├── __init__.py
├── predict.py              # Main prediction interface
├── train_model.py          # Model training script
├── preprocess.py           # Feature preprocessing
├── evaluate.py             # Model evaluation
├── config.py               # Configuration
└── models/
    ├── scheme_model.pkl    # Trained RandomForest model
    └── preprocessor.pkl    # Feature preprocessor (StandardScaler)
```

---

## Key Components

### 1. SchemePredictor Class (`predict.py`)

Main interface for predictions.

```python
class SchemePredictor:
    """
    Predicts user eligibility for schemes using trained ML model.
    """
    
    def __init__(self, model_path: str, preprocessor_path: str)
    def rank_schemes(
        user_data: Dict, 
        schemes: List[Dict]
    ) -> List[Dict]
    """
    Ranks all schemes by eligibility probability.
    
    Args:
        user_data: {
            'age': int,
            'income': float,
            'occupation': str,
            'category': str,  # SC/ST/OBC/General
            'location_type': str,  # Urban/Rural
            'education': str,
            'gender': str
        }
        schemes: List of scheme objects
    
    Returns:
        [
            {
                'scheme_id': int,
                'scheme_name': str,
                'probability': float,  # 0-1
                'eligible': bool,
                'explanation': str
            },
            ...
        ]
    """
    
    def predict_single(
        user_data: Dict,
        scheme: Dict
    ) -> float
    """
    Predicts eligibility probability for single scheme.
    
    Returns: float between 0 and 1
    """
    
    def explain_prediction(
        user_data: Dict,
        scheme: Dict
    ) -> Dict
    """
    Explains the prediction with feature importance.
    
    Returns:
        {
            'probability': float,
            'top_factors': [
                {'feature': 'age', 'importance': 0.25},
                {'feature': 'income', 'importance': 0.20},
                ...
            ],
            'reasoning': str
        }
    """
    
    def predict_batch(
        users_data: List[Dict],
        schemes: List[Dict]
    ) -> List[List[Dict]]
    """
    Batch predictions for multiple users.
    
    Returns:
        [
            [scheme predictions for user 1],
            [scheme predictions for user 2],
            ...
        ]
    """
```

### 2. Feature Preprocessing (`preprocess.py`)

Converts raw user input into model features.

```python
class FeaturePreprocessor:
    """
    Preprocesses user data for ML model.
    """
    
    FEATURES = [
        'age',
        'income',
        'occupation_encoded',
        'category_encoded',
        'location_type_encoded',
        'education_encoded',
        'gender_encoded'
    ]
    
    CATEGORICAL_MAPPINGS = {
        'occupation': {
            'agriculture': 0,
            'business': 1,
            'service': 2,
            'unemployed': 3,
            'student': 4
        },
        'category': {
            'general': 0,
            'obc': 1,
            'sc': 2,
            'st': 3
        },
        'location_type': {
            'urban': 0,
            'rural': 1
        },
        'education': {
            'primary': 0,
            'secondary': 1,
            'diploma': 2,
            'graduate': 3,
            'postgraduate': 4
        },
        'gender': {
            'male': 0,
            'female': 1,
            'other': 2
        }
    }
    
    def preprocess(user_data: Dict) -> np.ndarray
    """
    Converts user data to feature array.
    
    Steps:
    1. Encode categorical variables
    2. Normalize numerical features
    3. Return standardized feature vector
    """
    
    def fit(data: pd.DataFrame) -> self
    """
    Fits preprocessor on training data.
    """
    
    def save(filepath: str) -> None
    """
    Saves fitted preprocessor (StandardScaler state).
    """
    
    def load(filepath: str) -> self
    """
    Loads saved preprocessor.
    """
```

### 3. Model Training (`train_model.py`)

Trains the RandomForest model.

```python
def train_model(
    training_data_path: str,
    output_model_path: str,
    output_preprocessor_path: str
) -> Dict:
    """
    Complete training pipeline.
    
    Steps:
    1. Load historical data
    2. Preprocess features
    3. Split into train/test
    4. Train RandomForest
    5. Evaluate model
    6. Save model and preprocessor
    
    Returns:
        {
            'accuracy': float,
            'precision': float,
            'recall': float,
            'f1_score': float,
            'feature_importances': Dict
        }
    """
    
    # Model parameters
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    # Training
    model.fit(X_train, y_train)
    
    # Evaluation
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # Save
    joblib.dump(model, output_model_path)
    joblib.dump(preprocessor, output_preprocessor_path)
```

### 4. Model Evaluation (`evaluate.py`)

Evaluates model performance.

```python
def evaluate_model(
    model_path: str,
    test_data_path: str
) -> Dict:
    """
    Comprehensive model evaluation.
    
    Metrics:
    - Accuracy: Overall correctness
    - Precision: Fewer false positives
    - Recall: Fewer false negatives
    - F1-Score: Balance of precision & recall
    - Confusion Matrix: Type I & II errors
    - ROC-AUC: Discrimination ability
    """
```

---

## Data Flow

### Training Flow

```
1. Load historical data
   └─ CSV/Database with scheme applications and outcomes

2. Feature Engineering
   ├─ Extract relevant features
   ├─ Encode categorical variables
   └─ Handle missing values

3. Data Splitting
   ├─ 80% training data
   ├─ 10% validation data
   └─ 10% test data

4. Model Training
   ├─ RandomForest with 100 trees
   ├─ Max depth: 15
   ├─ Min samples: 5 per split
   └─ Random state: 42 (reproducibility)

5. Cross-Validation
   └─ 5-fold cross-validation for robust evaluation

6. Hyperparameter Tuning (Optional)
   ├─ Grid search
   ├─ Random search
   └─ Bayesian optimization

7. Model Evaluation
   ├─ Test set evaluation
   ├─ Metric calculation
   └─ Performance logging

8. Model Saving
   ├─ Save model as pickle
   ├─ Save preprocessor
   └─ Version tracking
```

### Inference Flow

```
1. User Input Received
   └─ Demographics and income data

2. Feature Preprocessing
   ├─ Load saved preprocessor
   ├─ Encode categorical variables
   ├─ Normalize numerical features
   └─ Create feature vector

3. Model Loading (Cached)
   └─ Already loaded in memory

4. Prediction for Each Scheme
   ├─ For each scheme in system:
   │  ├─ Get scheme eligibility criteria
   │  ├─ Prepare scheme-specific features
   │  ├─ Model predicts probability
   │  ├─ Apply eligibility threshold
   │  └─ Store result
   └─ Collect all predictions

5. Ranking & Filtering
   ├─ Sort schemes by probability
   ├─ Filter low probability schemes
   ├─ Apply business rules
   └─ Generate explanations

6. Return Results
   └─ Top N schemes with confidence scores
```

---

## Backend Integration

### ML Service (`backend/app/services/ml_service.py`)

Wrapper service for ML pipeline in FastAPI.

```python
class MLService:
    """
    Integrates ML pipeline with FastAPI backend.
    """
    
    # Singleton instance (loaded once at startup)
    _instance: Optional['MLService'] = None
    _predictor: Optional[SchemePredictor] = None
    
    def __init__(self):
        """Load ML model at initialization."""
        self._predictor = SchemePredictor(
            model_path='../ml/models/scheme_model.pkl',
            preprocessor_path='../ml/models/preprocessor.pkl'
        )
    
    @classmethod
    def get_instance(cls) -> 'MLService':
        """Get singleton instance."""
        if cls._instance is None:
            cls._instance = MLService()
        return cls._instance
    
    async def recommend_schemes(
        self,
        user_data: Dict,
        limit: int = 10,
        min_probability: float = 0.3
    ) -> List[Dict]:
        """
        Get top scheme recommendations for user.
        
        Args:
            user_data: User profile
            limit: Number of schemes to return
            min_probability: Minimum probability threshold
        
        Returns:
            List of schemes sorted by probability
        """
    
    async def explain_eligibility(
        self,
        user_data: Dict,
        scheme_id: int
    ) -> Dict:
        """
        Explain why user is eligible/ineligible for scheme.
        """
    
    async def batch_predict(
        self,
        users_data: List[Dict]
    ) -> List[List[Dict]]:
        """
        Batch predictions for multiple users.
        """
```

### API Endpoints

```python
@router.post("/api/ml/recommend/")
async def recommend_schemes(
    request: EligibilityCheckRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get ML-powered scheme recommendations.
    
    Steps:
    1. Authenticate user (JWT)
    2. Validate input data
    3. Call ML service
    4. Save recommendations to history
    5. Return ranked schemes
    """
    
    ml_service = MLService.get_instance()
    recommendations = await ml_service.recommend_schemes(
        user_data=request.user_profile,
        limit=request.limit,
        min_probability=0.3
    )
    
    # Save to database
    # Return recommendations

@router.get("/api/ml/explain/{scheme_id}")
async def explain_eligibility(
    scheme_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get explanation for scheme eligibility prediction.
    """
    
    ml_service = MLService.get_instance()
    explanation = await ml_service.explain_eligibility(
        user_data=get_user_profile(user_id),
        scheme_id=scheme_id
    )
    
    return explanation
```

---

## Model Performance

### Expected Performance Metrics

| Metric | Value | Description |
|--------|-------|-------------|
| **Accuracy** | 85-90% | Overall correctness |
| **Precision** | 80-85% | Correct positive predictions |
| **Recall** | 85-90% | Catching eligible users |
| **F1-Score** | 82-87% | Balance of precision & recall |
| **ROC-AUC** | 0.90-0.95 | Discrimination ability |

### Prediction Time

- **Single Prediction**: ~50-100ms (preprocessing + inference)
- **Batch (1000 users)**: ~5-10 seconds
- **Load Time**: ~2 seconds (at app startup)

### Memory Usage

- **Model Size**: ~15-20MB (pickle file)
- **Preprocessor Size**: ~1-2MB
- **Runtime Memory**: ~500MB (model + data structures)

---

## Feature Importance

### Top Predictive Features

1. **Income** (25-30%)
   - Most discriminative feature
   - Directly affects eligibility for welfare schemes

2. **Age** (15-20%)
   - Senior/minor specific schemes
   - Age-based eligibility criteria

3. **Category** (10-15%)
   - SC/ST/OBC specific schemes
   - Significant eligibility factor

4. **Education** (8-12%)
   - Education-based scheme eligibility
   - Career/skill schemes

5. **Location Type** (5-10%)
   - Rural/urban specific schemes
   - Agricultural vs urban schemes

6. **Occupation** (5-10%)
   - Occupation-based schemes
   - Farmer, labor, self-employed schemes

7. **Gender** (3-5%)
   - Women-specific schemes
   - Lower feature importance

---

## Deployment Considerations

### Model Versioning

```
/ml/models/
├── scheme_model_v1.0.pkl    # Production model
├── scheme_model_v1.1.pkl    # Staging model
└── scheme_model_v0.9.pkl    # Rollback version
```

### Monitoring

```python
# Log all predictions
log_prediction(
    user_id=user_id,
    scheme_id=scheme_id,
    probability=0.85,
    actual_outcome=None  # Updated later
)

# Monitor model drift
calculate_prediction_distribution()
compare_with_baseline()
alert_if_drift_detected()
```

### Retraining

```
Schedule: Weekly/Monthly
Trigger: 
- Model drift detected
- Performance degradation
- New data available
- Eligibility criteria changes

Process:
1. Collect new data
2. Retrain model
3. Evaluate on test set
4. Compare with production
5. A/B test if needed
6. Deploy if better
```

---

## Configuration (`config.py`)

```python
# Model paths
MODEL_PATH = Path(__file__).parent / "models" / "scheme_model.pkl"
PREPROCESSOR_PATH = Path(__file__).parent / "models" / "preprocessor.pkl"

# Prediction parameters
MIN_PROBABILITY_THRESHOLD = 0.3
TOP_SCHEMES_LIMIT = 10
BATCH_PREDICTION_SIZE = 100

# Model parameters
RANDOM_FOREST_ESTIMATORS = 100
MAX_TREE_DEPTH = 15
MIN_SAMPLES_SPLIT = 5
MIN_SAMPLES_LEAF = 2
RANDOM_STATE = 42

# Feature configuration
NUMERICAL_FEATURES = ['age', 'income']
CATEGORICAL_FEATURES = ['occupation', 'category', 'location_type', 'education', 'gender']

# Training
TRAIN_TEST_SPLIT = 0.8
VALIDATION_SPLIT = 0.1
CROSS_VALIDATION_FOLDS = 5
```

---

## Troubleshooting

### Issue: Model not loading

**Solution**:
```python
try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    raise RuntimeError(f"Model not found at {MODEL_PATH}")
except Exception as e:
    raise RuntimeError(f"Error loading model: {e}")
```

### Issue: Predictions taking too long

**Solution**:
- Check model is loaded once (singleton)
- Profile preprocessing step
- Consider batch predictions
- Use async/await for I/O

### Issue: Low prediction accuracy

**Solution**:
- Check feature engineering
- Verify training data quality
- Retrain with new data
- Add missing features
- Adjust model hyperparameters

### Issue: Memory issues

**Solution**:
- Use smaller batch sizes
- Stream predictions
- Implement caching
- Load model on-demand

---

## Future Enhancements

### 1. Explainability
- SHAP values for feature importance
- LIME for local explanations
- Feature interaction visualization

### 2. Model Improvements
- Ensemble methods (XGBoost, LightGBM)
- Deep learning (Neural Networks)
- Incremental learning for online updates

### 3. Monitoring
- Real-time prediction monitoring
- Model drift detection
- Automated retraining pipeline

### 4. Performance
- Model quantization for faster inference
- GPU acceleration
- Distributed predictions

### 5. Integration
- GraphQL API for ML
- Real-time streaming predictions
- A/B testing framework

---

*Last Updated: January 2026*
*Version: 1.0*
