
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AddTeacher = () => {
  const navigate = useNavigate();
  const { schoolId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
    dateOfBirth: '',
    qualifications: '',
    subjects: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error("School ID not found. Cannot add teacher.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create a user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temporary-password-123', // You'd want to generate this or let user set it
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Set user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'teacher',
          teacher_role: 'normal_teacher',
          school_id: schoolId,
        });

      if (roleError) throw roleError;

      // 3. Create profile for the teacher
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          school_id: schoolId,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // 4. Store additional teacher metadata in a custom metadata field
      // Since we don't have a teachers table yet, we'll use the profile and user_roles tables
      const staffId = `TCH/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
      
      const qualificationsArray = formData.qualifications
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const subjectsArray = formData.subjects
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      // Since we don't have a dedicated teachers table yet,
      // we'll store this information as metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          staff_id: staffId,
          gender: formData.gender,
          date_of_birth: formData.dateOfBirth,
          hire_date: new Date().toISOString().split('T')[0],
          qualifications: qualificationsArray,
          subjects: subjectsArray,
        }
      });

      if (metadataError) throw metadataError;

      toast.success('Teacher added successfully!');
      navigate('/teachers');
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast.error('Failed to add teacher. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Add New Teacher</h1>
          <p className="text-gray-600">Register a new teaching staff member</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tanzanian-blue focus:ring focus:ring-tanzanian-blue/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tanzanian-blue focus:ring focus:ring-tanzanian-blue/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tanzanian-blue focus:ring focus:ring-tanzanian-blue/30"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tanzanian-blue focus:ring focus:ring-tanzanian-blue/30"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tanzanian-blue focus:ring focus:ring-tanzanian-blue/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tanzanian-blue focus:ring focus:ring-tanzanian-blue/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">Qualifications (comma separated)</label>
                  <textarea
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    placeholder="E.g. B.Ed in Mathematics, Diploma in Educational Technology"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tanzanian-blue focus:ring focus:ring-tanzanian-blue/30"
                    rows={3}
                  />
                </div>
                <div>
                  <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">Subjects (comma separated)</label>
                  <textarea
                    id="subjects"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleInputChange}
                    placeholder="E.g. Mathematics, Physics, Computer Science"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tanzanian-blue focus:ring focus:ring-tanzanian-blue/30"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/teachers')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tanzanian-blue"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-tanzanian-blue hover:bg-tanzanian-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tanzanian-blue"
              >
                {isSubmitting ? 'Adding...' : 'Add Teacher'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddTeacher;
