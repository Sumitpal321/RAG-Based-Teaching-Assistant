from fastapi import APIRouter, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi import Depends
from .model import StudentUser, TeacherUser
from config.db import users_collection
from .hash_utils import hash_password, verify_password


router = APIRouter()
security = HTTPBasic()


def authenticate(credentials: HTTPBasicCredentials = Depends(security)):

    res = users_collection.select("*").eq("username", credentials.username).execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    user = res.data[0]
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "username": user["username"],
        "fullname": user["fullname"],
        "email": user["email"],
        "role": user["role"],
        "grade": user.get("grade")
    }



@router.post("/Signup/student")
def Signup_student(req: StudentUser):

    # 🔍 Check if username exists
    existing_user = users_collection.select("*").eq("username", req.username).execute()

    if existing_user.data:
        raise HTTPException(status_code=400, detail="Username already exists!")

    # 🔐 Hash password
    hashed_password = hash_password(req.password)

    # 💾 Insert user
    users_collection.insert({
        "fullname": req.fullname,
        "email": req.email,
        "username": req.username,
        "password": hashed_password,
        "role": "student",
        "grade": req.grade,
        "college": req.college,
        "major": req.major
    }).execute()

    return {"message": "Student user created successfully!"}

@router.post("/Signup/teacher")
def teacher_student(req: TeacherUser):

    # 🔍 Check if username exists
    existing_user = users_collection.select("*").eq("username", req.username).execute()

    if existing_user.data:
        raise HTTPException(status_code=400, detail="Username already exists!")

    # 🔐 Hash password
    hashed_password = hash_password(req.password)

    # 💾 Insert user
    users_collection.insert({
        "fullname": req.fullname,
        "email": req.email,
        "username": req.username,
        "password": hashed_password,
        "role": "teacher",
        "college": req.college,
    }).execute()

    return {"message": "Teacher user created successfully!"}

@router.get("/login")
def login(user=Depends(authenticate)):
    "Handles user login"
    return {"message": f"Welcome, {user}!"}