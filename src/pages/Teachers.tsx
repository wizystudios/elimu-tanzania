
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { User, Search, Plus, Mail, Phone, GraduationCap, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface SubjectData {
  id: string;
  name: string;
}

interface TeacherData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  teacher_role?: string;
  is_active: boolean;
  subjects: string[];
  classes: string[];
}

const Teachers = () => {
  const { schoolId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch teachers data using the user_details view
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      console.log('Fetching teachers for school:', schoolId);

      // Get all teachers from user_details view
      const { data: teacherData, error: teacherError } = await supabase
        .from('user_details')
        .select('*')
        .eq('role', 'teacher')
        .eq('school_id', schoolId);
      
      if (teacherError) {
        console.error('Error fetching teachers:', teacherError);
        return [];
      }

      if (!teacherData || teacherData.length === 0) {
        return [];
      }
      
      const teacherIds = teacherData.map(teacher => teacher.id);
      
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
      
      // Map teacher data with their subjects and classes
      return teacherData.map(teacher => {
        // Get subjects taught by this teacher
        const subjectRelations = teacherSubjects?.filter(ts => ts.teacher_id === teacher.id) || [];
        const subjects = subjectRelations.map(relation => {
          const subjectData = relation.subjects;
          // Handle the case where subjects might be an array or a single object
          if (Array.isArray(subjectData)) {
            return subjectData.length > 0 ? subjectData[0].name : null;
          } else if (subjectData && typeof subjectData === 'object' && 'name' in subjectData) {
            return subjectData.name;
          }
          return null;
        }).filter(Boolean);
        
        // Get classes where this teacher is homeroom teacher
        const homeroomClasses = classes?.filter(cls => cls.homeroom_teacher_id === teacher.id).map(cls => cls.name) || [];
        
        return {
          id: teacher.id,
          first_name: teacher.first_name,
          last_name: teacher.last_name,
          email: teacher.email,
          phone: teacher.phone,
          profile_image: teacher.profile_image,
          teacher_role: teacher.teacher_role || 'normal_teacher',
          is_active: teacher.is_active,
          subjects: subjects,
          classes: homeroomClasses,
        };
      });
    }
  });
  
  // Filter teachers based on search query
  const filteredTeachers = teachers?.filter((teacher) => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (teacher.phone && teacher.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
                        {teacher.profile_image ? (
                          <img
                            className="h-12 w-12 object-cover"
                            src={teacher.profile_image}
                            alt={`${teacher.first_name} ${teacher.last_name}`}
                          />
                        ) : (
                          <User className="h-6 w-6 text-tanzanian-blue" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{teacher.first_name} {teacher.last_name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{teacher.teacher_role.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start space-x-2">
                        <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600">{teacher.email}</p>
                      </div>
                      {teacher.phone && (
                        <div className="flex items-start space-x-2">
                          <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{teacher.phone}</p>
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
                        teacher.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {teacher.is_active ? 'Active' : 'Inactive'}
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
