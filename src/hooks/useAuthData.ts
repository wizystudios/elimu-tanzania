
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  national_id?: string;
  date_of_birth?: string;
  gender?: string;
  role: string;
  teacher_role?: string;
  school_id: string;
  school_name?: string;
  auth_phone?: string;
  is_active: boolean;
}

export const useAuthData = () => {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) {
        setUserDetails(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_details')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user details:', error);
          return;
        }

        setUserDetails(data);
      } catch (error) {
        console.error('Error in fetchUserDetails:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  return { userDetails, isLoading };
};
