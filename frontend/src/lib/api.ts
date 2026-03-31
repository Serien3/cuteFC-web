import type {
  CohortDataset,
  CohortOverview,
  CohortSearchQuery,
  CohortVariant,
  DashboardPayload,
  FileCreate,
  InputFile,
  Project,
  ProjectCreate,
  ProjectDetail,
  ResultSummary,
  ResultVariantDetail,
  ResultVariantQuery,
  ResultVariant,
  Sample,
  SampleCreate,
  ShowcasePayload,
  Task,
  TaskCreate
} from "./types";
import type { TaskLog } from "./types";

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return response.json() as Promise<T>;
}

async function requestText(path: string, init?: RequestInit): Promise<string> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return response.text();
}

export async function getProjects(): Promise<Project[]> {
  return request<Project[]>("/projects");
}

export async function createProject(payload: ProjectCreate): Promise<Project> {
  return request<Project>("/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function updateProject(projectId: number, payload: ProjectCreate): Promise<Project> {
  return request<Project>(`/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function getProject(projectId: number): Promise<ProjectDetail> {
  return request<ProjectDetail>(`/projects/${projectId}`);
}

export async function createSample(projectId: number, payload: SampleCreate): Promise<Sample> {
  return request<Sample>(`/projects/${projectId}/samples`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function createFile(payload: FileCreate): Promise<InputFile> {
  return request<InputFile>("/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function getTasks(): Promise<Task[]> {
  return request<Task[]>("/tasks");
}

export async function createTask(payload: TaskCreate): Promise<Task> {
  return request<Task>("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function getTask(taskId: number): Promise<Task> {
  return request<Task>(`/tasks/${taskId}`);
}

export async function runTask(taskId: number): Promise<Task> {
  return request<Task>(`/tasks/${taskId}/run`, { method: "POST" });
}

export async function getTaskLog(taskId: number): Promise<TaskLog> {
  return request<TaskLog>(`/tasks/${taskId}/logs`);
}

export async function getResultSummary(taskId: number): Promise<ResultSummary> {
  return request(`/results/${taskId}/summary`);
}

export async function getResultVariants(taskId: number): Promise<ResultVariant[]> {
  return request(`/results/${taskId}/variants`);
}

export async function queryResultVariants(
  taskId: number,
  query: ResultVariantQuery
): Promise<ResultVariant[]> {
  return request(`/results/${taskId}/variants/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query)
  });
}

export async function getResultVariantDetail(variantId: number): Promise<ResultVariantDetail> {
  return request(`/results/variants/${variantId}`);
}

export async function exportResultVariants(
  taskId: number,
  query: ResultVariantQuery,
  format: "csv" | "tsv" | "vcf"
): Promise<string> {
  return requestText(`/results/${taskId}/variants/export/${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query)
  });
}

export async function getDashboard(): Promise<DashboardPayload> {
  return request("/showcase/dashboard");
}

export async function getShowcasePage(): Promise<ShowcasePayload> {
  return request("/showcase/page");
}

export async function getCohortDatasets(): Promise<CohortDataset[]> {
  return request("/cohort/datasets");
}

export async function getCohortOverview(datasetId = 1): Promise<CohortOverview> {
  return request(`/cohort/datasets/${datasetId}/overview`);
}

export async function getCohortHotspots(datasetId = 1): Promise<CohortVariant[]> {
  return request(`/cohort/datasets/${datasetId}/hotspots`);
}

export async function getCohortRare(datasetId = 1): Promise<CohortVariant[]> {
  return request(`/cohort/datasets/${datasetId}/rare`);
}

export async function searchCohort(
  query: CohortSearchQuery,
  datasetId = 1
): Promise<CohortVariant[]> {
  return request(`/cohort/datasets/${datasetId}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query)
  });
}
