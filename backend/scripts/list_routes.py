from app.main import app

routes = sorted([r.path for r in app.routes if r.path.startswith('/api/v1')])
print('API v1 Endpoints:')
for r in routes:
    print('  ' + r)
