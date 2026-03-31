import { createBrowserRouter } from "react-router-dom";

import { LandingPage } from "./pages/landing-page";
import { AppShell } from "./components/app-shell";
import { GeneticMapPage } from "./pages/genetic-map-page";
import { CohortSearchPage } from "./pages/cohort-search-page";
import { DashboardPage } from "./pages/dashboard-page";
import { NotFoundPage } from "./pages/not-found-page";
import { ProjectDetailPage } from "./pages/project-detail-page";
import { PlatformPage } from "./pages/platform-page";
import { ResultPage } from "./pages/result-page";
import { ShowcasePage } from "./pages/showcase-page";
import { TaskCreatePage } from "./pages/task-create-page";
import { TaskDetailPage } from "./pages/task-detail-page";
import { PipelinePage } from "./pages/pipeline-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />
  },
  {
    path: "/app",
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "platform", element: <PlatformPage /> },
      { path: "platform/:projectId", element: <ProjectDetailPage /> },
      { path: "pipeline", element: <PipelinePage /> },
      { path: "pipeline/new", element: <TaskCreatePage /> },
      { path: "pipeline/:taskId", element: <TaskDetailPage /> },
      { path: "results/:taskId", element: <ResultPage /> },
      { path: "genetic-map", element: <GeneticMapPage /> },
      { path: "genetic-map/search", element: <CohortSearchPage /> },
      { path: "showcase", element: <ShowcasePage /> }
    ]
  }
]);

