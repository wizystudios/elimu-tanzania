
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { User, Search, Plus, Filter, UserPlus, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { User as UserType, UserRole } from '@/types';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [users, setUsers] = useState<UserType[]>([]);
  
  // Get all available roles for filter options
  const userRoles: { value: UserRole | 'all', label: string }[] = [
    { value: 'all', label: 'All Roles' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'headmaster', label: 'Headmaster' },
    { value: 'vice_headmaster', label: 'Vice Headmaster' },
    { value: 'academic_teacher', label: 'Academic Teacher' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
    { value: 'parent', label: 'Parent' },
  ];

  // Fetch users data from Supabase
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', selectedRole],
    queryFn: async () => {
      // Get user roles with profile information
      let query = supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          teacher_role,
          is_active,
          school_id,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            profile_image,
            created_at
          )
        `);
      
      if (selectedRole !== 'all') {
        query = query.eq('role', selectedRole);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our User type
      const transformedUsers = data?.map(userRole => ({
        id: userRole.user_id,
        firstName: userRole.profiles?.first_name || '',
        lastName: userRole.profiles?.last_name || '',
        email: userRole.profiles?.email || '',
        role: userRole.role as UserRole,
        profileImage: userRole.profiles?.profile_image || undefined,
        phoneNumber: userRole.profiles?.phone || '',
        isActive: userRole.is_active,
        createdAt: userRole.profiles?.created_at || new Date().toISOString(),
        schoolId: userRole.school_id,
        teacherRole: userRole.teacher_role
      })) || [];
      
      return transformedUsers;
    }
  });
  
  // Update local state when data changes
  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
    }
  }, [usersData]);

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Function to get role display label
  const getRoleLabel = (role: UserRole): string => {
    const roleOption = userRoles.find(r => r.value === role);
    return roleOption ? roleOption.label : role.replace('_', ' ');
  };

  // Function to toggle user status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-gray-600">Manage all system users and their permissions</p>
          </div>
          <div className="flex space-x-2">
            <Link 
              to="/users/add" 
              className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              <span>Add User</span>
            </Link>
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Bulk Actions</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent"
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Role:</span>
              <select 
                className="border border-gray-300 rounded-md px-3 py-1"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
              >
                {userRoles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tanzanian-blue"></div>
          </div>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-tanzanian-blue/10 flex items-center justify-center overflow-hidden">
                            {user.profileImage ? (
                              <img
                                className="h-10 w-10 object-cover"
                                src={user.profileImage}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                            ) : (
                              <User className="h-5 w-5 text-tanzanian-blue" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getRoleLabel(user.role)}
                        </span>
                        {user.teacherRole && (
                          <div className="mt-1">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {user.teacherRole.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{user.email}</div>
                        <div>{user.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/users/${user.id}`} className="text-tanzanian-blue hover:text-tanzanian-blue/80">
                            View
                          </Link>
                          <Link to={`/users/${user.id}/edit`} className="text-tanzanian-green hover:text-tanzanian-green/80">
                            Edit
                          </Link>
                          <button
                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                            className={`${
                              user.isActive 
                                ? 'text-red-600 hover:text-red-800' 
                                : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <User className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Users Found</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {searchQuery || selectedRole !== 'all'
                  ? "No users match your search criteria. Try adjusting your filters."
                  : "There are no users in the system yet. Start by adding your first user."}
              </p>
              <Link 
                to="/users/add" 
                className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                <span>Add User</span>
              </Link>
            </div>
          </div>
        )}

        {/* Users Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {userRoles.filter(role => role.value !== 'all').map(role => {
            const count = users.filter(user => user.role === role.value).length;
            return (
              <div key={role.value} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm font-medium text-gray-500">{role.label}s</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;
