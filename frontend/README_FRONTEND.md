# YojnaSathi Frontend - React + TypeScript + Vite

A modern, professional frontend for the YojnaSathi government scheme discovery application. Built with React 18, TypeScript, and Vite for optimal performance.

## 🚀 Features

- **Modern UI**: Professional, responsive design with Tailwind CSS
- **Animations**: Smooth transitions and hover effects with Framer Motion
- **Authentication**: Secure JWT-based login/register with token management
- **Protected Routes**: Role-based access control for authenticated pages
- **API Integration**: Centralized API client with automatic token injection
- **State Management**: Zustand for simple, efficient state management
- **Responsive Design**: Mobile-first approach with full responsive support
- **Icons**: Lucide React for beautiful, scalable icons
- **Data Fetching**: TanStack React Query for efficient data management

## 🛠️ Tech Stack

- **React** 18.2.0 - UI Library
- **TypeScript** 5.3.3 - Type Safety
- **Vite** 5.0.8 - Build Tool
- **Tailwind CSS** 3.3.6 - Styling
- **Framer Motion** 10.16.4 - Animations
- **React Router** 6.20.0 - Routing
- **Axios** 1.6.2 - HTTP Client
- **Zustand** 4.4.1 - State Management
- **Lucide React** 0.292.0 - Icons
- **TanStack React Query** 5.25.0 - Data Fetching

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── admin/         # Admin-only dialogs (SchemeDialog, DeleteSchemeDialog)
│   │   ├── landing/       # Landing page sections
│   │   ├── layout/        # Layout components (Navbar, Footer)
│   │   ├── ui/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Header.tsx
│   │   ├── Input.tsx
│   │   ├── Loading.tsx
│   │   ├── Alert.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── SchemesPage.tsx
│   │   ├── EligibilityPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── context/
│   │   └── authStore.ts
│   ├── hooks/
│   ├── lib/
│   │   └── api.ts         # Centralized API client
│   ├── services/
│   ├── styles/
│   │   └── index.css      # Global styles & animations
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── .env                    # Environment variables (local)
├── .env.example           # Example env variables
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your backend API URL:
```env
VITE_API_URL=http://localhost:8000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Linting

Check for lint errors:
```bash
npm run lint
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. Users register or login
2. Backend returns JWT token
3. Token is stored in localStorage
4. All API requests include token in Authorization header
5. Token is automatically injected via Axios interceptor
6. 401 errors trigger logout and redirect to login page

### Authentication Flow

```
User → Register/Login → Backend → JWT Token → localStorage
↓
API Requests → Axios Interceptor → Add Bearer Token → Backend
↓
Protected Routes → Check Auth Context → Allow/Redirect
```

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for utility-first styling. Configuration is in `tailwind.config.js`.

### Custom Animations

Several custom animations are available in `src/styles/index.css`:
- `animate-fadeIn`
- `animate-slideInUp`, `animate-slideInDown`, `animate-slideInLeft`, `animate-slideInRight`
- `animate-scaleIn`
- `animate-blob`
- `animate-bounce-slow`

## 🔗 API Integration

All API calls are centralized in `src/lib/api.ts`. The API client includes:

- **Request Interceptor**: Automatically adds JWT token to all requests
- **Response Interceptor**: Handles 401 errors and redirects to login
- **Error Handling**: Consistent error handling across the application

### API Methods

```typescript
// Authentication
authAPI.register(name, email, password)
authAPI.login(email, password)

// Schemes
schemesAPI.getAll()
schemesAPI.checkEligibility(age, income, gender, is_student)

// User Profile
userAPI.getProfile()
userAPI.getEligibilityHistory()
userAPI.getEligibilityHistorySummary()
userAPI.getEligibleSchemes()

// Admin (Protected)
adminAPI.createScheme(data)
adminAPI.updateScheme(id, data)
adminAPI.deleteScheme(id)
```

## 🧩 Components

### Layout Components

- **Navbar**: Responsive navigation with user menu
- **Footer**: Footer with links and contact info

### Landing Components

- **HeroSection**: Hero banner with CTA
- **FeaturesSection**: Feature highlights
- **HowItWorksSection**: Step-by-step guide
- **CTASection**: Call-to-action section
- **TestimonialsSection**: User testimonials

### UI Components

- **Button**: Reusable button component
- **Input**: Form input field
- **Card**: Card container component
- **Alert**: Alert/notification component
- **Loading**: Loading spinner
- **NavLink**: Navigation link with active state

### Admin Components

- **SchemeDialog**: Add/edit scheme form
- **DeleteSchemeDialog**: Delete confirmation dialog

## 🛡️ Security

- **HTTPS**: Use HTTPS in production
- **CORS**: Backend configured for frontend origin
- **JWT Tokens**: Securely stored in localStorage
- **Input Validation**: Client-side validation on forms
- **Protected Routes**: Role-based access control
- **CSRF Protection**: Handled by backend

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8000 |

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: 0px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## 🎯 Performance

- **Code Splitting**: Automatic with Vite
- **Lazy Loading**: React Router lazy components
- **Image Optimization**: Optimized images
- **Bundle Size**: Optimized with tree-shaking
- **Caching**: API response caching with React Query

## 🐛 Debugging

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured correctly
   - Check VITE_API_URL matches backend

2. **Auth Token Issues**
   - Clear localStorage and re-login
   - Check token expiration (60 minutes)

3. **Page Not Found**
   - Ensure all routes are configured in App.tsx

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Framer Motion Documentation](https://www.framer.com/motion)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📄 License

This project is part of YojnaSathi and is licensed under the MIT License.

## 🙋‍♂️ Support

For support and questions, please reach out to the development team.

---

**Made with ❤️ in India**
