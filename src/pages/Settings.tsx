
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
import { Settings as SettingsIcon, Building, MapPin, User, Mail, Shield } from 'lucide-react';
import { School, SchoolLocation } from '@/types';
import { Spinner } from '@/components/ui/spinner';

const Settings = () => {
  const { toast } = useToast();
  const { schoolId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const isLoading = loadingSchool || loadingLocation || loadingAdmin;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Spinner className="h-8 w-8" />
            <p className="mt-4 text-gray-500">Loading school settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">School Settings</h1>
          <p className="text-gray-600">Manage your school's information and configuration</p>
        </div>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">
              <SettingsIcon className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="location">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </TabsTrigger>
            <TabsTrigger value="administrator">
              <User className="h-4 w-4 mr-2" />
              Administrator
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Update your school's basic information
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateSchool}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="schoolType">School Type</Label>
                      <Input
                        id="schoolType"
                        value={schoolType}
                        onChange={(e) => setSchoolType(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="establishedDate">Established Date</Label>
                      <Input
                        id="establishedDate"
                        type="date"
                        value={establishedDate}
                        onChange={(e) => setEstablishedDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
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
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
                <CardDescription>
                  Update your school's address details
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateLocation}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ward">Ward</Label>
                      <Input
                        id="ward"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
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
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="administrator">
            <Card>
              <CardHeader>
                <CardTitle>Administrator Information</CardTitle>
                <CardDescription>
                  Update school administrator details
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateAdmin}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Name</Label>
                      <Input
                        id="adminName"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminPhone">Phone</Label>
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
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
