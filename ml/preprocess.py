import pandas as pd
from sklearn.preprocessing import LabelEncoder

def preprocess_data(csv_path):
    df = pd.read_csv(csv_path)

    # -------------------------
    # Define columns
    # -------------------------
    categorical_cols = ["gender", "state", "education", "category"]
    numeric_cols = ["min_age", "max_age", "income_limit", "benefit_amount"]

    # -------------------------
    # Force numeric columns to numeric dtype
    # -------------------------
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # -------------------------
    # Fill missing values (SAFE WAY)
    # -------------------------
    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].fillna("Any")

    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].fillna(0)

    # -------------------------
    # Encode categorical columns
    # -------------------------
    encoders = {}
    for col in categorical_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            encoders[col] = le

    return df, encoders
