# 🎓 AI Guru — RAG-Based AI Teaching Assistant

![AI Guru Banner](https://img.shields.io/badge/AI%20Guru-Teaching%20Assistant-FF6B6B?style=for-the-badge&logo=graduation-cap)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-00B0D7?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

> An end-to-end AI-powered teaching assistant that lets teachers upload study materials and students ask questions, generate quizzes, and track their learning progress — all powered by RAG (Retrieval-Augmented Generation).

---

## 🎥 Live Demo

🔗 **Live App:** [RAG-Based Teaching Assistant](https://rag-based-teaching-assistant-qfzp-sumit-dev198.vercel.app)

> 📹 **Video Demo:** *(Add your screen recording link here — Loom, YouTube, etc.)*

---

## 📌 Project Summary

AI Guru is a full-stack, role-based AI teaching assistant built with a RAG (Retrieval-Augmented Generation) pipeline. Teachers upload PDF study materials which are chunked, embedded, and stored in a vector database. Students can then ask questions about those materials and receive AI-generated answers grounded in the actual documents — not hallucinated responses.

The system also features an AI quiz generator that creates multiple-choice questions from the uploaded content, allows students to submit answers, and tracks their performance history over time.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, React Router, Axios, React Hot Toast |
| **Backend** | FastAPI, Python 3.12, Uvicorn |
| **Authentication** | HTTP Basic Auth, Bcrypt password hashing |
| **Database** | Supabase (PostgreSQL) |
| **Vector Database** | Pinecone |
| **Embeddings** | Google Gemini Embedding API (`gemini-embedding-001`, 3072 dimensions) |
| **LLM** | Groq API (LLaMA 3.3 70B) |
| **RAG Framework** | LangChain |
| **PDF Processing** | PyPDF, LangChain Document Loaders |
| **Frontend Deployment** | Vercel |
| **Backend Deployment** | Railway |
| **Styling** | Custom CSS with Fredoka One + Nunito fonts |

---

## ✨ Features

### 👩‍🏫 Teacher Features
- 📤 **Upload PDF documents** with drag & drop interface
- 🏷️ **Grade-based access control** — assign documents to specific grades
- 🔄 **Automatic chunking & indexing** — PDFs are split, embedded and stored in Pinecone + Supabase

### 🧑‍🎓 Student Features
- 💬 **AI Chat** — Ask questions about uploaded study materials
- 📚 **Source citations** — Every answer shows which document it came from
- 🧠 **Quiz Generator** — Generate AI-powered MCQ quizzes on any topic
- ✅ **Quiz Checker** — Submit answers and get instant scores with feedback
- 📊 **Quiz History** — Track all past attempts with scores and progress bars

### 🔐 General Features
- Role-based access (Student / Teacher)
- Secure password hashing with Bcrypt
- Persistent chat and quiz history in Supabase
- Responsive, colorful educational UI

---

## 🔁 The Process

Here's how the system works end to end:

```
📄 Teacher uploads PDF
        ↓
📦 PDF is chunked (2000 chars, 50 overlap)
        ↓
🔢 Google Gemini generates 3072-dim embeddings
        ↓
📌 Embeddings stored in Pinecone (with grade/role metadata)
💾 Chunks stored in Supabase text table
        ↓
🧑‍🎓 Student asks a question
        ↓
🔢 Question is embedded with same model
        ↓
🔍 Pinecone finds top-5 similar chunks (filtered by grade)
        ↓
📖 Supabase fetches the actual text for those chunks
        ↓
🤖 Groq LLaMA generates answer using retrieved context
        ↓
💬 Answer + sources returned to student
```

---

## 📖 What I Learned

- **RAG Architecture** — How to build a full retrieval-augmented generation pipeline from scratch, including chunking strategies, embedding models, and vector similarity search
- **Vector Databases** — How Pinecone stores and retrieves embeddings using cosine similarity and metadata filtering
- **FastAPI** — Building production-ready REST APIs with dependency injection, middleware, and async endpoints
- **LangChain** — Using prompt templates, chains, and document loaders to orchestrate LLM pipelines
- **Full-Stack Development** — Connecting a React frontend to a Python backend with proper CORS, authentication, and error handling
- **Deployment** — Deploying a full-stack app across multiple platforms (Vercel + Railway + Supabase + Pinecone)
- **Debugging** — Tracing issues across the entire stack from frontend → API → vector DB → LLM

---

## 🚀 How It Can Be Improved

- 🔑 **JWT Authentication** — Replace Basic Auth with proper JWT tokens for better security
- 📧 **Email verification** — Add email OTP for account creation
- 🌐 **Google OAuth** — Sign in with Google for easier onboarding
- 📝 **Chat history per session** — Maintain conversation context across multiple turns
- 🎯 **Reranking** — Add a reranker model to improve retrieval quality
- 📊 **Teacher dashboard** — Analytics showing which topics students struggle with
- 🔔 **Notifications** — Alert teachers when students complete quizzes
- 📱 **Mobile app** — React Native version for mobile learning
- 🌍 **Multi-language support** — Support regional languages for wider reach
- ⚡ **Streaming responses** — Stream LLM responses token by token for better UX

---

## 🏃 How to Run the Project Locally

### Prerequisites
- Python 3.12+
- Node.js 18+
- Accounts on: Supabase, Pinecone, Google AI Studio, Groq

### 1. Clone the Repository
```bash
git clone https://github.com/Sumitpal321/RAG-Based-Teaching-Assistant.git
cd RAG-Based-Teaching-Assistant
```

### 2. Backend Setup
```bash
cd server
pip install -r requirements.txt
```

Create a `.env` file in the `server` folder:
```env
GOOGLE_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=tutor-rag
PINECONE_ENV=us-east-1
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

Run the backend:
```bash
uvicorn main:app --reload
```
Backend runs on: `http://localhost:8000`

### 3. Frontend Setup
```bash
cd client/tutor-rag
npm install
```

Create a `.env` file in `client/tutor-rag`:
```env
REACT_APP_API_URL=http://localhost:8000
```

Run the frontend:
```bash
npm start
```
Frontend runs on: `http://localhost:3000`

### 4. Database Setup (Supabase)
Run these SQL queries in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fullname TEXT,
    email TEXT,
    role TEXT NOT NULL,
    grade TEXT,
    college TEXT,
    major TEXT
);

-- Text chunks table
CREATE TABLE text (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chunk_id TEXT NOT NULL,
    doc_id TEXT NOT NULL,
    text TEXT NOT NULL,
    source TEXT,
    page INTEGER,
    grade INTEGER,
    role TEXT
);

-- Chat history table
CREATE TABLE chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id TEXT,
    username TEXT NOT NULL,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    sources JSONB,
    timestamp TIMESTAMPTZ NOT NULL
);

