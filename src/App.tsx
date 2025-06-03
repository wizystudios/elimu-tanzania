
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import all pages
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterSchool from "./pages/RegisterSchool";
import Schools from "./pages/Schools";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import Teachers from "./pages/Teachers";
import AddTeacher from "./pages/AddTeacher";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import Parents from "./pages/Parents";
import AddParent from "./pages/AddParent";
import LinkParents from "./pages/LinkParents";
import Subjects from "./pages/Subjects";
import AddSubject from "./pages/AddSubject";
import Classes from "./pages/Classes";
import CreateClass from "./pages/CreateClass";
import AssignTeachers from "./pages/AssignTeachers";
import Calendar from "./pages/Calendar";
import AddEvent from "./pages/AddEvent";
import Exams from "./pages/Exams";
import CreateExam from "./pages/CreateExam";
import ExamResults from "./pages/ExamResults";
import StudentAttendance from "./pages/StudentAttendance";
import Messages from "./pages/Messages";
import RealTimeChat from "./pages/RealTimeChat";
import ImprovedRealTimeChat from "./pages/ImprovedRealTimeChat";
import Chatbot from "./pages/Chatbot";
import Announcements from "./pages/Announcements";
import CreateAnnouncement from "./pages/CreateAnnouncement";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-school" element={<RegisterSchool />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/schools" element={<ProtectedRoute><Schools /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/users/add" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
            <Route path="/teachers/add" element={<ProtectedRoute><AddTeacher /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/students/add" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
            <Route path="/parents" element={<ProtectedRoute><Parents /></ProtectedRoute>} />
            <Route path="/parents/add" element={<ProtectedRoute><AddParent /></ProtectedRoute>} />
            <Route path="/parents/link" element={<ProtectedRoute><LinkParents /></ProtectedRoute>} />
            <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
            <Route path="/subjects/add" element={<ProtectedRoute><AddSubject /></ProtectedRoute>} />
            <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
            <Route path="/classes/create" element={<ProtectedRoute><CreateClass /></ProtectedRoute>} />
            <Route path="/classes/assign-teachers" element={<ProtectedRoute><AssignTeachers /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/calendar/add-event" element={<ProtectedRoute><AddEvent /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
            <Route path="/exams/create" element={<ProtectedRoute><CreateExam /></ProtectedRoute>} />
            <Route path="/exams/results" element={<ProtectedRoute><ExamResults /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><StudentAttendance /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/real-time-chat" element={<ProtectedRoute><ImprovedRealTimeChat /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
            <Route path="/announcements/create" element={<ProtectedRoute><CreateAnnouncement /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
