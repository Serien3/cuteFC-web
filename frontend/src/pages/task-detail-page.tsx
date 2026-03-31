import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { TaskDetailHeader } from "../features/tasks/task-detail-header";
import { TaskLogPanel } from "../features/tasks/task-log-panel";
import { TaskOverviewCards } from "../features/tasks/task-overview-cards";
import { TaskParameterSummary } from "../features/tasks/task-parameter-summary";
import { getTask, getTaskLog, runTask } from "../lib/api";
import type { Task, TaskLog } from "../lib/types";

export function TaskDetailPage() {
  const { taskId } = useParams();
  const resolvedTaskId = Number(taskId);
  const invalidTaskId = !taskId || Number.isNaN(resolvedTaskId);
  const [task, setTask] = useState<Task | null>(null);
  const [log, setLog] = useState<TaskLog | null>(null);
  const [loading, setLoading] = useState(!invalidTaskId);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (invalidTaskId) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    void Promise.all([getTask(resolvedTaskId), getTaskLog(resolvedTaskId)])
      .then(([taskDetail, taskLog]) => {
        if (cancelled) {
          return;
        }

        setTask(taskDetail);
        setLog(taskLog);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "加载任务详情失败。");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [invalidTaskId, resolvedTaskId]);

  async function handleRunTask() {
    if (!task) {
      return;
    }

    setRunning(true);
    try {
      const updated = await runTask(task.id);
      const updatedLog = await getTaskLog(task.id);
      setTask(updated);
      setLog(updatedLog);
      setError(null);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "运行任务失败。");
    } finally {
      setRunning(false);
    }
  }

  if (invalidTaskId) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>任务详情</h1>
          <p>路由中的任务 ID 无效。</p>
        </div>
      </div>
    );
  }

  if (loading || !task) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>任务详情</h1>
          <p>正在加载执行时间线、命令摘要与日志内容。</p>
        </div>
      </div>
    );
  }

  const params = task.params as {
    command?: string[];
    platform_type?: string;
    input_bam?: string;
    reference_fasta?: string;
    target_vcf?: string;
    output_vcf?: string;
    work_dir?: string;
  };
  return (
    <div className="page">
      <TaskDetailHeader running={running} task={task} onRunTask={handleRunTask} />
      {error ? <p>{error}</p> : null}
      <TaskOverviewCards task={task} />
      <TaskParameterSummary params={params} />
      <section className="panel">
        <h3>下一步</h3>
        <p>
          {task.has_results
            ? "结果已就绪，可以直接进入结果页查看统计和变异明细。"
            : task.status === "failed"
              ? "任务失败，请先检查错误与日志，再重新运行。"
              : task.status === "running"
                ? "任务正在执行，可持续查看日志与输出路径。"
                : "任务尚未执行，确认参数后可以立即开始运行。"}
        </p>
        {task.error_message ? <p>错误：{task.error_message}</p> : null}
      </section>
      <TaskLogPanel path={log?.log_path} content={log?.log_excerpt} />
    </div>
  );
}
