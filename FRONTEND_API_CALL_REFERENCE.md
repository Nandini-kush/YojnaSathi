# Frontend ML Integration - API Call Code Reference

## 📍 Exact Location of API Call

**File**: `frontend/src/pages/EligibilityCheck.tsx`
**Lines**: 79-155
**Function**: `handleSubmit()`

---

## 🔗 Complete API Call Code

### Full Implementation

```typescript
const handleSubmit = async () => {
  setIsLoading(true);
  setApiError(null);
  
  try {
    // Validate required fields
    if (!formData.age || !formData.gender || !formData.annualIncome || !formData.category) {
      const errorMsg = "Please fill in all required fields (Age, Gender, Income, Category)";
      setApiError(errorMsg);
      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // ========================================
    // PREPARE REQUEST PAYLOAD
    // ========================================
    const mlPredictionData = {
      age: parseInt(formData.age),
      income: parseFloat(formData.annualIncome),
      gender: formData.gender.toLowerCase(),
      category: formData.category,
    };

    // ========================================
    // LOG REQUEST (for debugging)
    // ========================================
    console.log("📤 Sending ML prediction request:", mlPredictionData);
    console.log("🔗 API Endpoint: POST /ml/predict-schemes");

    // ========================================
    // CALL ML PREDICTION API
    // ========================================
    const response = await recommendationService.predictSchemes(mlPredictionData);
    
    // ========================================
    // LOG RESPONSE (for debugging)
    // ========================================
    console.log("📥 ML API Response:", response.data);
    console.log(`✅ Found ${response.data.recommended_schemes?.length || 0} eligible schemes`);

    // ========================================
    // PROCESS RESPONSE
    // ========================================
    if (response.data && response.data.recommended_schemes) {
      // Store real API results in state
      setEligibleSchemes(response.data.recommended_schemes);
      
      // Show success message
      toast({
        title: "✅ Eligibility Check Complete!",
        description: `We found ${response.data.total_eligible} out of ${response.data.total_schemes} schemes you qualify for.`,
      });
    }
    
    // Move to results page
    setCurrentStep(5);
    
  } catch (error: any) {
    // ========================================
    // ERROR HANDLING
    // ========================================
    console.error("❌ ML API Error:", error);
    
    const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message ||
                         error.message ||
                         "Could not connect to ML service. Please try again.";
    
    console.error("Error details:", errorMessage);
    setApiError(errorMessage);
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🏗️ Breakdown by Section

### 1. Request Preparation
```typescript
const mlPredictionData = {
  age: parseInt(formData.age),              // Convert string to number
  income: parseFloat(formData.annualIncome), // Convert string to float
  gender: formData.gender.toLowerCase(),     // Normalize to lowercase
  category: formData.category,               // Keep as string
};
```

**Maps to backend UserProfileForML schema**:
```python
class UserProfileForML(BaseModel):
    age: int           # 18-120
    income: float      # > 0
    gender: str        # "male", "female"
    category: str      # "General", "OBC", "SC", "ST"
```

---

### 2. API Call
```typescript
const response = await recommendationService.predictSchemes(mlPredictionData);
```

**Service method** (from `src/services/index.ts`):
```typescript
export const recommendationService = {
  predictSchemes: (data: RecommendationRequest) =>
    apiClient.post<RecommendationResponse>('/ml/predict-schemes', data),
};
```

**Equivalent curl command**:
```bash
curl -X POST "http://localhost:8000/ml/predict-schemes" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "income": 250000,
    "gender": "female",
    "category": "General"
  }'
```

---

### 3. Response Processing
```typescript
if (response.data && response.data.recommended_schemes) {
  setEligibleSchemes(response.data.recommended_schemes);
  toast({
    title: "✅ Eligibility Check Complete!",
    description: `We found ${response.data.total_eligible} out of ${response.data.total_schemes} schemes you qualify for.`,
  });
}
```

**Response shape**:
```typescript
interface RecommendationResponse {
  user: UserProfileForML;                    // Echo of request
  recommended_schemes: RecommendationResult[]; // Array of scheme predictions
  total_schemes: number;                     // Total schemes evaluated
  total_eligible: number;                    // Count of eligible schemes
}

