from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def health_check():
    return {"status": "TutorRag is up and running!"}

# def main():
#     print("Hello from rag-based-teaching-assistant!")


# if __name__ == "__main__":
#     main()
