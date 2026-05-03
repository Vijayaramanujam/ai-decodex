from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict
import pdfplumber
import io

from src.agents.paper_analyzer import AnalysisCrew

router = APIRouter()

# Mock in-memory database for hackathon purposes
DB = {
    "topics": [
        {"topic": "Data Structures - Trees", "priority": "High", "frequency": 12, "difficulty": "Medium"},
        {"topic": "Algorithms - Sorting", "priority": "Medium", "frequency": 8, "difficulty": "Low"},
        {"topic": "Dynamic Programming", "priority": "High", "frequency": 15, "difficulty": "High"}
    ],
    "plan": {},
    "dashboard": {
        "year_trend": [{"year": 2021, "count": 10}, {"year": 2022, "count": 14}, {"year": 2023, "count": 18}],
        "syllabus_coverage": 85
    }
}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    content = await file.read()
    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
                
    return {"message": "File uploaded successfully", "extracted_length": len(text), "preview": text[:200]}

@router.post("/analyze")
async def analyze_document(payload: dict):
    raw_text = payload.get("text", "")
    if not raw_text:
        raise HTTPException(status_code=400, detail="Text payload required")
        
    try:
        crew = AnalysisCrew(raw_text)
        result = crew.analyze()
        return {"success": True, "analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/topics")
async def get_topics():
    return {"success": True, "data": DB["topics"]}

@router.post("/plan")
async def generate_plan(payload: dict):
    # In a real app we would trigger the StudyPlanner agent here
    # For now we'll mock the response structure
    plan = {
        "timeline_days": payload.get("days", 7),
        "priority_topics": [t["topic"] for t in DB["topics"] if t["priority"] == "High"],
        "daily_schedule": "Day 1-2: Dynamic Programming basics. Day 3-4: Trees and Traversal. Day 5-7: Mock tests and sorting algorithms."
    }
    DB["plan"] = plan
    return {"success": True, "data": plan}

@router.get("/dashboard")
async def get_dashboard():
    return {"success": True, "data": DB["dashboard"], "topics": DB["topics"]}
