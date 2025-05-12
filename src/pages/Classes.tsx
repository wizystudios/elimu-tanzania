
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data for classes
const mockClasses = [
  { 
    id: '1', 
    name: 'Class 1A', 
    grade: 'Standard 1', 
    teacher: 'John Doe',
    students: 42,
    subjects: ['Mathematics', 'English', 'Science', 'Social Studies']
  },
  { 
    id: '2', 
    name: 'Class 2B', 
    grade: 'Standard 2',
    teacher: 'Jane Smith',
    students: 38,
    subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Physical Education']
  },
  { 
    id: '3', 
    name: 'Class 3C', 
    grade: 'Standard 3',
    teacher: 'Emmanuel Mwenda',
    students: 45,
    subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Art']
  },
  { 
    id: '4', 
    name: 'Class 4A', 
    grade: 'Standard 4',
    teacher: 'Grace Makonjo',
    students: 39,
    subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Studies']
  }
];

const Classes = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredClasses = mockClasses.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Classes</TabsTrigger>
          <TabsTrigger value="primary">Primary</TabsTrigger>
          <TabsTrigger value="secondary">Secondary</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/classes/${cls.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>{cls.grade}</CardDescription>
                    </div>
                    <Badge>{cls.students} students</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">Class Teacher: {cls.teacher}</p>
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
            ))}
          </div>
        </TabsContent>
        <TabsContent value="primary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredClasses
              .filter(cls => ['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7']
                .some(grade => cls.grade.includes(grade)))
              .map((cls) => (
                <Card key={cls.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/classes/${cls.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cls.name}</CardTitle>
                        <CardDescription>{cls.grade}</CardDescription>
                      </div>
                      <Badge>{cls.students} students</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">Class Teacher: {cls.teacher}</p>
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
            ))}
          </div>
        </TabsContent>
        <TabsContent value="secondary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredClasses
              .filter(cls => ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6']
                .some(grade => cls.grade.includes(grade)))
              .map((cls) => (
                <Card key={cls.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/classes/${cls.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cls.name}</CardTitle>
                        <CardDescription>{cls.grade}</CardDescription>
                      </div>
                      <Badge>{cls.students} students</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">Class Teacher: {cls.teacher}</p>
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
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Classes;
