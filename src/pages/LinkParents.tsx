
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Search, Users, Link, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

const LinkParents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [relationship, setRelationship] = useState<string>('father');
  const [isPrimaryContact, setIsPrimaryContact] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Fetch parents (users with parent role)
  const { data: parents, isLoading: loadingParents } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      // First get all users with parent role
      const { data: parentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id')
        .eq('role', 'parent');

      if (rolesError) throw rolesError;
      
      if (!parentRoles || parentRoles.length === 0) {
        return [];
      }
      
      // Then get parent profile information using the user_ids
      const parentIds = parentRoles.map(role => role.user_id);
      
      const { data: parentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone')
        .in('id', parentIds);
        
      if (profilesError) throw profilesError;
      
      // Combine the parent IDs with their profiles
      return parentRoles.map(role => {
        const profile = parentProfiles?.find(profile => profile.id === role.user_id);
        return {
          id: role.id,
          user_id: role.user_id,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          email: profile?.email || '',
          phone: profile?.phone || ''
        };
      });
    }
  });
  
  // Fetch students
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          registration_number,
          current_class_id,
          classes:current_class_id (name, education_level)
        `);
      
      if (studentsError) throw studentsError;
      
      if (!studentsData || studentsData.length === 0) {
        return [];
      }
      
      // Then get student profiles
      const studentIds = studentsData.map(student => student.user_id);
      
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', studentIds);
        
      if (profilesError) throw profilesError;
      
      // Combine student data with their profiles
      return studentsData.map(student => {
        const profile = studentProfiles?.find(profile => profile.id === student.user_id);
        // Handle classes array properly
        const classInfo = Array.isArray(student.classes) && student.classes.length > 0 
          ? student.classes[0] 
          : null;
        
        return {
          id: student.id,
          user_id: student.user_id,
          registration_number: student.registration_number,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          current_class_id: student.current_class_id,
          class_name: classInfo?.name || '',
          education_level: classInfo?.education_level || ''
        };
      });
    }
  });
  
  // Fetch existing parent-student relationships
  const { data: existingLinks, refetch: refetchLinks } = useQuery({
    queryKey: ['parent_students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parent_students')
        .select(`
          id,
          parent_id,
          student_id,
          relationship,
          is_primary_contact
        `);
      
      if (error) throw error;
      
      return data || [];
    }
  });
  
  // Filter parents based on search query
  const filteredParents = parents?.filter(parent => {
    if (!searchQuery) return true;
    
    const fullName = `${parent.first_name} ${parent.last_name}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Get education level label
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
  
  const handleLinkParent = async () => {
    if (!selectedParent || !selectedStudent) {
      toast({
        title: "Selection required",
        description: "Please select both a parent and a student",
        variant: "destructive"
      });
      return;
    }
    
    // Check if this link already exists
    const existingLink = existingLinks?.find(
      link => link.parent_id === selectedParent && link.student_id === selectedStudent
    );
    
    if (existingLink) {
      toast({
        title: "Link already exists",
        description: "This parent is already linked to this student",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('parent_students')
        .insert([{
          parent_id: selectedParent,
          student_id: selectedStudent,
          relationship,
          is_primary_contact: isPrimaryContact
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Parent linked successfully",
        description: "The parent has been linked to the student"
      });
      
      // Reset form and refresh
      setSelectedParent(null);
      setSelectedStudent(null);
      setRelationship('father');
      setIsPrimaryContact(false);
      refetchLinks();
      
    } catch (error: any) {
      console.error('Error linking parent:', error);
      toast({
        title: "Error linking parent",
        description: error.message || "Failed to link parent to student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('parent_students')
        .delete()
        .eq('id', linkId);
      
      if (error) throw error;
      
      toast({
        title: "Link removed",
        description: "The parent-student link has been removed"
      });
      
      refetchLinks();
      
    } catch (error: any) {
      console.error('Error removing link:', error);
      toast({
        title: "Error removing link",
        description: error.message || "Failed to remove parent-student link. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Link Parents to Students</h1>
            <p className="text-gray-600">Create relationships between parents and students</p>
          </div>
          <Button onClick={() => navigate('/parents/add')} className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            <span>Add New Parent</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Create New Link</CardTitle>
                <CardDescription>Associate a parent with a student</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="select-parent">Select Parent</Label>
                  <div className="relative mt-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="text" 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent"
                        placeholder="Search parents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="mt-3 max-h-60 overflow-auto border rounded-md bg-white">
                      {loadingParents ? (
                        <div className="p-4 text-center text-gray-500">Loading parents...</div>
                      ) : filteredParents && filteredParents.length > 0 ? (
                        filteredParents.map(parent => (
                          <div 
                            key={parent.id}
                            className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-0 ${selectedParent === parent.id ? 'bg-blue-50' : ''}`}
                            onClick={() => setSelectedParent(parent.id)}
                          >
                            <div className="font-medium">{parent.first_name} {parent.last_name}</div>
                            <div className="text-sm text-gray-500">{parent.email}</div>
                            <div className="text-sm text-gray-500">{parent.phone}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          {searchQuery ? "No parents found matching your search" : "No parents found"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="select-student">Select Student</Label>
                  <Select
                    value={selectedStudent || ''}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={loadingStudents ? "Loading students..." : "Select a student"} />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} - {student.registration_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Relationship</Label>
                  <RadioGroup 
                    value={relationship} 
                    onValueChange={setRelationship}
                    className="flex flex-col space-y-1 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="father" id="father" />
                      <Label htmlFor="father" className="font-normal">Father</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mother" id="mother" />
                      <Label htmlFor="mother" className="font-normal">Mother</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="guardian" id="guardian" />
                      <Label htmlFor="guardian" className="font-normal">Guardian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="primary-contact"
                    checked={isPrimaryContact}
                    onChange={(e) => setIsPrimaryContact(e.target.checked)}
                    className="rounded border-gray-300 text-tanzanian-blue focus:ring-tanzanian-blue"
                  />
                  <Label htmlFor="primary-contact" className="font-normal">
                    Set as primary contact
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={!selectedParent || !selectedStudent || isSubmitting}
                  onClick={handleLinkParent}
                >
                  {isSubmitting ? 'Linking...' : 'Link Parent to Student'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Relationships</CardTitle>
                <CardDescription>
                  Current parent-student relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                {existingLinks && existingLinks.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="text-left p-3 text-gray-500 font-medium">Parent</th>
                            <th className="text-left p-3 text-gray-500 font-medium">Student</th>
                            <th className="text-left p-3 text-gray-500 font-medium">Relationship</th>
                            <th className="text-left p-3 text-gray-500 font-medium">Status</th>
                            <th className="text-right p-3 text-gray-500 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {existingLinks.map(link => {
                            const parent = parents?.find(p => p.id === link.parent_id);
                            const student = students?.find(s => s.id === link.student_id);
                            
                            return (
                              <tr key={link.id} className="hover:bg-gray-50">
                                <td className="p-3">
                                  {parent ? (
                                    <div>
                                      <div className="font-medium">{parent.first_name} {parent.last_name}</div>
                                      <div className="text-xs text-gray-500">{parent.email}</div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">Unknown Parent</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {student ? (
                                    <div>
                                      <div className="font-medium">{student.first_name} {student.last_name}</div>
                                      <div className="text-xs text-gray-500">{student.registration_number}</div>
                                      {student.class_name && (
                                        <div className="text-xs text-gray-500">{student.class_name}</div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">Unknown Student</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className="capitalize">{link.relationship}</span>
                                </td>
                                <td className="p-3">
                                  {link.is_primary_contact && (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                      Primary Contact
                                    </Badge>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleRemoveLink(link.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <Link className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Relationships Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      There are no parent-student relationships set up. Use the form to link parents to students.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LinkParents;
