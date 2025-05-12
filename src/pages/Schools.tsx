
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { School, SchoolType } from '@/types';
import { Search, Plus, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const Schools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [schoolsList, setSchoolsList] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userRole, schoolId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('schools').select('*, school_locations(*)');
        
        // If user is not a super_admin, filter by their school_id
        if (userRole !== 'super_admin' && schoolId) {
          query = query.eq('id', schoolId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          // Transform the data to match our School type
          const typedSchools: School[] = data.map(school => ({
            ...school,
            type: school.type as SchoolType, // Cast string to SchoolType enum
            // Map other properties for compatibility
            address: school.school_locations?.[0] ? {
              region: school.school_locations[0].region,
              district: school.school_locations[0].district,
              ward: school.school_locations[0].ward,
              street: school.school_locations[0].street,
            } : undefined,
            contactInfo: {
              email: school.email,
              phone: school.phone
            },
            registrationNumber: school.registration_number,
            establishedDate: school.established_date
          }));
          
          setSchoolsList(typedSchools);
        } else {
          setSchoolsList([]);
          toast.error('No schools data available');
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
        toast.error('Failed to load schools data');
        setSchoolsList([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchools();
  }, [userRole, schoolId]);

  const getSchoolTypeLabel = (type: School['type']): string => {
    switch (type) {
      case 'kindergarten': return 'Chekechea';
      case 'primary': return 'Shule ya Msingi';
      case 'secondary': return 'Secondary School';
      case 'advanced': return 'Advanced Level';
    }
  };

  const getSchoolTypeBadgeColor = (type: School['type']) => {
    switch (type) {
      case 'kindergarten': return 'bg-amber-100 text-amber-800';
      case 'primary': return 'bg-green-100 text-green-800';
      case 'secondary': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
    }
  };

  const filteredSchools = schoolsList.filter((school) => {
    // Use school_locations if available, otherwise fall back to address
    const region = school.school_locations?.[0]?.region || school.address?.region || '';
    const district = school.school_locations?.[0]?.district || school.address?.district || '';
    
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          district.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === null || school.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleRegisterSchool = () => {
    navigate('/register-school');
  };

  const handleViewSchool = (id: string) => {
    navigate(`/schools/${id}`);
  };

  const handleEditSchool = (id: string) => {
    navigate(`/schools/${id}/edit`);
  };

  const handleDeleteSchool = async (id: string) => {
    if (confirm('Are you sure you want to delete this school?')) {
      try {
        const { error } = await supabase
          .from('schools')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast.success('School deleted successfully');
        // Refresh the schools list
        setSchoolsList(prev => prev.filter(school => school.id !== id));
      } catch (error) {
        console.error('Error deleting school:', error);
        toast.error('Failed to delete school');
      }
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Schools</h1>
            <p className="text-gray-600">Manage all registered schools</p>
          </div>
          {userRole === 'super_admin' && (
            <button 
              onClick={handleRegisterSchool}
              className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Register School</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent"
                placeholder="Search schools by name, region, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Filter by type:</span>
              <div className="flex items-center space-x-2">
                <button 
                  className={`px-3 py-1 rounded-full ${selectedType === null ? 'bg-gray-200 text-gray-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedType(null)}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedType === 'kindergarten' ? 'bg-amber-100 text-amber-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedType('kindergarten')}
                >
                  Chekechea
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedType === 'primary' ? 'bg-green-100 text-green-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedType('primary')}
                >
                  Primary
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedType === 'secondary' ? 'bg-blue-100 text-blue-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedType('secondary')}
                >
                  Secondary
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedType === 'advanced' ? 'bg-purple-100 text-purple-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedType('advanced')}
                >
                  Advanced
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Schools List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tanzanian-blue"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      School Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{school.name}</div>
                        <div className="text-xs text-gray-500">Est. {new Date(school.established_date).getFullYear()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSchoolTypeBadgeColor(school.type)}`}>
                          {getSchoolTypeLabel(school.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(school.school_locations && school.school_locations[0]) 
                          ? `${school.school_locations[0].region}, ${school.school_locations[0].district}`
                          : school.address 
                            ? `${school.address.region}, ${school.address.district}`
                            : 'Location not specified'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {school.registration_number || 'Not registered'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {school.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {school.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-tanzanian-blue hover:text-tanzanian-blue/80 mr-4"
                          onClick={() => handleViewSchool(school.id)}
                        >
                          View
                        </button>
                        {(userRole === 'super_admin' || (userRole === 'admin' && school.id === schoolId)) && (
                          <>
                            <button 
                              className="text-tanzanian-green hover:text-tanzanian-green/80 mr-4"
                              onClick={() => handleEditSchool(school.id)}
                            >
                              Edit
                            </button>
                            {userRole === 'super_admin' && (
                              <button 
                                className="text-tanzanian-red hover:text-tanzanian-red/80"
                                onClick={() => handleDeleteSchool(school.id)}
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredSchools.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No schools found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Schools;
