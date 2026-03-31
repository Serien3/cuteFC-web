from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.utils.time import utc_now


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )


class Project(TimestampMixin, Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")

    samples: Mapped[list["Sample"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    files: Mapped[list["InputFile"]] = relationship(back_populates="project", cascade="all, delete-orphan")


class Sample(TimestampMixin, Base):
    __tablename__ = "samples"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    sample_name: Mapped[str] = mapped_column(String(120), nullable=False)
    platform_type: Mapped[str] = mapped_column(String(32), default="ONT")
    remark: Mapped[str] = mapped_column(Text, default="")

    project: Mapped[Project] = relationship(back_populates="samples")


class InputFile(TimestampMixin, Base):
    __tablename__ = "input_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    sample_id: Mapped[int | None] = mapped_column(ForeignKey("samples.id"), nullable=True)
    file_type: Mapped[str] = mapped_column(String(32), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="registered")

    project: Mapped[Project] = relationship(back_populates="files")


class AnalysisTask(TimestampMixin, Base):
    __tablename__ = "analysis_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    sample_id: Mapped[int] = mapped_column(ForeignKey("samples.id"), nullable=False)
    tool_name: Mapped[str] = mapped_column(String(64), default="cuteFC")
    task_name: Mapped[str] = mapped_column(String(120), nullable=False)
    params_json: Mapped[str] = mapped_column(Text, default="{}")
    status: Mapped[str] = mapped_column(String(32), default="pending")
    output_path: Mapped[str] = mapped_column(Text, default="")
    log_path: Mapped[str] = mapped_column(Text, default="")
    error_message: Mapped[str] = mapped_column(Text, default="")
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class VariantRecord(TimestampMixin, Base):
    __tablename__ = "variant_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("analysis_tasks.id"), nullable=False)
    sample_id: Mapped[int] = mapped_column(ForeignKey("samples.id"), nullable=False)
    chrom: Mapped[str] = mapped_column(String(32), nullable=False)
    pos: Mapped[int] = mapped_column(Integer, nullable=False)
    end: Mapped[int] = mapped_column(Integer, nullable=False)
    sv_type: Mapped[str] = mapped_column(String(32), nullable=False)
    sv_len: Mapped[int] = mapped_column(Integer, nullable=False)
    gt: Mapped[str] = mapped_column(String(16), default="./.")
    support_reads: Mapped[int] = mapped_column(Integer, default=0)


class CohortDataset(TimestampMixin, Base):
    __tablename__ = "cohort_datasets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dataset_name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    source_path: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    import_status: Mapped[str] = mapped_column(String(32), default="pending")


class CohortImportJob(TimestampMixin, Base):
    __tablename__ = "cohort_import_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("cohort_datasets.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    log_path: Mapped[str] = mapped_column(Text, default="")
    error_message: Mapped[str] = mapped_column(Text, default="")


class CohortVariantSummary(TimestampMixin, Base):
    __tablename__ = "cohort_variant_summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("cohort_datasets.id"), nullable=False)
    variant_key: Mapped[str] = mapped_column(String(255), nullable=False)
    chrom: Mapped[str] = mapped_column(String(32), nullable=False)
    pos: Mapped[int] = mapped_column(Integer, nullable=False)
    end: Mapped[int] = mapped_column(Integer, nullable=False)
    sv_type: Mapped[str] = mapped_column(String(32), nullable=False)
    sample_count: Mapped[int] = mapped_column(Integer, default=0)
    frequency: Mapped[float] = mapped_column(Float, default=0.0)
    sample_list: Mapped[str] = mapped_column(Text, default="")
    gene_name: Mapped[str] = mapped_column(String(128), default="")
