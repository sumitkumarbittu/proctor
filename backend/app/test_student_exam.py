import asyncio
from sqlalchemy import select, or_
from app.db.session import AsyncSessionLocal
from app.models.exam import Exam, Assignment, ExamStatus
from app.models.attempt import Attempt
from app.models.user import User, UserRole
from app.core.security import get_password_hash

async def run():
    async with AsyncSessionLocal() as db:
        # Create student
        student = User(email="student_test_1@example.com", name="Test Student", password_hash=get_password_hash("password"), role=UserRole.STUDENT, is_active=True)
        db.add(student)
        await db.flush()

        # Create exam (LIVE)
        exam = Exam(title="Test Exam", duration_minutes=60, status=ExamStatus.LIVE, created_by=1)
        db.add(exam)
        await db.flush()

        # Assign exam to student
        assignment = Assignment(exam_id=exam.id, student_id=student.id)
        db.add(assignment)
        await db.flush()
        
        await db.commit()

        # Query
        stmt = select(Exam)
        assignment_exists = select(Assignment.exam_id).filter(Assignment.exam_id == Exam.id, Assignment.student_id == student.id).exists()
        attempt_exists = select(Attempt.id).filter(Attempt.exam_id == Exam.id, Attempt.student_id == student.id).exists()
        stmt = stmt.filter(or_(assignment_exists, attempt_exists), Exam.status != ExamStatus.DRAFT)

        result = await db.execute(stmt)
        exams = result.scalars().unique().all()
        print("EXAMS FOUND:", [e.title for e in exams])

asyncio.run(run())
