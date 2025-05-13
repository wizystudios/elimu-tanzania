
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AddSubject = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    applicable_levels: [] as string[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Education levels
  const educationLevelsGroups = [
    {
      title: 'Kindergarten',
      levels: [
        { value: 'chekechea', label: 'Kindergarten' }
      ]
    },
    {
      title: 'Primary School',
      levels: [
        { value: 'darasa1', label: 'Standard 1' },
        { value: 'darasa2', label: 'Standard 2' },
        { value: 'darasa3', label: 'Standard 3' },
        { value: 'darasa4', label: 'Standard 4' },
        { value: 'darasa5', label: 'Standard 5' },
        { value: 'darasa6', label: 'Standard 6' },
        { value: 'darasa7', label: 'Standard 7' }
      ]
    },
    {
      title: 'Secondary School',
      levels: [
        { value: 'form1', label: 'Form 1' },
        { value: 'form2', label: 'Form 2' },
        { value: 'form3', label: 'Form 3' },
        { value: 'form4', label: 'Form 4' }
      ]
    },
    {
      title: 'Advanced Level',
      levels: [
        { value: 'form5', label: 'Form 5' },
        { value: 'form6', label: 'Form 6' }
      ]
    }
  ];
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleLevelChange = (level: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      applicable_levels: checked 
        ? [...prev.applicable_levels, level]
        : prev.applicable_levels.filter(l => l !== level)
    }));
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Subject name is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.code.trim()) {
      toast({
        title: "Subject code is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.applicable_levels.length === 0) {
      toast({
        title: "Please select at least one applicable education level",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert new subject into Supabase
      const { data, error } = await supabase
        .from('subjects')
        .insert([{
          name: formData.name,
          code: formData.code,
          description: formData.description,
          applicable_levels: formData.applicable_levels,
          // TODO: In production, get school_id from auth context
          school_id: '1'
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Subject added successfully",
        description: `The subject "${formData.name}" has been created.`
      });
      
      // Redirect to the subjects list page
      navigate('/subjects');
      
    } catch (error: any) {
      console.error('Error adding subject:', error);
      toast({
        title: "Error adding subject",
        description: error.message || "Failed to add subject. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const generateSubjectCode = () => {
    if (!formData.name) return;
    
    // Generate a code from the first letters of each word in the name
    const code = formData.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    setFormData(prev => ({ ...prev, code }));
  };
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Add New Subject</h1>
        <p className="text-gray-600 mb-6">Create a new academic subject</p>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="name">Subject Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Mathematics, English, Physics"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="code">Subject Code <span className="text-red-500">*</span></Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateSubjectCode}
                    className="text-xs"
                  >
                    Generate Code
                  </Button>
                </div>
                <Input 
                  id="code" 
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="e.g. MATH, ENG, PHY"
                  className="mt-1"
                  required
                />
                <p className="text-gray-500 text-sm mt-1">A short abbreviation for the subject</p>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter a brief description of the subject"
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div>
                <Label className="block mb-2">Applicable Educational Levels <span className="text-red-500">*</span></Label>
                
                <div className="space-y-4">
                  {educationLevelsGroups.map((group) => (
                    <div key={group.title} className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-gray-700 mb-2">{group.title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {group.levels.map((level) => (
                          <div key={level.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={level.value}
                              checked={formData.applicable_levels.includes(level.value)}
                              onCheckedChange={(checked) => handleLevelChange(level.value, checked as boolean)}
                            />
                            <Label htmlFor={level.value} className="cursor-pointer text-sm font-normal">
                              {level.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/subjects')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Subject'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default AddSubject;
