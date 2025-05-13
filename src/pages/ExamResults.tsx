
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';

const ExamResults = () => {
  const { toast } = useToast();
  const { schoolId, user } = useAuth();
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [marks, setMarks] = useState<number | ''>('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch exams
  const { data: exams, isLoading: loadingExams } = useQuery({
    queryKey: ['exams', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('exams')
        .select(`
          id, 
          title,
          exam_date,
          total_marks,
          passing_score,
          classes(name),
          subjects(name, code)
        `)
        .eq('school_id', schoolId)
        .order('exam_date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch students for the selected exam's class
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students_for_exam', selectedExam],
    queryFn: async () => {
      if (!selectedExam) return [];
      
      // First get the exam to find its class
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('class_id')
        .eq('id', selectedExam)
        .single();
        
      if (examError) throw examError;
      
      // Then get students in that class
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          registration_number,
          profiles:user_id (
            first_name, 
            last_name,
            profile_image
          )
        `)
        .eq('current_class_id', exam.class_id)
        .eq('school_id', schoolId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedExam
  });

  // Fetch existing results for this exam
  const { data: examResults, isLoading: loadingResults, refetch: refetchResults } = useQuery({
    queryKey: ['exam_results', selectedExam],
    queryFn: async () => {
      if (!selectedExam) return [];
      
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          id,
          student_id,
          marks_obtained,
          comments,
          recorded_by,
          updated_at,
          profiles:recorded_by (first_name, last_name)
        `)
        .eq('exam_id', selectedExam);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedExam
  });

  // Find the student's result if it exists
  const findStudentResult = () => {
    if (!examResults || !selectedStudent) return null;
    return examResults.find(result => result.student_id === selectedStudent);
  };

  // Handle record/update result
  const handleRecordResult = async () => {
    if (!selectedExam || !selectedStudent || marks === '') {
      toast({
        title: "Error",
        description: "Please select an exam, student, and enter the marks.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You need to be logged in to record results.",
        variant: "destructive"
      });
      return;
    }
    
    const existingResult = findStudentResult();
    
    try {
      setIsSubmitting(true);
      
      if (existingResult) {
        // Update existing result
        const { error } = await supabase
          .from('exam_results')
          .update({
            marks_obtained: marks,
            comments,
            recorded_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResult.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Exam result updated successfully."
        });
      } else {
        // Create new result
        const { error } = await supabase
          .from('exam_results')
          .insert({
            exam_id: selectedExam,
            student_id: selectedStudent,
            marks_obtained: marks,
            comments,
            recorded_by: user.id
          });
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Exam result recorded successfully."
        });
      }
      
      // Reset form and refresh results
      setMarks('');
      setComments('');
      setSelectedStudent('');
      refetchResults();
      
    } catch (error: any) {
      console.error('Error recording result:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record result. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter students based on search query
  const filteredStudents = students?.filter(student => {
    const fullName = `${student.profiles?.first_name || ''} ${student.profiles?.last_name || ''}`.toLowerCase();
    const regNumber = student.registration_number.toLowerCase();
    
    return fullName.includes(searchQuery.toLowerCase()) || 
           regNumber.includes(searchQuery.toLowerCase());
  });

  // Select a student and populate form if result exists
  const selectStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    
    // Check if result already exists for this student
    const existingResult = examResults?.find(result => result.student_id === studentId);
    
    if (existingResult) {
      setMarks(existingResult.marks_obtained);
      setComments(existingResult.comments || '');
    } else {
      setMarks('');
      setComments('');
    }
  };

  // Get selected exam details
  const selectedExamDetails = exams?.find(exam => exam.id === selectedExam);

  const isLoading = loadingExams || loadingStudents || loadingResults;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Exam Results</h1>
          <p className="text-gray-600">Record and view examination results</p>
        </div>
        
        <Tabs defaultValue="record" className="space-y-4">
          <TabsList>
            <TabsTrigger value="record">Record Results</TabsTrigger>
            <TabsTrigger value="view">View Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="record" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Record Exam Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="exam">Select Exam</Label>
                    <Select
                      value={selectedExam}
                      onValueChange={setSelectedExam}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingExams ? "Loading exams..." : "Select an exam"} />
                      </SelectTrigger>
                      <SelectContent>
                        {exams?.map(exam => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.title} - {exam.subjects?.name} ({format(new Date(exam.exam_date), 'dd/MM/yyyy')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedExamDetails && (
                    <Card className="bg-gray-50">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Subject:</span> {selectedExamDetails.subjects?.name} ({selectedExamDetails.subjects?.code})
                          </div>
                          <div>
                            <span className="font-semibold">Class:</span> {selectedExamDetails.classes?.name}
                          </div>
                          <div>
                            <span className="font-semibold">Date:</span> {format(new Date(selectedExamDetails.exam_date), 'dd MMMM yyyy')}
                          </div>
                          <div>
                            <span className="font-semibold">Total Marks:</span> {selectedExamDetails.total_marks}
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold">Passing Score:</span> {selectedExamDetails.passing_score} ({Math.round((selectedExamDetails.passing_score / selectedExamDetails.total_marks) * 100)}%)
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedExam && (
                    <>
                      <div className="space-y-2">
                        <Label>Search Student</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            className="pl-10" 
                            placeholder="Search by name or registration number" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="border rounded-md h-48 overflow-y-auto">
                        {loadingStudents ? (
                          <div className="flex justify-center items-center h-full">
                            <Spinner className="h-6 w-6" />
                          </div>
                        ) : filteredStudents && filteredStudents.length > 0 ? (
                          <div className="divide-y">
                            {filteredStudents.map(student => {
                              const hasResult = examResults?.some(r => r.student_id === student.id);
                              
                              return (
                                <div 
                                  key={student.id} 
                                  className={`p-3 cursor-pointer flex justify-between items-center hover:bg-gray-50 ${selectedStudent === student.id ? 'bg-blue-50' : ''}`}
                                  onClick={() => selectStudent(student.id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="font-medium">
                                      {student.profiles?.first_name} {student.profiles?.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {student.registration_number}
                                    </div>
                                  </div>
                                  {hasResult && (
                                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      Recorded
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-full text-gray-500">
                            No students found
                          </div>
                        )}
                      </div>
                      
                      {selectedStudent && (
                        <div className="space-y-4 border-t pt-4">
                          <div>
                            <Label htmlFor="marks">Marks Obtained</Label>
                            <Input 
                              id="marks" 
                              type="number" 
                              min="0" 
                              max={selectedExamDetails?.total_marks}
                              value={marks}
                              onChange={(e) => setMarks(e.target.value ? Number(e.target.value) : '')}
                              required
                            />
                            {selectedExamDetails && typeof marks === 'number' && (
                              <div className="text-sm mt-1">
                                {marks >= selectedExamDetails.passing_score ? (
                                  <span className="text-green-600">Passed</span>
                                ) : (
                                  <span className="text-red-600">Failed</span>
                                )} ({Math.round((marks / selectedExamDetails.total_marks) * 100)}%)
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="comments">Comments (Optional)</Label>
                            <Textarea 
                              id="comments" 
                              placeholder="Add comments about the student's performance"
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                            />
                          </div>
                          
                          <Button 
                            onClick={handleRecordResult}
                            disabled={isSubmitting}
                            className="w-full"
                          >
                            {isSubmitting ? "Processing..." : (findStudentResult() ? "Update Result" : "Record Result")}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="view" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>View Exam Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="viewExam">Select Exam</Label>
                    <Select
                      value={selectedExam}
                      onValueChange={setSelectedExam}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingExams ? "Loading exams..." : "Select an exam"} />
                      </SelectTrigger>
                      <SelectContent>
                        {exams?.map(exam => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.title} - {exam.subjects?.name} ({format(new Date(exam.exam_date), 'dd/MM/yyyy')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedExamDetails && (
                    <Card className="bg-gray-50">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Subject:</span> {selectedExamDetails.subjects?.name} ({selectedExamDetails.subjects?.code})
                          </div>
                          <div>
                            <span className="font-semibold">Class:</span> {selectedExamDetails.classes?.name}
                          </div>
                          <div>
                            <span className="font-semibold">Date:</span> {format(new Date(selectedExamDetails.exam_date), 'dd MMMM yyyy')}
                          </div>
                          <div>
                            <span className="font-semibold">Total Marks:</span> {selectedExamDetails.total_marks}
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold">Passing Score:</span> {selectedExamDetails.passing_score} ({Math.round((selectedExamDetails.passing_score / selectedExamDetails.total_marks) * 100)}%)
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="flex flex-col items-center">
                        <Spinner className="h-8 w-8" />
                        <p className="mt-4 text-gray-500">Loading exam data...</p>
                      </div>
                    </div>
                  ) : selectedExam && examResults && (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {examResults.length > 0 
                            ? `Showing ${examResults.length} result${examResults.length > 1 ? 's' : ''}`
                            : 'No results recorded yet'
                          }
                        </div>
                        <div className="text-sm">
                          <Input 
                            className="w-64" 
                            placeholder="Search by name or reg number" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {examResults.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Student</th>
                                <th className="px-4 py-2 text-left">Registration No.</th>
                                <th className="px-4 py-2 text-left">Marks</th>
                                <th className="px-4 py-2 text-left">Percentage</th>
                                <th className="px-4 py-2 text-left">Result</th>
                                <th className="px-4 py-2 text-left">Comments</th>
                                <th className="px-4 py-2 text-left">Recorded By</th>
                              </tr>
                            </thead>
                            <tbody>
                              {examResults.map(result => {
                                const student = students?.find(s => s.id === result.student_id);
                                const percentage = selectedExamDetails 
                                  ? Math.round((result.marks_obtained / selectedExamDetails.total_marks) * 100) 
                                  : 0;
                                const isPassed = selectedExamDetails 
                                  ? result.marks_obtained >= selectedExamDetails.passing_score 
                                  : false;
                                
                                if (!student) return null;
                                
                                // Filter by search query
                                const fullName = `${student.profiles?.first_name || ''} ${student.profiles?.last_name || ''}`.toLowerCase();
                                const regNumber = student.registration_number.toLowerCase();
                                if (searchQuery && !fullName.includes(searchQuery.toLowerCase()) && !regNumber.includes(searchQuery.toLowerCase())) {
                                  return null;
                                }
                                
                                return (
                                  <tr key={result.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                      {student.profiles?.first_name} {student.profiles?.last_name}
                                    </td>
                                    <td className="px-4 py-3">{student.registration_number}</td>
                                    <td className="px-4 py-3">
                                      {result.marks_obtained} / {selectedExamDetails?.total_marks}
                                    </td>
                                    <td className="px-4 py-3">{percentage}%</td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-1 rounded-full text-xs ${isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {isPassed ? 'Passed' : 'Failed'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">{result.comments || '-'}</td>
                                    <td className="px-4 py-3 text-sm">
                                      {result.profiles?.first_name} {result.profiles?.last_name}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No results have been recorded for this exam yet.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ExamResults;
