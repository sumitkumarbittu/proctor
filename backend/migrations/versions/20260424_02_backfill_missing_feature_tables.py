"""Backfill missing feature tables for legacy databases

Revision ID: 20260424_02
Revises: 20260424_01
Create Date: 2026-04-24 16:30:00
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260424_02"
down_revision = "20260424_01"
branch_labels = None
depends_on = None


TABLE_CREATE_ORDER = [
    "users",
    "exams",
    "question_folders",
    "questions",
    "teacher_assignments",
    "question_folder_shares",
    "exam_questions",
    "assignments",
    "attempts",
    "responses",
    "proctoring_logs",
    "results",
    "trash",
]


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def _has_foreign_key(
    inspector: sa.Inspector,
    table_name: str,
    *,
    constrained_columns: list[str],
    referred_table: str,
) -> bool:
    return any(
        fk.get("referred_table") == referred_table
        and fk.get("constrained_columns") == constrained_columns
        for fk in inspector.get_foreign_keys(table_name)
    )


def _ensure_current_tables(bind) -> None:
    from app.db.base import Base

    metadata = Base.metadata
    for table_name in TABLE_CREATE_ORDER:
        metadata.tables[table_name].create(bind=bind, checkfirst=True)


def upgrade() -> None:
    bind = op.get_bind()

    _ensure_current_tables(bind)
    inspector = sa.inspect(bind)

    if _has_table(inspector, "exams"):
        if not _has_column(inspector, "exams", "password_hash"):
            with op.batch_alter_table("exams") as batch_op:
                batch_op.add_column(sa.Column("password_hash", sa.String(), nullable=True))

        if not _has_column(inspector, "exams", "schedule_updated_by"):
            with op.batch_alter_table("exams") as batch_op:
                batch_op.add_column(sa.Column("schedule_updated_by", sa.Integer(), nullable=True))

        inspector = sa.inspect(bind)
        if not _has_foreign_key(
            inspector,
            "exams",
            constrained_columns=["schedule_updated_by"],
            referred_table="users",
        ):
            with op.batch_alter_table("exams") as batch_op:
                batch_op.create_foreign_key(
                    "fk_exams_schedule_updated_by_users",
                    "users",
                    ["schedule_updated_by"],
                    ["id"],
                )

        inspector = sa.inspect(bind)
        if not _has_column(inspector, "exams", "schedule_updated_at"):
            with op.batch_alter_table("exams") as batch_op:
                batch_op.add_column(sa.Column("schedule_updated_at", sa.DateTime(), nullable=True))

    inspector = sa.inspect(bind)
    if _has_table(inspector, "attempts"):
        if not _has_column(inspector, "attempts", "ends_at"):
            with op.batch_alter_table("attempts") as batch_op:
                batch_op.add_column(sa.Column("ends_at", sa.DateTime(), nullable=True))

        inspector = sa.inspect(bind)
        if not _has_column(inspector, "attempts", "last_opened_at"):
            with op.batch_alter_table("attempts") as batch_op:
                batch_op.add_column(sa.Column("last_opened_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "attempts") and _has_column(inspector, "attempts", "last_opened_at"):
        with op.batch_alter_table("attempts") as batch_op:
            batch_op.drop_column("last_opened_at")

    inspector = sa.inspect(bind)
    if _has_table(inspector, "attempts") and _has_column(inspector, "attempts", "ends_at"):
        with op.batch_alter_table("attempts") as batch_op:
            batch_op.drop_column("ends_at")

    inspector = sa.inspect(bind)
    if _has_table(inspector, "exams") and _has_column(inspector, "exams", "schedule_updated_at"):
        with op.batch_alter_table("exams") as batch_op:
            batch_op.drop_column("schedule_updated_at")

    inspector = sa.inspect(bind)
    if _has_table(inspector, "exams") and _has_column(inspector, "exams", "schedule_updated_by"):
        if _has_foreign_key(
            inspector,
            "exams",
            constrained_columns=["schedule_updated_by"],
            referred_table="users",
        ):
            with op.batch_alter_table("exams") as batch_op:
                batch_op.drop_constraint("fk_exams_schedule_updated_by_users", type_="foreignkey")

        with op.batch_alter_table("exams") as batch_op:
            batch_op.drop_column("schedule_updated_by")

    inspector = sa.inspect(bind)
    if _has_table(inspector, "exams") and _has_column(inspector, "exams", "password_hash"):
        with op.batch_alter_table("exams") as batch_op:
            batch_op.drop_column("password_hash")
