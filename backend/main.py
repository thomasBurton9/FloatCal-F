from fastapi import FastAPI

from api import health, calendars, items

app = FastAPI(title="FloatCal API backend")

app.include_router(health.router)
app.include_router(calendars.router)
app.include_router(items.router)


@app.get("/")
async def root():
    return {"message": "FloatCal API"}
