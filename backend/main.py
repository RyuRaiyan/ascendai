import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="AscendAI API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ascendai-ashen.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def home():
    return {
        "message": "AscendAI API is running!",
        "status": "online"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}

from pydantic import BaseModel


class SkillGapRequest(BaseModel):
    target_role: str
    current_skills: list[str]


ROLE_SKILLS = {
    "software engineer": [
        "Python", "Data Structures", "SQL",
        "Git", "REST APIs", "Testing"
    ],
    "data scientist": [
        "Python", "SQL", "Statistics",
        "Machine Learning", "Data Visualization"
    ],
    "machine learning engineer": [
        "Python", "Statistics", "Machine Learning",
        "Deep Learning", "Model Deployment", "Git"
    ],
    "frontend developer": [
        "HTML", "CSS", "JavaScript",
        "React", "Git", "Testing"
    ],
}

LEARNING_PLANS = {
    "python": {
        "topic": "Python syntax, data structures, functions, modules, and error handling"
    },
    "sql": {
        "topic": "SQL queries, joins, aggregations, subqueries, and database design"
    },
    "statistics": {
        "topic": "descriptive statistics, probability, hypothesis testing, and distributions"
    },
    "machine learning": {
        "topic": "supervised and unsupervised learning, model evaluation, and feature engineering"
    },
    "data visualization": {
        "topic": "visual storytelling, chart selection, dashboards, and communicating insights"
    },
    "pandas": {
        "topic": "DataFrame operations, data cleaning, grouping, merging, and analysis"
    },
    "numpy": {
        "topic": "arrays, vectorized operations, broadcasting, and numerical computation"
    },
    "deep learning": {
        "topic": "neural networks, backpropagation, optimization, and model evaluation"
    },
    "sql databases": {
        "topic": "relational database design, queries, indexing, and transactions"
    },
    "communication": {
        "topic": "explaining technical findings clearly to technical and non-technical audiences"
    },
    "problem solving": {
        "topic": "breaking down complex problems, selecting approaches, and evaluating solutions"
    },
}

DEFAULT_PLAN = {
    "topic": "core concepts, practical applications, common tools, and hands-on exercises"
}

class RoadmapRequest(BaseModel):
    target_role: str
    missing_skills: list[str]
    skill_levels: dict[str, str] = {}


@app.post("/skill-gap")
async def skill_gap(request: SkillGapRequest):
    import json

    role = request.target_role.strip().lower()
    required_skills = ROLE_SKILLS.get(role)

    if required_skills is None:
        return {
            "error": "Role not supported yet.",
            "supported_roles": list(ROLE_SKILLS.keys())
        }

    current_skills = [
        skill.strip()
        for skill in request.current_skills
        if skill.strip()
    ]

    if not current_skills:
        raise HTTPException(
            status_code=400,
            detail="Please enter your current skills first."
        )

    prompt = f"""
You are AscendAI, an expert career and skills coach.

Analyse the candidate's current skills against the requirements
for their target role.

Target role: {request.target_role}
Required skills: {json.dumps(required_skills)}
Candidate's current skills: {json.dumps(current_skills)}

Rules:
- Recognise equivalent or closely related skills when justified.
- Only mark a skill as matched when the candidate's stated skills
  provide reasonable evidence for it.
- Use the canonical names from Required skills in matched_skills
  and missing_skills.
- Do not invent experience, qualifications, or achievements.
- Calculate readiness_percentage as:
  matched required skills / total required skills * 100,
  rounded to the nearest integer.
- Give practical, role-specific recommendations.
- Return ONLY valid JSON, without Markdown or code fences.

Use exactly this JSON structure:
{{
  "matched_skills": ["skill names"],
  "missing_skills": ["skill names"],
  "readiness_percentage": 0,
  "summary": "Short assessment of the candidate",
  "recommendations": [
    "Specific actionable recommendation"
  ],
  "priority_skills": [
    "Most important skill to learn next"
  ]
}}

Return all required skills in either matched_skills or missing_skills.
"""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "X-OpenRouter-Title": "AscendAI",
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are a precise career skills analyst. "
                                "Return valid JSON only."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.2,
                },
            )

        if response.is_error:
            print("OpenRouter skill-gap error:", response.text[:1000])
            raise HTTPException(
                status_code=502,
                detail="The AI provider could not complete the skill analysis."
            )

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        # Remove optional Markdown code fences.
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            content = content.rsplit("```", 1)[0].strip()

        ai_result = json.loads(content)

        # Validate and normalise skill names against the known requirements.
        
        import re

        def normalise_skill(skill):
            return re.sub(r"[^a-z0-9]+", "", skill.lower().strip())

        required_by_normalised = {
            normalise_skill(skill): skill
            for skill in required_skills
        }

        matched = []
        for skill in ai_result.get("matched_skills", []):
            canonical = required_by_normalised.get(normalise_skill(skill))
            if canonical and canonical not in matched:
                matched.append(canonical)

        missing = [
            skill for skill in required_skills
            if skill not in matched
        ]


        readiness = round(
            len(matched) / len(required_skills) * 100
        ) if required_skills else 0

        return {
            "target_role": request.target_role,
            "matched_skills": matched,
            "missing_skills": missing,
            "readiness_percentage": readiness,
            "summary": str(ai_result.get("summary", "")),
            "recommendations": ai_result.get("recommendations", []),
            "priority_skills": ai_result.get("priority_skills", []),
            "message": "AI skill gap analysis completed."
        }

    except HTTPException:
        raise
    except (KeyError, IndexError, TypeError, ValueError) as error:
        print("Invalid OpenRouter skill-gap response:", str(error))
        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid analysis. Please try again."
        )
    except Exception as error:
        print("Skill-gap analysis error:", str(error))
        raise HTTPException(
            status_code=502,
            detail="Could not complete the skill analysis. Please try again."
        )




