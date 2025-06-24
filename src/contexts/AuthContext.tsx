
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type TeacherRole = 
  'normal_teacher' | 
  'headmaster' | 
  'vice_headmaster' | 
  'academic_teacher' | 
  'discipline_teacher' | 
  'sports_teacher' | 
  'environment_teacher';

type UserRoleType = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: string | null;
  teacherRole: TeacherRole | null;
  schoolId: string | null;
  schoolName: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teacherRole, setTeacherRole] = useState<TeacherRole | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserData = async (userId: string | undefined) => {
    if (!userId) {
      console.log("No user ID provided");
      return;
    }
    
    try {
      console.log("Fetching user data for ID:", userId);
      
      // Use the user_details view which should work without RLS issues
      const { data: userDetails, error: detailsError } = await supabase
        .from('user_details')
        .select('role, teacher_role, school_id, school_name')
        .eq('id', userId)
        .maybeSingle();
        
      if (detailsError) {
        console.error("Error fetching user details:", detailsError);
        // Don't throw error, just log it and continue
        return;
      }
      
      console.log("User details data:", userDetails);
      
      if (userDetails) {
        setUserRole(userDetails.role || null);
        setTeacherRole(userDetails.teacher_role || null);
        setSchoolId(userDetails.school_id || null);
        setSchoolName(userDetails.school_name || null);
      } else {
        console.log("No user details found");
        setUserRole(null);
        setTeacherRole(null);
        setSchoolId(null);
        setSchoolName(null);
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      // Don't throw error, just log it
    }
  };

  const refreshUserData = async () => {
    if (user?.id) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Use setTimeout to avoid potential deadlock
          setTimeout(() => {
            fetchUserData(newSession.user.id);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setUserRole(null);
          setTeacherRole(null);
          setSchoolId(null);
          setSchoolName(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.log("Existing session:", existingSession ? "Yes" : "No");
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          await fetchUserData(existingSession.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Umetoka kwenye akaunti yako");
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Hitilafu imetokea wakati wa kutoka kwenye akaunti yako");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userRole, 
      teacherRole,
      schoolId,
      schoolName,
      isLoading, 
      signOut,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
