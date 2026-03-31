from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class RegisteredPath:
    file_type: str
    file_path: str


class FileStore:
    def __init__(self, data_root: Path) -> None:
        self.data_root = data_root
        self.tasks_root = data_root / "tasks"
        self.cohort_root = data_root / "cohort"
        self.uploads_root = data_root / "uploads"

    def ensure_base_dirs(self) -> None:
        self.uploads_root.mkdir(parents=True, exist_ok=True)
        self.tasks_root.mkdir(parents=True, exist_ok=True)
        self.cohort_root.mkdir(parents=True, exist_ok=True)
        (self.cohort_root / "datasets").mkdir(parents=True, exist_ok=True)
        (self.cohort_root / "imports").mkdir(parents=True, exist_ok=True)
        (self.cohort_root / "cache").mkdir(parents=True, exist_ok=True)

    def task_dir(self, task_id: int) -> Path:
        task_dir = self.tasks_root / str(task_id)
        task_dir.mkdir(parents=True, exist_ok=True)
        return task_dir

    def task_logs_dir(self, task_id: int) -> Path:
        path = self.task_dir(task_id) / "logs"
        path.mkdir(parents=True, exist_ok=True)
        return path

    def task_outputs_dir(self, task_id: int) -> Path:
        path = self.task_dir(task_id) / "outputs"
        path.mkdir(parents=True, exist_ok=True)
        return path

    def cohort_cache_dir(self, dataset_id: int) -> Path:
        path = self.cohort_root / "cache" / str(dataset_id)
        path.mkdir(parents=True, exist_ok=True)
        return path

    def register_external_path(self, file_type: str, file_path: str) -> RegisteredPath:
        return RegisteredPath(file_type=file_type, file_path=file_path)

