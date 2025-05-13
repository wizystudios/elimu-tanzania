
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateExamFormProps {
  onExamCreated?: () => void;
}

const CreateExamForm = ({ onExamCreated }: CreateExamFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    class_id: '',
    exam_date: '',
    exam_time: '09:00',
    duration: 60,
    total_marks: 100,
    passing_score: 40,
    description: ''
  });

  // Fetch subjects from Supabase
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch classes from Supabase
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, education_level')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.subject_id || !formData.class_id || !formData.exam_date) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const examDateTime = new Date(`${formData.exam_date}T${formData.exam_time}`);
      
      // Insert exam into Supabase
      const { data, error } = await supabase
        .from('exams')
        .insert([{
          title: formData.title,
          subject_id: formData.subject_id,
          class_id: formData.class_id,
          exam_date: examDateTime.toISOString(),
          duration: formData.duration,
          total_marks: formData.total_marks,
          passing_score: formData.passing_score,
          description: formData.description,
          // In a real implementation, get the authenticated user id
          created_by: "1", // This should be auth.uid() in production
          school_id: "1" // This should come from auth context in production
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Exam has been scheduled successfully."
      });
      
      // Reset form
      setFormData({
        title: '',
        subject_id: '',
        class_id: '',
        exam_date: '',
        exam_time: '09:00',
        duration: 60,
        total_marks: 100,
        passing_score: 40,
        description: ''
      });
      
      // Notify parent component
      if (onExamCreated) {
        onExamCreated();
      }
      
    } catch (error: any) {
      console.error('Error creating exam:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Education levels for the helper text
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Exam Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. End Term Mathematics Exam"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
          <Select
            value={formData.subject_id}
            onValueChange={(value) => handleChange('subject_id', value)}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder={loadingSubjects ? "Loading subjects..." : "Select a subject"} />
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
          <Label htmlFor="class">Class <span className="text-red-500">*</span></Label>
          <Select
            value={formData.class_id}
            onValueChange={(value) => handleChange('class_id', value)}
          >
            <SelectTrigger id="class">
              <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select a class"} />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.name} ({getEducationLevelLabel(classItem.education_level)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exam_date">Exam Date <span className="text-red-500">*</span></Label>
          <Input
            id="exam_date"
            type="date"
            value={formData.exam_date}
            onChange={(e) => handleChange('exam_date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exam_time">Start Time <span className="text-red-500">*</span></Label>
          <Input
            id="exam_time"
            type="time"
            value={formData.exam_time}
            onChange={(e) => handleChange('exam_time', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes) <span className="text-red-500">*</span></Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
            min={15}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="total_marks">Total Marks <span className="text-red-500">*</span></Label>
          <Input
            id="total_marks"
            type="number"
            value={formData.total_marks}
            onChange={(e) => handleChange('total_marks', parseInt(e.target.value))}
            min={1}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="passing_score">Passing Score <span className="text-red-500">*</span></Label>
          <Input
            id="passing_score"
            type="number"
            value={formData.passing_score}
            onChange={(e) => handleChange('passing_score', parseInt(e.target.value))}
            min={1}
            max={formData.total_marks}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Exam instructions, scope, and other relevant details..."
          rows={4}
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Schedule Exam'}
        </Button>
      </div>
    </form>
  );
};

export default CreateExamForm;
