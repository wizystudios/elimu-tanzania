
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Book, Check } from 'lucide-react';

// Define types for the assignment data
type TeacherAssignment = {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  academic_year: string;
  classes: { name: string; education_level: string };
  subjects: { name: string; code: string };
  school_id: string;
  teacher_name: string;
};

const AssignTeachers = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { schoolId } = useAuth();
  
  // Generate academic years (current year -1 to current year +3)
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear + i - 1;
    return `${year}-${year + 1}`;
  });
  
  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, education_level')
        .eq('school_id', schoolId)
        .order('name');
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects', schoolId, selectedClass],
    queryFn: async () => {
      if (!schoolId) return [];
      
      let query = supabase
        .from('subjects')
        .select('id, name, code, applicable_levels')
        .eq('school_id', schoolId);
      
      // If a class is selected, filter by applicable education level
      if (selectedClass && classes) {
        const selectedClassData = classes.find(c => c.id === selectedClass);
        if (selectedClassData) {
          query = query.contains('applicable_levels', [selectedClassData.education_level]);
        }
      }
      
      const { data, error } = await query.order('name');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId
  });
  
  // Fetch teachers
  const { data: teachers } = useQuery({
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
      
      // Filter out any teachers without profile information
      return teacherRoles
        .filter(teacher => teacher.profiles)
        .map(teacher => ({
          id: teacher.user_id,
          name: `${teacher.profiles?.first_name || ''} ${teacher.profiles?.last_name || ''}`.trim(),
        })) || [];
    },
  });
  
  // Fetch existing teacher-subject assignments
  const { data: existingAssignments, refetch: refetchAssignments } = useQuery<TeacherAssignment[]>({
    queryKey: ['teacher_subjects', academicYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_subjects')
        .select(`
          id,
          teacher_id,
          class_id,
          subject_id,
          academic_year,
          classes (
            name,
            education_level
          ),
          subjects (
            name,
            code
          ),
          school_id
        `)
        .eq('school_id', schoolId)
        .eq('academic_year', academicYear);
      
      if (error) throw error;
      
      // Add teacher names to the results
      const results = await Promise.all(
        data.map(async (assignment) => {
          // Get teacher name
          const { data: teacherData, error: teacherError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', assignment.teacher_id)
            .single();
          
          if (teacherError || !teacherData) {
            return {
              ...assignment,
              teacher_name: 'Unknown Teacher'
            };
          }
          
          return {
            ...assignment,
            teacher_name: `${teacherData.first_name} ${teacherData.last_name}`
          };
        })
      );
      
      return results as TeacherAssignment[];
    }
  });
  
  // Filter subjects when class changes
  useEffect(() => {
    setSelectedSubject('');
  }, [selectedClass]);
  
  // Handle assignment creation
  const handleAssign = async () => {
    if (!selectedClass || !selectedSubject || !selectedTeacher) {
      toast({
        title: "Missing Fields",
        description: "Please select a class, subject, and teacher to make an assignment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School information is missing",
        variant: "destructive"
      });
      return;
    }
    
    // Check if assignment already exists
    const existingAssignment = existingAssignments?.find(
      a => a.class_id === selectedClass && a.subject_id === selectedSubject
    );
    
    if (existingAssignment) {
      if (existingAssignment.teacher_id === selectedTeacher) {
        toast({
          title: "Already Assigned",
          description: "This teacher is already assigned to this subject for the selected class.",
        });
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      if (existingAssignment) {
        // Update existing assignment
        const { error: updateError } = await supabase
          .from('teacher_subjects')
          .update({
            teacher_id: selectedTeacher,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAssignment.id);
          
        if (updateError) throw updateError;
        
        toast({
          title: "Assignment Updated",
          description: "Teacher assignment has been updated successfully."
        });
      } else {
        // Create new assignment
        const { error: insertError } = await supabase
          .from('teacher_subjects')
          .insert({
            school_id: schoolId,
            class_id: selectedClass,
            subject_id: selectedSubject,
            teacher_id: selectedTeacher,
            academic_year: academicYear
          });
          
        if (insertError) throw insertError;
        
        toast({
          title: "Assignment Created",
          description: "Teacher has been assigned to the subject successfully."
        });
      }
      
      // Refresh assignments data
      await refetchAssignments();
      
      // Reset selection
      setSelectedSubject('');
      setSelectedTeacher('');
      
    } catch (error: any) {
      console.error('Error assigning teacher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get class subject assignments
  const getClassAssignments = (classId: string) => {
    if (!existingAssignments) return [];
    return existingAssignments.filter(a => a.class_id === classId);
  };
  
  // Group assignments by class
  const assignmentsByClass = () => {
    if (!existingAssignments || !classes) return {};
    
    return existingAssignments.reduce((acc: Record<string, TeacherAssignment[]>, curr) => {
      const classId = curr.class_id;
      if (!acc[classId]) {
        acc[classId] = [];
      }
      acc[classId].push(curr);
      return acc;
    }, {});
  };
  
  // Filter classes by search query
  const filteredClasses = classes?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assign Teachers to Subjects</h1>
          <p className="text-gray-600">Manage teacher assignments for classes and subjects</p>
        </div>
        
        <Tabs defaultValue="assign" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assign">Create Assignment</TabsTrigger>
            <TabsTrigger value="view">View Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assign" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Assignment</CardTitle>
                <CardDescription>
                  Assign teachers to subjects for the selected academic year
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Select
                      value={academicYear}
                      onValueChange={setAcademicYear}
                    >
                      <SelectTrigger id="academicYear">
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
                    <Label htmlFor="class">Class</Label>
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                    >
                      <SelectTrigger id="class">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={selectedSubject}
                      onValueChange={setSelectedSubject}
                      disabled={!selectedClass}
                    >
                      <SelectTrigger id="subject">
                        <SelectValue placeholder={selectedClass ? "Select subject" : "Select a class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teacher">Teacher</Label>
                    <Select
                      value={selectedTeacher}
                      onValueChange={setSelectedTeacher}
                      disabled={!selectedSubject}
                    >
                      <SelectTrigger id="teacher">
                        <SelectValue placeholder={selectedSubject ? "Select teacher" : "Select a subject first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers?.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Current Assignment</h3>
                  {selectedClass && selectedSubject ? (
                    <div className="bg-gray-50 p-4 rounded-md">
                      {(() => {
                        const existingAssignment = existingAssignments?.find(
                          a => a.class_id === selectedClass && a.subject_id === selectedSubject
                        );
                        
                        if (existingAssignment) {
                          return (
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">
                                  {existingAssignment.subjects.name} is currently taught by:
                                </span>
                                <span className="ml-2 text-tanzanian-blue">
                                  {existingAssignment.teacher_name}
                                </span>
                              </div>
                              {selectedTeacher && (
                                <span className="text-sm text-gray-600">
                                  This will override the current assignment
                                </span>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-gray-600">
                              No teacher is currently assigned to this subject for the selected class
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md text-gray-500">
                      Select a class and subject to see the current assignment
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  disabled={!selectedClass || !selectedSubject || !selectedTeacher || isSubmitting}
                  onClick={handleAssign}
                >
                  {isSubmitting ? "Processing..." : "Assign Teacher"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="view" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>View Assignments</CardTitle>
                <CardDescription>
                  Current teacher assignments for {academicYear} academic year
                </CardDescription>
                <div className="pt-4">
                  <Input
                    placeholder="Search classes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {filteredClasses && filteredClasses.length > 0 ? (
                  filteredClasses.map(classItem => {
                    const assignments = getClassAssignments(classItem.id);
                    
                    return (
                      <Card key={classItem.id} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 py-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Book className="h-5 w-5" />
                            {classItem.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {assignments.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="px-4 py-2 text-left">Subject</th>
                                    <th className="px-4 py-2 text-left">Code</th>
                                    <th className="px-4 py-2 text-left">Teacher</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {assignments.map(assignment => (
                                    <tr key={assignment.id} className="border-b">
                                      <td className="px-4 py-3">{assignment.subjects.name}</td>
                                      <td className="px-4 py-3">{assignment.subjects.code}</td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center">
                                          <div className="h-8 w-8 rounded-full bg-tanzanian-blue/10 flex items-center justify-center text-tanzanian-blue mr-2">
                                            <GraduationCap className="h-4 w-4" />
                                          </div>
                                          {assignment.teacher_name}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" className="h-8">Change</Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              No subjects assigned to teachers for this class
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    {searchQuery ? "No classes found matching your search" : "No classes available"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AssignTeachers;
