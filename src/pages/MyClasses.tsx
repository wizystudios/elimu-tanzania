import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Book, 
  Users, 
  Calendar, 
  FileText, 
  Clock,
  GraduationCap,
  MessageSquare,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ClassData {
  id: string;
  name: string;
  education_level: string;
  academic_year: string;
  student_count?: number;
  subjects?: {
    id: string;
    name: string;
    code: string;
  }[];
}

const MyClasses = () => {
  const { user, schoolId } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch teacher's classes
  const { data: classes, isLoading } = useQuery({
    queryKey: ['teacher_classes', user?.id, schoolId],
    queryFn: async () => {
      if (!user || !schoolId) return [];

      // Get classes where user is homeroom teacher
      const { data: homeroomClasses, error: homeroomError } = await supabase
        .from('classes')
        .select('*')
        .eq('homeroom_teacher_id', user.id)
        .eq('school_id', schoolId);

      if (homeroomError) {
        console.error('Error fetching homeroom classes:', homeroomError);
      }

      // Get classes where user teaches subjects
      const { data: teacherSubjects, error: subjectsError } = await supabase
        .from('teacher_subjects')
        .select(`
          class_id,
          classes:class_id (
            id,
            name,
            education_level,
            academic_year
          ),
          subjects:subject_id (
            id,
            name,
            code
          )
        `)
        .eq('teacher_id', user.id)
        .eq('school_id', schoolId);

      if (subjectsError) {
        console.error('Error fetching teacher subjects:', subjectsError);
      }

      // Combine and deduplicate classes
      const allClassIds = new Set();
      const combinedClasses: ClassData[] = [];

      // Add homeroom classes
      homeroomClasses?.forEach(cls => {
        if (!allClassIds.has(cls.id)) {
          allClassIds.add(cls.id);
          combinedClasses.push({
            ...cls,
            subjects: []
          });
        }
      });

      // Add subject classes and merge subjects
      teacherSubjects?.forEach(ts => {
        const classData = Array.isArray(ts.classes) ? ts.classes[0] : ts.classes;
        const subjectData = Array.isArray(ts.subjects) ? ts.subjects[0] : ts.subjects;
        
        if (classData && subjectData) {
          const existingClass = combinedClasses.find(c => c.id === classData.id);
          if (existingClass) {
            if (!existingClass.subjects) existingClass.subjects = [];
            existingClass.subjects.push(subjectData);
          } else if (!allClassIds.has(classData.id)) {
            allClassIds.add(classData.id);
            combinedClasses.push({
              ...classData,
              subjects: [subjectData]
            });
          }
        }
      });

      // Get student counts for each class
      for (const cls of combinedClasses) {
        const { count, error: countError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('current_class_id', cls.id)
          .eq('school_id', schoolId);

        if (!countError) {
          cls.student_count = count || 0;
        }
      }

      return combinedClasses;
    },
    enabled: !!user && !!schoolId
  });

  const getEducationLevelBadgeColor = (level: string) => {
    if (level === 'chekechea') {
      return 'bg-amber-100 text-amber-800';
    } else if (level.startsWith('darasa')) {
      return 'bg-green-100 text-green-800';
    } else if (['form1', 'form2', 'form3', 'form4'].includes(level)) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-purple-100 text-purple-800';
    }
  };

  const getEducationLevelLabel = (level: string) => {
    const levelMap: Record<string, string> = {
      'chekechea': 'Kindergarten',
      'darasa1': 'Standard 1',
      'darasa2': 'Standard 2',
      'darasa3': 'Standard 3',
      'darasa4': 'Standard 4',
      'darasa5': 'Standard 5',
      'darasa6': 'Standard 6',
      'darasa7': 'Standard 7',
      'form1': 'Form 1',
      'form2': 'Form 2',
      'form3': 'Form 3',
      'form4': 'Form 4',
      'form5': 'Form 5',
      'form6': 'Form 6',
    };
    return levelMap[level] || level;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Book className="h-7 w-7" />
            <span>My Classes</span>
          </h1>
          <p className="text-gray-600">Manage your assigned classes and subjects</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tanzanian-blue"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes && classes.length > 0 ? (
                  classes.map((classItem) => (
                    <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{classItem.name}</CardTitle>
                          <Badge className={getEducationLevelBadgeColor(classItem.education_level)}>
                            {getEducationLevelLabel(classItem.education_level)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Academic Year: {classItem.academic_year}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{classItem.student_count || 0} Students</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Book className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{classItem.subjects?.length || 0} Subjects</span>
                          </div>
                        </div>

                        {classItem.subjects && classItem.subjects.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Subjects I Teach:</h4>
                            <div className="flex flex-wrap gap-1">
                              {classItem.subjects.map((subject, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {subject.name} ({subject.code})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2 pt-2">
                          <Button size="sm" asChild>
                            <Link to={`/classes/${classItem.id}/attendance`}>
                              <Clock className="h-3 w-3 mr-1" />
                              Attendance
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/classes/${classItem.id}/grades`}>
                              <GraduationCap className="h-3 w-3 mr-1" />
                              Grades
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-sm">
                    <Book className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">You don't have any classes assigned yet.</p>
                    <p className="text-sm text-gray-400">
                      Contact your administrator to get classes assigned to you.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Class Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Class scheduling feature coming soon!</p>
                  <p className="text-sm text-gray-400">
                    You'll be able to view and manage your class timetables here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Assignments</span>
                  </div>
                  <Button size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Create Assignment
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Assignment management feature coming soon!</p>
                  <p className="text-sm text-gray-400">
                    You'll be able to create and manage assignments for your classes here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MyClasses;