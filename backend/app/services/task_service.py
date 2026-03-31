import json
import os
import subprocess
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models, schemas
from app.repositories import task_repo
from app.services.cutefc_adapter import build_command
from app.services.project_service import get_file_store
from app.services import result_service
from app.utils.time import utc_now


def create_task(session: Session, payload: schemas.TaskCreate) -> models.AnalysisTask:
    project = session.get(models.Project, payload.project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    sample = session.get(models.Sample, payload.sample_id)
    if sample is None:
        raise HTTPException(status_code=404, detail="Sample not found")
    if sample.project_id != project.id:
        raise HTTPException(status_code=400, detail="Sample does not belong to project")

    command_plan = build_command(payload)
    task = models.AnalysisTask(
        project_id=payload.project_id,
        sample_id=payload.sample_id,
        tool_name=payload.tool_name,
        task_name=payload.task_name,
        params_json=json.dumps(
            {
                "platform_type": payload.platform_type,
                "threads": payload.threads,
                "input_bam": payload.input_bam,
                "reference_fasta": payload.reference_fasta,
                "target_vcf": payload.target_vcf,
                "output_vcf": payload.output_vcf,
                "work_dir": payload.work_dir,
                "sample_name": sample.sample_name,
                "command": command_plan.command,
                "command_cwd": command_plan.cwd,
                "command_env": command_plan.env_overrides,
                "effective_params": command_plan.effective_params,
            }
        ),
        status="pending",
    )
    return task_repo.create_task(session, task)


def create_task_detail(session: Session, payload: schemas.TaskCreate) -> schemas.TaskRead:
    task = create_task(session, payload)
    return get_task_detail(session, task.id)


def _load_task_context(
    session: Session, project_ids: set[int], sample_ids: set[int], task_ids: set[int]
) -> tuple[dict[int, str], dict[int, str], set[int]]:
    project_rows = session.execute(
        select(models.Project.id, models.Project.name).where(models.Project.id.in_(project_ids))
    )
    sample_rows = session.execute(
        select(models.Sample.id, models.Sample.sample_name).where(models.Sample.id.in_(sample_ids))
    )
    result_rows = session.execute(
        select(models.VariantRecord.task_id, func.count(models.VariantRecord.id))
        .where(models.VariantRecord.task_id.in_(task_ids))
        .group_by(models.VariantRecord.task_id)
    )
    project_names = {project_id: project_name for project_id, project_name in project_rows}
    sample_names = {sample_id: sample_name for sample_id, sample_name in sample_rows}
    tasks_with_results = {task_id for task_id, count in result_rows if count > 0}
    return project_names, sample_names, tasks_with_results


def serialize_task(task: models.AnalysisTask) -> schemas.TaskRead:
    return serialize_task_with_context(
        task,
        project_name="",
        sample_name="",
        has_results=False,
    )


def serialize_task_with_context(
    task: models.AnalysisTask,
    *,
    project_name: str,
    sample_name: str,
    has_results: bool,
) -> schemas.TaskRead:
    payload = json.loads(task.params_json)
    return schemas.TaskRead.model_validate(
        {
            "id": task.id,
            "project_id": task.project_id,
            "sample_id": task.sample_id,
            "project_name": project_name,
            "sample_name": sample_name,
            "tool_name": task.tool_name,
            "task_name": task.task_name,
            "params_json": task.params_json,
            "status": task.status,
            "output_path": task.output_path,
            "log_path": task.log_path,
            "error_message": task.error_message,
            "has_results": has_results,
            "started_at": task.started_at,
            "finished_at": task.finished_at,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "params": payload,
        }
    )


def list_tasks(session: Session):
    tasks = task_repo.list_tasks(session)
    if not tasks:
        return []

    project_names, sample_names, tasks_with_results = _load_task_context(
        session,
        {task.project_id for task in tasks},
        {task.sample_id for task in tasks},
        {task.id for task in tasks},
    )
    return [
        serialize_task_with_context(
            task,
            project_name=project_names.get(task.project_id, ""),
            sample_name=sample_names.get(task.sample_id, ""),
            has_results=task.id in tasks_with_results,
        )
        for task in tasks
    ]


def get_task(session: Session, task_id: int) -> models.AnalysisTask:
    task = task_repo.get_task(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


def get_task_detail(session: Session, task_id: int) -> schemas.TaskRead:
    task = get_task(session, task_id)
    project_names, sample_names, tasks_with_results = _load_task_context(
        session, {task.project_id}, {task.sample_id}, {task.id}
    )
    return serialize_task_with_context(
        task,
        project_name=project_names.get(task.project_id, ""),
        sample_name=sample_names.get(task.sample_id, ""),
        has_results=task.id in tasks_with_results,
    )


def get_task_log(session: Session, task_id: int) -> schemas.TaskLogRead:
    task = get_task(session, task_id)
    excerpt = ""
    if task.log_path:
        log_path = Path(task.log_path)
        if log_path.exists():
            excerpt = log_path.read_text(encoding="utf-8")[-4000:]
    return schemas.TaskLogRead(task_id=task.id, log_path=task.log_path, log_excerpt=excerpt)


def run_task(session: Session, task_id: int) -> models.AnalysisTask:
    task = get_task(session, task_id)
    payload = json.loads(task.params_json)
    store = get_file_store()
    logs_dir = store.task_logs_dir(task.id)
    outputs_dir = store.task_outputs_dir(task.id)
    log_path = logs_dir / "task.log"

    task.status = "running"
    task.log_path = str(log_path)
    task.output_path = str(outputs_dir)
    task.started_at = utc_now()
    task.finished_at = None
    task_repo.save(session, task)

    try:
        _prepare_task_runtime(payload)
        env = _build_task_env(payload)
        result = subprocess.run(
            payload["command"],
            capture_output=True,
            text=True,
            cwd=payload.get("command_cwd"),
            env=env,
        )
        log_text = result.stdout + result.stderr
    except Exception as exc:
        result = None
        log_text = f"Task preparation failed.\n{exc}\n"

    log_path.write_text(log_text, encoding="utf-8")

    succeeded = bool(result is not None and result.returncode == 0)
    task.status = "succeeded" if succeeded else "failed"
    task.error_message = "" if succeeded else (
        result.stderr.strip()
        if result is not None and result.stderr
        else log_text.strip().splitlines()[-1]
        if log_text.strip()
        else "Task failed"
    )
    task.finished_at = utc_now()
    saved_task = task_repo.save(session, task)
    if saved_task.status == "succeeded":
        result_service.ingest_task_vcf(session, saved_task.id)
    return get_task_detail(session, saved_task.id)


def _prepare_task_runtime(payload: dict[str, object]) -> None:
    required_paths = {
        "input_bam": payload.get("input_bam"),
        "reference_fasta": payload.get("reference_fasta"),
        "target_vcf": payload.get("target_vcf"),
    }
    missing = [
        f"{name}={path}"
        for name, path in required_paths.items()
        if not path or not Path(str(path)).exists()
    ]
    if missing:
        raise FileNotFoundError("Missing required task inputs: " + ", ".join(missing))

    work_dir = payload.get("work_dir")
    if work_dir:
        Path(str(work_dir)).mkdir(parents=True, exist_ok=True)

    output_vcf = payload.get("output_vcf")
    if output_vcf:
        Path(str(output_vcf)).parent.mkdir(parents=True, exist_ok=True)


def _build_task_env(payload: dict[str, object]) -> dict[str, str]:
    env = os.environ.copy()
    command_env = payload.get("command_env")
    if isinstance(command_env, dict):
        for key, value in command_env.items():
            rendered = str(value)
            if key == "PYTHONPATH" and env.get("PYTHONPATH"):
                rendered = f"{rendered}:{env['PYTHONPATH']}"
            env[key] = rendered
    return env
