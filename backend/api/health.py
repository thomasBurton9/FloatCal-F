from fastapi import APIRouter

router = APIRouter(prefix="/api")


@router.get("/health")
async def check_health_api():
    return {"status": "ok"}
