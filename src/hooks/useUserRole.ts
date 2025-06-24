
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

        // Use the user_details view instead of direct user_roles table
        const { data, error: fetchError } = await supabase
          .from('user_details')
          .select('role, teacher_role, school_id, is_active')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching user role:", fetchError);
          setError(fetchError.message);
          setUserRole(null);
        } else if (data) {
          // Convert the user_details format to UserRole format
          setUserRole({
            id: user.id,
            role: data.role,
            teacher_role: data.teacher_role,
            school_id: data.school_id,
            is_active: data.is_active || false
          });
        } else {
          setUserRole(null);
        }
      } catch (err: any) {
        console.error('Error fetching user role:', err);
        setError(err.message);
        setUserRole(null);
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
