# YojnaSathi Frontend

A modern React frontend for the YojnaSathi government scheme eligibility checker application.

## Features

- ✅ User authentication (Login & Registration)
- ✅ JWT token-based authentication with Bearer tokens
- ✅ Browse government schemes
- ✅ Check eligibility for schemes
- ✅ User profile management
- ✅ Responsive design with Tailwind CSS
- ✅ Smooth animations with Framer Motion
- ✅ State management with Zustand
- ✅ Axios for API calls with interceptors
- ✅ Protected routes

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── context/          # State management (Zustand)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── styles/           # CSS files
│   ├── assets/           # Images, fonts, etc.
│   ├── App.tsx           # Main app component
│   └── main.tsx          # React DOM entry point
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind CSS config
└── .env.local            # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- Backend API running at `http://localhost:8000`

### Installation

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# .env.local is already configured
# If needed, update VITE_API_URL
VITE_API_URL=http://localhost:8000
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

Preview the build:
```bash
npm run preview
```

## API Integration

The frontend integrates with the FastAPI backend at `http://localhost:8000`.

### Authentication Flow

1. **Register**: POST `/auth/register`
   - Request: `{ name, email, password }`
   - Response: `{ user_id, email, name, message }`

2. **Login**: POST `/auth/login`
   - Request: `{ email, password }`
   - Response: `{ access_token, token_type }`
   - Token saved to `localStorage` as `access_token`

3. **Protected Requests**: All requests include `Authorization: Bearer {token}` header

### Integrated Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /admin/login` - Admin login

#### User Profile
- `GET /users/me` - Get current user
- `GET /users/profile` - Get user profile

#### Schemes
- `GET /schemes` - Get all schemes
- `GET /schemes/{id}` - Get scheme by ID
- `GET /user-schemes/eligible` - Get eligible schemes for user

#### Eligibility
- `POST /eligibility` - Check eligibility for schemes
- `GET /eligibility-history` - Get eligibility check history
- `GET /eligibility-history/{id}` - Get specific eligibility check

#### Recommendations
- `POST /ml/recommend` - Get ML recommendations

## JWT Authentication

### How It Works

1. **Token Storage**: JWT token saved in `localStorage` after login
2. **Request Interceptor**: Automatically adds `Authorization: Bearer {token}` header to all requests
3. **Response Interceptor**: Handles 401 responses by clearing token and redirecting to login
4. **Token Payload**: Typically includes `{ sub, email, role }` for RBAC

### Implementation

See [src/services/api.ts](src/services/api.ts) for axios interceptor setup.

## CORS Configuration

The frontend is configured to work with the FastAPI backend's CORS settings. If you encounter CORS errors:

1. Ensure backend has FastAPI CORS middleware configured
2. Check that `http://localhost:5173` is in allowed origins
3. Verify `VITE_API_URL` matches your backend URL

## State Management

Using Zustand for authentication state:

```typescript
import { useAuthStore } from '@context/authStore';

const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore();
```

## Components

### Layout
- `Header` - Navigation header with auth status

### Forms
- `Input` - Text input with validation
- `Button` - Styled button with loading state

### Display
- `Card` - Container card with hover effect
- `Alert` - Alert messages (info, success, error, warning)
- `Loading` - Loading spinner

### Logic
- `ProtectedRoute` - Route guard for authenticated pages

## Environment Variables

```
VITE_API_URL=http://localhost:8000      # Backend API URL
VITE_API_TIMEOUT=10000                  # Request timeout in ms
```

## Troubleshooting

### 401 Unauthorized
- Token may have expired
- Token not being sent correctly (check localStorage)
- Backend rejecting token

### CORS Errors
- Check backend CORS middleware configuration
- Verify frontend URL is in allowed origins
- Check proxy settings in vite.config.ts

### API Connection Issues
- Verify backend is running on port 8000
- Check `VITE_API_URL` environment variable
- Use browser DevTools Network tab to inspect requests

## Development Notes

- Pages are located in `src/pages/`
- Services for API calls are in `src/services/`
- Reusable components are in `src/components/`
- State management with Zustand in `src/context/`
- Styling uses Tailwind CSS utility classes

## Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. If protected, wrap with `<ProtectedRoute>`
4. Create API service if needed in `src/services/`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code (if configured)

## License

MIT