interface RecommendationResult {
  scheme_id: number;       // Unique scheme ID
  scheme_name: string;     // Scheme name
  eligible: boolean;       // Is user eligible
  probability: number;     // Eligibility probability (0-1)
}
```

---

### 4. Error Handling
```typescript
catch (error: any) {
  const errorMessage = error.response?.data?.detail ||     // Backend error message
                       error.response?.data?.message ||     // Alternative message
                       error.message ||                      // Axios error
                       "Could not connect to ML service.";  // Fallback
  
  setApiError(errorMessage);
  toast({ title: "Error", description: errorMessage });
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────┐
│   User Fills Form                   │
│   age: 28                           │
│   income: 250000                    │
│   gender: "Female"                  │
│   category: "General"               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Validation                        │
│   ✓ All 4 fields filled?            │
│   ✓ Valid data types?               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Prepare Request                   │
│   {                                 │
│     "age": 28,                      │
│     "income": 250000,               │
│     "gender": "female",             │
│     "category": "General"           │
│   }                                 │
└────────────┬────────────────────────┘
             │
      console.log("📤 Sending...")
             │
             ▼
┌─────────────────────────────────────┐
│   POST /ml/predict-schemes          │
│   (Backend runs ML model)           │
└────────────┬────────────────────────┘
             │
      console.log("📥 Response...")
             │
             ▼
┌─────────────────────────────────────┐
│   API Response                      │
│   {                                 │
│     "recommended_schemes": [        │
│       {                             │
│         "scheme_id": 3,             │
│         "scheme_name": "...",       │
│         "eligible": true,           │
│         "probability": 0.95         │
│       },                            │
│       ...                           │
│     ],                              │
│     "total_eligible": 3             │
│   }                                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Store in State                    │
│   setEligibleSchemes(response...)   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Render Results                    │
│   - Display scheme list             │
│   - Show ML probabilities           │
│   - Show eligibility status         │
└─────────────────────────────────────┘
```

---

## 🔌 Service Layer Integration

### Before Changes
```typescript
// OLD: Called basic eligibility endpoint
const response = await eligibilityAPI.check(eligibilityData);
```

### After Changes
```typescript
// NEW: Calls ML prediction endpoint through service
const response = await recommendationService.predictSchemes(mlPredictionData);
```

### Service Definition
```typescript
// File: frontend/src/services/index.ts

export interface RecommendationRequest {
  age: number;
  income: number;
  gender: string;
  category: string;
}

export interface RecommendationResponse {
  recommended_schemes: RecommendationResult[];
  total_schemes: number;
  total_eligible: number;
}

export const recommendationService = {
  // Existing protected endpoint
  getRecommendations: (data: RecommendationRequest) =>
    apiClient.post<RecommendationResponse>('/ml/recommend', data),

  // NEW: Public endpoint
  predictSchemes: (data: RecommendationRequest) =>
    apiClient.post<RecommendationResponse>('/ml/predict-schemes', data),
};
```

---

## 🧪 Testing the API Call

### Manual Test with cURL
```bash
# Copy and paste this in PowerShell

$body = @{
    age = 28
    income = 250000
    gender = "female"
    category = "General"
} | ConvertTo-Json

curl -X POST "http://localhost:8000/ml/predict-schemes" `
  -H "Content-Type: application/json" `
  -Body $body
```

### Test in Browser Console
```javascript
// Open http://localhost:5174/eligibility-check
// Open DevTools (F12)
// Copy and paste this in console:

fetch('http://localhost:8000/ml/predict-schemes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    age: 28,
    income: 250000,
    gender: 'female',
    category: 'General'
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

---

## 📱 Console Output Example

```javascript
// When user fills form and clicks "Check Eligibility":

📤 Sending ML prediction request: 
{
  age: 28,
  income: 250000,
  gender: 'female',
  category: 'General'
}

🔗 API Endpoint: POST /ml/predict-schemes

📥 ML API Response: 
{
  user: { age: 28, income: 250000, gender: 'female', category: 'General' },
  recommended_schemes: [
    {
      scheme_id: 3,
      scheme_name: 'Pradhan Mantri Jan Dhan Yojana',
      eligible: true,
      probability: 0.95
    },
    {
      scheme_id: 1,
      scheme_name: 'Pradhan Mantri Sthaniya Kshetra Aajeevika Yojana',
      eligible: true,
      probability: 0.92
    },
    {
      scheme_id: 2,
      scheme_name: 'Pradhan Mantri Kaushal Vikas Yojana',
      eligible: true,
      probability: 0.87
    }
  ],
  total_schemes: 3,
  total_eligible: 3
}

✅ Found 3 eligible schemes
```

---

## 🎯 Key Points

1. **API Endpoint**: `POST /ml/predict-schemes`
2. **Base URL**: `http://localhost:8000` (from `VITE_API_URL`)
3. **Authentication**: Not required (public endpoint)
4. **Request Fields**: 4 required (age, income, gender, category)
5. **Response**: Ranked schemes with ML probabilities
6. **Console Logging**: Full request/response logged
7. **Error Handling**: Comprehensive with user feedback
8. **State Management**: Results stored in `eligibleSchemes` state

---

## ✅ Verification

**The API call is working correctly when**:

- ✅ Console shows `📤 Sending ML prediction request...`
- ✅ Console shows `📥 ML API Response...` (not error)
- ✅ Response includes `recommended_schemes` array
- ✅ Each scheme has `scheme_id`, `scheme_name`, `eligible`, `probability`
- ✅ Results display on UI (step 5)
- ✅ Schemes are NOT hardcoded (change form inputs = different results)
- ✅ ML probabilities vary (not all 0.95)

---

**Status**: ✅ API Integration Complete
**Date**: January 26, 2026
