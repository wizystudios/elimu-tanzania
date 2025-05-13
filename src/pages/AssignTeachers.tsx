import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  teacher_name?: string;
};

const AssignTeachers = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>(new Date().getFullYear().toString());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Get current year and a few prior years for selection
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });
  
  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch teachers with their profiles
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      // First get all users with teacher role
      const { data: teacherRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id')
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
      
      // Combine the teacher IDs with their profiles
      return teacherRoles.map(role => {
        const profile = teacherProfiles?.find(profile => profile.id === role.user_id);
        return {
          id: role.id,
          user_id: role.user_id,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || ''
        };
      });
    }
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
          classes:class_id (name, education_level),
          subjects:subject_id (name, code),
          school_id
        `)
        .eq('academic_year', academicYear);
      
      if (error) throw error;
      
      // Fetch teacher names for each assignment
      const results = await Promise.all(
        (data || []).map(async (assignment) => {
          const { data: teacherRole } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('id', assignment.teacher_id)
            .single();
          
          if (!teacherRole) return assignment;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', teacherRole.user_id)
            .single();
          
          return {
            ...assignment,
            teacher_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Teacher'
          };
        })
      );
      
      return results as TeacherAssignment[];
    }
  });
  
  // Filter subjects based on selected class's education level
  const filteredSubjects = React.useMemo(() => {
    if (!selectedClass || !subjects || !classes) {
      return [];
    }
    
    const selectedClassData = classes.find(c => c.id === selectedClass);
    if (!selectedClassData) {
      return [];
    }
    
    return subjects.filter(subject => 
      subject.applicable_levels.includes(selectedClassData.education_level)
    );
  }, [selectedClass, subjects, classes]);
  
  const handleAssign = async () => {
    if (!selectedTeacher || !selectedClass || !selectedSubject) {
      toast({
        title: "All fields are required",
        description: "Please select a teacher, class, and subject",
        variant: "destructive"
      });
      return;
    }
    
    // Check if this assignment already exists
    const isDuplicate = existingAssignments?.some(assignment => 
      assignment.teacher_id === selectedTeacher && 
      assignment.class_id === selectedClass && 
      assignment.subject_id === selectedSubject
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate assignment",
        description: "This teacher is already assigned to this subject for this class",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('teacher_subjects')
        .insert([{
          teacher_id: selectedTeacher,
          class_id: selectedClass,
          subject_id: selectedSubject,
          academic_year: academicYear,
          // TODO: In production, get school_id from auth context
          school_id: '1'
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Teacher assigned successfully",
        description: "The teacher has been assigned to the selected subject and class"
      });
      
      // Reset form and refresh assignments
      setSelectedTeacher('');
      setSelectedSubject('');
      refetchAssignments();
      
    } catch (error: any) {
      console.error('Error assigning teacher:', error);
      toast({
        title: "Error assigning teacher",
        description: error.message || "Failed to assign teacher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('teacher_subjects')
        .delete()
        .eq('id', assignmentId);
      
      if (error) throw error;
      
      toast({
        title: "Assignment removed",
        description: "The teacher assignment has been removed successfully"
      });
      
      refetchAssignments();
      
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error removing assignment",
        description: error.message || "Failed to remove assignment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Group assignments by class for better display
  const assignmentsByClass = React.useMemo(() => {
    if (!existingAssignments) {
      return {};
    }
    
    return existingAssignments.reduce((acc: Record<string, TeacherAssignment[]>, curr) => {
      const classId = curr.class_id;
      if (!acc[classId]) {
        acc[classId] = [];
      }
      acc[classId].push(curr);
      return acc;
    }, {});
  }, [existingAssignments]);
  
  // Education levels for display formatting
  const getEducationLevelLabel = (level: string): string => {
    if (level.startsWith('darasa')) {
      const classNumber = level.replace('darasa', '');
      return `Standard ${classNumber}`;
    } else if (level.startsWith('form')) {
      const formNumber = level.replace('form', '');
      return `Form ${formNumber}`;
    } else if (level === 'chekechea') {
      return 'Kindergarten';
    }
    return level;
  };
  
  return (
    <MainLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">Assign Teachers to Subjects</h1>
        <p className="text-gray-600 mb-6">Manage teacher assignments for classes and subjects</p>
        
        <Tabs defaultValue="assign" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assign">Make Assignments</TabsTrigger>
            <TabsTrigger value="view">View Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assign">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>New Assignment</CardTitle>
                  <CardDescription>Assign a teacher to a subject for a specific class</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="academic-year">Academic Year</Label>
                    <Select 
                      value={academicYear} 
                      onValueChange={setAcademicYear}
                    >
                      <SelectTrigger id="academic-year" className="mt-1">
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
                  
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select 
                      value={selectedClass} 
                      onValueChange={(value) => {
                        setSelectedClass(value);
                        setSelectedSubject(''); // Reset subject when class changes
                      }}
                    >
                      <SelectTrigger id="class" className="mt-1">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.map(classItem => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.name} ({getEducationLevelLabel(classItem.education_level)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select 
                      value={selectedSubject} 
                      onValueChange={setSelectedSubject}
                      disabled={!selectedClass || filteredSubjects.length === 0}
                    >
                      <SelectTrigger id="subject" className="mt-1">
                        <SelectValue placeholder={
                          !selectedClass 
                            ? "Select a class first" 
                            : filteredSubjects.length === 0 
                              ? "No applicable subjects found" 
                              : "Select a subject"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedClass && filteredSubjects.length === 0 && (
                      <p className="text-amber-500 text-sm mt-1">
                        No subjects found for this education level. Please add applicable subjects first.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="teacher">Teacher</Label>
                    <Select 
                      value={selectedTeacher} 
                      onValueChange={setSelectedTeacher}
                    >
                      <SelectTrigger id="teacher" className="mt-1">
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers?.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleAssign} 
                    disabled={isSubmitting || !selectedClass || !selectedSubject || !selectedTeacher}
                    className="w-full"
                  >
                    {isSubmitting ? 'Assigning...' : 'Assign Teacher'}
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Assignments</CardTitle>
                    <CardDescription>
                      Teachers assigned to subjects for {academicYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {existingAssignments && existingAssignments.length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(assignmentsByClass).map(([classId, assignments]) => {
                          // Get class information from the first assignment
                          const classInfo = assignments[0].classes;
                          
                          return (
                            <div key={classId} className="border rounded-lg p-4">
                              <h3 className="text-lg font-medium mb-2 flex items-center">
                                <Book className="h-5 w-5 mr-2 text-tanzanian-blue" />
                                {classInfo.name} 
                                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  {getEducationLevelLabel(classInfo.education_level)}
                                </Badge>
                              </h3>
                              
                              <div className="space-y-2 mt-3">
                                {assignments.map(assignment => (
                                  <div 
                                    key={assignment.id} 
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                  >
                                    <div className="flex items-center">
                                      <div className="mr-3 h-8 w-8 bg-tanzanian-blue/10 text-tanzanian-blue rounded-full flex items-center justify-center">
                                        <GraduationCap className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <div className="font-medium">
                                          {assignment.subjects.name} ({assignment.subjects.code})
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {assignment.teacher_name}
                                        </div>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleRemoveAssignment(assignment.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Assignments Yet</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          There are no teacher assignments for the selected academic year. Use the form to assign teachers to subjects.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Assignments</CardTitle>
                    <CardDescription>
                      Subject-teacher assignments for academic year {academicYear}
                    </CardDescription>
                  </div>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select year" />
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
              </CardHeader>
              <CardContent>
                {existingAssignments && existingAssignments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left p-3 text-gray-500 font-medium">Class</th>
                          <th className="text-left p-3 text-gray-500 font-medium">Level</th>
                          <th className="text-left p-3 text-gray-500 font-medium">Subject</th>
                          <th className="text-left p-3 text-gray-500 font-medium">Teacher</th>
                          <th className="text-right p-3 text-gray-500 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {existingAssignments.map(assignment => (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="p-3">{assignment.classes.name}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {getEducationLevelLabel(assignment.classes.education_level)}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{assignment.subjects.name}</div>
                              <div className="text-xs text-gray-500">{assignment.subjects.code}</div>
                            </td>
                            <td className="p-3">{assignment.teacher_name}</td>
                            <td className="p-3 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveAssignment(assignment.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Assignments Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      There are no teacher assignments for the selected academic year. Switch to "Make Assignments" tab to create new assignments.
                    </p>
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
