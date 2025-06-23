
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserRole {
  id: string;
  role: string;
  teacher_role?: string;
  school_id: string;
  is_active: boolean;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No rows returned
            setUserRole(null);
          } else {
            throw fetchError;
          }
        } else {
          setUserRole(data);
        }
      } catch (err: any) {
        console.error('Error fetching user role:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (role: string): boolean => {
    return userRole?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return userRole ? roles.includes(userRole.role) : false;
  };

  const canManageUsers = (): boolean => {
    return hasAnyRole(['admin', 'headmaster', 'vice_headmaster']);
  };

  const canCreateClasses = (): boolean => {
    return hasAnyRole(['admin', 'headmaster', 'vice_headmaster']);
  };

  const canCreateSubjects = (): boolean => {
    return hasAnyRole(['admin', 'headmaster', 'vice_headmaster', 'academic_teacher']);
  };

  const canCreateExams = (): boolean => {
    return hasAnyRole(['admin', 'headmaster', 'vice_headmaster', 'academic_teacher', 'teacher']);
  };

  const canCreateAnnouncements = (): boolean => {
    return hasAnyRole(['admin', 'headmaster', 'vice_headmaster', 'academic_teacher', 'teacher']);
  };

  return {
    userRole,
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    canManageUsers,
    canCreateClasses,
    canCreateSubjects,
    canCreateExams,
    canCreateAnnouncements,
  };
};
