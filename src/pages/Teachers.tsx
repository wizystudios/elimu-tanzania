
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { User, Search, Plus, Mail, Phone, GraduationCap, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Teachers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch teachers data from Supabase
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      // Get all users with teacher role
      const { data: teacherRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, teacher_role')
        .eq('role', 'teacher');
      
      if (rolesError) throw rolesError;
      
      if (!teacherRoles || teacherRoles.length === 0) {
        return [];
      }
      
      // Get teacher profiles
      const teacherIds = teacherRoles.map(role => role.user_id);
      
      const { data: teacherProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, profile_image, phone')
        .in('id', teacherIds);
        
      if (profilesError) throw profilesError;
      
      // Get subjects taught by teachers
      const { data: teacherSubjects, error: subjectsError } = await supabase
        .from('teacher_subjects')
        .select(`
          teacher_id,
          subjects:subject_id (
            id,
            name
          )
        `)
        .in('teacher_id', teacherIds);
      
      if (subjectsError) {
        console.error('Error fetching teacher subjects:', subjectsError);
      }
      
      // Get classes assigned to teachers
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, name, homeroom_teacher_id')
        .in('homeroom_teacher_id', teacherIds);
      
      if (classesError) {
        console.error('Error fetching classes:', classesError);
      }
      
      // Map teacher profiles with their subjects and classes
      return teacherProfiles?.map(teacher => {
        const teacherRole = teacherRoles.find(role => role.user_id === teacher.id);
        
        // Get subjects taught by this teacher - handle array structure properly
        const subjectRelations = teacherSubjects?.filter(ts => ts.teacher_id === teacher.id) || [];
        const subjects = subjectRelations.map(relation => {
          const subject = relation.subjects;
          // Handle case where subjects might be an array or object or null
          if (Array.isArray(subject) && subject.length > 0) {
            return subject[0]?.name || null;
          } else if (subject && !Array.isArray(subject) && typeof subject === 'object' && 'name' in subject) {
            return subject.name;
          }
          return null;
        }).filter(Boolean);
        
        // Get classes where this teacher is homeroom teacher
        const homeroomClasses = classes?.filter(cls => cls.homeroom_teacher_id === teacher.id).map(cls => cls.name) || [];
        
        return {
          id: teacher.id,
          firstName: teacher.first_name,
          lastName: teacher.last_name,
          email: teacher.email,
          profileImage: teacher.profile_image,
          phoneNumber: teacher.phone || '',
          role: 'teacher',
          teacherRole: teacherRole?.teacher_role || 'normal_teacher',
          subjects: subjects,
          classes: homeroomClasses,
          isActive: true
        };
      }) || [];
    }
  });
  
  // Filter teachers based on search query
  const filteredTeachers = teachers?.filter((teacher) => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           teacher.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
           teacher.subjects.some((subject: string) => subject.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Teachers</h1>
            <p className="text-gray-600">Manage teaching staff and their assignments</p>
          </div>
          <Link 
            to="/teachers/add" 
            className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Teacher</span>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent"
              placeholder="Search teachers by name, email, phone, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Teachers List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tanzanian-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers && filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <div key={teacher.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-tanzanian-blue/10 flex items-center justify-center overflow-hidden">
                        {teacher.profileImage ? (
                          <img
                            className="h-12 w-12 object-cover"
                            src={teacher.profileImage}
                            alt={`${teacher.firstName} ${teacher.lastName}`}
                          />
                        ) : (
                          <User className="h-6 w-6 text-tanzanian-blue" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{teacher.firstName} {teacher.lastName}</h3>
                        <p className="text-sm text-gray-500 capitalize">{teacher.teacherRole.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start space-x-2">
                        <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600">{teacher.email}</p>
                      </div>
                      {teacher.phoneNumber && (
                        <div className="flex items-start space-x-2">
                          <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{teacher.phoneNumber}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Subjects:
                        </h4>
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects.map((subject: string, index: number) => (
                              <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {subject}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No subjects assigned</p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          Classes:
                        </h4>
                        {teacher.classes && teacher.classes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teacher.classes.map((className: string, index: number) => (
                              <span key={index} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                {className}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No classes assigned</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teacher.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
                    <Link to={`/teachers/${teacher.id}`} className="text-sm text-tanzanian-blue hover:underline">View Profile</Link>
                    <Link to={`/teachers/${teacher.id}/edit`} className="text-sm text-tanzanian-green hover:underline">Edit</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-sm">
                <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {searchQuery 
                    ? "No teachers found matching your search criteria." 
                    : "No teachers have been added yet."}
                </p>
                <Link 
                  to="/teachers/add" 
                  className="mt-4 inline-flex items-center px-4 py-2 bg-tanzanian-blue text-white rounded-md hover:bg-tanzanian-blue/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Teachers;
