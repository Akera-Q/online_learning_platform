import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "../components/Auth/ProtectedRoute"

// Import pages
const LandingPage = React.lazy(() => import("../pages/LandingPage"))
const LoginPage = React.lazy(() => import("../pages/LoginPage"))
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"))
const DashboardPage = React.lazy(() => import("../pages/DashboardPage"))
const CoursesPage = React.lazy(() => import("../pages/CoursesPage"))
const CourseDetailPage = React.lazy(() => import("../pages/CourseDetailPage"))
const BookmarksPage = React.lazy(() => import("../pages/BookmarksPage"))
const UncompletedCoursesPage = React.lazy(() => import("../pages/UncompletedCoursesPage"))
const AdminDashboard = React.lazy(() => import("../pages/AdminDashboard"))
const InstructorPage = React.lazy(() => import("../pages/InstructorPage"))
const ProfilePage = React.lazy(() => import("../pages/ProfilePage"))
const QuizPage = React.lazy(() => import("../pages/QuizPage"))



const AppRoutes = () => {
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        
        <Route path="/bookmarks" element={
          <ProtectedRoute>
            <BookmarksPage />
          </ProtectedRoute>
        } />
        
        <Route path="/uncompleted" element={
          <ProtectedRoute roles={["student"]}>
            <UncompletedCoursesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/instructor" element={
          <ProtectedRoute roles={["instructor"]}>
            <InstructorPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/quiz/:id" element={
          <ProtectedRoute roles={["student"]}>
            <QuizPage />
          </ProtectedRoute>
        } />
      </Routes>
    </React.Suspense>
  )
}

export default AppRoutes