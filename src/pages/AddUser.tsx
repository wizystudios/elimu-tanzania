
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

const AddUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { schoolId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    phone: '',
    teacherRole: ''
  });

  const userRoles: { value: UserRole, label: string }[] = [
    { value: 'super_admin', label: 'Super Admin 👑' },
    { value: 'admin', label: 'School Admin 🛡️' },
    { value: 'headmaster', label: 'Headmaster 🎓' },
    { value: 'vice_headmaster', label: 'Vice Headmaster 📚' },
    { value: 'academic_teacher', label: 'Academic Teacher 🏆' },
    { value: 'teacher', label: 'Teacher 📖' },
    { value: 'student', label: 'Student 🎒' },
    { value: 'parent', label: 'Parent 👨‍👩‍👧‍👦' },
  ];

  const teacherRoles = [
    { value: 'normal_teacher', label: 'Normal Teacher 📘' },
    { value: 'headmaster', label: 'Headmaster 🧑‍💼' },
    { value: 'vice_headmaster', label: 'Vice Headmaster 🧑‍💼' },
    { value: 'academic_teacher', label: 'Academic Teacher 📚' },
    { value: 'discipline_teacher', label: 'Discipline Teacher 🚨' },
    { value: 'sports_teacher', label: 'Sports Teacher 🏅' },
    { value: 'environment_teacher', label: 'Environment Teacher 🌱' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateDefaultPassword = () => {
    // Use phone number if available, otherwise generate a default password
    return formData.phone || 'ElimuTZ123';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Set default password if not provided
    const password = formData.password || generateDefaultPassword();
    const confirmPassword = formData.confirmPassword || password;

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating user with role:', formData.role);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          phone: formData.phone
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user data returned');
      }

      console.log('User created successfully:', authData.user.id);

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          school_id: schoolId
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      // Create user role
      const roleData: any = {
        user_id: authData.user.id,
        role: formData.role,
        school_id: schoolId,
        is_active: true
      };

      // Add teacher role if it's a teacher
      if (formData.role === 'teacher' || formData.role === 'academic_teacher' || 
          formData.role === 'headmaster' || formData.role === 'vice_headmaster') {
        roleData.teacher_role = formData.teacherRole || 'normal_teacher';
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert(roleData);

      if (roleError) {
        console.error('Role creation error:', roleError);
        throw roleError;
      }

      const passwordMessage = formData.password 
        ? "with the password you specified" 
        : `with password: ${password} (default password used)`;

      toast({
        title: "Success",
        description: `${formData.firstName} ${formData.lastName} has been added successfully. They can now log in with their email and ${passwordMessage}.`
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '' as UserRole | '',
        phone: '',
        teacherRole: ''
      });

      // Navigate back to users list
      navigate('/users');

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTeacherRole = ['teacher', 'academic_teacher', 'headmaster', 'vice_headmaster'].includes(formData.role);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <UserPlus className="h-7 w-7" />
              <span>Add New User</span>
            </h1>
            <p className="text-gray-600">Create a new user account with role-based access</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+255..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password (Optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    minLength={6}
                    placeholder="Leave empty to use phone as password"
                  />
                </div>
                
                {formData.password && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select onValueChange={(value) => handleInputChange('role', value)} required>
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

              {isTeacherRole && (
                <div className="space-y-2">
                  <Label htmlFor="teacherRole">Teacher Specialization</Label>
                  <Select onValueChange={(value) => handleInputChange('teacherRole', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher specialization" />
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

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Password Info:</strong> If no password is provided, the system will use the phone number as the default password (minimum 6 characters). The user can change it after first login.
                </p>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                  Cancel
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
