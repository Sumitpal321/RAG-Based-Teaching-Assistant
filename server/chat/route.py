import uuid
from fastapi import APIRouter, HTTPException, Depends, Body
from auth.route import authenticate
from .chat_query import answer_query, quiz_generator
from pydantic import BaseModel
from typing import List, Optional
import datetime
from config.db import (
    chat_history_collection,
    quiz_collection,
    quiz_history
)
chat_id = str(uuid.uuid4())

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str
    num_questions: Optional[int] = 3

class QuizAnswerRequest(BaseModel):
    quiz_id: str
    answers:List[str]
@router.post("/chat")
async def chat(user=Depends(authenticate), query:str=Body(..., embed=True)):
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can access the chat endpoint.")
    """
    Main chat endpoint for students and teachers to ask questions and receive answers.
    """

    # Process the query and get the answer
    response = await answer_query(query, user["role"], user["grade"])

    # Store the chat history in Supabase
    chat_history_collection.insert({
        "chat_id": chat_id,
        "username": user["username"],
        "question": query,
        "response": response["answer"],
        "sources": response["sources"],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }).execute()

    return response

@router.post("/quiz")
async def quiz(request:QuizRequest, user=Depends(authenticate)):
    if user["role"] !="student":
        raise HTTPException(
            status_code=403, 
            detail="Only students can access the quiz endpoint."
        )
    response = await quiz_generator(
        request.topic, user["role"], 
        user["grade"], 
        request.num_questions
    )

    quiz_docs = {
        "username": user["username"],
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "topic": request.topic,
        "quiz_data": response["quiz"],
        "sources": response["sources"]
    }

    result = quiz_collection.insert(quiz_docs).execute()

    return {
        "quiz": response["quiz"],
        "sources": response["sources"],
        "quiz_id": result.data[0]["id"]
    }

@router.post("/quiz/check")
async def check_quiz(request:QuizAnswerRequest, user=Depends(authenticate)):
    print(f"Looking for quiz_id: {request.quiz_id}")
    quiz_doc = quiz_collection.select("*").eq("id", request.quiz_id).execute().data
    print(f"Quiz doc found: {quiz_doc}")
    if not quiz_doc:
        raise HTTPException(status_code=404, detail="Quiz not found.")
    
    if quiz_doc[0]["username"] != user["username"]:
        raise HTTPException(status_code=403, detail="Unauthorized to check this quiz.")
    
    correct_answers =[]
    for line in quiz_doc[0]["quiz_data"].split("\n"):
        if line.startswith("Answer:"):
            correct_answers.append(line.split(":")[1].strip()[0])

    if len(request.answers) != len(correct_answers):
        raise HTTPException(status_code=400, detail="Number of answers does not match number of questions.")
    
    score = 0
    results = []
    
    for i, ans in enumerate(request.answers):
        is_correct = ans.strip().upper() == correct_answers[i]
        if is_correct:
            score += 1

        results.append({
            "question_number": i+1,
            "user_answer": ans,
            "correct_answer": correct_answers[i],
            "is_correct": is_correct
        })

    quiz_history.insert({
        "username": user["username"],
        "quiz_id": request.quiz_id,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "topic": quiz_doc[0]["topic"],
        "score": score,
        "total_questions": len(correct_answers),
        "results": results,
        "quiz_content": quiz_doc[0]["quiz_data"]
    }).execute()

    return{
        "message": f"You scored {score} out of {len(correct_answers)}",
        'score': score,
        "total_questions": len(correct_answers),
        "results": results
    }

@router.get("/quiz/history")
async def quiz_history_endpoint(user=Depends(authenticate)):
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can access their quiz history.")
    
    result = quiz_history.select("*").eq("username", user["username"]).execute()
    history = result.data

    return {
        "message": f"Found {len(history)} attempts",
        "history": history
    }