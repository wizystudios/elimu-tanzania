
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Exam } from '@/types';

// Importing components with named imports (fixed import syntax)
import { ExamsList } from '@/components/exams/ExamsList';
import { ExamScheduleCalendar } from '@/components/exams/ExamScheduleCalendar';
import CreateExamForm from '@/components/exams/CreateExamForm';

const Exams = () => {
  const { data: examsData, isLoading, refetch } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      // Fetch exams from Supabase
      const { data, error } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          description,
          exam_date,
          duration,
          passing_score,
          total_marks,
          subjects:subject_id (name),
          classes:class_id (
            education_level,
            name
          )
        `)
        .order('exam_date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match our Exam type
      return data?.map(exam => {
        // Determine status based on date
        const examDate = new Date(exam.exam_date);
        const now = new Date();
        const daysDiff = Math.floor((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: 'scheduled' | 'in_progress' | 'completed' = 'scheduled';
        if (daysDiff < 0) {
          status = 'completed';
        } else if (daysDiff === 0) {
          status = 'in_progress';
        }
        
        return {
          id: exam.id,
          title: exam.title,
          subject: exam.subjects?.name || 'Unknown Subject',
          educationLevel: exam.classes?.education_level || 'unknown',
          date: exam.exam_date,
          duration: exam.duration,
          status,
          totalMarks: exam.total_marks,
          passingScore: exam.passing_score,
          description: exam.description || ''
        } as Exam;
      }) || [];
    }
  });

  const handleExamCreated = () => {
    refetch();
  };

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Examinations</h1>
            <p className="text-gray-600">Manage and schedule examinations</p>
          </div>
          <Button asChild>
            <a href="#create-exam">Create New Exam</a>
          </Button>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="create">Create Exam</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <ExamsList exams={examsData || []} isLoading={isLoading} title="All Examinations" />
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-4">
            <ExamScheduleCalendar exams={examsData || []} />
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4" id="create-exam">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Create New Examination</h2>
              <CreateExamForm onExamCreated={handleExamCreated} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Exams;
