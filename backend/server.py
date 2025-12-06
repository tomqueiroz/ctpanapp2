from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint for Kubernetes
@api_router.get("/")
async def health_check():
    """Health check endpoint for deployment"""
    try:
        # Test database connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "student"  # student, instructor, admin
    created_at: str

class SessionData(BaseModel):
    session_token: str
    user_id: str
    expires_at: str

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    course_id: str
    title: str
    description: str
    thumbnail: Optional[str] = None
    instructor: str
    duration: Optional[str] = None
    status: str = "published"  # draft, published
    created_at: str

class Module(BaseModel):
    model_config = ConfigDict(extra="ignore")
    module_id: str
    course_id: str
    title: str
    order: int
    created_at: str

class Lesson(BaseModel):
    model_config = ConfigDict(extra="ignore")
    lesson_id: str
    module_id: str
    title: str
    content_type: str  # video, pdf, text
    content_url: Optional[str] = None
    content_text: Optional[str] = None
    duration: Optional[int] = None  # in minutes
    order: int
    created_at: str

class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    quiz_id: str
    lesson_id: str
    questions: List[Dict[str, Any]]
    passing_score: int = 70
    created_at: str

class Enrollment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    enrollment_id: str
    user_id: str
    course_id: str
    progress: float = 0.0
    status: str = "active"  # active, completed
    enrolled_at: str
    completed_at: Optional[str] = None

class Certificate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    certificate_id: str
    user_id: str
    course_id: str
    issued_at: str

class Magazine(BaseModel):
    model_config = ConfigDict(extra="ignore")
    magazine_id: str
    title: str
    description: Optional[str] = None
    cover_url: str
    pdf_url: str
    published_date: str
    created_at: str

# Helper function to get user from session
async def get_current_user(request: Request) -> Optional[User]:
    # Try to get session_token from cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    # Find session in database
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check if session is expired
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user data
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

# Auth endpoints
@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # Call Emergent auth service
    async with httpx.AsyncClient() as http_client:
        try:
            auth_service_url = os.environ.get('AUTH_SERVICE_URL', 'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data')
            auth_response = await http_client.get(
                auth_service_url,
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            auth_response.raise_for_status()
            auth_data = auth_response.json()
        except Exception as e:
            logging.error(f"Failed to validate session_id: {e}")
            raise HTTPException(status_code=401, detail="Invalid session_id")
    
    # Extract user data
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": "student",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    # Return user data
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return User(**user)

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# Course endpoints
@api_router.get("/courses", response_model=List[Course])
async def get_courses(request: Request):
    user = await get_current_user(request)
    query = {"status": "published"} if not user or user.role != "admin" else {}
    courses = await db.courses.find(query, {"_id": 0}).limit(100).to_list(None)
    return [Course(**course) for course in courses]

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**course)

