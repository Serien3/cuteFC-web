import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.db import ensure_runtime_schema, ensure_tables
from app.services import cohort_service, result_service
from app.services.project_service import get_file_store

DEMO_PROJECT_NAME = "Competition Demo Cohort"
DEMO_SAMPLE_NAME = "HG002-ONT"
DEMO_TASK_NAME = "HG002 cuteFC demo run"
DEMO_DATASET_NAME = "Competition Demo Atlas"
DEMO_COHORT_FILENAME = "1000g-sv-atlas-demo.vcf"
REPO_ROOT = Path(__file__).resolve().parents[3]


def _get_demo_root() -> Path:
    return REPO_ROOT / "data" / "demo"


def _require_demo_file(path: Path) -> Path:
    if not path.exists():
        raise FileNotFoundError(f"Demo asset is missing: {path}")
    return path


def _get_or_create_project(session: Session) -> models.Project:
    project = session.scalar(
        select(models.Project).where(models.Project.name == DEMO_PROJECT_NAME)
    )
    if project is not None:
        return project

    project = models.Project(
        name=DEMO_PROJECT_NAME,
        description="Preloaded phase-one demo project for competition walkthroughs.",
    )
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


def _get_or_create_sample(session: Session, project_id: int) -> models.Sample:
    sample = session.scalar(
        select(models.Sample).where(
            models.Sample.project_id == project_id,
            models.Sample.sample_name == DEMO_SAMPLE_NAME,
        )
    )
    if sample is not None:
        return sample

    sample = models.Sample(
        project_id=project_id,
        sample_name=DEMO_SAMPLE_NAME,
        platform_type="ONT",
        remark="Demo sample aligned with the bundled result VCF.",
    )
    session.add(sample)
    session.commit()
    session.refresh(sample)
    return sample


def _ensure_input_file(
    session: Session,
    *,
    project_id: int,
    sample_id: int,
    file_type: str,
    file_path: Path,
) -> models.InputFile:
    record = session.scalar(
        select(models.InputFile).where(
            models.InputFile.project_id == project_id,
            models.InputFile.sample_id == sample_id,
            models.InputFile.file_type == file_type,
            models.InputFile.file_path == str(file_path),
        )
    )
    if record is not None:
        return record

    record = models.InputFile(
        project_id=project_id,
        sample_id=sample_id,
        file_type=file_type,
        file_path=str(file_path),
        status="registered",
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def _get_or_create_task(
    session: Session,
    *,
    project_id: int,
    sample_id: int,
    input_bam: Path,
    reference_fasta: Path,
    target_vcf: Path,
    result_vcf: Path,
) -> models.AnalysisTask:
    task = session.scalar(
        select(models.AnalysisTask).where(
            models.AnalysisTask.project_id == project_id,
            models.AnalysisTask.sample_id == sample_id,
            models.AnalysisTask.task_name == DEMO_TASK_NAME,
        )
    )
    if task is None:
        task = models.AnalysisTask(
            project_id=project_id,
            sample_id=sample_id,
            tool_name="cuteFC",
            task_name=DEMO_TASK_NAME,
            params_json=json.dumps(
                {
                    "platform_type": "ONT",
                    "threads": 8,
                    "input_bam": str(input_bam),
                    "reference_fasta": str(reference_fasta),
                    "target_vcf": str(target_vcf),
                    "output_vcf": str(result_vcf),
                    "work_dir": str(_get_demo_root() / "workdir"),
                    "command": [
                        "python",
                        "-m",
                        "cuteFC.cuteFC",
                        str(input_bam),
                        str(reference_fasta),
                        str(target_vcf),
                    ],
                    "effective_params": {"min_support": 3, "min_size": 50},
                }
            ),
            status="succeeded",
        )
        session.add(task)
        session.commit()
        session.refresh(task)

    store = get_file_store()
    log_dir = store.task_logs_dir(task.id)
    output_dir = store.task_outputs_dir(task.id)
    log_path = log_dir / "task.log"
    log_text = (
        "Demo task record prepared from bundled example assets.\n"
        f"Input BAM: {input_bam}\n"
        f"Target VCF: {target_vcf}\n"
        f"Output VCF: {result_vcf}\n"
    )
    log_path.write_text(log_text, encoding="utf-8")

    task.log_path = str(log_path)
    task.output_path = str(output_dir)
    task.status = "succeeded"
    task.error_message = ""
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def _get_or_create_dataset(session: Session, cohort_vcf: Path) -> models.CohortDataset:
    dataset = session.scalar(
        select(models.CohortDataset).where(
            models.CohortDataset.dataset_name == DEMO_DATASET_NAME
        )
    )
    if dataset is None:
        dataset = models.CohortDataset(
            dataset_name=DEMO_DATASET_NAME,
            source_path=str(cohort_vcf),
            description="Bundled multi-sample cohort VCF for local platform demos.",
            import_status="pending",
        )
        session.add(dataset)
        session.commit()
        session.refresh(dataset)
    else:
        dataset.source_path = str(cohort_vcf)
        session.add(dataset)
        session.commit()
        session.refresh(dataset)
    return dataset


def bootstrap_demo_data(session: Session) -> schemas.DemoBootstrapRead:
    bind = session.get_bind()
    ensure_tables(bind)
    ensure_runtime_schema(bind)
    demo_root = _get_demo_root()
    inputs_dir = demo_root / "inputs"
    cohort_vcf = _require_demo_file(demo_root / "cohort" / DEMO_COHORT_FILENAME)
    result_vcf = _require_demo_file(demo_root / "results" / "hg002-demo-result.vcf")
    input_bam = _require_demo_file(inputs_dir / "HG002.subset.bam")
    reference_fasta = _require_demo_file(inputs_dir / "reference.fa")
    target_vcf = _require_demo_file(inputs_dir / "targets.vcf")

    project = _get_or_create_project(session)
    sample = _get_or_create_sample(session, project.id)

    _ensure_input_file(
        session,
        project_id=project.id,
        sample_id=sample.id,
        file_type="bam",
        file_path=input_bam,
    )
    _ensure_input_file(
        session,
        project_id=project.id,
        sample_id=sample.id,
        file_type="reference_fasta",
        file_path=reference_fasta,
    )
    _ensure_input_file(
        session,
        project_id=project.id,
        sample_id=sample.id,
        file_type="target_vcf",
        file_path=target_vcf,
    )

    task = _get_or_create_task(
        session,
        project_id=project.id,
        sample_id=sample.id,
        input_bam=input_bam,
        reference_fasta=reference_fasta,
        target_vcf=target_vcf,
        result_vcf=result_vcf,
    )
    result_records = result_service.ingest_task_vcf(session, task.id)

    dataset = _get_or_create_dataset(session, cohort_vcf)
    cohort_service.import_dataset(session, dataset.id)

    return schemas.DemoBootstrapRead(
        project_id=project.id,
        sample_id=sample.id,
        task_id=task.id,
        dataset_id=dataset.id,
        cohort_source_path=str(cohort_vcf),
        result_vcf_path=str(result_vcf),
        variant_count=len(result_records),
    )
