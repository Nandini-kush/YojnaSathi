@echo off
REM Test FastAPI Backend Structure
REM Run from backend directory

echo.
echo ================================
echo FastAPI Backend Structure Verification
echo ================================
echo.

REM Check if running from backend directory
if not exist "app\main.py" (
    echo ERROR: Run this script from the backend directory
    echo cd C:\Users\Soft Tech\Desktop\YojnaSathi\backend
    exit /b 1
)

echo Checking directory structure...
echo ✓ backend/app/main.py exists
echo ✓ backend/app/routes/ exists

if exist "app\routes\__init__.py" (
    echo ✓ backend/app/routes/__init__.py exists
) else (
    echo ✗ Missing: backend/app/routes/__init__.py
)

if exist "app\services\__init__.py" (
    echo ✓ backend/app/services/__init__.py exists
) else (
    echo ✗ Missing: backend/app/services/__init__.py
)

if exist "app\db\__init__.py" (
    echo ✓ backend/app/db/__init__.py exists
) else (
    echo ✗ Missing: backend/app/db/__init__.py
)

echo.
echo ================================
echo To start the server:
echo ================================
echo.
echo Option 1: python -m uvicorn app.main:app --reload
echo Option 2: python run.py
echo.
echo Server will run at: http://localhost:8000
echo Docs available at: http://localhost:8000/docs
echo.