-- Quiz table
CREATE TABLE quiz (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    topic TEXT NOT NULL,
    quiz_data TEXT NOT NULL,
    sources JSONB,
    timestamp TIMESTAMPTZ NOT NULL
);

-- Quiz history table
CREATE TABLE quiz_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    quiz_id TEXT,
    topic TEXT,
    score INTEGER,
    total_questions INTEGER,
    results JSONB,
    quiz_content TEXT,
    timestamp TIMESTAMPTZ NOT NULL
);
```

---

## 📁 Project Structure

```
RAG-Based-Teaching-Assistant/
├── client/
│   └── tutor-rag/          # React frontend
│       ├── src/
│       │   ├── pages/      # Login, Register, Chat, Quiz, History, Upload
│       │   ├── components/ # Navbar
│       │   ├── context/    # AuthContext
│       │   └── services/   # API calls
│       └── public/
├── server/                 # FastAPI backend
│   ├── auth/               # Authentication routes
│   ├── chat/               # Chat & quiz routes
│   ├── docs/               # Document upload & vectorstore
│   ├── config/             # Database config
│   └── main.py             # App entry point
└── README.md
```

---

## 👨‍💻 Author

**Sumit Pal**
- GitHub: [@Sumitpal321](https://github.com/Sumitpal321)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ using FastAPI, React, LangChain, Pinecone, Supabase, and Groq*
