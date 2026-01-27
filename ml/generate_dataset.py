import pandas as pd

categories = {
    "Students": {
        "gender": "Any",
        "min_age": 17,
        "max_age": 30,
        "benefit": "Scholarship"
    },
    "Women": {
        "gender": "Female",
        "min_age": 18,
        "max_age": 60,
        "benefit": "Financial Assistance"
    },
    "Farmers": {
        "gender": "Any",
        "min_age": 21,
        "max_age": 65,
        "benefit": "Subsidy"
    },
    "Children": {
        "gender": "Any",
        "min_age": 0,
        "max_age": 18,
        "benefit": "Nutrition / Education Support"
    }
}

rows = []
scheme_id = 1

for category, meta in categories.items():
    for i in range(1, 101):
        rows.append({
            "scheme_id": scheme_id,
            "scheme_name": f"{category} Welfare Scheme {i}",
            "category": category,
            "min_age": meta["min_age"],
            "max_age": meta["max_age"],
            "gender": meta["gender"],
            "income_limit": 800000,
            "state": "All India",
            "benefit_type": meta["benefit"],
            "description": f"Government-supported {category.lower()} welfare scheme focused on social upliftment.",
            "official_source": "https://www.india.gov.in"
        })
        scheme_id += 1

df = pd.DataFrame(rows)
df.to_csv("yojnasathi_400_schemes_dataset.csv", index=False)

print("✅ Dataset created: yojnasathi_400_schemes_dataset.csv")
print("Total rows:", len(df))
