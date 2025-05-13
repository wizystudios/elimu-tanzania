
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { User } from '@/types';
import { Search, Plus, Filter, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define schema for form validation
const userFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phoneNumber: z.string().min(10, { message: "Valid phone number is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { userRole, schoolId } = useAuth();
  
  // Initialize form
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "",
      password: "",
    },
  });

  // Function to fetch real users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        if (!schoolId) {
          console.error("School ID not found");
          return;
        }
        
        // Get roles for the school
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            id, 
            user_id, 
            role, 
            is_active, 
            teacher_role
          `)
          .eq('school_id', schoolId);
          
        if (roleError) {
          throw roleError;
        }
        
        if (!roleData || roleData.length === 0) {
          setUsersList([]);
          return;
        }
        
        // Get profile info for each user
        const userIds = roleData.map(role => role.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone, profile_image')
          .in('id', userIds);
          
        if (profilesError) {
          throw profilesError;
        }
        
        // Combine data
        const combinedUsers = roleData.map(role => {
          const profile = profilesData?.find(p => p.id === role.user_id);
          
          return {
            id: role.user_id,
            firstName: profile?.first_name || "",
            lastName: profile?.last_name || "",
            email: profile?.email || "",
            phoneNumber: profile?.phone || "",
            role: role.role,
            teacherRole: role.teacher_role,
            isActive: role.is_active,
            profileImage: profile?.profile_image || null,
            schoolId,
          };
        });
        
        setUsersList(combinedUsers);
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
                          (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = selectedRole === null || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });
  
  // Function to handle user creation
  const handleCreateUser = async (values: z.infer<typeof userFormSchema>) => {
    try {
      const { firstName, lastName, email, phoneNumber, role, password } = values;
      
      // 1. Create the user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        toast.error("Failed to create user account");
        return;
      }
      
      // 2. Update the profile with additional info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: phoneNumber
        })
        .eq('id', authData.user.id);
        
      if (profileError) throw profileError;
      
      // 3. Create user_role entry
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role,
          school_id: schoolId,
          is_active: true
        });
        
      if (roleError) throw roleError;
      
      toast.success("User created successfully");
      setIsAddUserOpen(false);
      form.reset();
      
      // Refresh the users list
      const newUser: User = {
        id: authData.user.id,
        firstName,
        lastName,
        email,
        phoneNumber,
        role,
        isActive: true,
        schoolId: schoolId || "",
        profileImage: null,
      };
      
      setUsersList(prev => [...prev, newUser]);
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || "Failed to create user");
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage all system users</p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white">
                <UserPlus className="h-5 w-5 mr-2" />
                <span>Add User</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account. The user will receive an email to activate their account.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+255 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">School Admin</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="headmaster">Headmaster</SelectItem>
                            <SelectItem value="vice_headmaster">Vice Headmaster</SelectItem>
                            <SelectItem value="academic_teacher">Academic Teacher</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temporary Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Minimum 6 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create User
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Filter by role:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === null 
                    ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setSelectedRole(null)}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === 'admin' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  Admin
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === 'teacher' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setSelectedRole('teacher')}
                >
                  Teacher
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === 'student' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setSelectedRole('student')}
                >
                  Student
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedRole === 'parent' 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' 
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setSelectedRole('parent')}
                >
                  Parent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tanzanian-blue"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                                {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
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
                <p className="text-gray-500 dark:text-gray-400">No users found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;
