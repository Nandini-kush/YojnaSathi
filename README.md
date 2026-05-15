# YojnaSathi

> An AI-powered Government Scheme Eligibility Recommendation System that helps citizens discover the most relevant central and state welfare schemes based on their personal profile and eligibility.

---

## 📌 Overview

YojnaSathi simplifies access to government welfare programs by allowing users to enter details such as age, gender, income, occupation, caste category, disability status, and state. The platform analyzes eligibility criteria and recommends the most suitable schemes.

The goal is to reduce the difficulty citizens face when searching through hundreds of government portals and documents.

---

## ✨ Key Features

### 👤 User Authentication

* Secure signup and login
* JWT-based authentication
* Protected routes
* Profile management

### 🔍 Eligibility Checker

* Dynamic eligibility form
* Filters schemes based on user data
* Instant recommendations
* Detailed eligibility reasoning

### 📋 Scheme Explorer

* Browse all available schemes
* Search and filter by category
* View scheme details and benefits
* Application links and required documents

### 🤖 AI-Powered Recommendations

* Personalized ranking of schemes
* Intelligent eligibility matching
* Future-ready architecture for ML enhancements

### 📊 Dashboard

* Personalized overview
* Saved and recommended schemes
* Profile summary

### 📱 Responsive UI

* Mobile-first design
* Clean and professional interface
* Reusable component architecture

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Framer Motion
* shadcn/ui
* React Router
* Axios

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* JWT Authentication

### Development Tools

* Git & GitHub
* Vite
* ESLint
* Prettier

---

## 🏗️ Project Architecture

```text
YojnaSathi/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   └── schemes/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── lib/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   └── requirements.txt
│
└── README.md
```


## ⚙️ Installation and Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/yojnasathi.git
cd yojnasathi
```

---

## 🚀 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 🚀 Backend Setup

```bash
cd backend
python -m venv venv
```

### Activate Virtual Environment

#### Windows

```bash
venv\Scripts\activate
```

#### macOS/Linux

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Server

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

---

## 🗄️ Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/yojnasathi
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## 📡 API Documentation

After running the backend:

* Swagger UI: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

---

## 🔐 Authentication Flow

1. User registers with email and password.
2. Backend validates and stores the user.
3. User logs in.
4. JWT access token is generated.
5. Token is used to access protected routes.

---

## 🧠 Eligibility Recommendation Flow

1. User enters profile details.
2. Frontend sends data to the backend.
3. Backend evaluates eligibility criteria.
4. Matching schemes are ranked.
5. Results are displayed with benefits and application links.

---

## 🎨 UI Highlights

* Reusable `Logo` component using `src/assets/yojnasathi_logo.png`
* Responsive navbar and footer
* Animated transitions using Framer Motion
* Consistent design system with Tailwind CSS and shadcn/ui

---

## 🧪 Build Verification

### Frontend

```bash
npm run build
```

### Backend

```bash
uvicorn app.main:app --reload
```

---

## 📈 Future Enhancements

* Multi-language support (Hindi and regional languages)
* Voice-based scheme search
* OCR for document extraction
* ML-based recommendation ranking
* Email and WhatsApp notifications
* Admin panel for scheme management

---

## 🚀 Deployment

### Frontend

* Vercel
* Netlify

### Backend

* Render
* Railway
* AWS

### Database

* Neon PostgreSQL
* Supabase

---

## 👩‍💻 Author

**Nandini Kushwah**

* B.Tech Information Technology Student
* Aspiring Full-Stack and Machine Learning Engineer

### Connect With Me

* GitHub: https://github.com/Nandini-kush
* LinkedIn: https://www.linkedin.com/in/nandini-kushwah/
* Email: nandinikushwah7898@gmail.com

---

## 🏆 Why This Project Matters

Government welfare schemes are often underutilized because citizens struggle to identify programs relevant to their circumstances. YojnaSathi solves this by providing a simple, intelligent platform that makes welfare discovery accessible and personalized.

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project helpful:

* ⭐ Star the repository
* 🍴 Fork the project
* 🐛 Report issues
* 🤝 Contribute improvements

---

## 🙏 Acknowledgements

* Government of India public scheme portals
* FastAPI community
* React ecosystem
* Open-source contributors worldwide
