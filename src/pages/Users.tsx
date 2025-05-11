
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { User } from '@/types';
import { Search, Plus, Filter, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { users as mockUsers } from '@/data/mockData';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole, schoolId } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, we would fetch from Supabase
        // Since we don't have user_roles table access in this example,
        // we'll just use mock data filtered by school ID for now
        
        // For super_admin, show all users; for others, filter by school
        const filteredUsers = userRole === 'super_admin' 
          ? mockUsers 
          : mockUsers.filter(user => user.schoolId === schoolId);
        
        setUsersList(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users data');
        setUsersList([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [userRole, schoolId]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-rose-100 text-rose-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'parent': return 'bg-amber-100 text-amber-800';
      case 'headmaster': return 'bg-indigo-100 text-indigo-800';
      case 'academic_teacher': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'School Admin';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      case 'parent': return 'Parent';
      case 'headmaster': return 'Headmaster';
      case 'vice_headmaster': return 'Vice Headmaster';
      case 'academic_teacher': return 'Academic Teacher';
      default: return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
    }
  };

  const filteredUsers = usersList.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === null || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-gray-600">Manage all system users</p>
          </div>
          <button className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <UserPlus className="h-5 w-5" />
            <span>Add User</span>
          </button>
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
              <span>Filter by role:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === null ? 'bg-gray-200 text-gray-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedRole(null)}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  Admin
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedRole('teacher')}
                >
                  Teacher
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === 'student' ? 'bg-green-100 text-green-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedRole('student')}
                >
                  Student
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === 'parent' ? 'bg-amber-100 text-amber-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedRole('parent')}
                >
                  Parent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
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
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.profileImage ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={user.profileImage}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-tanzanian-blue flex items-center justify-center text-white">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-tanzanian-blue hover:text-tanzanian-blue/80 mr-4">View</button>
                        <button className="text-tanzanian-green hover:text-tanzanian-green/80 mr-4">Edit</button>
                        <button className="text-tanzanian-red hover:text-tanzanian-red/80">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No users found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;
