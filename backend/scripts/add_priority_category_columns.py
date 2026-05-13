"""
Database Migration Script: Add priority and category columns to schemes table

This script adds the new 'priority' and 'category' columns to the existing
schemes table in the database.

Usage:
    python backend/scripts/add_priority_category_columns.py

The script will:
1. Connect to the database
2. Check if columns already exist
3. Add priority column (default=0)
4. Add category column (nullable)
5. Verify the changes
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import MetaData, Table, Column, Integer, String, text
from app.db.database import engine

def column_exists(conn, table_name, column_name):
    """Check if a column exists in a table."""
    inspector_query = f"""
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = '{table_name}' AND COLUMN_NAME = '{column_name}'
    """
    try:
        result = conn.execute(text(inspector_query))
        return result.scalar() > 0
    except:
        # If INFORMATION_SCHEMA isn't available (e.g., SQLite), try a different approach
        try:
            result = conn.execute(text(f"PRAGMA table_info({table_name})"))
            columns = result.fetchall()
            return any(col[1] == column_name for col in columns)
        except:
            return False


def migrate():
    """Execute the migration."""
    print("=" * 80)
    print("DATABASE MIGRATION: Add priority and category columns")
    print("=" * 80)
    
    with engine.connect() as conn:
        # Check if priority column exists
        if column_exists(conn, "schemes", "priority"):
            print("✅ priority column already exists")
        else:
            print("➕ Adding priority column...")
            try:
                conn.execute(text(
                    "ALTER TABLE schemes ADD COLUMN priority INTEGER DEFAULT 0"
                ))
                conn.commit()
                print("✅ priority column added successfully")
            except Exception as e:
                print(f"❌ Error adding priority column: {e}")
                conn.rollback()
                return False
        
        # Check if category column exists
        if column_exists(conn, "schemes", "category"):
            print("✅ category column already exists")
        else:
            print("➕ Adding category column...")
            try:
                conn.execute(text(
                    "ALTER TABLE schemes ADD COLUMN category TEXT NULL"
                ))
                conn.commit()
                print("✅ category column added successfully")
            except Exception as e:
                print(f"❌ Error adding category column: {e}")
                conn.rollback()
                return False
        
        # Verify the changes
        print("\n" + "=" * 80)
        print("VERIFICATION")
        print("=" * 80)
        
        try:
            result = conn.execute(text("SELECT * FROM schemes LIMIT 1"))
            columns = [desc[0] for desc in result.description] if result.description else []
            print(f"\nCurrent schemes table columns:")
            for col in columns:
                print(f"  - {col}")
            
            if "priority" in columns:
                print("\n✅ priority column verified")
            else:
                print("\n❌ priority column NOT found")
                return False
            
            if "category" in columns:
                print("✅ category column verified")
            else:
                print("❌ category column NOT found")
                return False
                
        except Exception as e:
            print(f"❌ Error verifying columns: {e}")
            return False
    
    print("\n" + "=" * 80)
    print("✅ MIGRATION COMPLETED SUCCESSFULLY")
    print("=" * 80)
    return True


if __name__ == "__main__":
    success = migrate()
    sys.exit(0 if success else 1)
