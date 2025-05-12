
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Index";
import Schools from "./pages/Schools";
import RegisterSchool from "./pages/RegisterSchool";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Parents from "./pages/Parents";
import Exams from "./pages/Exams";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Users from "./pages/Users";

// Create placeholder components for other routes
const Classes = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Classes Management</h1><p>This feature is coming soon.</p></div>;
const Subjects = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Subjects Management</h1><p>This feature is coming soon.</p></div>;
const Calendar = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">School Calendar</h1><p>This feature is coming soon.</p></div>;
const Announcements = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Announcements</h1><p>This feature is coming soon.</p></div>;
const Messages = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Messaging</h1><p>This feature is coming soon.</p></div>;
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Settings</h1><p>This feature is coming soon.</p></div>;
const Profile = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">User Profile</h1><p>This feature is coming soon.</p></div>;
const SchoolDetails = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">School Details</h1><p>This feature is coming soon.</p></div>;
const EditSchool = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Edit School</h1><p>This feature is coming soon.</p></div>;

const queryClient = new QueryClient();

const AppWithProviders = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Redirect from root to dashboard when authenticated */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* School Management Routes */}
        <Route path="/schools" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Schools />
          </ProtectedRoute>
        } />
        <Route path="/register-school" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <RegisterSchool />
          </ProtectedRoute>
        } />
        <Route path="/schools/:id" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster']}>
            <SchoolDetails />
          </ProtectedRoute>
        } />
        <Route path="/schools/:id/edit" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <EditSchool />
          </ProtectedRoute>
        } />
        
        {/* User Management Routes */}
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster']}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Students />
          </ProtectedRoute>
        } />
        <Route path="/teachers" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster']}>
            <Teachers />
          </ProtectedRoute>
        } />
        <Route path="/parents" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster']}>
            <Parents />
          </ProtectedRoute>
        } />
        
        {/* Academic Management Routes */}
        <Route path="/classes" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Classes />
          </ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Subjects />
          </ProtectedRoute>
        } />
        <Route path="/exams" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Exams />
          </ProtectedRoute>
        } />
        
        {/* School Operations Routes */}
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } />
        <Route path="/announcements" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Announcements />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        
        {/* User Account Routes */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Redirect root to dashboard if authenticated */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="elimu-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppWithProviders />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
