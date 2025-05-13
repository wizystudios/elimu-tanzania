
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { User, Search, Plus, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Teachers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  // Fetch teachers data from Supabase
  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      // First get all users with teacher role
      const { data: teacherRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, teacher_role')
        .eq('role', 'teacher');
      
      if (rolesError) throw rolesError;
      
      if (!teacherRoles || teacherRoles.length === 0) {
        return [];
      }
      
      // Get profile information for all teachers
      const teacherIds = teacherRoles.map(role => role.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, profile_image, phone')
        .in('id', teacherIds);
        
      if (profilesError) throw profilesError;
      
      // Fetch the teacher subjects and class assignments
      // This would normally come from a teacher_subjects table
      const { data: teacherSubjects, error: subjectsError } = await supabase
        .from('teacher_subjects')
        .select(`
          teacher_id, 
          subjects:subject_id (
            id, name
          ),
          classes:class_id (
            id, name
          )
        `)
        .in('teacher_id', teacherIds);
      
      if (subjectsError) throw subjectsError;
      
      // Map teacher data to get complete teacher profiles
      return profiles?.map(profile => {
        const role = teacherRoles.find(r => r.user_id === profile.id);
        const teacherSubjectsForUser = teacherSubjects?.filter(ts => ts.teacher_id === profile.id) || [];
        
        // Extract unique subjects and classes
        const subjects = Array.from(new Set(teacherSubjectsForUser.map(ts => ts.subjects?.name))).filter(Boolean) as string[];
        const classesAssigned = Array.from(new Set(teacherSubjectsForUser.map(ts => ts.classes?.name))).filter(Boolean) as string[];
        
        // TODO: This would come from a qualifications table in a real implementation
        const qualifications = ["B.Ed in Education", "Diploma in Mathematics"];
        
        return {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          profileImage: profile.profile_image,
          phoneNumber: profile.phone,
          staffId: `TCH/${new Date().getFullYear()}/${profile.id.substring(0, 3)}`,
          teacherRole: role?.teacher_role || 'normal_teacher',
          subjects,
          classesAssigned,
          qualifications,
        };
      }) || [];
    }
  });
  
  // Get all unique subjects for the filter
  const allSubjects = teachersData 
    ? [...new Set(teachersData.flatMap(teacher => teacher.subjects))]
    : [];
  
  // Filter teachers based on search query and selected subject
  const filteredTeachers = teachersData?.filter((teacher) => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          teacher.staffId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === null || teacher.subjects.includes(selectedSubject);
    
    return matchesSearch && matchesSubject;
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Teachers</h1>
            <p className="text-gray-600">Manage all teaching staff</p>
          </div>
          <Link 
            to="/teachers/add" 
            className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Register Teacher</span>
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
                placeholder="Search teachers by name or staff ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Filter by subject:</span>
              <div className="flex items-center space-x-2 flex-wrap">
                <button 
                  className={`px-3 py-1 rounded-full ${selectedSubject === null ? 'bg-gray-200 text-gray-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedSubject(null)}
                >
                  All
                </button>
                {allSubjects.map((subject) => (
                  <button 
                    key={subject}
                    className={`px-3 py-1 rounded-full ${selectedSubject === subject ? 'bg-blue-100 text-blue-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teachers List */}
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
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subjects
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualifications
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers && filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              {teacher.profileImage ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={teacher.profileImage}
                                  alt={`${teacher.firstName} ${teacher.lastName}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-tanzanian-blue/10 flex items-center justify-center text-tanzanian-blue">
                                  <User className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {teacher.firstName} {teacher.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {teacher.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.staffId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects.map((subject, index) => (
                              <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {subject}
                              </span>
                            ))}
                            {teacher.subjects.length === 0 && (
                              <span className="text-xs text-gray-500">No subjects assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {teacher.classesAssigned.map((className, index) => (
                              <span key={index} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                {className}
                              </span>
                            ))}
                            {teacher.classesAssigned.length === 0 && (
                              <span className="text-xs text-gray-500">No classes assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <ul className="text-sm text-gray-500 list-disc list-inside">
                            {teacher.qualifications.map((qualification, index) => (
                              <li key={index}>{qualification}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/teachers/${teacher.id}`} className="text-tanzanian-blue hover:text-tanzanian-blue/80 mr-4">View</Link>
                          <Link to={`/teachers/${teacher.id}/edit`} className="text-tanzanian-green hover:text-tanzanian-green/80 mr-4">Edit</Link>
                          <button className="text-tanzanian-red hover:text-tanzanian-red/80">Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        {searchQuery || selectedSubject ? 
                          "No teachers found matching your search criteria." : 
                          "No teachers have been added yet."
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

export default Teachers;
