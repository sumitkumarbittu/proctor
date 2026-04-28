from collections import Counter
from datetime import datetime, timedelta
from statistics import median
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api import deps
from app.core.datetime import to_ist_date, utc_now
from app.models.attempt import Attempt, AttemptStatus, ProctoringLog, Response
from app.models.exam import Assignment, Exam, ExamQuestion, ExamStatus, TeacherAssignment
from app.models.user import User, UserRole

router = APIRouter()

SCORE_BUCKETS = [
    (0, 20, "0-20%"),
    (21, 40, "21-40%"),
    (41, 60, "41-60%"),
    (61, 80, "61-80%"),
    (81, 100, "81-100%"),
]


def _round(value: float, digits: int = 2) -> float:
    return round(float(value), digits)


def _percentage(value: float, total: float) -> float:
    if not total:
        return 0.0
    return _round((value / total) * 100)


def _score_percentage(attempt: Attempt) -> float | None:
    if not attempt.result or not attempt.result.max_score:
        return None
    return _percentage(attempt.result.total_score, attempt.result.max_score)


def _score_distribution(percentages: list[float]) -> list[dict[str, Any]]:
    buckets = {label: 0 for _, _, label in SCORE_BUCKETS}
    for percentage in percentages:
        rounded = max(0, min(100, percentage))
        for lower, upper, label in SCORE_BUCKETS:
            if lower <= rounded <= upper:
                buckets[label] += 1
                break
    return [{"label": label, "count": count} for label, count in buckets.items()]


def _status_breakdown(items: list[Any], attribute: str, labels: list[Any]) -> list[dict[str, Any]]:
    return [
        {
            "label": str(label.value if hasattr(label, "value") else label),
            "count": sum(1 for item in items if getattr(item, attribute) == label),
        }
        for label in labels
    ]


def _event_breakdown(logs: list[ProctoringLog]) -> list[dict[str, Any]]:
    counter = Counter(log.event_type for log in logs)
    return [{"label": event_type, "count": count} for event_type, count in counter.most_common()]


def _risk_band(log_count: int) -> str:
    if log_count >= 3:
        return "High risk"
    if log_count >= 1:
        return "Flagged"
    return "Clean"


def _risk_distribution(attempts: list[Attempt]) -> list[dict[str, Any]]:
    counter = Counter(_risk_band(len(attempt.logs)) for attempt in attempts)
    return [
        {"label": label, "count": counter.get(label, 0)}
        for label in ["Clean", "Flagged", "High risk"]
    ]


def _activity_timeline(
    attempts: list[Attempt],
    days: int = 7,
    *,
    now: datetime | None = None,
) -> list[dict[str, Any]]:
    today = to_ist_date(now or utc_now())
    timeline: dict[Any, dict[str, Any]] = {}

    for index in range(days - 1, -1, -1):
        current_date = today - timedelta(days=index)
        timeline[current_date] = {
            "date": current_date.isoformat(),
            "label": f"{current_date.strftime('%d %b')} IST",
            "started": 0,
            "submitted": 0,
            "evaluated": 0,
        }

    for attempt in attempts:
        started_at = to_ist_date(attempt.started_at)
        submitted_at = to_ist_date(attempt.submitted_at)
        evaluated_at = to_ist_date(attempt.result.published_at if attempt.result else None)

        if started_at in timeline:
            timeline[started_at]["started"] += 1
        if submitted_at in timeline:
            timeline[submitted_at]["submitted"] += 1
        if evaluated_at in timeline:
            timeline[evaluated_at]["evaluated"] += 1

    return list(timeline.values())


