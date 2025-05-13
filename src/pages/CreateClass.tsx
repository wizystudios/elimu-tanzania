
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// Define education levels
const EDUCATION_LEVELS = [
  { value: 'chekechea', label: 'Chekechea (Kindergarten)' },
  { value: 'darasa1', label: 'Darasa la 1 (Grade 1)' },
  { value: 'darasa2', label: 'Darasa la 2 (Grade 2)' },
  { value: 'darasa3', label: 'Darasa la 3 (Grade 3)' },
  { value: 'darasa4', label: 'Darasa la 4 (Grade 4)' },
  { value: 'darasa5', label: 'Darasa la 5 (Grade 5)' },
  { value: 'darasa6', label: 'Darasa la 6 (Grade 6)' },
  { value: 'darasa7', label: 'Darasa la 7 (Grade 7)' },
  { value: 'form1', label: 'Kidato cha 1 (Form 1)' },
  { value: 'form2', label: 'Kidato cha 2 (Form 2)' },
  { value: 'form3', label: 'Kidato cha 3 (Form 3)' },
  { value: 'form4', label: 'Kidato cha 4 (Form 4)' },
  { value: 'form5', label: 'Kidato cha 5 (Form 5)' },
  { value: 'form6', label: 'Kidato cha 6 (Form 6)' }
];

interface TeacherWithProfile {
  user_id: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  } | null;
}

const CreateClass = () => {
  const { schoolId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [className, setClassName] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [academicYear, setAcademicYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [homeroomTeacher, setHomeroomTeacher] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate academic years (current year-1 to current year+3)
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear + i - 1;
    return `${year}-${year + 1}`;
  });
  
  // Fetch teachers
  const { data: teachers } = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('school_id', schoolId)
        .eq('role', 'teacher');
        
      if (error) throw error;
      
      // TypeScript assertion to help with type safety
      const typedTeacherRoles = data as TeacherWithProfile[];
      
      return typedTeacherRoles
        .filter(teacher => teacher.profiles)
        .map(teacher => ({
          id: teacher.user_id,
          name: `${teacher.profiles?.first_name || ''} ${teacher.profiles?.last_name || ''}`.trim() || 'Unknown Teacher',
        })) || [];
    },
  });
  
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
    
    if (!className || !educationLevel || !academicYear) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: className,
          education_level: educationLevel,
          academic_year: academicYear,
          homeroom_teacher_id: homeroomTeacher || null,
          school_id: schoolId
        })
        .select('id')
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Class ${className} has been created successfully.`,
      });
      
      navigate('/classes');
      
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create class. Please try again.",
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
            <CardDescription>Enter the information for the new class</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="className">Class Name</Label>
                  <Input
                    id="className"
                    placeholder="e.g., 1A, Form 1 East"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <Select
                    value={educationLevel}
                    onValueChange={setEducationLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
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
                    value={academicYear}
                    onValueChange={setAcademicYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="homeroomTeacher">Homeroom Teacher (Optional)</Label>
                  <Select
                    value={homeroomTeacher}
                    onValueChange={setHomeroomTeacher}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {teachers?.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Class'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateClass;
