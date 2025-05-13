
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

// Interface for teacher data
interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

const CreateClass = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    education_level: '',
    capacity: '',
    description: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get school ID from local storage or context
      // For now, we'll use a placeholder
      const schoolId = "1"; // Replace with actual school ID logic
      
      // Insert class into Supabase
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: formData.name,
          education_level: formData.education_level,
          academic_year: formData.academic_year,
          homeroom_teacher_id: formData.homeroom_teacher_id || null,
          school_id: schoolId,
          // Note: capacity is not part of our table schema,
          // but we're collecting it in the UI for future use
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Class created",
        description: `${formData.name} has been created successfully.`,
      });
      
      navigate('/classes');
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Map DB education levels to display text
  const educationLevels = [
    { value: 'chekechea', label: 'Pre-School (Chekechea)' },
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

  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/classes')}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Classes
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Class</CardTitle>
          <CardDescription>Fill in the details to create a new class</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name*</Label>
                <Input 
                  id="name"
                  name="name"
                  required
                  placeholder="e.g., Class 1A"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education_level">Grade Level*</Label>
                <Select 
                  required
                  onValueChange={(value) => handleSelectChange('education_level', value)} 
                  defaultValue={formData.education_level}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Class Capacity*</Label>
                <Input 
                  id="capacity"
                  name="capacity"
                  type="number"
                  required
                  min="1"
                  max="100"
                  placeholder="Maximum number of students"
                  value={formData.capacity}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="homeroom_teacher_id">Class Teacher</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('homeroom_teacher_id', value)} 
                  defaultValue={formData.homeroom_teacher_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Assign a teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher: Teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year*</Label>
              <Select 
                required
                onValueChange={(value) => handleSelectChange('academic_year', value)} 
                defaultValue={formData.academic_year}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                placeholder="Additional information about this class"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Class
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClass;
