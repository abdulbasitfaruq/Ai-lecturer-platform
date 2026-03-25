# PohanaAI

An AI-powered live lecture platform that generates interactive lectures with real-time Q&A, voice synthesis, and talking avatars.

## Features

- 🔐 User authentication (registration & login)
- 🤖 AI-generated lectures using GPT-4
- 🎙️ Text-to-speech voice synthesis
- 🎭 Talking avatar with lip-sync
- 📊 Educational visualizations
- 💬 Real-time Q&A during lectures
- 📚 Lecture history tracking

## Tech Stack

**Backend:**

- FastAPI (Python)
- SQLAlchemy (ORM)
- SQLite (Database)
- JWT (Authentication)
- bcrypt (Password hashing)

**Frontend (Coming Soon):**

- React
- Tailwind CSS

**AI Services:**

- OpenAI GPT-4
- ElevenLabs (Voice)
- D-ID (Avatar)

## Setup

### Prerequisites

- Python 3.11+
- pip
- Virtual environment

### Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/ai-lecturer-platform.git
cd ai-lecturer-platform
```

2. Create virtual environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file in backend folder:

```
DATABASE_URL=sqlite:///./pohana.db
JWT_SECRET=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

5. Run the server:

```bash
uvicorn main:app --reload --port 5000
```

6. Visit: http://localhost:5000/docs

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /health` - Health check

## Project Structure

```
ai-lecturer-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── models/          # Database models
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   └── services/        # Helper services
│   ├── main.py              # FastAPI app
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not in git)
└── frontend/                # React app (coming soon)
```

## Development Status

- [x] Database setup
- [x] User authentication
- [ ] AI lecture generation
- [ ] Voice synthesis
- [ ] Avatar integration
- [ ] Frontend (React)
- [ ] Real-time Q&A

## University Project

This project is being developed as a Final Year Project for BSc Computer Science at Kingston University.

**Project Title:** PohanaAI - AI-Powered Live Lecture Platform  
**Deadline:** March 2026  
**Student:** Abdul Basit Farooq (K2260997)

## License

This project is for educational purposes.

---

**3. Save it!** (Cmd+S)

---

## Your Folder Structure Should Look Like:

```
ai-lecturer-platform/
├── README.md ← You just created this!
├── .gitignore ← Already exists
└── backend/
├── main.py
├── requirements.txt
├── .env
└── src/

```

**Notice:** `README.md` is in the MAIN folder, NOT in backend!

---

## Now Continue with GitHub Desktop:

**1. Open GitHub Desktop**

**2. You should now see:**

- ✅ `README.md` in the changed files list

**3. Make your first commit:**

**Summary:**

```

Initial commit: Backend authentication system

```

**Description:**

```

- Set up FastAPI backend with SQLite
- Created User model and database
- Implemented registration and login with JWT
- Added password hashing with bcrypt
- Configured CORS middleware

An AI powered Live lecture platform that generate inteeractive lecture with realtime QnA

```