def _question_insights(exam: Exam) -> list[dict[str, Any]]:
    attempts = list(exam.attempts)
    total_started = len(attempts)
    responses_by_question: dict[int, list[Response]] = {}

    for attempt in attempts:
        for response in attempt.responses:
            responses_by_question.setdefault(response.question_id, []).append(response)

    insights: list[dict[str, Any]] = []
    for exam_question in sorted(exam.questions, key=lambda item: item.order_index or 0):
        question = exam_question.question
        responses = responses_by_question.get(question.id, [])
        answered_responses = [response for response in responses if (response.answer or "").strip()]
        answered_count = len(answered_responses)
        blank_count = max(total_started - answered_count, 0)
        average_marks = (
            _round(sum((response.marks_awarded or 0.0) for response in responses) / len(responses))
            if responses
            else 0.0
        )

        correct_count = 0
        correct_rate = 0.0
        difficulty = "Mixed"
        if question.type.value == "MCQ":
            correct_count = sum(
                1 for response in answered_responses if response.answer == question.correct_option
            )
            correct_rate = _percentage(correct_count, answered_count)
            if correct_rate >= 75:
                difficulty = "Easy"
            elif correct_rate >= 45:
                difficulty = "Moderate"
            else:
                difficulty = "Hard"
        elif average_marks >= question.marks * 0.75:
            difficulty = "Strong"
        elif average_marks <= question.marks * 0.35:
            difficulty = "Needs review"

        insights.append(
            {
                "question_id": question.id,
                "prompt": question.prompt,
                "type": question.type.value,
                "marks": question.marks,
                "answered_count": answered_count,
                "blank_count": blank_count,
                "response_rate": _percentage(answered_count, total_started),
                "correct_count": correct_count,
                "correct_rate": correct_rate,
                "average_awarded_marks": average_marks,
                "difficulty": difficulty,
            }
        )

    return insights


def _leaderboard(attempts: list[Attempt]) -> list[dict[str, Any]]:
    rows = []
    for attempt in attempts:
        percentage = _score_percentage(attempt)
        rows.append(
            {
                "attempt_id": attempt.id,
                "student_id": attempt.student_id,
                "student_name": attempt.student.name or attempt.student.email
                if attempt.student
                else f"Student #{attempt.student_id}",
                "student_email": attempt.student.email if attempt.student else None,
                "status": attempt.status.value,
                "score": _round(attempt.result.total_score) if attempt.result else None,
                "max_score": _round(attempt.result.max_score) if attempt.result else None,
                "percentage": percentage,
                "violations": len(attempt.logs),
                "submitted_at": attempt.submitted_at.isoformat() if attempt.submitted_at else None,
            }
        )

    rows.sort(
        key=lambda row: (
            row["percentage"] is not None,
            row["percentage"] or -1,
            -(row["violations"] or 0),
        ),
        reverse=True,
    )
    return rows[:5]


def _exam_metrics(exam: Exam) -> dict[str, Any]:
    attempts = list(exam.attempts)
    assigned_students = len(exam.assignments)
    evaluated_attempts = [attempt for attempt in attempts if attempt.result]
    completed_attempts = [
        attempt for attempt in attempts if attempt.status in [AttemptStatus.SUBMITTED, AttemptStatus.EVALUATED]
    ]
    score_percentages = [
        percentage
        for attempt in evaluated_attempts
        if (percentage := _score_percentage(attempt)) is not None
    ]
    raw_scores = [attempt.result.total_score for attempt in evaluated_attempts if attempt.result]
    total_logs = sum(len(attempt.logs) for attempt in attempts)
    average_duration = [
        (attempt.submitted_at - attempt.started_at).total_seconds() / 60
        for attempt in attempts
        if attempt.started_at and attempt.submitted_at
    ]

    return {
        "attempts": attempts,
        "assigned_students": assigned_students,
        "started_count": len(attempts),
        "completed_count": len(completed_attempts),
        "evaluated_count": len(evaluated_attempts),
        "in_progress_count": sum(1 for attempt in attempts if attempt.status == AttemptStatus.IN_PROGRESS),
        "submitted_count": sum(1 for attempt in attempts if attempt.status == AttemptStatus.SUBMITTED),
        "not_started_count": max(assigned_students - len(attempts), 0),
        "score_percentages": score_percentages,
        "raw_scores": raw_scores,
        "total_logs": total_logs,
        "average_duration": _round(sum(average_duration) / len(average_duration)) if average_duration else 0.0,
        "high_risk_attempts": sum(1 for attempt in attempts if len(attempt.logs) >= 3),
    }


