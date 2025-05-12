
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const RegisterSchool = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm();

  // Redirect if user is not a super_admin
  if (userRole !== 'super_admin') {
    return <Navigate to="/unauthorized" />;
  }

  const onSubmit = async (data: any) => {
    try {
      // Insert school data
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: data.name,
          type: data.type,
          email: data.email,
          phone: data.phone,
          subdomain: data.subdomain || generateSubdomain(data.name),
          description: data.description,
          established_date: data.established_date,
          registration_number: data.registration_number
        })
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Insert school location
      if (school) {
        const { error: locationError } = await supabase
          .from('school_locations')
          .insert({
            school_id: school.id,
            region: data.region,
            district: data.district,
            ward: data.ward,
            street: data.street
          });

        if (locationError) throw locationError;
      }

      toast.success('School registered successfully');
      navigate('/schools');
    } catch (error) {
      console.error('Error registering school:', error);
      toast.error('Failed to register school');
    }
  };

  const generateSubdomain = (schoolName: string): string => {
    return schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
  };

  return (
    <MainLayout>
      <div>
        <h1 className="text-2xl font-bold mb-2">Register New School</h1>
        <p className="text-gray-600 mb-6">Add a new school to the system</p>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">School Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter school name" 
                    {...register('name', { required: 'School name is required' })}
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">School Type</Label>
                  <Select onValueChange={(value) => setValue('type', value)} defaultValue="">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kindergarten">Chekechea</SelectItem>
                      <SelectItem value="primary">Primary School</SelectItem>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="advanced">Advanced Level</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-xs">{errors.type.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Brief description of the school"
                    {...register('description')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="established_date">Established Date</Label>
                  <Input 
                    id="established_date" 
                    type="date" 
                    {...register('established_date', { required: 'Established date is required' })}
                  />
                  {errors.established_date && <p className="text-red-500 text-xs">{errors.established_date.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number</Label>
                  <Input 
                    id="registration_number" 
                    placeholder="School registration number" 
                    {...register('registration_number', { required: 'Registration number is required' })}
                  />
                  {errors.registration_number && <p className="text-red-500 text-xs">{errors.registration_number.message as string}</p>}
                </div>
              </div>

              {/* Contact and Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Contact & Location</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="School email address" 
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="School phone number" 
                    {...register('phone', { required: 'Phone number is required' })}
                  />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input 
                    id="region" 
                    placeholder="Region" 
                    {...register('region', { required: 'Region is required' })}
                  />
                  {errors.region && <p className="text-red-500 text-xs">{errors.region.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input 
                    id="district" 
                    placeholder="District" 
                    {...register('district', { required: 'District is required' })}
                  />
                  {errors.district && <p className="text-red-500 text-xs">{errors.district.message as string}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ward">Ward</Label>
                    <Input 
                      id="ward" 
                      placeholder="Ward" 
                      {...register('ward')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input 
                      id="street" 
                      placeholder="Street" 
                      {...register('street')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdomain">
                    Subdomain <span className="text-xs text-gray-500">(Optional)</span>
                  </Label>
                  <Input 
                    id="subdomain" 
                    placeholder="yourschool" 
                    {...register('subdomain')}
                  />
                  <p className="text-xs text-gray-500">If left blank, a subdomain will be generated automatically</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/schools')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-tanzanian-blue hover:bg-tanzanian-blue/90"
              >
                {isSubmitting ? 'Registering...' : 'Register School'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterSchool;
