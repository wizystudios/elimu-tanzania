
import React, { useState, useEffect } from 'react';
import { School } from '@/types';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SchoolsOverviewProps {
  schools?: School[];
}

const SchoolsOverview: React.FC<SchoolsOverviewProps> = ({ schools: propSchools }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { userRole, schoolId } = useAuth();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        
        // If schools were passed as props, use those instead of fetching
        if (propSchools && propSchools.length > 0) {
          setSchools(propSchools);
          setLoading(false);
          return;
        }

        let query = supabase.from('schools').select('*, school_locations(*)');
        
        // If user is not a super_admin, filter by their school
        if (userRole !== 'super_admin' && schoolId) {
          query = query.eq('id', schoolId);
        } else {
          // For super_admin, limit to recent schools for the overview
          query = query.order('created_at', { ascending: false }).limit(5);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          // Transform the data to match School type completely
          const typedSchools: School[] = data.map(school => ({
            id: school.id,
            name: school.name, 
            type: school.type as School['type'],
            registration_number: school.registration_number,
            subdomain: school.subdomain,
            logo: school.logo,
            description: school.description || '',
            created_at: school.created_at,
            updated_at: school.updated_at,
            school_locations: school.school_locations,
            email: school.email,
            phone: school.phone,
            established_date: school.established_date,
            // Add these properties for compatibility with existing code
            registrationNumber: school.registration_number,
            establishedDate: school.established_date,
            address: school.school_locations && school.school_locations[0] ? {
              region: school.school_locations[0].region,
              district: school.school_locations[0].district,
              ward: school.school_locations[0].ward,
              street: school.school_locations[0].street
            } : undefined,
            contactInfo: {
              email: school.email,
              phone: school.phone
            }
          }));
          
          setSchools(typedSchools);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchools();
  }, [propSchools, userRole, schoolId]);

  const getSchoolTypeIcon = (type: School['type']) => {
    switch (type) {
      case 'kindergarten':
        return (
          <div className="bg-tanzanian-gold/10 text-amber-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'primary':
        return (
          <div className="bg-tanzanian-green/10 text-tanzanian-green p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
        );
      case 'secondary':
        return (
          <div className="bg-tanzanian-blue/10 text-tanzanian-blue p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'advanced':
        return (
          <div className="bg-tanzanian-purple/10 text-tanzanian-purple p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
    }
  };

  const getSchoolType = (type: School['type']): string => {
    switch (type) {
      case 'kindergarten': return 'Chekechea';
      case 'primary': return 'Shule ya Msingi';
      case 'secondary': return 'Secondary School';
      case 'advanced': return 'Advanced Level';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Schools Overview</h3>
        <Link to="/schools" className="text-sm text-tanzanian-blue hover:underline">View all</Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tanzanian-blue"></div>
        </div>
      ) : schools.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No schools data available.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {schools.map((school) => (
            <div key={school.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
              {getSchoolTypeIcon(school.type)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{school.name}</h4>
                <p className="text-xs text-gray-500">{getSchoolType(school.type)}</p>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                  {school.school_locations && school.school_locations[0] && (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {school.school_locations[0].region}, {school.school_locations[0].district}
                    </span>
                  )}
                  {school.registration_number && (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {school.registration_number}
                    </span>
                  )}
                </div>
              </div>
              <Link to={`/schools/${school.id}`} className="px-3 py-1 text-xs font-medium text-tanzanian-blue border border-tanzanian-blue rounded-md hover:bg-tanzanian-blue hover:text-white transition-colors">
                Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolsOverview;
