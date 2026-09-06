import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import RootLayout from "./pages/RootLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AddReviewPage from "./pages/AddReviewPage";
import AdminProfessorFormPage from "./pages/AdminProfessorFormPage";
import AdminFlaggedReviewsPage from "./pages/AdminFlaggedReviewsPage";
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
        children: [
          { path: "student/dashboard", element: <StudentDashboardPage /> },
          { path: "student/profile", element: <StudentProfilePage /> },
          { path: "student/reviews/new", element: <AddReviewPage /> },
        ],
      },

      // Admin
      {
        element: <RequireAuth allowedRoles={["admin"]} />,
        children: [
          { path: "admin/dashboard", element: <AdminDashboardPage /> },
          { path: "admin/professors/new", element: <AdminProfessorFormPage /> },
          { path: "admin/professors/:id/edit", element: <AdminProfessorFormPage /> },
          { path: "admin/flagged-reviews", element: <AdminFlaggedReviewsPage /> },
        ],
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