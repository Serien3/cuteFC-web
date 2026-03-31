from collections import Counter

from sqlalchemy.orm import Session

from app import models
from app.services import task_service


def _build_task_summary(tasks: list[dict]) -> dict[str, int]:
    pending = sum(task["status"] == "pending" for task in tasks)
    running = sum(task["status"] == "running" for task in tasks)
    succeeded = sum(task["status"] == "succeeded" for task in tasks)
    failed = sum(task["status"] == "failed" for task in tasks)
    return {
        "total": len(tasks),
        "pending": pending,
        "running": running,
        "succeeded": succeeded,
        "failed": failed,
        "attention_count": pending + failed,
    }


def get_dashboard_payload(session: Session) -> dict:
    projects = session.query(models.Project).count()
    samples = session.query(models.Sample).count()
    tasks = session.query(models.AnalysisTask).count()
    succeeded = session.query(models.AnalysisTask).filter(models.AnalysisTask.status == "succeeded").count()
    variants = session.query(models.VariantRecord).all()
    cohort_rows = session.query(models.CohortVariantSummary).all()

    sv_counts = Counter(record.sv_type for record in variants)
    hotspots = sorted(cohort_rows, key=lambda item: (-item.frequency, item.pos))[:5]
    task_items = [task.model_dump(mode="json") for task in task_service.list_tasks(session)]
    recent_tasks = task_items[:5]
    success_rate = round((succeeded / tasks) * 100, 1) if tasks else 0.0

    return {
        "hero": {
            "title": "结构变异图谱平台",
            "subtitle": "围绕 cuteFC 构建的基因组变异分析平台",
        },
        "stats": [
            {"label": "项目数", "value": projects},
            {"label": "样本数", "value": samples},
            {"label": "任务数", "value": tasks},
            {"label": "分析成功率", "value": success_rate},
            {"label": "结果变异数", "value": len(variants)},
            {"label": "队列位点数", "value": len(cohort_rows)},
        ],
        "task_summary": _build_task_summary(task_items),
        "recent_tasks": recent_tasks,
        "sv_type_distribution": dict(sv_counts),
        "hotspots": [
            {
                "variant_key": item.variant_key,
                "chrom": item.chrom,
                "pos": item.pos,
                "frequency": item.frequency,
            }
            for item in hotspots
        ],
    }


def get_showcase_payload() -> dict:
    return {
        "hero": {
            "title": "cuteFC-SV Platform",
            "subtitle": "从命令行重分型工具到可视化队列图谱与竞赛展示系统",
        },
        "architecture": [
            "基于 React 的可视化前端，覆盖驾驶舱、分析流程、队列图谱与展示页面",
            "基于 FastAPI 的后端服务，负责项目管理、任务编排、结果解析与队列搜索",
            "使用 SQLite 与本地文件系统完成稳定的单机部署与演示",
        ],
        "workflow": [
            "创建项目并登记样本输入数据",
            "通过平台预设运行 cuteFC，并跟踪任务执行过程",
            "浏览结果统计、队列热点位点与竞赛展示页面",
        ],
        "innovation_points": [
            "将命令行结构变异工具平台化封装",
            "将队列 VCF 图谱导入与 cuteFC 运行解耦，保证演示稳定",
            "采用更贴合生信场景的数据可视化表达，而非通用后台风格",
        ],
    }
