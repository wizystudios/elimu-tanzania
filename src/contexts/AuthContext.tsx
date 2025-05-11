
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: string | null;
  schoolId: string | null;
  schoolName: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => {
            fetchUserData(newSession?.user?.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUserRole(null);
          setSchoolId(null);
          setSchoolName(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
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
  }, [navigate]);

  const fetchUserData = async (userId: string | undefined) => {
    if (!userId) return;
    
    try {
      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, school_id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (roleError) {
        console.error("Error fetching user role:", roleError);
        return;
      }
      
      setUserRole(roleData?.role || null);
      
      if (roleData?.school_id) {
        setSchoolId(roleData.school_id);
        
        // Fetch school name
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('name')
          .eq('id', roleData.school_id)
          .maybeSingle();
          
        if (schoolError) {
          console.error("Error fetching school data:", schoolError);
        } else {
          setSchoolName(schoolData?.name || null);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    }
  };

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
      schoolId,
      schoolName,
      isLoading, 
      signOut 
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