@api_router.post("/courses", response_model=Course)
async def create_course(request: Request, course_data: dict):
    user = await get_current_user(request)
    if not user or user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    course_id = f"course_{uuid.uuid4().hex[:12]}"
    course_doc = {
        "course_id": course_id,
        "title": course_data.get("title"),
        "description": course_data.get("description"),
        "thumbnail": course_data.get("thumbnail"),
        "instructor": course_data.get("instructor"),
        "duration": course_data.get("duration"),
        "status": course_data.get("status", "draft"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.courses.insert_one(course_doc)
    return Course(**course_doc)

@api_router.put("/courses/{course_id}", response_model=Course)
async def update_course(course_id: str, request: Request, course_data: dict):
    user = await get_current_user(request)
    if not user or user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.courses.update_one(
        {"course_id": course_id},
        {"$set": course_data}
    )
    
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    return Course(**course)

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str, request: Request):
    user = await get_current_user(request)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.courses.delete_one({"course_id": course_id})
    return {"message": "Course deleted successfully"}

# Module endpoints
@api_router.get("/courses/{course_id}/modules", response_model=List[Module])
async def get_modules(course_id: str):
    modules = await db.modules.find(
        {"course_id": course_id},
        {"_id": 0}
    ).sort("order", 1).limit(50).to_list(None)
    return [Module(**module) for module in modules]

@api_router.post("/modules", response_model=Module)
async def create_module(request: Request, module_data: dict):
    user = await get_current_user(request)
    if not user or user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    module_id = f"module_{uuid.uuid4().hex[:12]}"
    module_doc = {
        "module_id": module_id,
        "course_id": module_data.get("course_id"),
        "title": module_data.get("title"),
        "order": module_data.get("order", 0),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.modules.insert_one(module_doc)
    return Module(**module_doc)

# Lesson endpoints
@api_router.get("/modules/{module_id}/lessons", response_model=List[Lesson])
async def get_lessons(module_id: str):
    lessons = await db.lessons.find(
        {"module_id": module_id},
        {"_id": 0}
    ).sort("order", 1).to_list(1000)
    return [Lesson(**lesson) for lesson in lessons]

@api_router.get("/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str):
    lesson = await db.lessons.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return Lesson(**lesson)

@api_router.post("/lessons", response_model=Lesson)
async def create_lesson(request: Request, lesson_data: dict):
    user = await get_current_user(request)
    if not user or user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    lesson_id = f"lesson_{uuid.uuid4().hex[:12]}"
    lesson_doc = {
        "lesson_id": lesson_id,
        "module_id": lesson_data.get("module_id"),
        "title": lesson_data.get("title"),
        "content_type": lesson_data.get("content_type"),
        "content_url": lesson_data.get("content_url"),
        "content_text": lesson_data.get("content_text"),
        "duration": lesson_data.get("duration"),
        "order": lesson_data.get("order", 0),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.lessons.insert_one(lesson_doc)
    return Lesson(**lesson_doc)

# Enrollment endpoints
@api_router.post("/enrollments")
async def enroll_course(request: Request, enrollment_data: dict):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    course_id = enrollment_data.get("course_id")
    
    # Check if already enrolled
    existing = await db.enrollments.find_one({
        "user_id": user.user_id,
        "course_id": course_id
    })
    if existing:
        return {"message": "Already enrolled"}
    
    enrollment_id = f"enrollment_{uuid.uuid4().hex[:12]}"
    enrollment_doc = {
        "enrollment_id": enrollment_id,
        "user_id": user.user_id,
        "course_id": course_id,
        "progress": 0.0,
        "status": "active",
        "enrolled_at": datetime.now(timezone.utc).isoformat()
    }
    await db.enrollments.insert_one(enrollment_doc)
    return Enrollment(**enrollment_doc)

@api_router.get("/enrollments/my", response_model=List[Enrollment])
async def get_my_enrollments(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    enrollments = await db.enrollments.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    return [Enrollment(**enrollment) for enrollment in enrollments]

@api_router.put("/enrollments/{enrollment_id}/progress")
async def update_progress(enrollment_id: str, request: Request, progress_data: dict):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    progress = progress_data.get("progress", 0)
    update_data = {"progress": progress}
    
    if progress >= 100:
        update_data["status"] = "completed"
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.enrollments.update_one(
        {"enrollment_id": enrollment_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    return {"message": "Progress updated"}

# Certificate endpoints
@api_router.get("/certificates/my", response_model=List[Certificate])
async def get_my_certificates(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    certificates = await db.certificates.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    return [Certificate(**cert) for cert in certificates]

@api_router.get("/certificates/{certificate_id}", response_model=Certificate)
async def get_certificate(certificate_id: str):
    cert = await db.certificates.find_one({"certificate_id": certificate_id}, {"_id": 0})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return Certificate(**cert)

# Magazine endpoints
@api_router.get("/magazines", response_model=List[Magazine])
async def get_magazines():
    magazines = await db.magazines.find(
        {},
        {"_id": 0}
    ).sort("published_date", -1).to_list(1000)
    return [Magazine(**mag) for mag in magazines]

@api_router.get("/magazines/{magazine_id}", response_model=Magazine)
async def get_magazine(magazine_id: str):
    magazine = await db.magazines.find_one({"magazine_id": magazine_id}, {"_id": 0})
    if not magazine:
        raise HTTPException(status_code=404, detail="Magazine not found")
    return Magazine(**magazine)

@api_router.post("/magazines", response_model=Magazine)
async def create_magazine(request: Request, magazine_data: dict):
    user = await get_current_user(request)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    magazine_id = f"magazine_{uuid.uuid4().hex[:12]}"
    magazine_doc = {
        "magazine_id": magazine_id,
        "title": magazine_data.get("title"),
        "description": magazine_data.get("description"),
        "cover_url": magazine_data.get("cover_url"),
        "pdf_url": magazine_data.get("pdf_url"),
        "published_date": magazine_data.get("published_date"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.magazines.insert_one(magazine_doc)
    return Magazine(**magazine_doc)

# Admin endpoints
@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    user = await get_current_user(request)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_users = await db.users.count_documents({})
    total_courses = await db.courses.count_documents({})
    total_enrollments = await db.enrollments.count_documents({})
    total_magazines = await db.magazines.count_documents({})
    
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_magazines": total_magazines
    }

@api_router.get("/admin/users")
async def get_all_users(request: Request):
    user = await get_current_user(request)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, request: Request, role_data: dict):
    user = await get_current_user(request)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": role_data.get("role")}}
    )
    
    return {"message": "Role updated successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()