import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Search, Plus, Filter, Building2, Users, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Classes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(new Date().getFullYear().toString());
  
  // Get all education levels for filter options
  const educationLevels = [
    { value: 'kindergarten', label: 'Kindergarten' },
    { value: 'primary', label: 'Primary School' },
    { value: 'secondary', label: 'Secondary School' },
    { value: 'advanced', label: 'Advanced Level' },
  ];
  
  // Academic years for filtering
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Fetch classes data from Supabase
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes', selectedLevel, selectedYear],
    queryFn: async () => {
      let query = supabase.from('classes')
        .select(`
          *,
          teacher_subjects:teacher_subjects (
            subject_id,
            subjects:subject_id (
              name
            )
          )
        `);
      
      if (selectedLevel) {
        query = query.eq('education_level', selectedLevel);
      }
      
      if (selectedYear) {
        query = query.like('academic_year', `${selectedYear}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // For each class, fetch the teacher's name separately
      const classesWithTeachers = await Promise.all((data || []).map(async (classItem: any) => {
        if (classItem.homeroom_teacher_id) {
          // Get the profile info for this teacher
          const { data: teacherProfile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', classItem.homeroom_teacher_id)
            .single();
          
          if (profileError || !teacherProfile) {
            return {
              ...classItem,
              teacherName: 'Unknown Teacher'
            };
          }
          
          return {
            ...classItem,
            teacherName: `${teacherProfile.first_name} ${teacherProfile.last_name}`
          };
        }
        
        return {
          ...classItem,
          teacherName: 'No Teacher Assigned'
        };
      }));
      
      return classesWithTeachers;
    }
  });

  // Function to get the education level label
  const getEducationLevelLabel = (level: string): string => {
    const educationLevel = educationLevels.find(el => el.value === level);
    return educationLevel ? educationLevel.label : level;
  };

  // Filter classes by search query
  const filteredClasses = classes?.filter((classItem) => {
    return classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           getEducationLevelLabel(classItem.education_level).toLowerCase().includes(searchQuery.toLowerCase()) ||
           classItem.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Classes</h1>
            <p className="text-gray-600">Manage school classes and assignments</p>
          </div>
          <Link 
            to="/classes/create" 
            className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Class</span>
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
                placeholder="Search classes by name, level, or teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Filter className="h-4 w-4 text-gray-400" />
                <span>Level:</span>
                <select 
                  className="border border-gray-300 rounded-md px-3 py-1"
                  value={selectedLevel || ''}
                  onChange={(e) => setSelectedLevel(e.target.value || null)}
                >
                  <option value="">All</option>
                  {educationLevels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span>Year:</span>
                <select 
                  className="border border-gray-300 rounded-md px-3 py-1"
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(e.target.value || null)}
                >
                  <option value="">All</option>
                  {academicYears.map((year) => (
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tanzanian-blue"></div>
          </div>
        ) : filteredClasses && filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <div key={classItem.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{classItem.name}</h3>
                    <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                      {getEducationLevelLabel(classItem.education_level)}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Students</p>
                        <p className="text-lg font-semibold">0</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Class Teacher</p>
                        <p className="text-base">{classItem.teacherName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Subjects</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.from(new Set(classItem.teacher_subjects?.map((ts: any) => ts.subjects?.name).filter(Boolean))).map((subject: string, index: number) => (
                            <span key={index} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {subject}
                            </span>
                          ))}
                          {(!classItem.teacher_subjects || classItem.teacher_subjects.length === 0) && (
                            <span className="text-sm text-gray-500">No subjects assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
                  <Link to={`/classes/${classItem.id}`} className="text-sm text-tanzanian-blue hover:underline">View Details</Link>
                  <Link to={`/classes/${classItem.id}/edit`} className="text-sm text-tanzanian-green hover:underline">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <Building2 className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Classes Found</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {searchQuery || selectedLevel || selectedYear 
                  ? "No classes match your search criteria. Try adjusting your filters."
                  : "There are no classes created yet. Start by creating your first class."}
              </p>
              <Link 
                to="/classes/create" 
                className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Class</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Classes;
