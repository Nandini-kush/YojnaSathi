# FastAPI Integration Guide - ML Module

This guide explains how to integrate the trained ML model with the FastAPI backend.

## Quick Integration

### 1. Import the Predictor
```python
# In your FastAPI app (e.g., backend/main.py)
from ml.predict import get_predictor

# Initialize predictor once at app startup
predictor = get_predictor()
```

### 2. Create Endpoint
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()
predictor = get_predictor()  # Load model once

class UserData(BaseModel):
    age: int
    income: float
    gender: str  # "Male" or "Female"
    category: str  # "General", "OBC", "SC", "ST"

class SchemeData(BaseModel):
    scheme_id: int
    scheme_name: str
    scheme_min_age: int
    scheme_max_age: int
    scheme_income_limit: float
    scheme_category: str

@app.get("/api/v1/recommend-schemes")
async def get_scheme_recommendations(user_id: int):
    """
    Get ranked scheme recommendations for a user.
    Schemes are ranked by eligibility probability (highest first).
    """
    try:
        # Get user from database
        user_db = await db.users.find_one({'user_id': user_id})
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all schemes from database
        schemes_db = await db.schemes.find().to_list(None)
        
        # Convert to format expected by ML
        user_data = {
            'age': user_db['age'],
            'income': user_db['income'],
            'gender': user_db['gender'],
            'category': user_db['category']
        }
        
        schemes_data = [
            {
                'scheme_id': s['_id'],
                'scheme_name': s['name'],
                'scheme_min_age': s['min_age'],
                'scheme_max_age': s['max_age'],
                'scheme_income_limit': s['income_limit'],
                'scheme_category': s['category']
            }
            for s in schemes_db
        ]
        
        # Get ranked schemes using ML
        ranked_schemes = predictor.rank_schemes(
            user_data=user_data,
            schemes_data=schemes_data,
            top_n=10
        )
        
        return {
            'status': 'success',
            'user_id': user_id,
            'recommended_schemes': ranked_schemes,
            'total_eligible': sum(1 for s in ranked_schemes if s['eligible'] == 1),
            'total_schemes': len(ranked_schemes)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/check-scheme-eligibility")
async def check_eligibility(user_data: UserData, scheme_data: SchemeData):
    """
    Check if a user is eligible for a specific scheme.
    Returns eligibility status and probability score.
    """
    try:
        # Convert Pydantic models to dicts
        user_dict = user_data.dict()
        scheme_dict = scheme_data.dict()
        
        # Get prediction
        result = predictor.predict_single(user_dict, scheme_dict)
        
        return {
            'status': 'success',
            'scheme_id': scheme_data.scheme_id,
            'scheme_name': scheme_data.scheme_name,
            'eligible': result['eligible'],
            'eligible_label': result['eligible_label'],
            'probability': round(result['probability'], 4),
            'confidence': 'High' if result['probability'] > 0.8 else 
                         'Medium' if result['probability'] > 0.5 else 
                         'Low'
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/scheme-explanation/{user_id}/{scheme_id}")
async def explain_recommendation(user_id: int, scheme_id: int):
    """
    Get explanation for why a user is/isn't eligible for a scheme.
    Shows top contributing features.
    """
    try:
        # Get user and scheme from database
        user_db = await db.users.find_one({'user_id': user_id})
        scheme_db = await db.schemes.find_one({'_id': scheme_id})
        
        if not user_db or not scheme_db:
            raise HTTPException(status_code=404, detail="User or scheme not found")
        
        # Prepare data
        user_data = {
            'age': user_db['age'],
            'income': user_db['income'],
            'gender': user_db['gender'],
            'category': user_db['category']
        }
        
        scheme_data = {
            'scheme_id': scheme_db['_id'],
            'scheme_name': scheme_db['name'],
            'scheme_min_age': scheme_db['min_age'],
            'scheme_max_age': scheme_db['max_age'],
            'scheme_income_limit': scheme_db['income_limit'],
            'scheme_category': scheme_db['category']
        }
        
        # Get explanation
        explanation = predictor.explain_prediction(user_data, scheme_data)
        
        return {
            'status': 'success',
            'user_id': user_id,
            'scheme_id': scheme_id,
            'scheme_name': scheme_data['scheme_name'],
            'eligibility': explanation['eligible_label'],
            'probability': round(explanation['probability'], 4),
            'top_contributing_features': explanation['top_contributing_features'],
            'user_profile': {
                'age': user_data['age'],
                'income': f"₹{user_data['income']:,}",
                'category': user_data['category'],
                'gender': user_data['gender']
            },
            'scheme_requirements': {
                'age_range': f"{scheme_data['scheme_min_age']}-{scheme_data['scheme_max_age']}",
                'income_limit': f"₹{scheme_data['scheme_income_limit']:,}",
                'category': scheme_data['scheme_category']
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Response Examples

### Scheme Recommendations
```json
{
  "status": "success",
  "user_id": 123,
  "recommended_schemes": [
    {
      "scheme_id": 1,
      "scheme_name": "Young Achiever Scheme",
      "eligible": 1,
      "probability": 0.9528,
      "eligible_label": "Eligible"
    },
    {
      "scheme_id": 2,
      "scheme_name": "General Welfare Program",
      "eligible": 1,
      "probability": 0.8834,
      "eligible_label": "Eligible"
    },
    {
      "scheme_id": 5,
      "scheme_name": "OBC Empowerment",
      "eligible": 0,
      "probability": 0.3421,
      "eligible_label": "Not Eligible"
    }
  ],
  "total_eligible": 2,
  "total_schemes": 3
}
```

### Eligibility Check
```json
{
  "status": "success",
  "scheme_id": 1,
  "scheme_name": "Young Achiever Scheme",
  "eligible": 1,
  "eligible_label": "Eligible",
  "probability": 0.9528,
  "confidence": "High"
}
```

### Explanation
```json
{
  "status": "success",
  "user_id": 123,
  "scheme_id": 1,
  "scheme_name": "Young Achiever Scheme",
  "eligibility": "Eligible",
  "probability": 0.9528,
  "top_contributing_features": [
    {
      "feature": "age",
      "importance": 0.2829
    },
    {
      "feature": "age_scheme_gap",
      "importance": 0.2665
    },
    {
      "feature": "age_from_max",
      "importance": 0.2355
    },
    {
      "feature": "scheme_min_age",
      "importance": 0.0614
    },
    {
      "feature": "scheme_income_limit",
      "importance": 0.0461
    }
  ],
  "user_profile": {
    "age": 28,
    "income": "₹250,000",
    "category": "General",
    "gender": "Female"
  },
  "scheme_requirements": {
    "age_range": "21-40",
    "income_limit": "₹300,000",
    "category": "General"
  }
}
```

## Important Considerations

### 1. Model Loading
```python
# Load model ONCE at app startup, NOT in each request
# This ensures performance and consistency

# ✅ CORRECT - Load once
predictor = get_predictor()

@app.get("/api/recommend")
async def recommend():
    # Reuse predictor for all requests
    ranked = predictor.rank_schemes(...)
    return ranked

# ❌ WRONG - Don't load in every request
@app.get("/api/recommend")
async def recommend():
    predictor = get_predictor()  # DON'T DO THIS!
    ranked = predictor.rank_schemes(...)
    return ranked
```

### 2. Data Validation
```python
# Always validate input data format
@app.post("/api/check-eligibility")
async def check(user_data: UserData):
    # Pydantic validates before reaching this function
    # - age is int
    # - income is float
    # - gender is str
    # - category is str
    
    # No need for manual validation
    result = predictor.predict_single(user_data.dict(), scheme_data.dict())
    return result
```

### 3. Error Handling
```python
try:
    ranked = predictor.rank_schemes(user_data, schemes_data)
except FileNotFoundError:
    # Model artifacts missing
    raise HTTPException(status_code=503, detail="ML model not available")
except Exception as e:
    # Unexpected error
    raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
```

### 4. Performance Optimization
```python
# For high-traffic endpoints, consider caching
from functools import lru_cache

@lru_cache(maxsize=100)
def get_predictor_cached():
    """Cached predictor to avoid reloading."""
    return get_predictor()

# Or use Redis for distributed caching
async def get_scheme_recommendations(user_id: int):
    # Check cache first
    cached = await redis.get(f"recommendations:{user_id}")
    if cached:
        return json.loads(cached)
    
    # Compute if not cached
    recommendations = predictor.rank_schemes(...)
    
    # Cache for 24 hours
    await redis.setex(
        f"recommendations:{user_id}",
        86400,
        json.dumps(recommendations)
    )
    
    return recommendations
```

### 5. Batch Predictions
```python
@app.post("/api/v1/batch-recommendations")
async def batch_recommendations(user_ids: List[int]):
    """Get recommendations for multiple users."""
    results = []
    
    for user_id in user_ids:
        user_data = await db.users.find_one({'user_id': user_id})
        schemes_data = await db.schemes.find().to_list(None)
        
        ranked = predictor.rank_schemes(
            {
                'age': user_data['age'],
                'income': user_data['income'],
                'gender': user_data['gender'],
                'category': user_data['category']
            },
            [
                {
                    'scheme_id': s['_id'],
                    'scheme_name': s['name'],
                    'scheme_min_age': s['min_age'],
                    'scheme_max_age': s['max_age'],
                    'scheme_income_limit': s['income_limit'],
                    'scheme_category': s['category']
                }
                for s in schemes_data
            ],
            top_n=5
        )
        
        results.append({
            'user_id': user_id,
            'recommendations': ranked
        })
    
    return {'status': 'success', 'results': results}
```

## Deployment Checklist

- [ ] Model artifacts exist (`model/scheme_model.pkl`, `model/preprocessor.pkl`)
- [ ] All dependencies installed in production environment
- [ ] ML module imports successfully
- [ ] Database connections working
- [ ] Error handling tested for missing models
- [ ] Response time acceptable (< 200ms per prediction)
- [ ] Caching implemented for high-traffic endpoints
- [ ] Logging configured for troubleshooting
- [ ] API documentation generated
- [ ] Load testing completed

## Monitoring

Monitor these metrics in production:

```python
# Log prediction statistics
import logging

logger = logging.getLogger(__name__)

@app.get("/api/recommend")
async def recommend(user_id: int):
    start_time = time.time()
    
    ranked = predictor.rank_schemes(user_data, schemes_data)
    
    elapsed = time.time() - start_time
    logger.info(
        f"Recommendation generated",
        extra={
            'user_id': user_id,
            'schemes_count': len(ranked),
            'elapsed_ms': elapsed * 1000,
            'top_probability': ranked[0]['probability'] if ranked else 0
        }
    )
    
    return {'recommended_schemes': ranked}
```

## Common Integration Issues

### Issue 1: Import Error
```
ModuleNotFoundError: No module named 'ml'
```
**Solution**: Ensure `ml/__init__.py` exists and working directory is correct.

### Issue 2: Model Not Found
```
FileNotFoundError: Model not found at model/scheme_model.pkl
```
**Solution**: Run `python ml/train_model.py` to generate model artifacts.

### Issue 3: Data Mismatch
```
ValueError: X has X features, but model expects Y features
```
**Solution**: Ensure data is preprocessed with the same preprocessor.pkl used during training.

## Final Checklist

✅ ML pipeline complete  
✅ All modules tested  
✅ Documentation provided  
✅ Ready for FastAPI integration  
✅ Performance validated  
✅ Error handling implemented  

**Status**: Ready for production integration!

---

*Integration Guide - YojnaSathi ML Module*  
*January 2026*
