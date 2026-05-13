"""
YojnaSathi ML Pipeline Package

Main exports for easy importing.
"""

from .predict import SchemePredictor, get_predictor

__version__ = '1.0.0'
__author__ = 'YojnaSathi ML Team'

__all__ = [
    'SchemePredictor',
    'get_predictor',
]
