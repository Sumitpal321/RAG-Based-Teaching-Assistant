import os
import asyncio
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from torch import embedding
from config.db import chunk_collection
from docs.vectorstore import get_pinecone_index, GOOGLE_EMBEDDING_MODEL

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

#Define our embedding model
embed_model = GoogleGenerativeAIEmbeddings(model=GOOGLE_EMBEDDING_MODEL)
#define llm model
llm = ChatGroq(temperature=0.3,model="llama-3.3-70b-versatile", groq_api_key=GROQ_API_KEY)
#Define chat prompt template
rag_prompt = ChatPromptTemplate.from_template(
    """
You are a helpful assistant for answering questions based on the following retrieved documents:

Question:
{question}

Context:
{context}

If relevant, mention the documentation source.

"""
)

quiz_prompt = ChatPromptTemplate.from_template(
    """
You are a test generating assistant.

Using the context below, generate {num_questions} multiple choice questions for a student in grade {grade}.

You MUST follow this EXACT format for every question, including the Answer line:

Question 1: [question text]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: A

Question 2: [question text]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: B

Do NOT skip the Answer line. Every question MUST end with Answer: followed by the correct letter.

Context:
{context}
    """
)

#Design the rag chain
rag_chain = rag_prompt | llm
quiz_chain = quiz_prompt | llm

async def answer_query(query:str, user_role:str, user_grade:int)->dict:
    #1 Embedding generation
    query_embedding = await asyncio.to_thread(embed_model.embed_query, query)
    print(f"Query embedding dimension: {len(query_embedding)}")
    index = get_pinecone_index()

    # DEBUG - add these lines
    print(f"User grade: {user_grade}, type: {type(user_grade)}")
    print(f"User role: {user_role}")

    #2 retrieve relevant embedding from vector database
    results = await asyncio.to_thread(
        index.query,
        vector=query_embedding,
        top_k=5,
        include_metadata=True,
        filter={"grade": int(user_grade), "role": {"$in": ["Public", user_role]}}
    )

    # DEBUG - add this line
    print(f"Pinecone matches: {results.matches}")

    #3 Validation check
    if not results.get("matches"):
        return {"answer": "no relevant information", "sources": []}
    
    #4 Extract relevant context
    #4.1 get chunk id
    chunk_ids = [m["id"] for m in results["matches"]]
    print(f"Looking for chunk_ids: {chunk_ids}")
    #4.2 get document/text
    docs = chunk_collection.select("*").in_("chunk_id", chunk_ids).execute().data
    print(f"Supabase docs found: {len(docs)}")
    #4.3 validation check
    if not docs:
        return {"answer": "no relevant information", "sources": []}
    #4.4 preserve context order
    #4.4.1 
    doc_map = {d["chunk_id"]: d for d in docs}
    ordered_map = [doc_map[cid] for cid in chunk_ids if cid in doc_map]
    #4.4.2 
    context = "\n\n".join([d["text"] for d in ordered_map])
    sources = list({d["source"] for d in ordered_map})
    #4.5 Gather responses
    response = await asyncio.to_thread(
        rag_chain.invoke,
        {"question": query, "context": context}
    )

    #5 Reatirn response and sources
    answer_text = (
        response.content
        if hasattr(response, "content")
        else str(response)
    )

    return (
        {"answer": answer_text, "sources": sources}
    )


async def quiz_generator(topic:str, user_role:str, user_grade:int, num_questions:int=3)->dict:
    #1 Embedding generation
    embedding = await asyncio.to_thread(embed_model.embed_query, topic)
    print(f"Query embedding dimension: {len(embedding)}")
    index = get_pinecone_index()

    # DEBUG - add these lines
    print(f"User grade: {user_grade}, type: {type(user_grade)}")
    print(f"User role: {user_role}")

    #2 retrieve relevant embedding from vector database
    results = await asyncio.to_thread(
        index.query,
        vector=embedding,
        top_k=5,
        include_metadata=True,
        filter={"grade": int(user_grade), "role": {"$in": ["Public", user_role]}}
    )

    # DEBUG - add this line
    print(f"Pinecone matches: {results.matches}")

    #3 Validation check
    if not results.get("matches"):
        return {"quiz": "no relevant information found to generate quiz", "sources": []}
    
    #4 Extract relevant context
    #4.1 get chunk id
    chunk_ids = [m["id"] for m in results["matches"]]
    print(f"Looking for chunk_ids: {chunk_ids}")
    #4.2 get document/text
    docs = chunk_collection.select("*").in_("chunk_id", chunk_ids).execute().data
    print(f"Supabase docs found: {len(docs)}")
    #4.3 validation check
    if not docs:
        return {"quiz": "Context unavailable for quiz generation", "sources": []}
    #4.4 preserve context order
    #4.4.1 
    doc_map = {d["chunk_id"]: d for d in docs}
    ordered_map = [doc_map[cid] for cid in chunk_ids if cid in doc_map]
    #4.4.2 
    context = "\n\n".join([d["text"] for d in ordered_map])
    sources = list({d["source"] for d in ordered_map})
    #4.5 Gather responses
    response = await asyncio.to_thread(
        quiz_chain.invoke,
        {"num_questions": num_questions, "grade": user_grade, "context": context}
    )

    #5 Reatirn response and sources
    quiz_text = (
        response.content
        if hasattr(response, "content")
        else str(response)
    )

    return (
        {"quiz": quiz_text, 
         "sources": sources}
    )


