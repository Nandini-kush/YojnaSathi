"""
Model training module for YojnaSathi ML pipeline.
Trains the RandomForest classifier for scheme eligibility prediction.
"""

import os
import sys
import joblib
from sklearn.ensemble import RandomForestClassifier

# Add current directory to path to allow relative imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Try to import from ml.preprocessing (for backend), fall back to preprocessing (for direct execution)
try:
    from ml.preprocessing import get_preprocessor
except ImportError:
    from preprocessing import get_preprocessor


class ModelTrainer:
    """Handles model training, saving, and versioning."""
    
    def __init__(self, model_dir='model'):
        """
        Initialize the trainer.
        
        Args:
            model_dir (str): Directory to save trained models
        """
        self.model_dir = model_dir
        self.model = None
        self.preprocessor = None
        
        # Create model directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
    
    def train(self, X_train, y_train, **kwargs):
        """
        Train RandomForest classifier.
        
        Args:
            X_train (pd.DataFrame): Training feature matrix
            y_train (np.ndarray): Training target vector
            **kwargs: Additional parameters for RandomForestClassifier
                - n_estimators (int): Number of trees (default: 100)
                - max_depth (int): Maximum tree depth (default: 15)
                - min_samples_split (int): Min samples to split (default: 5)
                - random_state (int): Random seed (default: 42)
                
        Returns:
            sklearn.ensemble.RandomForestClassifier: Trained model
        """
        # Set default hyperparameters
        params = {
            'n_estimators': 100,
            'max_depth': 15,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': 42,
            'n_jobs': -1,  # Use all available processors
            'class_weight': 'balanced'  # Handle class imbalance
        }
        
        # Override with provided parameters
        params.update(kwargs)
        
        print("=" * 60)
        print("TRAINING RANDOM FOREST CLASSIFIER")
        print("=" * 60)
        print(f"Training samples: {len(X_train)}")
        print(f"Features: {X_train.shape[1]}")
        
        # Handle both numpy array and pandas Series
        if hasattr(y_train, 'value_counts'):
            class_dist = y_train.value_counts()
        else:
            import pandas as pd
            class_dist = pd.Series(y_train).value_counts()
        print(f"Class distribution:\n{class_dist}")
        print(f"\nHyperparameters: {params}")
        print("=" * 60)
        
        # Initialize and train model
        self.model = RandomForestClassifier(**params)
        self.model.fit(X_train, y_train)
        
        print("✓ Model training completed successfully!")
        return self.model
    
    def save_model(self, model_name='scheme_model.pkl'):
        """
        Save trained model to disk using joblib.
        
        Args:
            model_name (str): Name of the model file
            
        Returns:
            str: Full path to saved model
        """
        if self.model is None:
            raise ValueError("No model to save. Train a model first.")
        
        model_path = os.path.join(self.model_dir, model_name)
        joblib.dump(self.model, model_path)
        
        print(f"✓ Model saved to: {model_path}")
        return model_path
    
    def save_preprocessor(self, preprocessor, preprocessor_name='preprocessor.pkl'):
        """
        Save preprocessor for later use in predictions.
        
        Args:
            preprocessor (DataPreprocessor): Fitted preprocessor object
            preprocessor_name (str): Name of the preprocessor file
            
        Returns:
            str: Full path to saved preprocessor
        """
        preprocessor_path = os.path.join(self.model_dir, preprocessor_name)
        joblib.dump(preprocessor, preprocessor_path)
        
        print(f"✓ Preprocessor saved to: {preprocessor_path}")
        return preprocessor_path
    
    def get_feature_importance(self, feature_names=None, top_n=10):
        """
        Get feature importance from trained model.
        
        Args:
            feature_names (list): List of feature names (optional)
            top_n (int): Number of top features to return
            
        Returns:
            pd.DataFrame: Feature importance ranking
        """
        if self.model is None:
            raise ValueError("No model available. Train a model first.")
        
        importance = self.model.feature_importances_
        
        if feature_names is None:
            feature_names = [f"Feature_{i}" for i in range(len(importance))]
        
        # Create dataframe and sort
        import pandas as pd
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)
        
        print(f"\nTop {top_n} Important Features:")
        print("=" * 50)
        for idx, row in importance_df.head(top_n).iterrows():
            print(f"{row['feature']:30s} {row['importance']:.4f}")
        
        return importance_df


def train_pipeline(dataset_path, model_dir='model'):
    """
    Complete training pipeline from raw data to saved model.
    
    Args:
        dataset_path (str): Path to the CSV dataset
        model_dir (str): Directory to save models
        
    Returns:
        tuple: (model, preprocessor) - Trained model and fitted preprocessor
    """
    print("\n" + "=" * 60)
    print("STARTING COMPLETE ML TRAINING PIPELINE")
    print("=" * 60 + "\n")
    
    # Step 1: Load and preprocess data
    print("[1/4] Loading and preprocessing data...")
    preprocessor = get_preprocessor()
    df = preprocessor.load_data(dataset_path)
    X, y = preprocessor.preprocess_full_pipeline(df, fit=True)
    print(f"✓ Data loaded: {df.shape[0]} samples, {X.shape[1]} features")
    
    # Step 2: Split data
    print("\n[2/4] Splitting into train/test sets...")
    X_train, X_test, y_train, y_test = preprocessor.train_test_split_data(X, y)
    print(f"✓ Train set: {len(X_train)} samples")
    print(f"✓ Test set: {len(X_test)} samples")
    
    # Step 3: Train model
    print("\n[3/4] Training model...")
    trainer = ModelTrainer(model_dir=model_dir)
    model = trainer.train(X_train, y_train)
    
    # Step 4: Save artifacts
    print("\n[4/4] Saving trained artifacts...")
    trainer.save_model()
    trainer.save_preprocessor(preprocessor)
    print("✓ All artifacts saved successfully!")
    
    # Display feature importance
    feature_names = [
        'age', 'income', 'gender', 'category',
        'scheme_min_age', 'scheme_max_age', 'scheme_income_limit',
        'age_scheme_gap', 'age_from_max', 'age_eligibility_window',
        'income_ratio', 'income_above_limit', 'category_match'
    ]
    trainer.get_feature_importance(feature_names=feature_names)
    
    print("\n" + "=" * 60)
    print("TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 60 + "\n")
    
    return model, preprocessor, X_test, y_test


if __name__ == '__main__':
    """Run training when executed as main script."""
    import sys
    
    # Add parent directory to path so ml.preprocessing can be imported
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    # Determine dataset path
    data_path = 'data/schemes_dataset.csv'
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        sys.exit(1)
    
    # Run training pipeline
    model, preprocessor, X_test, y_test = train_pipeline(data_path)
