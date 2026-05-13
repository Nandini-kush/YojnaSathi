"""
Database Migration Script: Add user profile columns to users table

This script adds the following columns if missing:
- age INTEGER NOT NULL DEFAULT 0
- income REAL NOT NULL DEFAULT 0.0
- gender VARCHAR(20) NOT NULL DEFAULT ''
- caste VARCHAR(50) NOT NULL DEFAULT ''
- state VARCHAR(100) NOT NULL DEFAULT ''

Usage:
    python backend/scripts/add_user_profile_columns.py
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db.database import engine


def column_exists(conn, table_name, column_name):
    try:
        result = conn.execute(text(f"PRAGMA table_info({table_name})"))
        cols = [row[1] for row in result.fetchall()]
        return column_name in cols
    except Exception:
        # Fallback for other DBs
        try:
            result = conn.execute(text(
                f"SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='{table_name}' AND COLUMN_NAME='{column_name}'"
            ))
            return result.scalar() > 0
        except Exception:
            return False


def migrate():
    print("="*80)
    print("DATABASE MIGRATION: Add user profile columns to users table")
    print("="*80)

    with engine.connect() as conn:
        # age
        if column_exists(conn, 'users', 'age'):
            print('✅ age column exists')
        else:
            try:
                print('➕ Adding age column...')
                conn.execute(text("ALTER TABLE users ADD COLUMN age INTEGER NOT NULL DEFAULT 0"))
                conn.commit()
                print('✅ age added')
            except Exception as e:
                print('❌ Failed to add age:', e)
                conn.rollback()
                return False

        # income
        if column_exists(conn, 'users', 'income'):
            print('✅ income column exists')
        else:
            try:
                print('➕ Adding income column...')
                conn.execute(text("ALTER TABLE users ADD COLUMN income REAL NOT NULL DEFAULT 0.0"))
                conn.commit()
                print('✅ income added')
            except Exception as e:
                print('❌ Failed to add income:', e)
                conn.rollback()
                return False

        # gender
        if column_exists(conn, 'users', 'gender'):
            print('✅ gender column exists')
        else:
            try:
                print('➕ Adding gender column...')
                conn.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR(20) NOT NULL DEFAULT ''"))
                conn.commit()
                print('✅ gender added')
            except Exception as e:
                print('❌ Failed to add gender:', e)
                conn.rollback()
                return False

        # caste
        if column_exists(conn, 'users', 'caste'):
            print('✅ caste column exists')
        else:
            try:
                print('➕ Adding caste column...')
                conn.execute(text("ALTER TABLE users ADD COLUMN caste VARCHAR(50) NOT NULL DEFAULT ''"))
                conn.commit()
                print('✅ caste added')
            except Exception as e:
                print('❌ Failed to add caste:', e)
                conn.rollback()
                return False

        # state
        if column_exists(conn, 'users', 'state'):
            print('✅ state column exists')
        else:
            try:
                print('➕ Adding state column...')
                conn.execute(text("ALTER TABLE users ADD COLUMN state VARCHAR(100) NOT NULL DEFAULT ''"))
                conn.commit()
                print('✅ state added')
            except Exception as e:
                print('❌ Failed to add state:', e)
                conn.rollback()
                return False

        # (is_student column handling removed - not used anymore)

        print('\n' + '='*80)
        print('VERIFICATION - columns present for users table:')
        try:
            result = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in result.fetchall()]
            for c in cols:
                print(' -', c)
        except Exception:
            try:
                result = conn.execute(text("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users'"))
                for row in result.fetchall():
                    print(' -', row[0])
            except Exception as e:
                print('Could not list columns:', e)

    print('\n✅ MIGRATION COMPLETED')
    return True

if __name__ == '__main__':
    ok = migrate()
    sys.exit(0 if ok else 1)
