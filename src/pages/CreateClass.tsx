
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';
import { EducationLevel } from '@/types';

const CreateClass = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { schoolId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    className: '',
    educationLevel: '',
    academicYear: (new Date()).getFullYear().toString(),
    homeroomTeacher: '',
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

  // Generate academic year options
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear + i - 2;
    return {
      value: year.toString(),
      label: `${year}-${year + 1}`,
    };
  });

  // Fetch teachers
  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data: teacherRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          profiles:user_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('school_id', schoolId)
        .eq('role', 'teacher');
        
      if (rolesError) throw rolesError;
      
      return teacherRoles.map(teacher => ({
        id: teacher.user_id,
        name: `${teacher.profiles?.first_name || ''} ${teacher.profiles?.last_name || ''}`.trim(),
      })) || [];
    },
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
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
    
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!formData.className.trim() || !formData.educationLevel || !formData.academicYear) {
        throw new Error("Please fill all required fields");
      }
      
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: formData.className.trim(),
          education_level: formData.educationLevel as EducationLevel,
          academic_year: `${formData.academicYear}-${parseInt(formData.academicYear) + 1}`,
          homeroom_teacher_id: formData.homeroomTeacher || null,
          school_id: schoolId
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Class created successfully"
      });
      
      navigate('/classes');
      
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create New Class</h1>
          <p className="text-gray-600">Add a new class to your school</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
            <CardDescription>
              Fill in the information for the new class
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="className">Class Name</Label>
                  <Input 
                    id="className"
                    name="className"
                    placeholder="e.g., Class 1A, Form 3B"
                    value={formData.className}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <Select
                    value={formData.educationLevel}
                    onValueChange={(value) => handleSelectChange('educationLevel', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select
                    value={formData.academicYear}
                    onValueChange={(value) => handleSelectChange('academicYear', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map(year => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="homeroomTeacher">Homeroom Teacher (Optional)</Label>
                  <Select
                    value={formData.homeroomTeacher}
                    onValueChange={(value) => handleSelectChange('homeroomTeacher', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Select teacher"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {teachers?.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => navigate('/classes')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  'Create Class'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateClass;
