from typing import List, Dict, Tuple, Set
import logging
import re
from sqlalchemy.orm import Session

from ..db.models import Scheme, User
from ..db.database import SessionLocal
from ..utils.serializers import scheme_to_dict

logger = logging.getLogger(__name__)

# ============================================================================
# COMPREHENSIVE STATE MAPPING
# ============================================================================
STATE_MAP = {
    "ap": "andhra pradesh", "ar": "arunachal pradesh", "as": "assam",
    "br": "bihar", "ct": "chhattisgarh", "cg": "chhattisgarh",
    "ga": "goa", "gj": "gujarat", "hr": "haryana",
    "hp": "himachal pradesh", "jk": "jammu and kashmir", "jh": "jharkhand",
    "ka": "karnataka", "kl": "kerala", "mp": "madhya pradesh",
    "mh": "maharashtra", "mn": "manipur", "ml": "meghalaya",
    "mz": "mizoram", "nl": "nagaland", "or": "odisha",
    "pb": "punjab", "rj": "rajasthan", "sk": "sikkim",
    "tn": "tamil nadu", "tg": "telangana", "tr": "tripura",
    "up": "uttar pradesh", "uk": "uttarakhand", "wb": "west bengal",
    "dl": "delhi", "ld": "ladakh", "all": "all", "all india": "all"
}

GENDER_MAP = {
    "m": "male", "male": "male", "f": "female", "female": "female",
    "o": "other", "other": "other", "all": "all"
}

CASTEMAP = {
    "sc": "sc", "st": "st", "obc": "obc", "general": "general",
    "bpl": "bpl", "ews": "ews", "all": "all"
}

# ============================================================================
# NORMALIZATION HELPERS
# ============================================================================
def clean_string(val) -> str:
    """Convert None to "", strip whitespace, and convert to lowercase."""
    if val is None:
        return ""
    return str(val).strip().lower()

def _normalize_state(val: str) -> str:
    cleaned = clean_string(val)
    return STATE_MAP.get(cleaned, cleaned)

def _normalize_gender(val: str) -> str:
    cleaned = clean_string(val)
    return GENDER_MAP.get(cleaned, cleaned)

def _normalize_caste(val: str) -> str:
    cleaned = clean_string(val)
    return CASTEMAP.get(cleaned, cleaned)

def _parse_multi(val: str) -> List[str]:
    """Split values by '/' and ',' and trim spaces."""
    cleaned = clean_string(val)
    if not cleaned:
        return []
    # Replace comma with slash for uniform splitting
    parts = cleaned.replace(",", "/").split("/")
    return [p.strip() for p in parts if p.strip()]

# ============================================================================
# CORE ELIGIBILITY LOGIC
# ============================================================================

def is_scheme_eligible(
    scheme: Scheme,
    age: int = None,
    income: float = None,
    gender: str = None,
    caste: str = None,
    state: str = None
) -> bool:
    
    # 6. ACTIVE FLAG
    if not getattr(scheme, "is_active", True):
        return False
        
    s_name = getattr(scheme, "scheme_name", getattr(scheme, "name", "Unknown"))
    
    logger.debug(f"Checking scheme: {s_name}")

    # 1. AGE
    min_age = getattr(scheme, "min_age", None)
    max_age = getattr(scheme, "max_age", None)
    if age is not None:
        if min_age is not None and age < min_age:
            logger.debug(f"Rejected: age {age} < min_age {min_age}")
            return False
        if max_age is not None and age > max_age:
            logger.debug(f"Rejected: age {age} > max_age {max_age}")
            return False

    # 2. INCOME
    max_income = getattr(scheme, "max_income", None)
    if income is not None:
        if max_income is not None and income > max_income:
            logger.debug(f"Rejected: income {income} > max_income {max_income}")
            return False

    # 3. GENDER
    s_gender_raw = getattr(scheme, "gender", None)
    s_gender = clean_string(s_gender_raw)
    if s_gender and s_gender != "all":
        u_gender = _normalize_gender(gender)
        allowed = [_normalize_gender(g) for g in _parse_multi(s_gender)]
        if u_gender not in allowed and "all" not in allowed:
            logger.debug(f"Rejected: gender mismatch (scheme={s_gender_raw}, user={gender})")
            return False

    # 4. CASTE
    s_caste_raw = getattr(scheme, "caste", None)
    s_caste = clean_string(s_caste_raw)
    if s_caste and s_caste != "all":
        u_caste = _normalize_caste(caste)
        allowed = [_normalize_caste(c) for c in _parse_multi(s_caste)]
        if u_caste not in allowed and "all" not in allowed:
            logger.debug(f"Rejected: caste mismatch (scheme={s_caste_raw}, user={caste})")
            return False

    # 5. STATE
    s_state_raw = getattr(scheme, "state", None)
    s_state = clean_string(s_state_raw)
    if s_state and s_state != "all":
        u_state = _normalize_state(state)
        allowed = [_normalize_state(s) for s in _parse_multi(s_state)]
        if u_state not in allowed and "all" not in allowed:
            logger.debug(f"Rejected: state mismatch (scheme={s_state_raw}, user={state})")
            return False

    logger.debug("Accepted: all criteria matched")
    return True


