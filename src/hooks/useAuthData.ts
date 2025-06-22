
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

interface SchoolDetails {
  id: string;
  name: string;
  registration_number: string;
  email: string;
  phone: string;
  type: string;
  subdomain: string;
  logo?: string;
  description?: string;
  established_date?: string;
  created_at: string;
  updated_at: string;
}

export const useAuthData = () => {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) {
        setUserDetails(null);
        setSchoolDetails(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching user details for:', user.id);
        
        // Fetch user details from the view
        const { data: userData, error: userError } = await supabase
          .from('user_details')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user details:', userError);
          setIsLoading(false);
          return;
        }

        console.log('User data fetched:', userData);
        setUserDetails(userData);

        // If user has a school_id, fetch school details
        if (userData?.school_id) {
          console.log('Fetching school details for school_id:', userData.school_id);
          
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('id', userData.school_id)
            .single();

          if (schoolError) {
            console.error('Error fetching school details:', schoolError);
          } else {
            console.log('School data fetched:', schoolData);
            setSchoolDetails(schoolData);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserDetails:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  return { userDetails, schoolDetails, isLoading };
};
