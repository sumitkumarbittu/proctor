"""Exam attempt limits and password mode

Revision ID: 20260428_01
Revises: 20260424_02
Create Date: 2026-04-28 14:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260428_01"
down_revision = "20260424_02"
branch_labels = None
depends_on = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "exams"):
        return

    if not _has_column(inspector, "exams", "max_attempts_per_student"):
        with op.batch_alter_table("exams") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "max_attempts_per_student",
                    sa.Integer(),
                    nullable=False,
                    server_default="1",
                )
            )

    inspector = sa.inspect(bind)
    if not _has_column(inspector, "exams", "password_required"):
        with op.batch_alter_table("exams") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "password_required",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.true(),
                )
            )

    with op.batch_alter_table("exams") as batch_op:
        batch_op.alter_column("max_attempts_per_student", server_default=None)
        batch_op.alter_column("password_required", server_default=None)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "exams") and _has_column(inspector, "exams", "password_required"):
        with op.batch_alter_table("exams") as batch_op:
            batch_op.drop_column("password_required")

    inspector = sa.inspect(bind)
    if _has_table(inspector, "exams") and _has_column(inspector, "exams", "max_attempts_per_student"):
        with op.batch_alter_table("exams") as batch_op:
            batch_op.drop_column("max_attempts_per_student")
