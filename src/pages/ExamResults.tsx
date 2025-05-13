
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Search, User, FileText, ArrowRightLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';

// Define interfaces for students and exams with their relations
interface StudentWithProfile {
  id: string;
  registration_number: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  } | null;
}

interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  comments: string | null;
  recorded_by: string;
  recorder_profile?: {
    first_name?: string;
    last_name?: string;
  } | null;
  student?: StudentWithProfile;
}

const ExamResults = () => {
  const { toast } = useToast();
  const { schoolId } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('view');
  const [resultsData, setResultsData] = useState<Record<string, { marks: string; comments: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch classes
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId)
        .order('name');
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch subjects based on selected class
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects', selectedClass],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      
      // First get the education level of the selected class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('education_level')
        .eq('id', selectedClass)
        .single();
        
      if (classError || !classData) return [];
      
      // Then fetch subjects applicable for this education level
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('school_id', schoolId)
        .contains('applicable_levels', [classData.education_level])
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId
  });
  
  // Fetch exams based on selected class and subject
  const { data: exams, isLoading: loadingExams } = useQuery({
    queryKey: ['exams', selectedClass, selectedSubject],
    queryFn: async () => {
      if (!selectedClass || !selectedSubject || !schoolId) return [];
      
      const { data, error } = await supabase
        .from('exams')
        .select('id, title, exam_date, total_marks')
        .eq('school_id', schoolId)
        .eq('class_id', selectedClass)
        .eq('subject_id', selectedSubject)
        .order('exam_date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!selectedSubject && !!schoolId
  });
  
  // Fetch students in the selected class
  const { data: students, isLoading: loadingStudents } = useQuery<StudentWithProfile[]>({
    queryKey: ['students_in_class', selectedClass],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          registration_number,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('current_class_id', selectedClass)
        .eq('school_id', schoolId)
        .order('registration_number');
        
      if (error) throw error;
      return data as StudentWithProfile[];
    },
    enabled: !!selectedClass && !!schoolId
  });
  
  // Fetch existing exam results
  const { data: examResults, isLoading: loadingResults, refetch: refetchResults } = useQuery<ExamResult[]>({
    queryKey: ['exam_results', selectedExam],
    queryFn: async () => {
      if (!selectedExam) return [];
      
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          id,
          exam_id,
          student_id,
          marks_obtained,
          comments,
          recorded_by,
          recorder_profile:recorded_by (
            first_name,
            last_name
          )
        `)
        .eq('exam_id', selectedExam);
        
      if (error) throw error;
      
      // Prepare data for input fields
      const resultsObject: Record<string, { marks: string; comments: string }> = {};
      data.forEach(result => {
        resultsObject[result.student_id] = {
          marks: result.marks_obtained.toString(),
          comments: result.comments || ''
        };
      });
      setResultsData(resultsObject);
      
      return data as ExamResult[];
    },
    enabled: !!selectedExam
  });
  
  // Fetch exam details
  const { data: examDetails } = useQuery({
    queryKey: ['exam_details', selectedExam],
    queryFn: async () => {
      if (!selectedExam) return null;
      
      const { data, error } = await supabase
        .from('exams')
        .select('title, total_marks, passing_score')
        .eq('id', selectedExam)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!selectedExam
  });
  
  // Handle mark input change
  const handleMarkChange = (studentId: string, value: string) => {
    // Only allow numbers
    const marks = value.replace(/[^0-9]/g, '');
    
    setResultsData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId] || { comments: '' },
        marks
      }
    }));
  };
  
  // Handle comment input change
  const handleCommentChange = (studentId: string, comments: string) => {
    setResultsData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId] || { marks: '' },
        comments
      }
    }));
  };
  
  // Save exam results
  const handleSaveResults = async () => {
    if (!selectedExam || !schoolId) {
      toast({
        title: "Error",
        description: "Please select an exam first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session?.user?.id) {
        throw new Error("User authentication required");
      }
      
      const userId = sessionData.session.user.id;
      
      // Get existing results to determine which to update vs. insert
      const { data: existingResults, error: fetchError } = await supabase
        .from('exam_results')
        .select('id, student_id')
        .eq('exam_id', selectedExam);
        
      if (fetchError) throw fetchError;
      
      const existingMap: Record<string, string> = {};
      existingResults?.forEach(result => {
        existingMap[result.student_id] = result.id;
      });
      
      // Process each student's results
      const operations = [];
      for (const [studentId, data] of Object.entries(resultsData)) {
        if (!data.marks) continue; // Skip if no marks entered
        
        const marks = parseInt(data.marks, 10);
        if (isNaN(marks)) continue; // Skip if marks are not a valid number
        
        if (existingMap[studentId]) {
          // Update existing result
          operations.push(
            supabase
              .from('exam_results')
              .update({
                marks_obtained: marks,
                comments: data.comments || null,
                recorded_by: userId,
              })
              .eq('id', existingMap[studentId])
          );
        } else {
          // Insert new result
          operations.push(
            supabase
              .from('exam_results')
              .insert({
                exam_id: selectedExam,
                student_id: studentId,
                marks_obtained: marks,
                comments: data.comments || null,
                recorded_by: userId,
              })
          );
        }
      }
      
      // Execute all operations
      await Promise.all(operations.map(op => op));
      
      toast({
        title: "Success",
        description: "Exam results have been saved successfully."
      });
      
      // Refresh results data
      refetchResults();
      
    } catch (error: any) {
      console.error('Error saving exam results:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save exam results",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get student result or empty object
  const getStudentResult = (studentId: string) => {
    return resultsData[studentId] || { marks: '', comments: '' };
  };
  
  // Filter students by search query
  const filteredStudents = students?.filter(student => {
    const fullName = `${student.profiles?.first_name || ''} ${student.profiles?.last_name || ''}`.toLowerCase();
    const regNumber = student.registration_number.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || regNumber.includes(query);
  });
  
  // Combine students with their results for the results view tab
  const studentsWithResults = students?.map(student => {
    const result = examResults?.find(r => r.student_id === student.id);
    return {
      ...student,
      result
    };
  }).filter(student => {
    if (!searchQuery) return true;
    
    const fullName = `${student.profiles?.first_name || ''} ${student.profiles?.last_name || ''}`.toLowerCase();
    const regNumber = student.registration_number.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || regNumber.includes(query);
  });
  
  // Loading states
  const isLoadingData = loadingClasses || loadingSubjects || loadingExams || loadingStudents || loadingResults;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Exam Results</h1>
          <p className="text-gray-600">Record and view student examination results</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="class-select">Class</Label>
            <Select
              value={selectedClass}
              onValueChange={(value) => {
                setSelectedClass(value);
                setSelectedSubject('');
                setSelectedExam('');
              }}
            >
              <SelectTrigger>
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
            <Label htmlFor="subject-select">Subject</Label>
            <Select
              value={selectedSubject}
              onValueChange={(value) => {
                setSelectedSubject(value);
                setSelectedExam('');
              }}
              disabled={!selectedClass}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedClass ? "Select subject" : "Select class first"} />
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
            <Label htmlFor="exam-select">Exam</Label>
            <Select
              value={selectedExam}
              onValueChange={setSelectedExam}
              disabled={!selectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedSubject ? "Select exam" : "Select subject first"} />
              </SelectTrigger>
              <SelectContent>
                {exams?.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedExam ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <div className="bg-blue-50 px-4 py-2 rounded-md">
                  <span className="text-sm text-blue-700">Exam: </span>
                  <span className="font-medium">{examDetails?.title}</span>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-md">
                  <span className="text-sm text-green-700">Total Marks: </span>
                  <span className="font-medium">{examDetails?.total_marks}</span>
                </div>
                <div className="bg-amber-50 px-4 py-2 rounded-md">
                  <span className="text-sm text-amber-700">Passing Score: </span>
                  <span className="font-medium">{examDetails?.passing_score}</span>
                </div>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Tabs defaultValue="enter" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="enter">
                  <FileText className="h-4 w-4 mr-2" />
                  Enter Results
                </TabsTrigger>
                <TabsTrigger value="view">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  View Results
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="enter">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Exam Results</CardTitle>
                    <CardDescription>
                      Record marks and comments for each student
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingData ? (
                      <div className="flex justify-center py-10">
                        <div className="flex flex-col items-center">
                          <Spinner className="h-8 w-8" />
                          <p className="mt-4 text-gray-500">Loading student data...</p>
                        </div>
                      </div>
                    ) : filteredStudents && filteredStudents.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left">Reg. No</th>
                              <th className="px-4 py-2 text-left">Student Name</th>
                              <th className="px-4 py-2 text-center">Marks (/{examDetails?.total_marks})</th>
                              <th className="px-4 py-2 text-left">Comments (Optional)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map((student) => {
                              const result = getStudentResult(student.id);
                              return (
                                <tr key={student.id} className="border-b">
                                  <td className="px-4 py-3">{student.registration_number}</td>
                                  <td className="px-4 py-3">
                                    {student.profiles?.first_name || 'Unknown'} {student.profiles?.last_name || 'Student'}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <Input
                                      type="text"
                                      value={result.marks}
                                      onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                      className="w-20 mx-auto text-center"
                                      placeholder="0"
                                      max={examDetails?.total_marks}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <Textarea
                                      value={result.comments}
                                      onChange={(e) => handleCommentChange(student.id, e.target.value)}
                                      placeholder="Add comments (optional)"
                                      className="min-h-0 h-10"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        {searchQuery 
                          ? "No students found matching your search criteria"
                          : "No students found in this class"}
                      </div>
                    )}
                    
                    {filteredStudents && filteredStudents.length > 0 && (
                      <div className="mt-6 flex justify-end">
                        <Button 
                          onClick={handleSaveResults}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>Saving Results...</>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Save Results
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="view">
                <Card>
                  <CardHeader>
                    <CardTitle>View Exam Results</CardTitle>
                    <CardDescription>
                      Overview of student performance in this exam
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingData ? (
                      <div className="flex justify-center py-10">
                        <div className="flex flex-col items-center">
                          <Spinner className="h-8 w-8" />
                          <p className="mt-4 text-gray-500">Loading results data...</p>
                        </div>
                      </div>
                    ) : studentsWithResults && studentsWithResults.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left">Student</th>
                              <th className="px-4 py-2 text-left">Reg. No</th>
                              <th className="px-4 py-2 text-center">Marks</th>
                              <th className="px-4 py-2 text-center">Status</th>
                              <th className="px-4 py-2 text-left">Comments</th>
                              <th className="px-4 py-2 text-left">Recorded By</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentsWithResults.map((student) => (
                              <tr key={student.id} className="border-b">
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                      <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                      {student.profiles?.first_name || 'Unknown'} {student.profiles?.last_name || 'Student'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">{student.registration_number}</td>
                                <td className="px-4 py-3 text-center font-medium">
                                  {student.result ? (
                                    `${student.result.marks_obtained}/${examDetails?.total_marks}`
                                  ) : (
                                    <span className="text-gray-400">No result</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {student.result ? (
                                    student.result.marks_obtained >= (examDetails?.passing_score || 0) ? (
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Pass
                                      </span>
                                    ) : (
                                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Fail
                                      </span>
                                    )
                                  ) : (
                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                      Not recorded
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {student.result?.comments || <span className="text-gray-400">-</span>}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {student.result?.recorder_profile ? (
                                    `${student.result.recorder_profile.first_name || ''} ${student.result.recorder_profile.last_name || ''}`.trim() || 'Unknown'
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        {searchQuery 
                          ? "No students found matching your search criteria"
                          : "No results have been recorded for this exam"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-lg font-medium">Select an Exam</h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  Please select a class, subject, and exam to view or enter exam results
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ExamResults;
