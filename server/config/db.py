import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "test_key")


client = create_client(SUPABASE_URL, SUPABASE_KEY)

#user collection
users_collection = client.table("users")
#Document Collection
chunk_collection = client.table("text")
#Chat Collection
chat_history_collection = client.table("chat_history")
# Quiz collection
quiz_collection = client.table("quiz")
quiz_history = client.table("quiz_history")


