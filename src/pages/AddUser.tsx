
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
    if (!schoolId) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, education_level')
        .eq('school_id', schoolId);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
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

    setIsLoading(true);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      });

      if (authError) throw authError;

      if (authData.user) {
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

        if (roleError) throw roleError;

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: formData.phone,
            school_id: schoolId
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        // If student, create student record
        if (formData.role === 'student' && formData.classId) {
          const { error: studentError } = await supabase
            .from('students')
            .insert({
              user_id: authData.user.id,
              school_id: schoolId,
              current_class_id: formData.classId,
              registration_number: `STU${Date.now()}`,
              gender: 'other', // Default, can be updated later
              date_of_birth: '2000-01-01', // Default, should be updated
              enrollment_date: new Date().toISOString().split('T')[0]
            });

          if (studentError) throw studentError;
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
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/users" className="flex items-center text-tanzanian-blue hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Users
          </Link>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Add New User</span>
              <span>👤</span>
            </CardTitle>
            <CardDescription>
              Create a new user account for your school system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+255 XXX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher role" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.length > 0 ? (
                        classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.education_level})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="other" disabled>
                          No classes available - Create classes first
                        </SelectItem>
                      )}
                      <SelectItem value="other">Other (Manual Assignment Later)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
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
