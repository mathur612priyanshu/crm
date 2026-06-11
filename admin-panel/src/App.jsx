import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Home from "./screens/Home";
import Sidebar from "./components/sidebar";
import UserList from "./screens/users/Screens/userlist";
import LeadsList from "./screens/leads/Screens/leadslist";
import LeadDetailScreen from "./screens/leads/Screens/leadsdetailsscreen";
import LeadEditScreen from "./screens/leads/Screens/leadEdit";
import AttendanceScreen from "./screens/attendance/attendance_screen";
import UserDetailScreen from "./screens/users/Screens/userdetailsscreen";
import TaskScreen from "./screens/tasks/Screens/taskScreen";
import TemplateScreen from "./screens/template/templateScreen";
import Login from "./screens/login/login";
import ProtectedRoute from "./protectedRoute";
import PerformanceScreen from "./screens/performance/performanceScreen";
import LeadsReport from "./screens/leadReport/leadReportScreen";
import LeadStatusesScreen from "./screens/leadStatuses/leadStatusesScreen";
import OperationsScreen from "./screens/operations/operationsScreen";
import SettingsScreen from "./screens/settings/settings";

const Layout = () => {
  const location = useLocation();
  const noSidebarRoutes = ["/login", "/signup"];

  return (
    <div className="flex">
      {!noSidebarRoutes.includes(location.pathname) && <Sidebar />}
      <div
        className={`flex-1 p-6 ${
          !noSidebarRoutes.includes(location.pathname) ? "ml-64" : ""
        }`}
      >
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <LeadsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-users"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lead-details/:id"
            element={
              <ProtectedRoute allowedRoles={["manager", "operations"]}>
                <LeadDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lead-edit/:id"
            element={
              <ProtectedRoute allowedRoles={["manager", "operations"]}>
                <LeadEditScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <AttendanceScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userdetail/:emp_id"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <UserDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <TaskScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/template"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <TemplateScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lead-statuses"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <LeadStatusesScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations"
            element={
              <ProtectedRoute allowedRoles={["manager", "operations"]}>
                <OperationsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <PerformanceScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lead_report"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <LeadsReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <SettingsScreen />
              </ProtectedRoute>
            }
          />

          {/* Redirect any unknown path to /login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
