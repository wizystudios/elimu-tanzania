
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TeacherSpecialization, TanzanianEducationLevel } from '@/types/tanzania-education';

interface TeacherFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  nationalId: string;
  teachingLicense: string;
  specialization: TeacherSpecialization;
  qualifications: string;
  subjects: string[];
  preferredLevels: TanzanianEducationLevel[];
  experience: string;
  languages: string[];
}

interface TeacherRegistrationFormProps {
  onSubmit: (data: TeacherFormData) => Promise<void>;
  isLoading?: boolean;
}

const TeacherRegistrationForm: React.FC<TeacherRegistrationFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<TeacherFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
    dateOfBirth: '',
    nationalId: '',
    teachingLicense: '',
    specialization: 'normal_teacher',
    qualifications: '',
    subjects: [],
    preferredLevels: [],
    experience: '',
    languages: ['Swahili', 'English'],
  });

  const specializationOptions = [
    { value: 'normal_teacher', label: 'Normal Teacher 📖' },
    { value: 'homeroom_teacher', label: 'Homeroom Teacher 🏠' },
    { value: 'subject_teacher', label: 'Subject Teacher 📚' },
    { value: 'headmaster', label: 'Head Master 🎓' },
    { value: 'vice_headmaster', label: 'Vice Head Master 📚' },
    { value: 'academic_teacher', label: 'Academic Teacher 🏆' },
    { value: 'discipline_teacher', label: 'Discipline Teacher ⚖️' },
  ];

  const educationLevels = [
    { value: 'chekechea', label: 'Chekechea (Pre-Primary)' },
    { value: 'darasa1', label: 'Darasa la 1 (Standard I)' },
    { value: 'darasa2', label: 'Darasa la 2 (Standard II)' },
    { value: 'darasa3', label: 'Darasa la 3 (Standard III)' },
    { value: 'darasa4', label: 'Darasa la 4 (Standard IV)' },
    { value: 'darasa5', label: 'Darasa la 5 (Standard V)' },
    { value: 'darasa6', label: 'Darasa la 6 (Standard VI)' },
    { value: 'darasa7', label: 'Darasa la 7 (Standard VII)' },
    { value: 'form1', label: 'Form I' },
    { value: 'form2', label: 'Form II' },
    { value: 'form3', label: 'Form III' },
    { value: 'form4', label: 'Form IV' },
    { value: 'form5', label: 'Form V' },
    { value: 'form6', label: 'Form VI' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof TeacherFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Teacher Registration</span>
          <span>👨‍🏫</span>
        </CardTitle>
        <CardDescription>
          Register a new teacher for the Tanzanian education system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name (Jina la Kwanza) *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name (Jina la Ukoo) *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Nambari ya Simu) *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+255 XXX XXX XXX"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender (Jinsia)</Label>
              <Select value={formData.gender} onValueChange={(value: any) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male (Mwanaume)</SelectItem>
                  <SelectItem value="female">Female (Mwanamke)</SelectItem>
                  <SelectItem value="other">Other (Nyingine)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID (Kitambulisho) *</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => handleInputChange('nationalId', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teachingLicense">Teaching License Number</Label>
              <Input
                id="teachingLicense"
                value={formData.teachingLicense}
                onChange={(e) => handleInputChange('teachingLicense', e.target.value)}
                placeholder="TSC License Number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Teacher Specialization *</Label>
              <Select value={formData.specialization} onValueChange={(value: any) => handleInputChange('specialization', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {specializationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifications">Educational Qualifications (Sifa za Elimu) *</Label>
            <Textarea
              id="qualifications"
              value={formData.qualifications}
              onChange={(e) => handleInputChange('qualifications', e.target.value)}
              placeholder="E.g., B.Ed in Mathematics from University of Dar es Salaam, Diploma in Education"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Teaching Experience (Uzoefu wa Ufundishaji)</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Describe your teaching experience, previous schools, years of service"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registering... ⏳' : 'Register Teacher 🎉'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherRegistrationForm;
