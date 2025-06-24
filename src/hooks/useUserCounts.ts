
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserCounts {
  super_admin: number;
  admin: number;
  headmaster: number;
  vice_headmaster: number;
  academic_teacher: number;
  teacher: number;
  student: number;
  parent: number;
}

export const useUserCounts = () => {
  const { schoolId } = useAuth();
  const [counts, setCounts] = useState<UserCounts>({
    super_admin: 0,
    admin: 0,
    headmaster: 0,
    vice_headmaster: 0,
    academic_teacher: 0,
    teacher: 0,
    student: 0,
    parent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCounts = async () => {
    if (!schoolId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_details')
        .select('role')
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (fetchError) {
        throw fetchError;
      }

      // Count users by role
      const roleCounts: UserCounts = {
        super_admin: 0,
        admin: 0,
        headmaster: 0,
        vice_headmaster: 0,
        academic_teacher: 0,
        teacher: 0,
        student: 0,
        parent: 0,
      };

      data?.forEach((user) => {
        if (user.role && roleCounts.hasOwnProperty(user.role)) {
          roleCounts[user.role as keyof UserCounts]++;
        }
      });

      setCounts(roleCounts);
    } catch (err: any) {
      console.error('Error fetching user counts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCounts();
  }, [schoolId]);

  return {
    counts,
    isLoading,
    error,
    refetch: fetchUserCounts
  };
};
