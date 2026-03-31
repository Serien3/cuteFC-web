from dataclasses import dataclass
from pathlib import Path
import sys

from app.schemas import TaskCreate

REPO_ROOT = Path(__file__).resolve().parents[3]
ENTRYPOINT = REPO_ROOT / "cuteFC" / "src" / "cuteFC" / "cuteFC"


PRESETS = {
    "ONT": {"min_support": 3, "min_mapq": 20},
    "HiFi": {"min_support": 2, "min_mapq": 20},
    "CLR": {"min_support": 4, "min_mapq": 10},
}


@dataclass(slots=True)
class CommandPlan:
    command: list[str]
    effective_params: dict[str, int | float | str]
    cwd: str
    env_overrides: dict[str, str]


def resolve_preset(platform_type: str) -> dict[str, int | float | str]:
    return PRESETS.get(platform_type, PRESETS["ONT"]).copy()


def build_command(payload: TaskCreate) -> CommandPlan:
    effective_params = resolve_preset(payload.platform_type)
    effective_params.update(payload.params_json)
    python_path_entries = [
        str(REPO_ROOT / "cuteFC" / "src"),
        str(REPO_ROOT / "local_vendor"),
    ]

    command = [
        sys.executable,
        str(ENTRYPOINT),
        payload.input_bam,
        payload.reference_fasta,
        payload.output_vcf,
        payload.work_dir,
        "-Ivcf",
        payload.target_vcf,
        "--threads",
        str(payload.threads),
    ]

    for key, value in effective_params.items():
        command.extend([f"--{key}", str(value)])

    return CommandPlan(
        command=command,
        effective_params=effective_params,
        cwd=str(REPO_ROOT),
        env_overrides={"PYTHONPATH": ":".join(python_path_entries)},
    )