def calculate_score(
    scheme: Scheme,
    age: int,
    income: float,
    gender: str = None,
    caste: str = None,
    state: str = None
) -> int:
    score = 0
    
    priority = getattr(scheme, 'priority', 0) or 0
    score += priority * 30
    
    s_state_raw = getattr(scheme, "state", None)
    if s_state_raw:
        u_state = _normalize_state(state)
        allowed = [_normalize_state(s) for s in _parse_multi(s_state_raw)]
        if u_state in allowed and "all" not in allowed:
            score += 20
            
    s_caste_raw = getattr(scheme, "caste", None)
    if s_caste_raw:
        u_caste = _normalize_caste(caste)
        allowed = [_normalize_caste(c) for c in _parse_multi(s_caste_raw)]
        if u_caste in allowed and "all" not in allowed:
            score += 20
            
    s_gender_raw = getattr(scheme, "gender", None)
    if s_gender_raw:
        allowed = [_normalize_gender(g) for g in _parse_multi(s_gender_raw)]
        if "all" not in allowed:
            score += 10
            
    max_income = getattr(scheme, "max_income", None)
    if max_income and income is not None:
        if max_income > 0:
            if income / max_income < 0.8:
                score += 10
        elif income == 0:
            score += 10
            
    return score


def load_schemes() -> List[Scheme]:
    db = SessionLocal()
    try:
        return db.query(Scheme).filter(Scheme.is_active == True).all()
    finally:
        db.close()


def get_eligible_schemes(
    age: int,
    income: float,
    gender: str = None,
    caste: str = None,
    state: str = None
) -> List[Dict]:
    if age is None or income is None:
        raise ValueError("Age and income are required for eligibility check")

    logger.info(f"[START ELIGIBILITY FILTER] age={age}, income={income}, gender={gender}, caste={caste}, state={state}")

    db = SessionLocal()
    try:
        schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
        eligible_with_scores = []

        for scheme in schemes:
            if is_scheme_eligible(scheme, age, income, gender, caste, state):
                score = calculate_score(scheme, age, income, gender, caste, state)
                eligible_with_scores.append((scheme, score))

        eligible_with_scores.sort(key=lambda x: x[1], reverse=True)

        result = []
        for scheme, score in eligible_with_scores:
            scheme_dict = scheme_to_dict(scheme)
            scheme_dict["score"] = score
            result.append(scheme_dict)

        if not result:
            logger.warning("[NO MATCHES] Strict filtering returned 0 eligible schemes.")

        return result
    except Exception as e:
        logger.error(f"[ERROR] get_eligible_schemes failed: {str(e)}", exc_info=True)
        return []
    finally:
        db.close()


def get_eligible_schemes_for_user(db: Session, user: User) -> List[dict]:
    age = getattr(user, 'age', None)
    income = getattr(user, 'income', None)
    gender = getattr(user, 'gender', None)
    caste = getattr(user, 'caste', None)
    state = getattr(user, 'state', None)

    try:
        return get_eligible_schemes(
            age=age,
            income=income,
            gender=gender,
            caste=caste,
            state=state,
        )
    except Exception as e:
        logger.error(f"[ERROR] Exception in get_eligible_schemes for user {user.id}: {e}", exc_info=True)
        return []
