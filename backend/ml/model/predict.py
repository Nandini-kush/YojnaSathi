import joblib
import os

# Load model and vectorizer once
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/domain_model.pkl")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "../models/vectorizer.pkl")

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

def predict_domain(text):
    """
    Input: user text (string)
    Output: predicted domain (string)
    """
    X = vectorizer.transform([text])
    return model.predict(X)[0]
