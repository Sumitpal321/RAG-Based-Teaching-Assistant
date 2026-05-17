import os
import asyncio
import time
from pathlib import Path
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone, ServerlessSpec

from config.db import chunk_collection

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_EMBEDDING_MODEL = "models/gemini-embedding-001"
GOOGLE_EMBEDDING_DIMENSION = 3072

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV", "us-east-1")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "tutor-rag")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY missing")
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY missing")

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

pc = Pinecone(api_key=PINECONE_API_KEY)


def get_index_dimension(index_info):
    index_data = index_info.to_dict() if hasattr(index_info, "to_dict") else index_info
    return (
        index_data.get("dimension")
        if isinstance(index_data, dict)
        else getattr(index_info, "dimension", None)
    )


def wait_for_pinecone_index():
    while PINECONE_INDEX_NAME not in [i["name"] for i in pc.list_indexes()]:
        time.sleep(1)

    while True:
        index_info = pc.describe_index(PINECONE_INDEX_NAME)
        index_data = index_info.to_dict() if hasattr(index_info, "to_dict") else index_info
        status = index_data.get("status", {}) if isinstance(index_data, dict) else getattr(index_info, "status", {})
        ready = status.get("ready") if isinstance(status, dict) else getattr(status, "ready", True)

        if ready:
            return index_info

        time.sleep(1)


def create_pinecone_index():
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=GOOGLE_EMBEDDING_DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region=PINECONE_ENV
        )
    )
    wait_for_pinecone_index()


def get_pinecone_index():
    existing = [i["name"] for i in pc.list_indexes()]

    if PINECONE_INDEX_NAME not in existing:
        create_pinecone_index()
    else:
        index_info = pc.describe_index(PINECONE_INDEX_NAME)
        index_dimension = get_index_dimension(index_info)

        if index_dimension != GOOGLE_EMBEDDING_DIMENSION:
            pc.delete_index(PINECONE_INDEX_NAME)

            while PINECONE_INDEX_NAME in [i["name"] for i in pc.list_indexes()]:
                time.sleep(1)

            create_pinecone_index()

    index_info = pc.describe_index(PINECONE_INDEX_NAME)
    print(f"Pinecone index name: {PINECONE_INDEX_NAME}")
    print(f"Pinecone index dimension: {get_index_dimension(index_info)}")

    return pc.Index(PINECONE_INDEX_NAME)


async def load_vectorstore(uploaded_files, role, doc_id, grade):

    embed_model = GoogleGenerativeAIEmbeddings(
        model=GOOGLE_EMBEDDING_MODEL,
        task_type="retrieval_document",
        output_dimensionality=GOOGLE_EMBEDDING_DIMENSION
    )

    pinecone_index = get_pinecone_index()

    for file in uploaded_files:

        file_path = UPLOAD_DIR / file.filename

        content = await file.read()

        with open(file_path, "wb") as f:
            f.write(content)

        loader = PyPDFLoader(str(file_path))
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=50
        )

        chunks = splitter.split_documents(documents)

        if not chunks:
            continue

        chunk_docs = []

        for i, chunk in enumerate(chunks):
            chunk_docs.append({
                "chunk_id": f"{doc_id}-{i}",
                "doc_id": doc_id,
                "text": chunk.page_content,
                "page": chunk.metadata.get("page", 0),
                "source": file.filename,
                "grade": grade,
                "role": role
            })

        try:
            result = chunk_collection.insert(chunk_docs).execute()
            print(f"Supabase insert result: {result}")
        except Exception as e:
            print(f"Supabase insert ERROR: {e}")
            raise

        texts = [c.page_content for c in chunks]

        embeddings = await asyncio.to_thread(
            embed_model.embed_documents,
            texts
        )

        vectors = []

        for i, emb in enumerate(embeddings):
            vectors.append((
                f"{doc_id}-{i}",
                emb,
                {
                    "doc_id": doc_id,
                    "page": int(chunks[i].metadata.get("page", 0)),
                    "source": file.filename,
                    "grade": grade,
                    "role": role
                }
            ))

        pinecone_index.upsert(vectors=vectors)

        print(f"Indexed {file.filename}")
