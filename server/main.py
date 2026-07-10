from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.route import router as auth_router
from docs.route import router as docs_router
from chat.route import router as chat_router    

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://rag-based-teaching-assistant-qfzp.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(docs_router)
app.include_router(chat_router)

@app.get("/")
def home():
    return {"message": "Welcome to the User Management API"}