@app.post("/career-roadmap")
def career_roadmap(request: RoadmapRequest):
    roadmap = []

    proficiency_points = {
        "beginner": 25,
        "intermediate": 60,
        "advanced": 90,
    }

    # Remove duplicates and prioritize the lowest-rated skills.
    skills = list(dict.fromkeys(
        skill.strip()
        for skill in request.missing_skills
        if skill.strip()
    ))

    skills.sort(
        key=lambda skill: proficiency_points.get(
            request.skill_levels.get(skill, "beginner").lower(),
            25,
        )
    )

    for index, skill in enumerate(skills, start=1):
        plan = LEARNING_PLANS.get(
            skill.lower(),
            DEFAULT_PLAN,
        )

        level = (
            request.skill_levels.get(skill, "beginner") or "beginner"
        ).strip().lower()

        duration_by_level = {
            "beginner": "3 weeks",
            "intermediate": "2 weeks",
            "advanced": "1 week",
        }

        duration = duration_by_level.get(level, "3 weeks")

        level_plans = {
            "beginner": {
                "topic_prefix": "Learn the fundamentals of",
                "project_prefix": "Build a beginner-friendly project demonstrating",
            },
            "intermediate": {
                "topic_prefix": "Strengthen practical knowledge of",
                "project_prefix": "Build and evaluate a practical solution using",
            },
            "advanced": {
                "topic_prefix": "Master advanced techniques in",
                "project_prefix": "Develop a production-oriented project demonstrating",
            },
        }

        level_plan = level_plans.get(level, level_plans["beginner"])
        
        resource_map = {
            "python": [
                {
                    "title": "Python Official Tutorial",
                    "url": "https://docs.python.org/3/tutorial/",
                    "type": "Documentation"
                },
                {
                    "title": "Kaggle Python Course",
                    "url": "https://www.kaggle.com/learn/python",
                    "type": "Interactive course"
                }
            ],
            "statistics": [
                {
                    "title": "Khan Academy Statistics",
                    "url": "https://www.khanacademy.org/math/statistics-probability",
                    "type": "Course"
                }
            ],
            "machine learning": [
                {
                    "title": "Google Machine Learning Crash Course",
                    "url": "https://developers.google.com/machine-learning/crash-course",
                    "type": "Course"
                },
                {
                    "title": "scikit-learn User Guide",
                    "url": "https://scikit-learn.org/stable/user_guide.html",
                    "type": "Documentation"
                }
            ],
            "data visualization": [
                {
                    "title": "Tableau Free Training",
                    "url": "https://www.tableau.com/learn/training",
                    "type": "Training"
                }
            ],
            "sql": [
                {
                    "title": "SQLBolt Interactive Lessons",
                    "url": "https://sqlbolt.com/",
                    "type": "Interactive course"
                }
            ]
        }

        resources = resource_map.get(skill.strip().lower(), [])

        roadmap.append({
            "step": index,
            "skill": skill,
            "duration": duration,
            "learning_focus": (
                f"{level_plan['topic_prefix']} "
                f"{plan['topic']}"
            ),
            "project": (
                f"{level_plan['project_prefix']} {skill}."
            ),
            "target_role": request.target_role,
            "resources": resources,
        })

    return {
        "target_role": request.target_role,
        "total_steps": len(roadmap),
        "roadmap": roadmap,
        "message": "Personalized career roadmap generated successfully.",
    }




OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")


class InterviewRequest(BaseModel):
    question: str
    answer: str


@app.post("/interview/evaluate")
async def evaluate_interview(request: InterviewRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API key is not configured. Check backend/.env.",
        )

    if not request.question.strip() or not request.answer.strip():
        raise HTTPException(
            status_code=400,
            detail="Both question and answer are required.",
        )

    prompt = f"""
You are an expert career coach helping a candidate prepare for job interviews.

Interview question:
{request.question}

Candidate's answer:
{request.answer}

Evaluate the answer fairly, not just by keyword matching.

Return:
1. Score out of 100.
2. What the candidate did well.
3. What needs improvement.
4. Specific suggestions to improve the answer.
5. A stronger sample answer.

Be encouraging, specific, and concise. Do not invent experience
or achievements on behalf of the candidate.
"""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "X-OpenRouter-Title": "AscendAI",
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are a constructive, honest interview coach."
                            ),
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    "temperature": 0.3,
                },
            )

        if response.is_error:
            print("OpenRouter error:", response.text[:1000])
            raise HTTPException(
                status_code=502,
                detail="OpenRouter request failed. Check the backend terminal.",
            )

        data = response.json()
        feedback = data["choices"][0]["message"]["content"]

        if not feedback:
            raise HTTPException(
                status_code=502,
                detail="OpenRouter returned empty feedback.",
            )

        return {
            "success": True,
            "feedback": feedback,
            "model": data.get("model", OPENROUTER_MODEL),
        }

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="OpenRouter timed out. Please try again.",
        )
    except HTTPException:
        raise
    except (KeyError, IndexError, TypeError, ValueError):
        raise HTTPException(
            status_code=502,
            detail="OpenRouter returned an unexpected response.",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to OpenRouter.",
        )
