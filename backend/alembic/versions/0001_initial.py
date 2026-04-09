"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-09
"""
from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "plant_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "uploaded_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reading_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("alarm_count", sa.Integer(), nullable=False, server_default="0"),
    )

    op.create_table(
        "sensor_readings",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("plant_runs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("sensor_name", sa.String(50), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(20), nullable=False),
    )
    op.create_index("ix_sensor_readings_run_id", "sensor_readings", ["run_id"])
    op.create_index("ix_sensor_readings_timestamp", "sensor_readings", ["timestamp"])
    op.create_index("ix_sensor_readings_sensor_name", "sensor_readings", ["sensor_name"])
    op.create_index(
        "ix_readings_run_sensor_time",
        "sensor_readings",
        ["run_id", "sensor_name", "timestamp"],
    )

    op.create_table(
        "alarm_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("plant_runs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "reading_id",
            sa.BigInteger(),
            sa.ForeignKey("sensor_readings.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("sensor_name", sa.String(50), nullable=False),
        sa.Column("alarm_type", sa.String(20), nullable=False),
        sa.Column("threshold_value", sa.Float(), nullable=False),
        sa.Column("actual_value", sa.Float(), nullable=False),
        sa.Column("triggered_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
    )
    op.create_index("ix_alarm_events_run_id", "alarm_events", ["run_id"])


def downgrade() -> None:
    op.drop_index("ix_alarm_events_run_id", table_name="alarm_events")
    op.drop_table("alarm_events")
    op.drop_index("ix_readings_run_sensor_time", table_name="sensor_readings")
    op.drop_index("ix_sensor_readings_sensor_name", table_name="sensor_readings")
    op.drop_index("ix_sensor_readings_timestamp", table_name="sensor_readings")
    op.drop_index("ix_sensor_readings_run_id", table_name="sensor_readings")
    op.drop_table("sensor_readings")
    op.drop_table("plant_runs")
