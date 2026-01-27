from .database import SessionLocal
from .models import Scheme

schemes_data = [
    {
        "scheme_name": "Ayushman Bharat Yojana",
        "min_age": 0,
        "max_age": 100,
        "max_income": 250000,
        "category": "All",
        "state": "Central",
        "benefits": "Free health insurance up to ₹5 lakh per family per year",
        "official_link": "https://pmjay.gov.in/"
    },
    {
        "scheme_name": "Pradhan Mantri Awas Yojana",
        "min_age": 18,
        "max_age": 60,
        "max_income": 300000,
        "category": "All",
        "state": "Central",
        "benefits": "Financial assistance for affordable housing",
        "official_link": "https://pmaymis.gov.in/"
    },
    {
        "scheme_name": "PM Kisan Samman Nidhi",
        "min_age": 18,
        "max_age": 70,
        "max_income": 200000,
        "category": "All",
        "state": "Central",
        "benefits": "₹6000 per year income support to farmers",
        "official_link": "https://pmkisan.gov.in/"
    }
]

def seed_schemes():
    db = SessionLocal()

    for data in schemes_data:
        scheme = Scheme(**data)
        db.add(scheme)

    db.commit()
    db.close()
    print("✅ Schemes inserted into database")

if __name__ == "__main__":
    seed_schemes()
