from fastapi import FastAPI

app = FastAPI(
    title="Verenpaine-vahti",
    version="0.1.0"
)

@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }