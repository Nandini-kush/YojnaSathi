"""
⚠️ TEMPORARY: Password hashing DISABLED for debugging
This file stores passwords in PLAIN TEXT.
DO NOT USE IN PRODUCTION.
For production, restore bcrypt hashing.
"""

def hash_password(password: str) -> str:
    """
    ⚠️ TEMPORARY: Store password as plain text for debugging.
    TODO: Restore bcrypt hashing after debugging is complete.
    """
    return password


def verify_password(password: str, stored_password: str) -> bool:
    """
    ⚠️ TEMPORARY: Compare passwords as plain text for debugging.
    TODO: Restore bcrypt verification after debugging is complete.
    """
    return password == stored_password
