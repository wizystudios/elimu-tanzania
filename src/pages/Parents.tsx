
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { User, Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Parents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch parents data from Supabase
  const { data: parents, isLoading } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      // First get all users with parent role
      const { data: parentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'parent');
      
      if (rolesError) throw rolesError;
      
      if (!parentRoles || parentRoles.length === 0) {
        return [];
      }
      
      // Get parent profiles
      const parentIds = parentRoles.map(role => role.user_id);
      
      const { data: parentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, profile_image, phone')
        .in('id', parentIds);
        
      if (profilesError) throw profilesError;
      
      // In a real app, we would fetch relationships between parents and students
      // For now, to replace the mock data, we'll create a query to the parent_students table
      const { data: parentStudentRelations, error: relationsError } = await supabase
        .from('parent_students')
        .select(`
          parent_id,
          relationship,
          student:student_id (
            id,
            user_id,
            current_class_id,
            class:current_class_id (
              name
            )
          )
        `)
        .in('parent_id', parentIds);
      
      if (relationsError) {
        console.error('Error fetching parent-student relations:', relationsError);
        // Continue without relations data if there's an error
      }
      
      // Get student user details - handle array structure properly
      const studentUserIds = parentStudentRelations?.filter(r => {
        const student = r.student;
        return student && !Array.isArray(student) && student.user_id;
      }).map(r => {
        const student = r.student;
        return student && !Array.isArray(student) ? student.user_id : null;
      }).filter(Boolean) || [];
      
      let studentProfiles = [];
      if (studentUserIds.length > 0) {
        const { data: studentProfilesData, error: studentProfilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', studentUserIds);
          
        if (!studentProfilesError) {
          studentProfiles = studentProfilesData || [];
        }
      }
      
      // Map parent profiles with their associated students
      return parentProfiles?.map(parent => {
        const childRelations = parentStudentRelations?.filter(relation => relation.parent_id === parent.id) || [];
        
        // Map child relations to student details
        const children = childRelations.map(relation => {
          const student = relation.student;
          
          // Handle case where student might be an array or object or null
          if (!student || Array.isArray(student)) {
            return null;
          }
          
          const studentProfile = studentProfiles.find(profile => profile.id === student.user_id);
          const classInfo = student.class && !Array.isArray(student.class) ? student.class : null;
          
          return {
            id: student.id,
            userId: student.user_id,
            firstName: studentProfile?.first_name || 'Unknown',
            lastName: studentProfile?.last_name || 'Student',
            currentClass: classInfo?.name || 'Unassigned',
            relationship: relation.relationship
          };
        }).filter(Boolean); // Remove null entries
        
        return {
          id: parent.id,
          firstName: parent.first_name,
          lastName: parent.last_name,
          email: parent.email,
          profileImage: parent.profile_image,
          phoneNumber: parent.phone,
          role: 'parent',
          children
        };
      }) || [];
    }
  });
  
  // Filter parents based on search query
  const filteredParents = parents?.filter((parent) => {
    const fullName = `${parent.firstName} ${parent.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (parent.phoneNumber && parent.phoneNumber.includes(searchQuery));
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Parents/Guardians</h1>
            <p className="text-gray-600">Manage parents and guardians of enrolled students</p>
          </div>
          <Link 
            to="/parents/add" 
            className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Parent</span>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent"
              placeholder="Search parents by name, email, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Parents List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tanzanian-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParents && filteredParents.length > 0 ? (
              filteredParents.map((parent) => (
                <div key={parent.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-tanzanian-blue/10 flex items-center justify-center overflow-hidden">
                        {parent.profileImage ? (
                          <img
                            className="h-12 w-12 object-cover"
                            src={parent.profileImage}
                            alt={`${parent.firstName} ${parent.lastName}`}
                          />
                        ) : (
                          <User className="h-6 w-6 text-tanzanian-blue" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{parent.firstName} {parent.lastName}</h3>
                        <p className="text-sm text-gray-500 capitalize">{parent.role.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <p className="text-sm text-gray-600">{parent.email}</p>
                      </div>
                      {parent.phoneNumber && (
                        <div className="flex items-start space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <p className="text-sm text-gray-600">{parent.phoneNumber}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Children:</h4>
                      {parent.children && parent.children.length > 0 ? (
                        <ul className="space-y-2">
                          {parent.children.map((child) => (
                            <li key={child.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                              <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-tanzanian-green rounded-full"></span>
                                <span className="text-sm">{child.firstName} {child.lastName}</span>
                              </div>
                              <span className="text-xs text-gray-500">{child.currentClass}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No children linked</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
                    <Link to={`/parents/${parent.id}`} className="text-sm text-tanzanian-blue hover:underline">View Profile</Link>
                    <Link to={`/parents/${parent.id}/edit`} className="text-sm text-tanzanian-green hover:underline">Edit</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-sm">
                <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {searchQuery 
                    ? "No parents found matching your search criteria." 
                    : "No parents or guardians have been added yet."}
                </p>
                <Link 
                  to="/parents/add" 
                  className="mt-4 inline-flex items-center px-4 py-2 bg-tanzanian-blue text-white rounded-md hover:bg-tanzanian-blue/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parent
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Parents;
