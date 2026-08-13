from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import authentication, calendars, health, items, users


app = FastAPI(title="FloatCal API backend")

app.include_router(health.router)
app.include_router(calendars.router)
app.include_router(items.router)
app.include_router(users.router)
app.include_router(authentication.router)

# Allow testing using react native web
# origins = [
#     "http://localhost:8000",
#     "http://127.0.0.1:8000",
#     "http://localhost:8081",
# ]  # Allow for web testing preventing CORS error converting regular requests to options requests.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for public hosting -> For hosting on vps
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "FloatCal API"}
