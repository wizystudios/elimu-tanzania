
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

const Settings = () => {
  const { toast } = useToast();
  const { user, schoolId, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  
  // School settings
  const [schoolData, setSchoolData] = useState({
    name: '',
    email: '',
    phone: '',
    registrationNumber: '',
    description: '',
    logo: '',
    region: '',
    district: '',
    ward: '',
    street: ''
  });
  
  // Fetch user profile data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setProfileData({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          profileImage: profileData.profile_image || ''
        });
        
        // Fetch school data if admin/headmaster
        if (schoolId && ['admin', 'headmaster', 'super_admin'].includes(userRole)) {
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('*, school_locations(*)')
            .eq('id', schoolId)
            .single();
            
          if (schoolError) throw schoolError;
          
          setSchoolData({
            name: schoolData.name || '',
            email: schoolData.email || '',
            phone: schoolData.phone || '',
            registrationNumber: schoolData.registration_number || '',
            description: schoolData.description || '',
            logo: schoolData.logo || '',
            region: schoolData.school_locations?.region || '',
            district: schoolData.school_locations?.district || '',
            ward: schoolData.school_locations?.ward || '',
            street: schoolData.school_locations?.street || ''
          });
        }
      } catch (error) {
        console.error('Error fetching settings data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load settings. Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, schoolId, userRole, toast]);
  
  // Handle profile data changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle school data changes
  const handleSchoolChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSchoolData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Update profile
  const updateProfile = async () => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Update school info
  const updateSchool = async () => {
    if (!schoolId) return;
    
    try {
      setIsSaving(true);
      
      // Update school basic info
      const { error: schoolError } = await supabase
        .from('schools')
        .update({
          name: schoolData.name,
          email: schoolData.email,
          phone: schoolData.phone,
          description: schoolData.description
        })
        .eq('id', schoolId);
      
      if (schoolError) throw schoolError;
      
      // Update school location
      const { error: locationError } = await supabase
        .from('school_locations')
        .update({
          region: schoolData.region,
          district: schoolData.district,
          ward: schoolData.ward,
          street: schoolData.street
        })
        .eq('school_id', schoolId);
      
      if (locationError) throw locationError;
      
      toast({
        title: "Success",
        description: "School information updated successfully"
      });
      
    } catch (error: any) {
      console.error('Error updating school:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update school information"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Spinner className="h-8 w-8" />
            <p className="mt-4 text-gray-500">Loading settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your account and application settings</p>
        </div>
        
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            {['admin', 'headmaster', 'super_admin'].includes(userRole) && (
              <TabsTrigger value="school">School</TabsTrigger>
            )}
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {['admin', 'super_admin'].includes(userRole) && (
              <TabsTrigger value="system">System</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      name="email"
                      value={profileData.email}
                      readOnly
                      disabled
                    />
                    <p className="text-sm text-gray-500">Contact an administrator to change your email address</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Profile Image</h3>
                    <p className="text-sm text-gray-500">Upload a profile picture (coming soon)</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                      {profileData.profileImage ? (
                        <img 
                          src={profileData.profileImage} 
                          alt="Profile" 
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-gray-500">
                          {profileData.firstName.charAt(0)}
                          {profileData.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <Button variant="outline" disabled>
                      Upload Image
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-500">Change your password</p>
                  </div>
                  
                  <Button variant="outline" disabled>
                    Change Password
                  </Button>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={updateProfile} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {['admin', 'headmaster', 'super_admin'].includes(userRole) && (
            <TabsContent value="school" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                  <CardDescription>
                    Update your school details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input 
                        id="schoolName"
                        name="name"
                        value={schoolData.name}
                        onChange={handleSchoolChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input 
                        id="registrationNumber"
                        name="registrationNumber"
                        value={schoolData.registrationNumber}
                        readOnly
                        disabled
                      />
                      <p className="text-sm text-gray-500">Registration number cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="schoolEmail">Email Address</Label>
                      <Input 
                        id="schoolEmail"
                        name="email"
                        value={schoolData.email}
                        onChange={handleSchoolChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="schoolPhone">Phone Number</Label>
                      <Input 
                        id="schoolPhone"
                        name="phone"
                        value={schoolData.phone}
                        onChange={handleSchoolChange}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">School Description</Label>
                      <Textarea 
                        id="description"
                        name="description"
                        rows={4}
                        value={schoolData.description}
                        onChange={handleSchoolChange}
                        placeholder="Enter school description"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-4">School Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Input 
                          id="region"
                          name="region"
                          value={schoolData.region}
                          onChange={handleSchoolChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input 
                          id="district"
                          name="district"
                          value={schoolData.district}
                          onChange={handleSchoolChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ward">Ward</Label>
                        <Input 
                          id="ward"
                          name="ward"
                          value={schoolData.ward}
                          onChange={handleSchoolChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="street">Street</Label>
                        <Input 
                          id="street"
                          name="street"
                          value={schoolData.street}
                          onChange={handleSchoolChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">School Logo</h3>
                      <p className="text-sm text-gray-500">Upload your school logo (coming soon)</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="h-24 w-24 bg-gray-200 flex items-center justify-center rounded-md">
                        {schoolData.logo ? (
                          <img 
                            src={schoolData.logo} 
                            alt="School Logo" 
                            className="h-24 w-24 object-contain"
                          />
                        ) : (
                          <span className="text-gray-500">No logo</span>
                        )}
                      </div>
                      <Button variant="outline" disabled>
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={updateSchool} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control which notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive email notifications</p>
                    </div>
                    <Switch disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Announcement Notifications</h3>
                      <p className="text-sm text-gray-500">Get notified about new announcements</p>
                    </div>
                    <Switch disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Event Reminders</h3>
                      <p className="text-sm text-gray-500">Receive reminders for upcoming events</p>
                    </div>
                    <Switch disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Exam Result Notifications</h3>
                      <p className="text-sm text-gray-500">Get notified when exam results are available</p>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-gray-500 italic">Notification preferences will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {['admin', 'super_admin'].includes(userRole) && (
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure system-wide settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Academic Year</h3>
                      <p className="text-sm text-gray-500">Set the current academic year</p>
                    </div>
                    
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="2023-2024" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2022-2023">2022-2023</SelectItem>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">User Registration</h3>
                      <p className="text-sm text-gray-500">Control user registration settings</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Allow Teacher Registration</h4>
                        <p className="text-xs text-gray-500">Let teachers register accounts</p>
                      </div>
                      <Switch disabled />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Allow Parent Registration</h4>
                        <p className="text-xs text-gray-500">Let parents register accounts</p>
                      </div>
                      <Switch disabled />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Require Admin Approval</h4>
                        <p className="text-xs text-gray-500">New accounts must be approved</p>
                      </div>
                      <Switch disabled />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 italic">System settings will be available soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
