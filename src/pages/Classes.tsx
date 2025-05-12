
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

// Define the class type with subjects and teacher data
interface ClassWithDetails {
  id: string;
  name: string;
  education_level: string;
  academic_year: string;
  homeroom_teacher?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  subjects: string[];
  student_count: number;
}

const fetchClasses = async (): Promise<ClassWithDetails[]> => {
  // Fetch classes with teacher details
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select(`
      id, 
      name, 
      education_level, 
      academic_year, 
      homeroom_teacher_id, 
      school_id
    `);

  if (classesError) {
    console.error('Error fetching classes:', classesError);
    throw new Error(classesError.message);
  }

  // If no classes found, return empty array
  if (!classes || classes.length === 0) {
    return [];
  }

  // Get teachers information
  const teacherIds = classes
    .map(cls => cls.homeroom_teacher_id)
    .filter(Boolean) as string[];

  const { data: teachers, error: teachersError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', teacherIds);

  if (teachersError) {
    console.error('Error fetching teachers:', teachersError);
    throw new Error(teachersError.message);
  }

  // Get subjects for each class
  // In a real scenario, you would fetch this from a class_subjects junction table
  // For now, we'll fetch all subjects
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name');

  if (subjectsError) {
    console.error('Error fetching subjects:', subjectsError);
    throw new Error(subjectsError.message);
  }

  // Count students per class
  const studentCountPromises = classes.map(async (cls) => {
    const { count, error } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('current_class_id', cls.id);
    
    return { classId: cls.id, count: count || 0, error };
  });

  const studentCounts = await Promise.all(studentCountPromises);

  // Combine all data
  return classes.map(cls => {
    // Find the teacher for this class
    const teacher = teachers?.find(t => t.id === cls.homeroom_teacher_id);
    
    // Get random subjects for demo purposes
    // In a real app, you would fetch the actual subjects assigned to each class
    const classSubjects = subjects 
      ? subjects
          .sort(() => 0.5 - Math.random())
          .slice(0, 4 + Math.floor(Math.random() * 3))
          .map(s => s.name)
      : [];
    
    // Get student count
    const studentCount = studentCounts.find(sc => sc.classId === cls.id)?.count || 0;

    return {
      id: cls.id,
      name: cls.name,
      education_level: cls.education_level,
      academic_year: cls.academic_year,
      homeroom_teacher: teacher ? {
        id: teacher.id,
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        email: teacher.email
      } : undefined,
      subjects: classSubjects,
      student_count: studentCount
    };
  });
};

const Classes = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch classes using React Query
  const { data: classes, isLoading, error } = useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses
  });

  const filteredClasses = classes?.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.education_level.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.homeroom_teacher && 
      `${cls.homeroom_teacher.first_name} ${cls.homeroom_teacher.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  // Helper function to determine if a class is primary or secondary
  const isPrimary = (educationLevel: string) => {
    return ['darasa1', 'darasa2', 'darasa3', 'darasa4', 'darasa5', 'darasa6', 'darasa7', 'Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7']
      .some(level => educationLevel.includes(level));
  };

  const isSecondary = (educationLevel: string) => {
    return ['form1', 'form2', 'form3', 'form4', 'form5', 'form6', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6']
      .some(level => educationLevel.includes(level));
  };

  // Format education level for display
  const formatEducationLevel = (level: string) => {
    // Convert DB format (e.g., darasa1) to display format (e.g., Standard 1)
    if (level.startsWith('darasa')) {
      const number = level.replace('darasa', '');
      return `Standard ${number}`;
    } else if (level.startsWith('form')) {
      const number = level.replace('form', '');
      return `Form ${number}`;
    }
    return level;
  };

  // Render the class card
  const renderClassCard = (cls: ClassWithDetails) => (
    <Card key={cls.id} className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/classes/${cls.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{cls.name}</CardTitle>
            <CardDescription>{formatEducationLevel(cls.education_level)}</CardDescription>
          </div>
          <Badge>{cls.student_count} students</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">
          Class Teacher: {cls.homeroom_teacher 
            ? `${cls.homeroom_teacher.first_name} ${cls.homeroom_teacher.last_name}` 
            : 'Not assigned'}
        </p>
        <Separator className="my-2" />
        <div>
          <p className="text-sm font-medium mb-1">Subjects:</p>
          <div className="flex flex-wrap gap-1">
            {cls.subjects.map((subject, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="container p-6 mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>Error loading classes: {(error as Error).message}</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Classes Management</h1>
        <Button onClick={() => navigate('/classes/create')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Class
        </Button>
      </div>
      
      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading classes...</span>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Classes</TabsTrigger>
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="secondary">Secondary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredClasses.map(renderClassCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No classes found. Create your first class to get started.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="primary" className="space-y-4">
            {filteredClasses.filter(cls => isPrimary(cls.education_level)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredClasses
                  .filter(cls => isPrimary(cls.education_level))
                  .map(renderClassCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No primary classes found.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="secondary" className="space-y-4">
            {filteredClasses.filter(cls => isSecondary(cls.education_level)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredClasses
                  .filter(cls => isSecondary(cls.education_level))
                  .map(renderClassCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No secondary classes found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Classes;
