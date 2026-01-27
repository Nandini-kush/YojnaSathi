"""
Data preprocessing module for YojnaSathi ML pipeline.
Handles feature engineering, encoding, and data normalization.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split


class DataPreprocessor:
    """Handles all data preprocessing operations for the eligibility classification model."""
    
    # Valid categorical values (as they appear in training data)
    VALID_GENDERS = ['Male', 'Female', 'Other']
    VALID_CATEGORIES = ['General', 'OBC', 'SC', 'ST']
    
    # Mapping from various input formats to canonical format
    GENDER_MAPPING = {
        'male': 'Male',
        'female': 'Female',
        'other': 'Other',
        'Male': 'Male',
        'Female': 'Female',
        'Other': 'Other',
    }
    
    CATEGORY_MAPPING = {
        'general': 'General',
        'obc': 'OBC',
        'sc': 'SC',
        'st': 'ST',
        'General': 'General',
        'OBC': 'OBC',
        'SC': 'SC',
        'ST': 'ST',
    }
    
    def __init__(self):
        """Initialize the preprocessor with encoders and scaler."""
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.categorical_columns = []
        self.numerical_columns = []
        
    def normalize_categorical_values(self, df):
        """
        Normalize categorical values to match training data format.
        
        Handles case-insensitive input and maps to canonical format:
        - 'male', 'Male' → 'Male'
        - 'female', 'Female' → 'Female'
        - 'general', 'General' → 'General'
        - 'obc', 'OBC' → 'OBC'
        - 'sc', 'SC' → 'SC'
        - 'st', 'ST' → 'ST'
        
        Args:
            df (pd.DataFrame): DataFrame with categorical columns
            
        Returns:
            pd.DataFrame: DataFrame with normalized categorical values
        """
        df = df.copy()
        
        # Normalize gender
        if 'gender' in df.columns:
            df['gender'] = df['gender'].astype(str).map(self.GENDER_MAPPING)
            if df['gender'].isna().any():
                raise ValueError(
                    f"Invalid gender value. Must be one of: {self.VALID_GENDERS}"
                )
        
        # Normalize category
        if 'category' in df.columns:
            df['category'] = df['category'].astype(str).map(self.CATEGORY_MAPPING)
            if df['category'].isna().any():
                raise ValueError(
                    f"Invalid category value. Must be one of: {self.VALID_CATEGORIES}"
                )
        
        # Normalize scheme_category (for scheme data)
        if 'scheme_category' in df.columns:
            df['scheme_category'] = df['scheme_category'].astype(str).map(self.CATEGORY_MAPPING)
            if df['scheme_category'].isna().any():
                raise ValueError(
                    f"Invalid scheme_category value. Must be one of: {self.VALID_CATEGORIES}"
                )
        
        return df
        
    def load_data(self, filepath):
        """
        Load CSV dataset.
        
        Args:
            filepath (str): Path to the CSV file
            
        Returns:
            pd.DataFrame: Loaded dataset
        """
        df = pd.read_csv(filepath)
        return df
    
    def engineer_features(self, df):
        """
        Create engineered features from raw data.
        
        Features engineered:
        - age_scheme_gap: Difference between user age and scheme min age
        - income_ratio: User income as ratio to scheme income limit
        - age_eligibility_window: Width of scheme's age eligibility window
        
        Args:
            df (pd.DataFrame): Raw dataset
            
        Returns:
            pd.DataFrame: Dataset with engineered features
        """
        df = df.copy()
        
        # Normalize categorical values first (handles case-insensitive input)
        df = self.normalize_categorical_values(df)
        
        # Age-related features
        df['age_scheme_gap'] = df['age'] - df['scheme_min_age']
        df['age_from_max'] = df['scheme_max_age'] - df['age']
        df['age_eligibility_window'] = df['scheme_max_age'] - df['scheme_min_age']
        
        # Income-related features
        df['income_ratio'] = df['income'] / (df['scheme_income_limit'] + 1)
        df['income_above_limit'] = (df['income'] > df['scheme_income_limit']).astype(int)
        
        # Category match
        df['category_match'] = (df['category'] == df['scheme_category']).astype(int)
        
        return df
    
    def prepare_features_target(self, df):
        """
        Separate features and target variable.
        Identify categorical and numerical columns for encoding.
        
        Args:
            df (pd.DataFrame): Preprocessed dataset
            
        Returns:
            tuple: (X, y) feature matrix and target vector
        """
        # Target variable
        y = df['eligible'].values
        
        # Features to use (exclude original scheme columns as they're engineered)
        feature_cols = [
            'age', 'income', 'gender', 'category',
            'scheme_min_age', 'scheme_max_age', 'scheme_income_limit',
            'age_scheme_gap', 'age_from_max', 'age_eligibility_window',
            'income_ratio', 'income_above_limit', 'category_match'
        ]
        
        X = df[feature_cols].copy()
        
        # Identify categorical columns
        self.categorical_columns = ['gender', 'category']
        self.numerical_columns = [col for col in feature_cols if col not in self.categorical_columns]
        
        return X, y
    
    def encode_categorical_features(self, X, fit=True):
        """
        Encode categorical features using LabelEncoder.
        
        Args:
            X (pd.DataFrame): Feature matrix
            fit (bool): If True, fit encoders; if False, use existing encoders
            
        Returns:
            pd.DataFrame: Encoded feature matrix
        """
        X = X.copy()
        
        for col in self.categorical_columns:
            if col not in X.columns:
                continue
                
            if fit:
                # Create new encoder for this column
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                self.label_encoders[col] = le
            else:
                # Use existing encoder
                le = self.label_encoders.get(col)
                if le is not None:
                    X[col] = le.transform(X[col].astype(str))
        
        return X
    
    def scale_features(self, X, fit=True):
        """
        Scale numerical features using StandardScaler.
        
        Args:
            X (pd.DataFrame): Feature matrix
            fit (bool): If True, fit scaler; if False, use existing scaler
            
        Returns:
            pd.DataFrame: Scaled feature matrix
        """
        X = X.copy()
        
        if fit:
            X[self.numerical_columns] = self.scaler.fit_transform(X[self.numerical_columns])
        else:
            X[self.numerical_columns] = self.scaler.transform(X[self.numerical_columns])
        
        return X
    
    def preprocess_full_pipeline(self, df, fit=True):
        """
        Run the complete preprocessing pipeline.
        
        Steps:
        1. Engineer features
        2. Separate features and target
        3. Encode categorical variables
        4. Scale numerical features
        
        Args:
            df (pd.DataFrame): Raw dataset
            fit (bool): If True, fit all transformers; if False, use existing ones
            
        Returns:
            tuple: (X_processed, y) processed feature matrix and target vector
        """
        # Feature engineering
        df_engineered = self.engineer_features(df)
        
        # Prepare features and target
        X, y = self.prepare_features_target(df_engineered)
        
        # Encode categorical features
        X = self.encode_categorical_features(X, fit=fit)
        
        # Scale numerical features
        X = self.scale_features(X, fit=fit)
        
        return X, y
    
    def train_test_split_data(self, X, y, test_size=0.2, random_state=42):
        """
        Split data into training and testing sets.
        
        Args:
            X (pd.DataFrame): Feature matrix
            y (np.ndarray): Target vector
            test_size (float): Proportion of data for testing
            random_state (int): Random seed for reproducibility
            
        Returns:
            tuple: (X_train, X_test, y_train, y_test)
        """
        return train_test_split(
            X, y,
            test_size=test_size,
            random_state=random_state,
            stratify=y  # Maintain class balance
        )


def get_preprocessor():
    """
    Factory function to get a preprocessor instance.
    
    Returns:
        DataPreprocessor: Initialized preprocessor object
    """
    return DataPreprocessor()
