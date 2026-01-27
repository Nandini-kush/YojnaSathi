"""
Model evaluation module for YojnaSathi ML pipeline.
Evaluates model performance on test set with various metrics.
"""

import joblib
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)
import os


class ModelEvaluator:
    """Handles model evaluation and performance reporting."""
    
    def __init__(self, model_path='model/scheme_model.pkl'):
        """
        Initialize evaluator and load model.
        
        Args:
            model_path (str): Path to the saved model
        """
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load trained model from disk."""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}")
        
        self.model = joblib.load(self.model_path)
        print(f"✓ Model loaded from: {self.model_path}")
    
    def evaluate(self, X_test, y_test):
        """
        Evaluate model performance on test set.
        
        Args:
            X_test (pd.DataFrame): Test feature matrix
            y_test (np.ndarray): Test target vector
            
        Returns:
            dict: Dictionary containing all evaluation metrics
        """
        print("\n" + "=" * 60)
        print("MODEL EVALUATION REPORT")
        print("=" * 60)
        
        # Make predictions
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        # Confusion matrix
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
        
        # Print key metrics
        print(f"\nTest Set Size: {len(X_test)} samples")
        print(f"Positive Class: {np.sum(y_test)} samples")
        print(f"Negative Class: {len(y_test) - np.sum(y_test)} samples")
        
        print("\n" + "=" * 60)
        print("KEY METRICS")
        print("=" * 60)
        print(f"Accuracy:     {accuracy:.4f}")
        print(f"Precision:    {precision:.4f}")
        print(f"Recall:       {recall:.4f}")
        print(f"F1-Score:     {f1:.4f}")
        print(f"Specificity:  {specificity:.4f}")
        print(f"ROC-AUC:      {roc_auc:.4f}")
        
        # Confusion matrix
        print("\n" + "=" * 60)
        print("CONFUSION MATRIX")
        print("=" * 60)
        print(f"True Negatives:  {tn}")
        print(f"False Positives: {fp}")
        print(f"False Negatives: {fn}")
        print(f"True Positives:  {tp}")
        
        # Classification report
        print("\n" + "=" * 60)
        print("DETAILED CLASSIFICATION REPORT")
        print("=" * 60)
        print(classification_report(
            y_test, y_pred,
            target_names=['Not Eligible (0)', 'Eligible (1)'],
            digits=4
        ))
        
        # Store results
        metrics = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'specificity': specificity,
            'roc_auc': roc_auc,
            'confusion_matrix': {
                'tn': int(tn),
                'fp': int(fp),
                'fn': int(fn),
                'tp': int(tp)
            },
            'test_size': len(X_test),
            'positive_samples': int(np.sum(y_test)),
            'negative_samples': int(len(y_test) - np.sum(y_test))
        }
        
        return metrics
    
    def print_model_info(self):
        """Print information about the trained model."""
        if self.model is None:
            raise ValueError("No model loaded")
        
        print("\n" + "=" * 60)
        print("MODEL INFORMATION")
        print("=" * 60)
        print(f"Model Type: {type(self.model).__name__}")
        print(f"Number of Trees: {self.model.n_estimators}")
        print(f"Max Depth: {self.model.max_depth}")
        print(f"Min Samples Split: {self.model.min_samples_split}")
        print(f"Min Samples Leaf: {self.model.min_samples_leaf}")
        print(f"Number of Classes: {len(self.model.classes_)}")
        print(f"Classes: {self.model.classes_}")
        print(f"Number of Features: {self.model.n_features_in_}")


def evaluate_pipeline(model_path='model/scheme_model.pkl',
                     preprocessor_path='model/preprocessor.pkl',
                     dataset_path='data/schemes_dataset.csv'):
    """
    Complete evaluation pipeline.
    
    Args:
        model_path (str): Path to saved model
        preprocessor_path (str): Path to saved preprocessor
        dataset_path (str): Path to dataset (for test split)
        
    Returns:
        dict: Evaluation metrics
    """
    print("\n" + "=" * 60)
    print("STARTING MODEL EVALUATION PIPELINE")
    print("=" * 60 + "\n")
    
    # Load preprocessor and data
    print("[1/3] Loading preprocessor and data...")
    preprocessor = joblib.load(preprocessor_path)
    df = preprocessor.load_data(dataset_path)
    X, y = preprocessor.preprocess_full_pipeline(df, fit=False)
    print("✓ Preprocessor and data loaded")
    
    # Split data
    print("\n[2/3] Creating test set...")
    _, X_test, _, y_test = preprocessor.train_test_split_data(X, y)
    print(f"✓ Test set created: {len(X_test)} samples")
    
    # Evaluate model
    print("\n[3/3] Evaluating model...")
    evaluator = ModelEvaluator(model_path=model_path)
    evaluator.print_model_info()
    metrics = evaluator.evaluate(X_test, y_test)
    
    print("\n" + "=" * 60)
    print("EVALUATION COMPLETED")
    print("=" * 60 + "\n")
    
    return metrics


if __name__ == '__main__':
    """Run evaluation when executed as main script."""
    import sys
    
    model_path = 'model/scheme_model.pkl'
    preprocessor_path = 'model/preprocessor.pkl'
    dataset_path = 'data/schemes_dataset.csv'
    
    # Check if model exists
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        print("Please train the model first using: python train_model.py")
        sys.exit(1)
    
    # Run evaluation pipeline
    metrics = evaluate_pipeline(model_path, preprocessor_path, dataset_path)