def _build_exam_analytics(exam: Exam) -> dict[str, Any]:
    metrics = _exam_metrics(exam)
    attempts = metrics["attempts"]
    score_percentages = metrics["score_percentages"]
    raw_scores = metrics["raw_scores"]
    total_questions = len(exam.questions)

    overview = {
        "assigned_students": metrics["assigned_students"],
        "attempt_count": metrics["started_count"],
        "not_started_count": metrics["not_started_count"],
        "in_progress_count": metrics["in_progress_count"],
        "submitted_count": metrics["submitted_count"],
        "evaluated_count": metrics["evaluated_count"],
        "completion_rate": _percentage(
            metrics["completed_count"],
            metrics["assigned_students"] or metrics["started_count"],
        ),
        "participation_rate": _percentage(metrics["started_count"], metrics["assigned_students"]),
        "evaluation_rate": _percentage(metrics["evaluated_count"], metrics["completed_count"]),
        "average_percentage": _round(sum(score_percentages) / len(score_percentages)) if score_percentages else 0.0,
        "median_percentage": _round(median(score_percentages)) if score_percentages else 0.0,
        "highest_percentage": _round(max(score_percentages)) if score_percentages else 0.0,
        "lowest_percentage": _round(min(score_percentages)) if score_percentages else 0.0,
        "pass_rate": _percentage(sum(1 for value in score_percentages if value >= 50), len(score_percentages)),
        "average_time_to_submit_minutes": metrics["average_duration"],
        "total_violations": metrics["total_logs"],
        "high_risk_attempts": metrics["high_risk_attempts"],
    }

    all_logs = [log for attempt in attempts for log in attempt.logs]
    question_insights = _question_insights(exam)
    question_insights.sort(
        key=lambda item: (
            item["correct_rate"] if item["type"] == "MCQ" else item["response_rate"],
            -item["average_awarded_marks"],
        )
    )

    return {
        "exam": {
            "id": exam.id,
            "title": exam.title,
            "status": exam.status.value,
            "duration_minutes": exam.duration_minutes,
            "start_time": exam.start_time.isoformat() if exam.start_time else None,
            "question_count": total_questions,
            "assigned_students": metrics["assigned_students"],
            "teacher_count": len(exam.teacher_assignments),
        },
        "overview": overview,
        "progress_funnel": [
            {"label": "Assigned", "count": metrics["assigned_students"]},
            {"label": "Started", "count": metrics["started_count"]},
            {"label": "Completed", "count": metrics["completed_count"]},
            {"label": "Evaluated", "count": metrics["evaluated_count"]},
        ],
        "status_breakdown": _status_breakdown(
            attempts,
            "status",
            [AttemptStatus.IN_PROGRESS, AttemptStatus.SUBMITTED, AttemptStatus.EVALUATED],
        ),
        "score_distribution": _score_distribution(score_percentages),
        "question_insights": question_insights,
        "proctoring_breakdown": _event_breakdown(all_logs),
        "risk_distribution": _risk_distribution(attempts),
        "timeline": _activity_timeline(attempts, days=7),
        "leaderboard": _leaderboard(attempts),
        "total_attempts": metrics["started_count"],
        "total_submitted": metrics["completed_count"],
        "total_evaluated": metrics["evaluated_count"],
        "average_score": _round(sum(raw_scores) / len(raw_scores)) if raw_scores else 0.0,
        "max_score": _round(max(raw_scores)) if raw_scores else 0.0,
        "min_score": _round(min(raw_scores)) if raw_scores else 0.0,
        "total_proctoring_violations": metrics["total_logs"],
    }


