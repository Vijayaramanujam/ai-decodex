from crewai import Agent, Task, Crew, Process
from pydantic import BaseModel, Field
from typing import List, Optional
import os

# We will use Gemini via LangChain wrapper
from langchain_google_genai import ChatGoogleGenerativeAI

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY", "dummy"),
        temperature=0.2
    )

class TopicMetadata(BaseModel):
    topic: str
    difficulty: str
    question_type: str

class PaperAnalysisResult(BaseModel):
    paper_title: str
    identified_topics: List[TopicMetadata]
    summary: str

class StudyPlan(BaseModel):
    priority_topics: List[str]
    timeline_days: int
    daily_schedule: str

class AnalysisCrew:
    def __init__(self, raw_text: str):
        self.raw_text = raw_text
        self.llm = get_llm()

        self.paper_analyzer = Agent(
            role='Past Paper Analyst',
            goal='Extract distinct questions, topics, difficulty, and types from the raw exam paper text.',
            backstory='You are an expert academic evaluator capable of parsing complex exam papers and identifying core syllabus topics tested.',
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )

        self.topic_ranker = Agent(
            role='Topic Strategist',
            goal='Analyze extracted topics and rank them by importance based on frequency and difficulty.',
            backstory='You are a curriculum expert who identifies high-yield topics to maximize student score with limited time.',
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )

        self.study_planner = Agent(
            role='Study Plan Creator',
            goal='Generate a concrete study timeline focusing on high-priority topics with practice recommendations.',
            backstory='You are an empathetic academic coach designing personalized, realistic study schedules.',
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )

    def analyze(self):
        task1 = Task(
            description=f'Analyze the following exam paper text and extract topics, difficulty levels (Low/Medium/High), and question types (Theory/Problem/MCQ). Text: {self.raw_text[:4000]}...',
            agent=self.paper_analyzer,
            expected_output="A structured list of topics, their difficulties, and question types."
        )

        task2 = Task(
            description='Take the topics extracted from Task 1 and rank them by importance (High/Medium/Low priority) to maximize exam scores.',
            agent=self.topic_ranker,
            expected_output="A ranked list of topics with priority labels."
        )

        task3 = Task(
            description='Based on the ranked topics from Task 2, create a 7-day study plan with daily milestones and practice recommendations.',
            agent=self.study_planner,
            expected_output="A detailed 7-day study schedule focusing first on high-priority topics."
        )

        crew = Crew(
            agents=[self.paper_analyzer, self.topic_ranker, self.study_planner],
            tasks=[task1, task2, task3],
            process=Process.sequential
        )

        result = crew.kickoff()
        return result
