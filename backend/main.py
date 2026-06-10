from fastapi import FastAPI

from api import health

app = FastAPI(title="FloatCal API backend")

app.include_router(health.router)


@app.get("/")
async def root():
    return {"message": "FloatCal API"}