def _build_attempt_analytics(attempt: Attempt, current_user: User) -> dict[str, Any]:
    exam = attempt.exam
    exam_questions = sorted(exam.questions, key=lambda item: item.order_index or 0) if exam else []
    responses_by_question = {response.question_id: response for response in attempt.responses}
    show_correct_answers = current_user.role in [UserRole.ADMIN, UserRole.EXAMINER] or attempt.status == AttemptStatus.EVALUATED

    answered_count = 0
    correct_count = 0
    total_mcqs = 0
    total_subjective = 0
    subjective_score = 0.0
    max_score = attempt.result.max_score if attempt.result else sum(
        exam_question.question.marks for exam_question in exam_questions if exam_question.question
    )
    score = attempt.result.total_score if attempt.result else sum(
        (responses_by_question.get(exam_question.question_id).marks_awarded or 0.0)
        for exam_question in exam_questions
        if responses_by_question.get(exam_question.question_id)
    )
    time_spent_minutes = (
        _round((attempt.submitted_at - attempt.started_at).total_seconds() / 60)
        if attempt.started_at and attempt.submitted_at
        else None
    )

    question_breakdown = []
    for index, exam_question in enumerate(exam_questions, start=1):
        question = exam_question.question
        if not question:
            continue

        response = responses_by_question.get(question.id)
        answer = response.answer if response else None
        marks_awarded = response.marks_awarded if response else 0.0
        is_answered = bool((answer or "").strip())
        answered_count += 1 if is_answered else 0

        is_correct = None
        if question.type.value == "MCQ":
            total_mcqs += 1
            is_correct = bool(is_answered and answer == question.correct_option)
            correct_count += 1 if is_correct else 0
        else:
            total_subjective += 1
            subjective_score += marks_awarded or 0.0

        question_breakdown.append(
            {
                "order": index,
                "question_id": question.id,
                "prompt": question.prompt,
                "type": question.type.value,
                "marks": question.marks,
                "answer": answer,
                "is_answered": is_answered,
                "marks_awarded": marks_awarded,
                "percentage_awarded": _percentage(marks_awarded or 0.0, question.marks),
                "is_correct": is_correct,
                "correct_option": question.correct_option if show_correct_answers else None,
            }
        )

    blank_count = max(len(question_breakdown) - answered_count, 0)
    percentage = _percentage(score, max_score)
    mcq_accuracy = _percentage(correct_count, total_mcqs)
    average_subjective = _round(subjective_score / total_subjective) if total_subjective else 0.0
    evaluated_count = sum(1 for row in question_breakdown if row["marks_awarded"] is not None)
    proctor_events = [
        {
            "id": log.id,
            "type": log.event_type,
            "severity": log.severity,
            "metadata": log.metadata_info,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in sorted(attempt.logs, key=lambda item: item.created_at or datetime.min)
    ]

    return {
        "attempt": {
            "id": attempt.id,
            "status": attempt.status.value,
            "started_at": attempt.started_at.isoformat() if attempt.started_at else None,
            "submitted_at": attempt.submitted_at.isoformat() if attempt.submitted_at else None,
            "student_id": attempt.student_id,
            "student_name": attempt.student.name if attempt.student else None,
            "student_email": attempt.student.email if attempt.student else None,
            "ended_at": attempt.ends_at.isoformat() if attempt.ends_at else None,
        },
        "exam": {
            "id": exam.id if exam else None,
            "title": exam.title if exam else "Exam",
            "status": exam.status.value if exam else None,
            "duration_minutes": exam.duration_minutes if exam else 0,
            "question_count": len(question_breakdown),
            "max_attempts_per_student": exam.max_attempts_per_student if exam else 1,
        },
        "overview": {
            "score": _round(score),
            "max_score": _round(max_score),
            "percentage": percentage,
            "answered_count": answered_count,
            "blank_count": blank_count,
            "evaluated_question_count": evaluated_count,
            "total_question_count": len(question_breakdown),
            "response_rate": _percentage(answered_count, len(question_breakdown)),
            "total_violations": len(attempt.logs),
            "risk_band": _risk_band(len(attempt.logs)),
            "time_spent_minutes": time_spent_minutes,
            "mcq_accuracy": mcq_accuracy,
            "average_subjective_marks": average_subjective,
            "correct_count": correct_count,
            "incorrect_count": max(total_mcqs - correct_count, 0),
            "total_mcqs": total_mcqs,
            "total_subjective": total_subjective,
        },
        "performance_breakdown": [
            {"label": "Answered", "count": answered_count},
            {"label": "Blank", "count": blank_count},
            {"label": "Correct", "count": correct_count},
            {"label": "Incorrect", "count": max(total_mcqs - correct_count, 0)},
        ],
        "integrity_breakdown": _event_breakdown(attempt.logs),
        "proctor_events": proctor_events,
        "question_breakdown": question_breakdown,
    }


def _build_student_summary(attempts: list[Attempt]) -> dict[str, Any]:
    evaluated_attempts = [attempt for attempt in attempts if attempt.result]
    percentages = [
        percentage
        for attempt in evaluated_attempts
        if (percentage := _score_percentage(attempt)) is not None
    ]
    total_flags = sum(len(attempt.logs) for attempt in attempts)

    return {
        "overview": {
            "attempt_count": len(attempts),
            "evaluated_count": len(evaluated_attempts),
            "average_percentage": _round(sum(percentages) / len(percentages)) if percentages else 0.0,
            "best_percentage": _round(max(percentages)) if percentages else 0.0,
            "total_flags": total_flags,
        },
        "status_breakdown": _status_breakdown(
            attempts,
            "status",
            [AttemptStatus.IN_PROGRESS, AttemptStatus.SUBMITTED, AttemptStatus.EVALUATED],
        ),
        "score_distribution": _score_distribution(percentages),
        "recent_attempts": [
            {
                "attempt_id": attempt.id,
                "exam_id": attempt.exam_id,
                "exam_title": attempt.exam.title if attempt.exam else f"Exam #{attempt.exam_id}",
                "status": attempt.status.value,
                "percentage": _score_percentage(attempt),
                "started_at": attempt.started_at.isoformat() if attempt.started_at else None,
            }
            for attempt in sorted(attempts, key=lambda item: item.started_at or datetime.min, reverse=True)[:5]
        ],
    }


def _has_exam_staff_access(exam: Exam | None, current_user: User) -> bool:
    if not exam:
        return False
    if current_user.role == UserRole.ADMIN:
        return True
    if current_user.role != UserRole.EXAMINER:
        return False
    if exam.created_by == current_user.id:
        return True
    return any(assignment.teacher_id == current_user.id for assignment in exam.teacher_assignments)


@router.get("/attempt/{attempt_id}/analytics")
async def get_attempt_analytics(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(
        select(Attempt)
        .options(
            selectinload(Attempt.student),
            selectinload(Attempt.result),
            selectinload(Attempt.logs),
            selectinload(Attempt.responses),
            selectinload(Attempt.exam).selectinload(Exam.teacher_assignments),
            selectinload(Attempt.exam).selectinload(Exam.questions).selectinload(ExamQuestion.question),
        )
        .filter(Attempt.id == attempt_id)
    )
    attempt = result.scalars().unique().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    if attempt.student_id != current_user.id and not _has_exam_staff_access(attempt.exam, current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return _build_attempt_analytics(attempt, current_user)


@router.get("/student/me")
async def get_my_student_analytics(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=400, detail="Student analytics are only available to students")

    result = await db.execute(
        select(Attempt)
        .options(selectinload(Attempt.result), selectinload(Attempt.logs), selectinload(Attempt.exam))
        .filter(Attempt.student_id == current_user.id)
        .order_by(Attempt.started_at.desc())
    )
    attempts = result.scalars().unique().all()
    return _build_student_summary(attempts)


@router.get("/exam/{exam_id}/summary")
@router.get("/exam/{exam_id}/analytics")
async def get_exam_summary(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    result = await db.execute(
        select(Exam)
        .options(
            selectinload(Exam.teacher_assignments),
            selectinload(Exam.questions).selectinload(ExamQuestion.question),
            selectinload(Exam.assignments).selectinload(Assignment.student),
            selectinload(Exam.attempts).selectinload(Attempt.student),
            selectinload(Exam.attempts).selectinload(Attempt.result),
            selectinload(Exam.attempts).selectinload(Attempt.logs),
            selectinload(Exam.attempts).selectinload(Attempt.responses).selectinload(Response.question),
        )
        .filter(Exam.id == exam_id)
    )
    exam = result.scalars().unique().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if not _has_exam_staff_access(exam, current_user):
        raise HTTPException(status_code=403, detail="Exam is not available to this teacher")

    return _build_exam_analytics(exam)


@router.get("/dashboard")
async def get_admin_dashboard(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    stmt = select(Exam).options(
        selectinload(Exam.teacher_assignments),
        selectinload(Exam.assignments),
        selectinload(Exam.attempts).selectinload(Attempt.result),
        selectinload(Exam.attempts).selectinload(Attempt.logs),
    )

    if current_user.role == UserRole.EXAMINER:
        assigned_teacher_exists = (
            select(TeacherAssignment.exam_id)
            .filter(
                TeacherAssignment.exam_id == Exam.id,
                TeacherAssignment.teacher_id == current_user.id,
            )
            .exists()
        )
        stmt = stmt.filter(or_(Exam.created_by == current_user.id, assigned_teacher_exists))

    exams_result = await db.execute(stmt)
    exams = exams_result.scalars().unique().all()

    users_result = await db.execute(select(User))
    users = users_result.scalars().all()

    attempts = [attempt for exam in exams for attempt in exam.attempts]
    evaluated_attempts = [attempt for attempt in attempts if attempt.result]
    score_percentages = [
        percentage
        for attempt in evaluated_attempts
        if (percentage := _score_percentage(attempt)) is not None
    ]
    all_logs = [log for attempt in attempts for log in attempt.logs]
    total_assignments = sum(len(exam.assignments) for exam in exams)

    overview = {
        "total_exams": len(exams),
        "live_exams": sum(1 for exam in exams if exam.status == ExamStatus.LIVE),
        "draft_exams": sum(1 for exam in exams if exam.status == ExamStatus.DRAFT),
        "closed_exams": sum(1 for exam in exams if exam.status == ExamStatus.CLOSED),
        "published_exams": sum(1 for exam in exams if exam.status == ExamStatus.RESULT_PUBLISHED),
        "total_users": len(users),
        "total_students": sum(1 for user in users if user.role == UserRole.STUDENT),
        "total_examiners": sum(1 for user in users if user.role == UserRole.EXAMINER),
        "total_attempts": len(attempts),
        "pending_evaluation": sum(1 for attempt in attempts if attempt.status == AttemptStatus.SUBMITTED),
        "active_attempts": sum(1 for attempt in attempts if attempt.status == AttemptStatus.IN_PROGRESS),
        "evaluated_attempts": len(evaluated_attempts),
        "average_percentage": _round(sum(score_percentages) / len(score_percentages)) if score_percentages else 0.0,
        "participation_rate": _percentage(len(attempts), total_assignments),
        "integrity_alerts": len(all_logs),
        "high_risk_attempts": sum(1 for attempt in attempts if len(attempt.logs) >= 3),
    }

    top_exams = []
    for exam in exams:
        metrics = _exam_metrics(exam)
        average_percentage = (
            _round(sum(metrics["score_percentages"]) / len(metrics["score_percentages"]))
            if metrics["score_percentages"]
            else 0.0
        )
        top_exams.append(
            {
                "exam_id": exam.id,
                "title": exam.title,
                "status": exam.status.value,
                "attempt_count": metrics["started_count"],
                "assigned_students": metrics["assigned_students"],
                "completion_rate": _percentage(
                    metrics["completed_count"],
                    metrics["assigned_students"] or metrics["started_count"],
                ),
                "average_percentage": average_percentage,
                "violations": metrics["total_logs"],
            }
        )

    top_exams.sort(
        key=lambda exam: (exam["attempt_count"], exam["violations"], exam["average_percentage"]),
        reverse=True,
    )

    return {
        "overview": overview,
        "total_exams": overview["total_exams"],
        "total_users": overview["total_users"],
        "total_attempts": overview["total_attempts"],
        "pending_evaluation": overview["pending_evaluation"],
        "live_exams": overview["live_exams"],
        "exam_status_breakdown": _status_breakdown(
            exams,
            "status",
            [
                ExamStatus.DRAFT,
                ExamStatus.SCHEDULED,
                ExamStatus.LIVE,
                ExamStatus.CLOSED,
                ExamStatus.RESULT_PUBLISHED,
            ],
        ),
        "attempt_status_breakdown": _status_breakdown(
            attempts,
            "status",
            [AttemptStatus.IN_PROGRESS, AttemptStatus.SUBMITTED, AttemptStatus.EVALUATED],
        ),
        "score_distribution": _score_distribution(score_percentages),
        "risk_distribution": _risk_distribution(attempts),
        "integrity_breakdown": _event_breakdown(all_logs),
        "activity_timeline": _activity_timeline(attempts, days=7),
        "top_exams": top_exams[:5],
    }
