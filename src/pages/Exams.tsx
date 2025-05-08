
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Book, Calendar, FileText, Filter, Plus, Search } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ExamsList } from '@/components/exams/ExamsList';
import { ExamScheduleCalendar } from '@/components/exams/ExamScheduleCalendar';
import { CreateExamForm } from '@/components/exams/CreateExamForm';
import { mockExams } from '@/data/mockExams';
import { EducationLevel, Exam } from '@/types';

const Exams = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<EducationLevel | 'all'>('all');
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => Promise.resolve(mockExams), // In a real app, this would fetch from an API
    staleTime: 5 * 60 * 1000,
  });

  const filteredExams = exams.filter((exam: Exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || exam.educationLevel === filterLevel;
    
    return matchesSearch && matchesLevel;
  });

  const upcomingExams = filteredExams.filter((exam: Exam) => 
    new Date(exam.date) >= new Date()
  ).sort((a: Exam, b: Exam) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const pastExams = filteredExams.filter((exam: Exam) => 
    new Date(exam.date) < new Date()
  ).sort((a: Exam, b: Exam) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const todayExams = filteredExams.filter((exam: Exam) => {
    const examDate = new Date(exam.date);
    const today = new Date();
    return examDate.getDate() === today.getDate() &&
      examDate.getMonth() === today.getMonth() &&
      examDate.getFullYear() === today.getFullYear();
  });

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Exam Management</h1>
            <p className="text-muted-foreground">View and manage school examinations</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Exam
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Create New Examination</SheetTitle>
                </SheetHeader>
                <CreateExamForm />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Examination Schedule</CardTitle>
                  <CardDescription>View and manage upcoming exams</CardDescription>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search exams..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Filter Exams</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Education Level</h3>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant={filterLevel === 'all' ? 'default' : 'outline'}
                              onClick={() => setFilterLevel('all')}
                            >
                              All Levels
                            </Button>
                            <Button
                              size="sm"
                              variant={filterLevel === 'chekechea' ? 'default' : 'outline'}
                              onClick={() => setFilterLevel('chekechea')}
                            >
                              Kindergarten
                            </Button>
                            <Button
                              size="sm"
                              variant={filterLevel === 'darasa1' ? 'default' : 'outline'}
                              onClick={() => setFilterLevel('darasa1')}
                            >
                              Primary
                            </Button>
                            <Button
                              size="sm"
                              variant={filterLevel === 'form1' ? 'default' : 'outline'}
                              onClick={() => setFilterLevel('form1')}
                            >
                              Secondary
                            </Button>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'list' | 'calendar')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    List View
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar View
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                  <div className="space-y-6">
                    <ExamsList exams={upcomingExams} title="Upcoming Exams" isLoading={isLoading} />
                    <ExamsList exams={pastExams} title="Past Exams" isLoading={isLoading} />
                  </div>
                </TabsContent>
                <TabsContent value="calendar">
                  <ExamScheduleCalendar exams={filteredExams} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Today's Exams
                </CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayExams.length > 0 ? (
                  <div className="space-y-4">
                    {todayExams.map((exam) => (
                      <div key={exam.id} className="border-l-4 border-tanzanian-blue pl-4 py-2">
                        <div className="font-medium">{exam.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Book className="h-3.5 w-3.5 mr-1.5" />
                          {exam.subject}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <span className="bg-tanzanian-blue/10 text-tanzanian-blue px-1.5 py-0.5 rounded text-xs">
                            {format(new Date(exam.date), 'hh:mm a')}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="text-xs">{exam.duration} mins</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No exams scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="h-5 w-5 mr-2" />
                  Exam Statistics
                </CardTitle>
                <CardDescription>Overview of examination data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Exams</span>
                    <span className="font-bold">{exams.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Upcoming Exams</span>
                    <span className="font-bold">{upcomingExams.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Today's Exams</span>
                    <span className="font-bold">{todayExams.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Past Exams</span>
                    <span className="font-bold">{pastExams.length}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Generate Reports
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Exams;
