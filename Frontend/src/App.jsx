import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import EditTask from "./pages/EditTask";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import AppLayout from "./components/layout/AppLayout";

const App = () => {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =====================================================
          PROTECTED ROUTES
      ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* =================================================
              TASKS
          ================================================= */}

          <Route
            path="/tasks"
            element={<Tasks />}
          />

          <Route
            path="/tasks/:id"
            element={<TaskDetails />}
          />

          <Route
            path="/tasks/:id/edit"
            element={<EditTask />}
          />

          {/* =================================================
              TEAMS
          ================================================= */}

          <Route
            path="/teams"
            element={<Teams />}
          />

          <Route
            path="/teams/:id"
            element={<TeamDetails />}
          />

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* =================================================
              USERS
              ADMIN ONLY
          ================================================= */}

          <Route
            element={
              <RoleRoute
                allowedRoles={["Admin"]}
              />
            }
          >
            <Route
              path="/users"
              element={<Users />}
            />
          </Route>

          {/* =================================================
              SETTINGS
          ================================================= */}

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>
      </Route>

      {/* =====================================================
          DEFAULT ROUTE
      ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* =====================================================
          UNKNOWN ROUTES
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;