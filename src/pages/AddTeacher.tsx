
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import TeacherRegistrationForm from '@/components/forms/TeacherRegistrationForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddTeacher = () => {
  const navigate = useNavigate();
  const { user, schoolId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (!schoolId) {
      toast.error("School ID not found");
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsSubmitting(true);

      const temporaryPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`;

      // Store current session
      const { data: currentSession } = await supabase.auth.getSession();

      // Create user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          national_id: formData.nationalId,
          teaching_license: formData.teachingLicense,
          gender: formData.gender,
          date_of_birth: formData.dateOfBirth,
          qualifications: formData.qualifications,
          subjects: formData.subjects,
          preferred_levels: formData.preferredLevels,
          experience: formData.experience,
          languages: formData.languages,
        }
      });

      if (authError) {
        console.log('Admin API failed, using regular signup:', authError);
        
        const { data: fallbackData, error: fallbackError } = await supabase.auth.signUp({
          email: formData.email,
          password: temporaryPassword,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              national_id: formData.nationalId,
              teaching_license: formData.teachingLicense,
              gender: formData.gender,
              date_of_birth: formData.dateOfBirth,
              qualifications: formData.qualifications,
              subjects: formData.subjects,
              preferred_levels: formData.preferredLevels,
              experience: formData.experience,
              languages: formData.languages,
            }
          }
        });

        if (fallbackError) throw fallbackError;
        
        // Restore original session
        if (currentSession?.session) {
          await supabase.auth.setSession(currentSession.session);
        }
        
        authData.user = fallbackData.user;
      }

      if (!authData.user) throw new Error('Failed to create user');

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'teacher',
          teacher_role: formData.specialization,
          school_id: schoolId,
          is_active: true,
          created_by: user.id
        });

      if (roleError) throw roleError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          school_id: schoolId,
          national_id: formData.nationalId,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      const currentYear = new Date().getFullYear();
      const staffId = `TCH/${currentYear}/${Math.floor(1000 + Math.random() * 9000)}`;

      toast.success("Success");
      toast.info(`Password: ${temporaryPassword}`, {
        duration: 10000,
      });

      navigate('/teachers');
    } catch (error: any) {
      console.error('Error adding teacher:', error);
      toast.error("Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-2 sm:p-4 lg:p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/teachers" className="flex items-center text-tanzanian-blue hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Teachers
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Add New Teacher</h1>
          <p className="text-gray-600">Register a new teaching staff member</p>
        </div>

        <TeacherRegistrationForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </MainLayout>
  );
};

export default AddTeacher;
