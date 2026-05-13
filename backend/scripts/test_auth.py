import json
import urllib.request
import urllib.error

BASE='http://127.0.0.1:8000/api/v1'

def post(path, payload):
    url = BASE + path
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            print(f'POST {path} -> {resp.status}')
            print(body)
            return resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f'POST {path} -> ERROR {e.code}')
        print(body)
        return e.code, body

if __name__ == '__main__':
    # Try register (may 409 if already exists)
    post('/auth/register', {'name':'Test Bot','email':'bot+1@example.com','password':'password123'})
    # Then login
    post('/auth/login', {'email':'bot+1@example.com','password':'password123'})
