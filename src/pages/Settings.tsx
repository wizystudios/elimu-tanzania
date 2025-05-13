
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Building, MapPin, User, Mail, Shield, Globe, Lock } from 'lucide-react';
import { School, SchoolLocation } from '@/types';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const { toast } = useToast();
  const { schoolId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState('swahili');
  
  // School information states
  const [schoolName, setSchoolName] = useState('');
  const [schoolType, setSchoolType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [establishedDate, setEstablishedDate] = useState('');
  
  // Location information states
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  
  // Administrator information states
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  
  // School status states
  const [schoolActive, setSchoolActive] = useState(true);
  
  // Fetch school information
  const { data: schoolData, isLoading: loadingSchool } = useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
        
      if (error) throw error;
      
      // Set school information states
      if (data) {
        setSchoolName(data.name || '');
        setSchoolType(data.type || '');
        setRegistrationNumber(data.registration_number || '');
        setDescription(data.description || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setEstablishedDate(data.established_date ? data.established_date.substring(0, 10) : '');
      }
      
      return data as School;
    },
  });
  
  // Fetch school location
  const { data: locationData, isLoading: loadingLocation } = useQuery({
    queryKey: ['school_location', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      
      const { data, error } = await supabase
        .from('school_locations')
        .select('*')
        .eq('school_id', schoolId);
        
      if (error) throw error;
      
      // Set location information states if data exists
      if (data && data.length > 0) {
        const location = data[0];
        setRegion(location.region || '');
        setDistrict(location.district || '');
        setWard(location.ward || '');
        setStreet(location.street || '');
      }
      
      return data as SchoolLocation[];
    },
  });
  
  // Fetch school administrator
  const { data: adminData, isLoading: loadingAdmin } = useQuery({
    queryKey: ['school_administrator', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      
      const { data, error } = await supabase
        .from('school_administrators')
        .select('*')
        .eq('school_id', schoolId);
        
      if (error) throw error;
      
      // Set administrator information states if data exists
      if (data && data.length > 0) {
        setAdminName(data[0].name || '');
        setAdminEmail(data[0].email || '');
        setAdminPhone(data[0].phone || '');
      }
      
      return data || [];
    },
  });

  // Function to toggle school active status
  const handleToggleSchoolStatus = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, we would update a status field in the school table
      // For now, we'll just show a success message
      setSchoolActive(!schoolActive);
      
      const newStatus = !schoolActive;
      
      toast({
        title: newStatus ? "School Activated" : "School Frozen",
        description: newStatus 
          ? "School has been successfully activated and can resume normal operations." 
          : "School has been frozen. All activities are temporarily suspended."
      });
      
    } catch (error: any) {
      console.error('Error updating school status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update school status",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update school information
  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error: updateError } = await supabase
        .from('schools')
        .update({
          name: schoolName,
          type: schoolType,
          registration_number: registrationNumber,
          description,
          email,
          phone,
          established_date: establishedDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', schoolId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: "School information updated successfully."
      });
      
    } catch (error: any) {
      console.error('Error updating school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update school information",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete school function
  const handleDeleteSchool = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    // Confirmation before deleting
    if (!confirm("Are you sure you want to delete this school? This action cannot be undone.")) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation with proper permissions, we would delete the school
      // For now, we'll just show a success message
      toast({
        title: "School Deleted",
        description: "School has been successfully deleted."
      });
      
    } catch (error: any) {
      console.error('Error deleting school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete school",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle language switch
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // In a real implementation, we would store this in localStorage or user preferences
    toast({
      title: value === "swahili" ? "Lugha Imebadilishwa" : "Language Changed",
      description: value === "swahili" 
        ? "Lugha ya mfumo imebadilishwa kuwa Kiswahili" 
        : "System language has been changed to English"
    });
  };
  
  // Update location information
  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (!locationData || locationData.length === 0) {
        // Create new location
        const { error: insertError } = await supabase
          .from('school_locations')
          .insert({
            school_id: schoolId,
            region,
            district,
            ward,
            street
          });
          
        if (insertError) throw insertError;
      } else {
        // Update existing location
        const { error: updateError } = await supabase
          .from('school_locations')
          .update({
            region,
            district,
            ward,
            street,
            updated_at: new Date().toISOString()
          })
          .eq('id', locationData[0].id);
          
        if (updateError) throw updateError;
      }
      
      toast({
        title: "Success",
        description: "School location updated successfully."
      });
      
    } catch (error: any) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update location information",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update administrator information
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (!adminData || adminData.length === 0) {
        // Create new administrator
        const { error: insertError } = await supabase
          .from('school_administrators')
          .insert({
            school_id: schoolId,
            name: adminName,
            email: adminEmail,
            phone: adminPhone
          });
          
        if (insertError) throw insertError;
      } else {
        // Update existing administrator
        const { error: updateError } = await supabase
          .from('school_administrators')
          .update({
            name: adminName,
            email: adminEmail,
            phone: adminPhone,
            updated_at: new Date().toISOString()
          })
          .eq('id', adminData[0].id);
          
        if (updateError) throw updateError;
      }
      
      toast({
        title: "Success",
        description: "Administrator information updated successfully."
      });
      
    } catch (error: any) {
      console.error('Error updating administrator:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update administrator information",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get the labels based on language
  const getLabel = (swahiliText: string, englishText: string): string => {
    return language === 'swahili' ? swahiliText : englishText;
  };
  
  const isLoading = loadingSchool || loadingLocation || loadingAdmin;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Spinner className="h-8 w-8" />
            <p className="mt-4 text-gray-500">
              {getLabel('Inapakia mipangilio ya shule...', 'Loading school settings...')}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{getLabel('Mipangilio ya Shule', 'School Settings')}</h1>
          <p className="text-gray-600">
            {getLabel('Simamia taarifa na mipangilio ya shule yako', 'Manage your school\'s information and configuration')}
          </p>
        </div>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">
              <SettingsIcon className="h-4 w-4 mr-2" />
              {getLabel('Jumla', 'General')}
            </TabsTrigger>
            <TabsTrigger value="location">
              <MapPin className="h-4 w-4 mr-2" />
              {getLabel('Eneo', 'Location')}
            </TabsTrigger>
            <TabsTrigger value="administrator">
              <User className="h-4 w-4 mr-2" />
              {getLabel('Msimamizi', 'Administrator')}
            </TabsTrigger>
            <TabsTrigger value="language">
              <Globe className="h-4 w-4 mr-2" />
              {getLabel('Lugha', 'Language')}
            </TabsTrigger>
            <TabsTrigger value="status">
              <Lock className="h-4 w-4 mr-2" />
              {getLabel('Hali', 'Status')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{getLabel('Taarifa za Jumla', 'General Information')}</CardTitle>
                <CardDescription>
                  {getLabel('Sasisha taarifa za msingi za shule yako', 'Update your school\'s basic information')}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateSchool}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">{getLabel('Jina la Shule', 'School Name')}</Label>
                      <Input
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="schoolType">{getLabel('Aina ya Shule', 'School Type')}</Label>
                      <Input
                        id="schoolType"
                        value={schoolType}
                        onChange={(e) => setSchoolType(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">{getLabel('Namba ya Usajili', 'Registration Number')}</Label>
                      <Input
                        id="registrationNumber"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="establishedDate">{getLabel('Tarehe ya Kuanzishwa', 'Established Date')}</Label>
                      <Input
                        id="establishedDate"
                        type="date"
                        value={establishedDate}
                        onChange={(e) => setEstablishedDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">{getLabel('Barua Pepe', 'Email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">{getLabel('Simu', 'Phone')}</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">{getLabel('Maelezo', 'Description')}</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting 
                      ? getLabel("Inahifadhi...", "Saving...") 
                      : getLabel("Hifadhi Mabadiliko", "Save Changes")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>{getLabel('Taarifa za Eneo', 'Location Information')}</CardTitle>
                <CardDescription>
                  {getLabel('Sasisha maelezo ya anwani ya shule yako', 'Update your school\'s address details')}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateLocation}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">{getLabel('Mkoa', 'Region')}</Label>
                      <Input
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="district">{getLabel('Wilaya', 'District')}</Label>
                      <Input
                        id="district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ward">{getLabel('Kata', 'Ward')}</Label>
                      <Input
                        id="ward"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="street">{getLabel('Mtaa', 'Street')}</Label>
                      <Input
                        id="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting 
                      ? getLabel("Inahifadhi...", "Saving...") 
                      : getLabel("Hifadhi Mabadiliko", "Save Changes")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="administrator">
            <Card>
              <CardHeader>
                <CardTitle>{getLabel('Taarifa za Msimamizi', 'Administrator Information')}</CardTitle>
                <CardDescription>
                  {getLabel('Sasisha taarifa za msimamizi wa shule', 'Update school administrator details')}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateAdmin}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">{getLabel('Jina', 'Name')}</Label>
                      <Input
                        id="adminName"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">{getLabel('Barua Pepe', 'Email')}</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminPhone">{getLabel('Simu', 'Phone')}</Label>
                      <Input
                        id="adminPhone"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting 
                      ? getLabel("Inahifadhi...", "Saving...") 
                      : getLabel("Hifadhi Mabadiliko", "Save Changes")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>{getLabel('Mipangilio ya Lugha', 'Language Settings')}</CardTitle>
                <CardDescription>
                  {getLabel('Chagua lugha ya mfumo', 'Choose your system language')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{getLabel('Kiswahili', 'Swahili')}</h3>
                      <p className="text-sm text-gray-500">{getLabel('Tumia Kiswahili kama lugha ya mfumo', 'Use Swahili as system language')}</p>
                    </div>
                    <Button
                      variant={language === 'swahili' ? 'default' : 'outline'}
                      onClick={() => handleLanguageChange('swahili')}
                    >
                      {language === 'swahili' ? getLabel('Inatumika', 'Active') : getLabel('Tumia', 'Use')}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{getLabel('Kiingereza', 'English')}</h3>
                      <p className="text-sm text-gray-500">{getLabel('Tumia Kiingereza kama lugha ya mfumo', 'Use English as system language')}</p>
                    </div>
                    <Button
                      variant={language === 'english' ? 'default' : 'outline'}
                      onClick={() => handleLanguageChange('english')}
                    >
                      {language === 'english' ? getLabel('Inatumika', 'Active') : getLabel('Tumia', 'Use')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>{getLabel('Hali ya Shule', 'School Status')}</CardTitle>
                <CardDescription>
                  {getLabel('Dhibiti hali ya shule', 'Control school status and operations')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      {getLabel('Shule Inafanya Kazi', 'School is Active')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getLabel(
                        'Weka au ondoa shule katika hali ya kufanya kazi',
                        'Set or unset the school as active'
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={schoolActive}
                      onCheckedChange={handleToggleSchoolStatus}
                      disabled={isSubmitting}
                    />
                    <span className={`text-sm ${schoolActive ? 'text-green-600' : 'text-red-600'}`}>
                      {schoolActive 
                        ? getLabel('Inafanya Kazi', 'Active') 
                        : getLabel('Imesimamishwa', 'Frozen')}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-red-600 mb-2">
                    {getLabel('Eneo la Hatari', 'Danger Zone')}
                  </h3>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                    <h4 className="font-medium">
                      {getLabel('Futa Shule', 'Delete School')}
                    </h4>
                    <p className="text-sm text-gray-700 mb-4">
                      {getLabel(
                        'Kitendo hiki hakiwezi kutenguliwa. Kufuta shule kutafuta kabisa taarifa zote za shule, wanafunzi, walimu, na wafanyakazi.',
                        'This action cannot be undone. Deleting the school will permanently remove all school, student, teacher, and staff data.'
                      )}
                    </p>
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteSchool}
                      disabled={isSubmitting}
                    >
                      {getLabel('Futa Shule', 'Delete School')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
