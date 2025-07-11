
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
import SchoolDetails from "./pages/SchoolDetails";
import RegisterSchool from "./pages/RegisterSchool";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent"; 
import StudentAttendance from "./pages/StudentAttendance";
import Teachers from "./pages/Teachers";
import AddTeacher from "./pages/AddTeacher";
import Parents from "./pages/Parents";
import AddParent from "./pages/AddParent";
import LinkParents from "./pages/LinkParents";
import Exams from "./pages/Exams";
import CreateExam from "./pages/CreateExam";
import ExamResults from "./pages/ExamResults";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import Classes from "./pages/Classes";
import CreateClass from "./pages/CreateClass";
import Subjects from "./pages/Subjects";
import AddSubject from "./pages/AddSubject";
import AssignTeachers from "./pages/AssignTeachers";
import Announcements from "./pages/Announcements";
import CreateAnnouncement from "./pages/CreateAnnouncement";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Calendar from "./pages/Calendar";
import AddEvent from "./pages/AddEvent";
import RealTimeChat from "./pages/RealTimeChat";
import Profile from "./pages/Profile";
import MyChildren from "./pages/MyChildren";
import AcademicProgress from "./pages/AcademicProgress";
import MyClasses from "./pages/MyClasses";

const queryClient = new QueryClient();

const AppWithProviders = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
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
            <div className="p-6"><h1 className="text-2xl font-bold mb-4">Edit School</h1><p>This feature is coming soon.</p></div>
          </ProtectedRoute>
        } />
        
        {/* User Management Routes */}
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster']}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/users/add" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster']}>
            <AddUser />
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Students />
          </ProtectedRoute>
        } />
        <Route path="/students/add" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster']}>
            <AddStudent />
          </ProtectedRoute>
        } />
        <Route path="/students/attendance" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster']}>
            <StudentAttendance />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'parent']}>
            <StudentAttendance />
          </ProtectedRoute>
        } />
        <Route path="/teachers" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster']}>
            <Teachers />
          </ProtectedRoute>
        } />
        <Route path="/teachers/add" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster']}>
            <AddTeacher />
          </ProtectedRoute>
        } />
        <Route path="/teachers/:id" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster']}>
            <div className="p-6"><h1 className="text-2xl font-bold mb-4">Teacher Profile</h1><p>This feature is coming soon.</p></div>
          </ProtectedRoute>
        } />
        <Route path="/teachers/:id/edit" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster']}>
            <div className="p-6"><h1 className="text-2xl font-bold mb-4">Edit Teacher</h1><p>This feature is coming soon.</p></div>
          </ProtectedRoute>
        } />
        <Route path="/teachers/assign" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster']}>
            <AssignTeachers />
          </ProtectedRoute>
        } />
        <Route path="/my-classes" element={
          <ProtectedRoute allowedRoles={['teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <MyClasses />
          </ProtectedRoute>
        } />
        <Route path="/assignments" element={
          <ProtectedRoute allowedRoles={['teacher', 'student', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <div className="p-6"><h1 className="text-2xl font-bold mb-4">Assignments</h1><p>This feature is coming soon.</p></div>
          </ProtectedRoute>
        } />
        <Route path="/parents" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster']}>
            <Parents />
          </ProtectedRoute>
        } />
        <Route path="/parents/add" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster']}>
            <AddParent />
          </ProtectedRoute>
        } />
        <Route path="/parents/link" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster']}>
            <LinkParents />
          </ProtectedRoute>
        } />
        
        {/* Parent and Student specific routes */}
        <Route path="/my-children" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <MyChildren />
          </ProtectedRoute>
        } />
        <Route path="/academic-progress" element={
          <ProtectedRoute allowedRoles={['parent', 'student']}>
            <AcademicProgress />
          </ProtectedRoute>
        } />
        
        {/* Academic Management Routes */}
        <Route path="/classes" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Classes />
          </ProtectedRoute>
        } />
        <Route path="/classes/create" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster']}>
            <CreateClass />
          </ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Subjects />
          </ProtectedRoute>
        } />
        <Route path="/subjects/add" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster', 'vice_headmaster']}>
            <AddSubject />
          </ProtectedRoute>
        } />
        <Route path="/exams" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Exams />
          </ProtectedRoute>
        } />
        <Route path="/exams/create" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <CreateExam />
          </ProtectedRoute>
        } />
        <Route path="/exams/results" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <ExamResults />
          </ProtectedRoute>
        } />
        
        {/* School Operations Routes */}
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } />
        <Route path="/calendar/add" element={
          <ProtectedRoute>
            <AddEvent />
          </ProtectedRoute>
        } />
        <Route path="/announcements" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <Announcements />
          </ProtectedRoute>
        } />
        <Route path="/announcements/create" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'headmaster', 'vice_headmaster', 'academic_teacher']}>
            <CreateAnnouncement />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <RealTimeChat />
          </ProtectedRoute>
        } />
        
        {/* User Account Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'headmaster']}>
            <Settings />
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
