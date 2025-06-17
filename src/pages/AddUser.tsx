
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Class {
  id: string;
  name: string;
  education_level: string;
}

const AddUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { schoolId } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    teacherRole: '',
    classId: '',
    password: ''
  });

  const userRoles = [
    { value: 'admin', label: 'Admin 🛡️' },
    { value: 'headmaster', label: 'Head Master 🎓' },
    { value: 'vice_headmaster', label: 'Vice Head Master 📚' },
    { value: 'academic_teacher', label: 'Academic Teacher 🏆' },
    { value: 'teacher', label: 'Teacher 📖' },
    { value: 'student', label: 'Student 🎒' },
    { value: 'parent', label: 'Parent 👨‍👩‍👧‍👦' },
  ];

  const teacherRoles = [
    { value: 'normal_teacher', label: 'Normal Teacher 📖' },
    { value: 'homeroom_teacher', label: 'Homeroom Teacher 🏠' },
    { value: 'subject_teacher', label: 'Subject Teacher 📚' },
    { value: 'headmaster', label: 'Head Master 🎓' },
    { value: 'vice_headmaster', label: 'Vice Head Master 📚' },
    { value: 'academic_teacher', label: 'Academic Teacher 🏆' },
  ];

  useEffect(() => {
    fetchClasses();
  }, [schoolId]);

  const fetchClasses = async () => {
    if (!schoolId) {
      console.log('No school ID available, skipping class fetch');
      return;
    }

    setIsLoadingClasses(true);
    try {
      console.log('Fetching classes for school:', schoolId);
      
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, education_level')
        .eq('school_id', schoolId)
        .order('name');

      if (error) {
        console.error('Error fetching classes:', error);
        throw error;
      }
      
      console.log('Fetched classes:', data);
      setClasses(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No Classes Found",
          description: "No classes have been created yet. Students will need to be assigned to classes later.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School information is missing",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating user with data:', {
        email: formData.email,
        role: formData.role,
        schoolId: schoolId
      });

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('User created successfully, creating role...');
        
        // Create user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            school_id: schoolId,
            role: formData.role,
            teacher_role: formData.role === 'teacher' ? formData.teacherRole : null,
            is_active: true
          });

        if (roleError) {
          console.error('Role creation error:', roleError);
          throw roleError;
        }

        console.log('Role created successfully, updating profile...');

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: formData.phone,
            school_id: schoolId
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }

        // If student, create student record
        if (formData.role === 'student') {
          console.log('Creating student record...');
          
          const { error: studentError } = await supabase
            .from('students')
            .insert({
              user_id: authData.user.id,
              school_id: schoolId,
              current_class_id: formData.classId || null,
              registration_number: `STU${Date.now()}`,
              gender: 'other', // Default, can be updated later
              date_of_birth: '2000-01-01', // Default, should be updated
              enrollment_date: new Date().toISOString().split('T')[0]
            });

          if (studentError) {
            console.error('Student creation error:', studentError);
            throw studentError;
          }
        }

        toast({
          title: "Success! 🎉",
          description: `${formData.firstName} ${formData.lastName} has been created successfully`
        });

        navigate('/users');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error ❌",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-2 sm:p-4 lg:p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/users" className="flex items-center text-tanzanian-blue hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Users
          </Link>
        </div>

        <Card className="max-w-full sm:max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <span>Add New User</span>
              <span>👤</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Create a new user account for your school system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+255 XXX XXX XXX"
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {userRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'teacher' && (
                <div className="space-y-2">
                  <Label htmlFor="teacherRole">Teacher Role</Label>
                  <Select
                    value={formData.teacherRole}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, teacherRole: value }))}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select teacher role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {teacherRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="classId">Class</Label>
                  {isLoadingClasses ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin h-4 w-4 border-2 border-tanzanian-blue border-t-transparent rounded-full"></div>
                      <span>Loading classes...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.classId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue placeholder="Select a class (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {classes.length > 0 ? (
                          <>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name} ({cls.education_level})
                              </SelectItem>
                            ))}
                            <SelectItem value="other">No Class (Assign Later)</SelectItem>
                          </>
                        ) : (
                          <SelectItem value="other">
                            No classes available - Create classes first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-gray-500">
                    {classes.length === 0 ? 
                      "No classes have been created yet. Student can be assigned to a class later." :
                      "Select a class for the student or leave empty to assign later."
                    }
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/users')}
                  className="text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                >
                  {isLoading ? 'Creating... ⏳' : 'Create User 🎉'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AddUser;
