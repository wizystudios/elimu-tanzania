
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const CreateAnnouncement = () => {
  const { user, schoolId } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [recipientType, setRecipientType] = useState('all_school');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch classes for specific class announcements
  const { data: classes } = useQuery({
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!user?.id || !schoolId) {
      toast.error('You must be logged in to create an announcement');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const announcementData = {
        title,
        content,
        is_important: isImportant,
        recipient_type: recipientType,
        sender_id: user.id,
        school_id: schoolId,
        class_id: recipientType === 'class' ? selectedClass : null
      };
      
      const { data, error } = await supabase
        .from('announcements')
        .insert(announcementData)
        .select();
      
      if (error) throw error;
      
      toast.success('Announcement created successfully');
      navigate('/announcements');
      
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast.error(error.message || 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create Announcement</h1>
          <p className="text-gray-600">Share important information with your school community</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
              <CardDescription>
                Fill in the details for your announcement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="Enter announcement content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="important" 
                  checked={isImportant}
                  onCheckedChange={(checked) => setIsImportant(checked === true)}
                />
                <Label htmlFor="important" className="text-sm font-normal cursor-pointer">
                  Mark as important announcement
                </Label>
              </div>
              
              <div className="space-y-3">
                <Label>Recipients</Label>
                <RadioGroup 
                  value={recipientType}
                  onValueChange={setRecipientType}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all_school" id="all_school" />
                    <Label htmlFor="all_school" className="text-sm font-normal cursor-pointer">All School</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teachers" id="teachers" />
                    <Label htmlFor="teachers" className="text-sm font-normal cursor-pointer">Teachers Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="students" id="students" />
                    <Label htmlFor="students" className="text-sm font-normal cursor-pointer">Students Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parents" id="parents" />
                    <Label htmlFor="parents" className="text-sm font-normal cursor-pointer">Parents Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="class" id="class" />
                    <Label htmlFor="class" className="text-sm font-normal cursor-pointer">Specific Class</Label>
                  </div>
                </RadioGroup>
                
                {recipientType === 'class' && (
                  <div className="pl-6 pt-2">
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                      required
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Select a class" />
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
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/announcements')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Publish Announcement"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateAnnouncement;
