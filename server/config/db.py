import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# ---------------------------------------------------------------------------
# Lazy Supabase client — created on first use so import never blocks startup.
# This prevents crashes if env vars are missing during Render's import phase.
# ---------------------------------------------------------------------------
_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url:
            raise RuntimeError(
                "SUPABASE_URL is not set. "
                "Add it to your Render environment variables."
            )
        if not key:
            raise RuntimeError(
                "SUPABASE_KEY is not set. "
                "Add it to your Render environment variables."
            )
        _client = create_client(url, key)
    return _client


class _LazyTable:
    """Proxy that defers the Supabase client lookup until the first call."""
    def __init__(self, table_name: str):
        self._table_name = table_name

    def __getattr__(self, name):
        return getattr(_get_client().table(self._table_name), name)


# Collections — behave exactly like before but only connect on first use
users_collection = _LazyTable("users")
chunk_collection = _LazyTable("text")
chat_history_collection = _LazyTable("chat_history")
quiz_collection = _LazyTable("quiz")
quiz_history = _LazyTable("quiz_history")
