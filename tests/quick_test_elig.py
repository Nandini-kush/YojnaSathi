import requests
import json

# Login first  
login_resp = requests.post('http://127.0.0.1:8000/auth/login', json={
    'email': 'testuser@example.com',
    'password': 'testpass123'
})
token = login_resp.json()['access_token']
print(f"✅ Got token")

# Try eligibility check
headers = {'Authorization': f'Bearer {token}'}
elig_resp = requests.post('http://127.0.0.1:8000/schemes/check-eligibility', 
    json={'age': 25, 'income': 30000, 'gender': 'male'},
    headers=headers
)
print(f'Status: {elig_resp.status_code}')
if elig_resp.status_code == 200:
    data = elig_resp.json()
    print('✅ Eligibility check passed!')
    print(f'Eligible count: {data.get("eligible_count")}')
    schemes = data.get('eligible_schemes', [])
    if schemes:
        print(f'Sample scheme: {json.dumps(schemes[0], indent=2)}'  )
else:
    print(f'Error: {elig_resp.text[:200]}')
