
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const EDUCATION_LEVELS = [
  { value: 'kindergarten', label: 'Chekechea' },
  { value: 'primary', label: 'Shule ya Msingi' },
  { value: 'secondary', label: 'Shule ya Sekondari' },
  { value: 'advanced', label: 'Kidato cha Tano na Sita' },
];

interface Teacher {
  id: string;
  name: string;
}

// Add interface for profile data
interface ProfileData {
  first_name: string;
  last_name: string;
}

const CreateClass = () => {
  const [className, setClassName] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const { schoolId } = useAuth();
  
  useEffect(() => {
    fetchTeachers();
  }, []);
  
  const fetchTeachers = async () => {
    try {
      if (!schoolId) return;
      
      // Modify the query to correctly join with the profiles table
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          profiles:user_id (first_name, last_name)
        `)
        .eq('role', 'teacher')
        .eq('school_id', schoolId);
        
      if (error) throw error;
      
      if (data) {
        const formattedTeachers = data.map(teacher => {
          // Safely access profile data with proper type checking
          const profile = teacher.profiles as ProfileData | null;
          
          return {
            id: teacher.user_id,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown Teacher',
          };
        });
        
        setTeachers(formattedTeachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!className || !educationLevel || !academicYear) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (!schoolId) {
      toast.error('School ID is missing');
      return;
    }
    
    setLoading(true);
    
    try {
      // Insert class data
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: className,
          education_level: educationLevel,
          academic_year: academicYear,
          school_id: schoolId,
          homeroom_teacher_id: teacherId === 'none' ? null : teacherId || null,
        })
        .select();
        
      if (error) throw error;
      
      toast.success('Class created successfully');
      
      // Reset form
      setClassName('');
      setEducationLevel('');
      setAcademicYear('');
      setTeacherId('');
      
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast.error(`Failed to create class: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const currentYear = new Date().getFullYear();
  const academicYears = [];
  for (let i = -1; i <= 3; i++) {
    const year = currentYear + i;
    academicYears.push(`${year}/${year + 1}`);
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ongeza Darasa Jipya</h1>
          <p className="text-gray-600">Create a new class for your school</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
            <CardDescription>
              Enter the details for the new class
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Class Name*</Label>
                  <Input
                    id="className"
                    placeholder="e.g. Form 1A or Standard 3"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level*</Label>
                  <Select value={educationLevel} onValueChange={setEducationLevel} required>
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
                  <Label htmlFor="academicYear">Academic Year*</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear} required>
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
                  <Label htmlFor="homeRoomTeacher">Homeroom Teacher</Label>
                  <Select value={teacherId} onValueChange={setTeacherId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
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
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Class"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateClass;
