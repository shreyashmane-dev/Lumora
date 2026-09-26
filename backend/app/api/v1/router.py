from fastapi import APIRouter
from app.api.v1.endpoints import detect, humanize, analyze, keys, usage, status

api_router = APIRouter()

api_router.include_router(detect.router, tags=["Detection"])
api_router.include_router(humanize.router, tags=["Humanization"])
api_router.include_router(analyze.router, tags=["Writing Analysis"])
api_router.include_router(keys.router, tags=["API Keys"])
api_router.include_router(usage.router, tags=["Usage"])
api_router.include_router(status.router, tags=["Status"])
