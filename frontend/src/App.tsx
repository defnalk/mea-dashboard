import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import RunsListPage from "./pages/RunsListPage";
import AlarmHistoryPage from "./pages/AlarmHistoryPage";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

const AnalysisPage = lazy(() => import("./pages/AnalysisPage"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="runs" element={<RunsListPage />} />
        <Route path="alarms" element={<AlarmHistoryPage />} />
        <Route
          path="analysis"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AnalysisPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
