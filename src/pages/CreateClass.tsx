
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const CreateClass = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    education_level: '',
    homeroom_teacher_id: '',
    academic_year: new Date().getFullYear().toString(),
  });

  // Fetch teachers for the dropdown - Fix the query to correctly join tables
  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      // First get all users with teacher role
      const { data: teacherRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher');

      if (rolesError) throw rolesError;
      
      if (!teacherRoles || teacherRoles.length === 0) {
        return [];
      }
      
      // Then get teacher profile information using the user_ids
      const teacherIds = teacherRoles.map(role => role.user_id);
      
      const { data: teacherProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', teacherIds);
        
      if (profilesError) throw profilesError;
      
      // Return the teacher profiles with necessary information
      return teacherProfiles || [];
    }
  });

  // Education level options
  const educationLevels = [
    { value: 'chekechea', label: 'Kindergarten' },
    { value: 'darasa1', label: 'Standard 1' },
    { value: 'darasa2', label: 'Standard 2' },
    { value: 'darasa3', label: 'Standard 3' },
    { value: 'darasa4', label: 'Standard 4' },
    { value: 'darasa5', label: 'Standard 5' },
    { value: 'darasa6', label: 'Standard 6' },
    { value: 'darasa7', label: 'Standard 7' },
    { value: 'form1', label: 'Form 1' },
    { value: 'form2', label: 'Form 2' },
    { value: 'form3', label: 'Form 3' },
    { value: 'form4', label: 'Form 4' },
    { value: 'form5', label: 'Form 5' },
    { value: 'form6', label: 'Form 6' },
  ];

  // Academic years options (current year and 4 previous years)
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.education_level) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Insert the new class into Supabase
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          name: formData.name,
          education_level: formData.education_level,
          academic_year: formData.academic_year,
          homeroom_teacher_id: formData.homeroom_teacher_id || null,
          // We'll get school_id from the authenticated user's context in a real implementation
          school_id: "1" // This should come from auth context in production
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Class created successfully",
      });
      
      // Redirect to the classes listing page
      navigate('/classes');
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Create New Class</h1>
        <p className="text-gray-600 mb-6">Add a new class to your school</p>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="name">Class Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Class 1A, Form 2B"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="education_level">Education Level <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.education_level}
                  onValueChange={(value) => handleChange('education_level', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="academic_year">Academic Year <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.academic_year}
                  onValueChange={(value) => handleChange('academic_year', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="homeroom_teacher_id">Class Teacher</Label>
                <Select
                  value={formData.homeroom_teacher_id}
                  onValueChange={(value) => handleChange('homeroom_teacher_id', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Select class teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No teacher assigned</SelectItem>
                    {teachers && teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/classes')}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Class
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateClass;
