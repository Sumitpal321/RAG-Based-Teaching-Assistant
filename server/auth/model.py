from pydantic import BaseModel

class StudentUser(BaseModel):
    # id : int
    fullname : str
    email : str
    username : str
    password : str
    grade : str
    college : str
    major : str

class TeacherUser(BaseModel):
    # id : int
    fullname : str
    email : str
    username : str
    password : str
    college : str