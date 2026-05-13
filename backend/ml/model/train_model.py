import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

def generate_synthetic_data(n_samples=5000):
    np.random.seed(42)
    
    ages = np.random.randint(18, 65, n_samples)
    incomes = np.random.exponential(scale=300000, size=n_samples)
    genders = np.random.choice(["male", "female", "other"], n_samples, p=[0.48, 0.48, 0.04])
    categories = np.random.choice(["general", "obc", "sc", "st", "ews"], n_samples)
    states = np.random.choice(["maharashtra", "delhi", "karnataka", "gujarat", "all india"], n_samples)
    
    # Synthetic target: relevance (1 or 0)
    # Higher relevance for lower income, specific categories, or older age
    relevance = np.zeros(n_samples, dtype=int)
    
    for i in range(n_samples):
        score = 0
        if incomes[i] < 250000:
            score += 2
        if categories[i] in ["sc", "st", "ews"]:
            score += 2
        if ages[i] > 50:
            score += 1
        if genders[i] == "female":
            score += 1
            
        # Add some noise
        score += np.random.normal(0, 1)
        
        relevance[i] = 1 if score > 3 else 0

    df = pd.DataFrame({
        "age": ages,
        "income": incomes,
        "gender": genders,
        "category": categories,
        "state": states,
        "relevance": relevance
    })
    
    return df

def train():
    print("Generating synthetic data...")
    df = generate_synthetic_data()
    
    X = df.drop("relevance", axis=1)
    y = df["relevance"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Preprocessing
    categorical_features = ["gender", "category", "state"]
    numeric_features = ["age", "income"]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
        ]
    )
    
    # We will fit the preprocessor separately to save it, or we can save the whole pipeline.
    # ml_service.py expects preprocessor.pkl and scheme_model.pkl separately.
    print("Fitting preprocessor...")
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_processed, y_train)
    
    print("Evaluating...")
    y_pred = model.predict(X_test_processed)
    print(classification_report(y_test, y_pred))
    
    # Save artifacts
    os.makedirs("models", exist_ok=True)
    
    print("Saving model artifacts...")
    joblib.dump(preprocessor, "models/preprocessor.pkl")
    joblib.dump(model, "models/scheme_model.pkl")
    print("✅ Training complete. Artifacts saved to models/")

if __name__ == "__main__":
    train()
