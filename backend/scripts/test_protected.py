import json
import urllib.request
import urllib.error
import urllib.parse

BASE='http://127.0.0.1:8000/api/v1'

def post(path, payload):
    url = BASE + path
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode('utf-8')

def get_with_auth(path, token):
    url = BASE + path
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.read().decode('utf-8')

if __name__ == '__main__':
    # Login
    try:
        body = json.dumps({'email':'bot+1@example.com','password':'password123'}).encode('utf-8')
        req = urllib.request.Request(BASE+'/auth/login', data=body, headers={'Content-Type':'application/json'})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            token = data.get('access_token')
            print('Login status:', resp.status)
            print('Token present:', bool(token))
    except urllib.error.HTTPError as e:
        print('Login failed', e.code, e.read().decode())
        raise SystemExit(1)

    # Call protected endpoint
    try:
        status, body = get_with_auth('/schemes/eligible?age=30&income=500000&gender=male', token)
        print('Protected GET /schemes/eligible ->', status)
        print(body)
    except urllib.error.HTTPError as e:
        print('Protected request failed', e.code)
        print(e.read().decode())
