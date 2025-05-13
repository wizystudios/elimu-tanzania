
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { User, Search, Plus, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  const { data: students, isLoading } = useQuery({
    queryKey: ['students', selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          *,
          class:current_class_id (
            name,
            education_level
          )
        `);
      
      if (selectedLevel) {
        // Apply education level filter from classes
        const { data: classIds, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('education_level', selectedLevel);
        
        if (!classError && classIds && classIds.length > 0) {
          const classIdList = classIds.map(c => c.id);
          query = query.in('current_class_id', classIdList);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Fetch student profiles separately
      const studentsWithProfiles = await Promise.all(data.map(async (student) => {
        // Get the profile information
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, profile_image')
          .eq('id', student.user_id)
          .single();
        
        // Placeholder for guardian info - in a real app would fetch from parent_students table
        const guardianInfo = {
          name: `Parent of ${profile?.first_name || 'Student'}`,
          relationship: Math.random() > 0.5 ? 'Father' : 'Mother',
          contact: `+255 7${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`
        };
        
        return {
          ...student,
          profiles: profileError ? null : profile,
          guardianInfo
        };
      }));
      
      return studentsWithProfiles;
    }
  });

  // Education level options for the filter
  const educationLevels = [
    { value: 'chekechea', label: 'Kindergarten' },
    { value: 'darasa1', label: 'Standard 1' },
    { value: 'darasa2', label: 'Standard 2' },
    { value: 'darasa3', label: 'Standard 3' },
    { value: 'darasa4', label: 'Standard 4' },
    { value: 'darasa5', label: 'Standard 5' },
    { value: 'darasa6', label: 'Standard 6' },
    { value: 'darasa7', label: 'Standard 7' },
    { value: 'form1', label: 'Form 1' },
    { value: 'form2', label: 'Form 2' },
    { value: 'form3', label: 'Form 3' },
    { value: 'form4', label: 'Form 4' },
    { value: 'form5', label: 'Form 5' },
    { value: 'form6', label: 'Form 6' },
  ];

  const getEducationLevelLabel = (level: string): string => {
    const educationLevel = educationLevels.find(el => el.value === level);
    return educationLevel ? educationLevel.label : level;
  };

  const getEducationLevelBadgeColor = (level: string) => {
    if (level === 'chekechea') {
      return 'bg-amber-100 text-amber-800';
    } else if (level.startsWith('darasa')) {
      return 'bg-green-100 text-green-800';
    } else if (['form1', 'form2', 'form3', 'form4'].includes(level)) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-purple-100 text-purple-800';
    }
  };

  const filteredStudents = students?.filter((student) => {
    const fullName = `${student.profiles?.first_name || ''} ${student.profiles?.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          student.registration_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Education level is now determined from the class rather than directly on the student
    const studentEducationLevel = student.class?.education_level;
    const matchesLevel = !selectedLevel || studentEducationLevel === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-gray-600">Manage all enrolled students</p>
          </div>
          <Link 
            to="/students/add" 
            className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Register Student</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent"
                placeholder="Search students by name or registration number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Filter by level:</span>
              <div className="flex items-center space-x-2 flex-wrap">
                <button 
                  className={`px-3 py-1 rounded-full ${selectedLevel === null ? 'bg-gray-200 text-gray-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedLevel(null)}
                >
                  All
                </button>
                {educationLevels.map(level => (
                  <button 
                    key={level.value}
                    className={`px-3 py-1 rounded-full ${selectedLevel === level.value ? getEducationLevelBadgeColor(level.value) : 'bg-white border border-gray-300 text-gray-600'}`}
                    onClick={() => setSelectedLevel(level.value)}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tanzanian-blue"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration No.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guardian
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents && filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              {student.profiles?.profile_image ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={student.profiles.profile_image}
                                  alt={`${student.profiles?.first_name} ${student.profiles?.last_name}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-tanzanian-blue/10 flex items-center justify-center text-tanzanian-blue">
                                  <User className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.profiles?.first_name} {student.profiles?.last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.profiles?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.registration_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.class?.education_level && (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEducationLevelBadgeColor(student.class.education_level)}`}>
                              {getEducationLevelLabel(student.class.education_level)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.class?.name || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.guardianInfo.name}</div>
                          <div className="text-xs text-gray-500">{student.guardianInfo.relationship} • {student.guardianInfo.contact}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/students/${student.id}`} className="text-tanzanian-blue hover:text-tanzanian-blue/80 mr-4">View</Link>
                          <Link to={`/students/${student.id}/edit`} className="text-tanzanian-green hover:text-tanzanian-green/80 mr-4">Edit</Link>
                          <button className="text-tanzanian-red hover:text-tanzanian-red/80">Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        {searchQuery || selectedLevel ? 
                          "No students found matching your search criteria." : 
                          "No students have been enrolled yet."
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Students;
