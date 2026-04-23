import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import RootLayout from "./pages/RootLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfessorDetailPage from "./pages/ProfessorDetailPage";

import { RequireAuth } from "./components/RequireAuth";


const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },

      // Protected (any role)
      {
        element: <RequireAuth />,
        children: [
          { path: "professor/:id", element: <ProfessorDetailPage /> },
        ],
      },

      // Student
      {
        element: <RequireAuth allowedRoles={["student"]} />,
        children: [{ path: "student/dashboard", element: <StudentDashboardPage /> }],
      },

      // Admin
      {
        element: <RequireAuth allowedRoles={["admin"]} />,
        children: [{ path: "admin/dashboard", element: <AdminDashboardPage /> }],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);