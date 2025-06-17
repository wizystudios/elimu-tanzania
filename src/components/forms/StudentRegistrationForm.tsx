
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TanzanianEducationLevel } from '@/types/tanzania-education';

interface StudentFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  educationLevel: TanzanianEducationLevel;
  previousSchool?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianRelationship: string;
  homeAddress: string;
  specialNeeds?: string;
  medicalConditions?: string;
  birthCertificateNumber: string;
}

interface StudentRegistrationFormProps {
  onSubmit: (data: StudentFormData) => Promise<void>;
  isLoading?: boolean;
}

const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    educationLevel: 'darasa1',
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: 'parent',
    homeAddress: '',
    birthCertificateNumber: '',
  });

  const educationLevels = [
    { value: 'chekechea', label: 'Chekechea (Pre-Primary)', age: '3-5 years' },
    { value: 'darasa1', label: 'Darasa la 1 (Standard I)', age: '6-7 years' },
    { value: 'darasa2', label: 'Darasa la 2 (Standard II)', age: '7-8 years' },
    { value: 'darasa3', label: 'Darasa la 3 (Standard III)', age: '8-9 years' },
    { value: 'darasa4', label: 'Darasa la 4 (Standard IV)', age: '9-10 years' },
    { value: 'darasa5', label: 'Darasa la 5 (Standard V)', age: '10-11 years' },
    { value: 'darasa6', label: 'Darasa la 6 (Standard VI)', age: '11-12 years' },
    { value: 'darasa7', label: 'Darasa la 7 (Standard VII)', age: '12-13 years' },
    { value: 'form1', label: 'Form I (Kidato cha 1)', age: '13-14 years' },
    { value: 'form2', label: 'Form II (Kidato cha 2)', age: '14-15 years' },
    { value: 'form3', label: 'Form III (Kidato cha 3)', age: '15-16 years' },
    { value: 'form4', label: 'Form IV (Kidato cha 4)', age: '16-17 years' },
    { value: 'form5', label: 'Form V (Kidato cha 5)', age: '17-18 years' },
    { value: 'form6', label: 'Form VI (Kidato cha 6)', age: '18-19 years' },
  ];

  const relationshipOptions = [
    { value: 'parent', label: 'Parent (Mzazi)' },
    { value: 'guardian', label: 'Guardian (Mlezi)' },
    { value: 'grandparent', label: 'Grandparent (Nyanyake/Babu)' },
    { value: 'uncle_aunt', label: 'Uncle/Aunt (Mjomba/Shangazi)' },
    { value: 'other', label: 'Other (Nyingine)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Student Registration</span>
          <span>🎒</span>
        </CardTitle>
        <CardDescription>
          Register a new student in the Tanzanian education system (Usajili wa Mwanafunzi)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Student Information (Taarifa za Mwanafunzi)</h3>
            
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth (Tarehe ya Kuzaliwa) *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender (Jinsia) *</Label>
                <Select value={formData.gender} onValueChange={(value: any) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male (Mwanaume)</SelectItem>
                    <SelectItem value="female">Female (Mwanamke)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthCertificateNumber">Birth Certificate No. *</Label>
                <Input
                  id="birthCertificateNumber"
                  value={formData.birthCertificateNumber}
                  onChange={(e) => handleInputChange('birthCertificateNumber', e.target.value)}
                  placeholder="Birth certificate number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationLevel">Education Level (Kiwango cha Elimu) *</Label>
              <Select value={formData.educationLevel} onValueChange={(value: any) => handleInputChange('educationLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label} ({level.age})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousSchool">Previous School (Shule ya Awali)</Label>
              <Input
                id="previousSchool"
                value={formData.previousSchool || ''}
                onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                placeholder="Name of previous school (if any)"
              />
            </div>
          </div>

          {/* Guardian Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Guardian Information (Taarifa za Mlezi)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardianName">Guardian Name (Jina la Mlezi) *</Label>
                <Input
                  id="guardianName"
                  value={formData.guardianName}
                  onChange={(e) => handleInputChange('guardianName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianRelationship">Relationship (Uhusiano) *</Label>
                <Select value={formData.guardianRelationship} onValueChange={(value) => handleInputChange('guardianRelationship', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardianPhone">Guardian Phone (Simu ya Mlezi) *</Label>
                <Input
                  id="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                  placeholder="+255 XXX XXX XXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianEmail">Guardian Email (optional)</Label>
                <Input
                  id="guardianEmail"
                  type="email"
                  value={formData.guardianEmail || ''}
                  onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeAddress">Home Address (Anwani ya Nyumbani) *</Label>
              <Textarea
                id="homeAddress"
                value={formData.homeAddress}
                onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                placeholder="Full home address including region, district, ward, and street"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information (Taarifa za Ziada)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Special Needs (Mahitaji Maalum)</Label>
              <Textarea
                id="specialNeeds"
                value={formData.specialNeeds || ''}
                onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                placeholder="Any special educational needs or accommodations required"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Medical Conditions (Hali za Kiafya)</Label>
              <Textarea
                id="medicalConditions"
                value={formData.medicalConditions || ''}
                onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                placeholder="Any medical conditions the school should be aware of"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registering... ⏳' : 'Register Student 🎉'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentRegistrationForm;
