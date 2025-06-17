
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { User, Search, Plus, Filter, UserPlus, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { User as UserType, UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const Users = () => {
  const { schoolId, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const itemsPerPage = 10;
  
  const userRoles: { value: UserRole | 'all', label: string }[] = [
    { value: 'all', label: 'All Roles' },
    { value: 'super_admin', label: 'Super Admin 👑' },
    { value: 'admin', label: 'Admin 🛡️' },
    { value: 'headmaster', label: 'Headmaster 🎓' },
    { value: 'vice_headmaster', label: 'Vice Headmaster 📚' },
    { value: 'academic_teacher', label: 'Academic Teacher 🏆' },
    { value: 'teacher', label: 'Teacher 📖' },
    { value: 'student', label: 'Student 🎒' },
    { value: 'parent', label: 'Parent 👨‍👩‍👧‍👦' },
  ];

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['users', selectedRole, schoolId],
    queryFn: async () => {
      console.log('Fetching users for school:', schoolId, 'role filter:', selectedRole);
      
      let query = supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          teacher_role,
          is_active,
          school_id,
          profiles!user_roles_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone,
            profile_image,
            created_at
          )
        `);
      
      // Filter by school (super_admin can see all)
      if (schoolId && userRole !== 'super_admin') {
        query = query.eq('school_id', schoolId);
      }
      
      // Filter by role if specified
      if (selectedRole !== 'all') {
        query = query.eq('role', selectedRole);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      console.log('Raw user data:', data);
      
      const transformedUsers = data?.map(userRole => {
        // Handle the profiles relationship properly
        const profile = Array.isArray(userRole.profiles) ? userRole.profiles[0] : userRole.profiles;
        
        return {
          id: userRole.user_id,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          email: profile?.email || '',
          role: userRole.role as UserRole,
          profileImage: profile?.profile_image || undefined,
          phoneNumber: profile?.phone || '',
          isActive: userRole.is_active,
          createdAt: profile?.created_at || new Date().toISOString(),
          schoolId: userRole.school_id,
          teacherRole: userRole.teacher_role
        };
      }) || [];
      
      console.log('Transformed users:', transformedUsers);
      return transformedUsers;
    }
  });
  
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

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Function to get role display label with emoji
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
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .in('user_id', selectedUsers);
      
      if (error) throw error;
      
      refetch();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error bulk deactivating users:', error);
    }
  };

  return (
    <MainLayout>
      <div className="p-2 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Users 👥</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage all system users and their permissions</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Link 
              to="/users/add" 
              className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
            >
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Add User</span>
            </Link>
            {selectedUsers.length > 0 && (
              <Button variant="outline" onClick={handleBulkDeactivate} className="flex items-center space-x-2 text-sm sm:text-base">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Deactivate Selected ({selectedUsers.length})</span>
                <span className="sm:hidden">Deactivate ({selectedUsers.length})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent text-sm sm:text-base"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Role:</span>
              <select 
                className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-sm"
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

        {/* Users Display */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-tanzanian-blue"></div>
          </div>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {currentUsers.map((user) => (
                <div key={user.id} className="border-b border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <div className="h-10 w-10 rounded-full bg-tanzanian-blue/10 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                          {user.role === 'super_admin' && <span className="ml-1">👑</span>}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                            {getRoleLabel(user.role)}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end space-x-3 text-sm">
                    <Link to={`/profile`} className="text-tanzanian-blue hover:text-tanzanian-blue/80">
                      View
                    </Link>
                    <Link to={`/profile`} className="text-tanzanian-green hover:text-tanzanian-green/80">
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
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-tanzanian-blue/10 flex items-center justify-center overflow-hidden">
                            {user.profileImage ? (
                              <img
                                className="h-8 w-8 sm:h-10 sm:w-10 object-cover"
                                src={user.profileImage}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                            ) : (
                              <User className="h-4 w-4 sm:h-5 sm:w-5 text-tanzanian-blue" />
                            )}
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                              {user.role === 'super_admin' && <span className="ml-1">👑</span>}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{user.email}</div>
                        <div>{user.phoneNumber}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/profile`} className="text-tanzanian-blue hover:text-tanzanian-blue/80">
                            View
                          </Link>
                          <Link to={`/profile`} className="text-tanzanian-green hover:text-tanzanian-green/80">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-3 sm:px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                      <span className="font-medium">{filteredUsers.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="rounded-r-none"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {currentPage} of {totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                        className="rounded-l-none"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">No Users Found 😔</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md">
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
        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {userRoles.filter(role => role.value !== 'all').map(role => {
            const count = users.filter(user => user.role === role.value).length;
            return (
              <div key={role.value} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <div className="text-xs sm:text-sm font-medium text-gray-500 truncate">{role.label}s</div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;
