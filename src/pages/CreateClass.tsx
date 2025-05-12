
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft, Save } from "lucide-react";

const CreateClass = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    capacity: '',
    description: '',
    classTeacher: '',
    academicYear: new Date().getFullYear().toString(),
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
      // In a real app, this would be an API call to create the class
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Class created",
        description: `${formData.name} has been created successfully.`,
      });
      
      navigate('/classes');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                <Label htmlFor="grade">Grade Level*</Label>
                <Select 
                  required
                  onValueChange={(value) => handleSelectChange('grade', value)} 
                  defaultValue={formData.grade}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard 1">Standard 1</SelectItem>
                    <SelectItem value="Standard 2">Standard 2</SelectItem>
                    <SelectItem value="Standard 3">Standard 3</SelectItem>
                    <SelectItem value="Standard 4">Standard 4</SelectItem>
                    <SelectItem value="Standard 5">Standard 5</SelectItem>
                    <SelectItem value="Standard 6">Standard 6</SelectItem>
                    <SelectItem value="Standard 7">Standard 7</SelectItem>
                    <SelectItem value="Form 1">Form 1</SelectItem>
                    <SelectItem value="Form 2">Form 2</SelectItem>
                    <SelectItem value="Form 3">Form 3</SelectItem>
                    <SelectItem value="Form 4">Form 4</SelectItem>
                    <SelectItem value="Form 5">Form 5</SelectItem>
                    <SelectItem value="Form 6">Form 6</SelectItem>
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
                <Label htmlFor="classTeacher">Class Teacher</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('classTeacher', value)} 
                  defaultValue={formData.classTeacher}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Doe">John Doe</SelectItem>
                    <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                    <SelectItem value="Emmanuel Mwenda">Emmanuel Mwenda</SelectItem>
                    <SelectItem value="Grace Makonjo">Grace Makonjo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year*</Label>
              <Select 
                required
                onValueChange={(value) => handleSelectChange('academicYear', value)} 
                defaultValue={formData.academicYear}
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
                  "Creating..."
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
