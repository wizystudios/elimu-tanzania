
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthData } from '@/hooks/useAuthData';
import { Building, Phone, Mail, MapPin, Calendar, Users } from 'lucide-react';

const SchoolDetails = () => {
  const { id } = useParams();
  const { schoolDetails, isLoading } = useAuthData();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tanzanian-blue"></div>
        </div>
      </MainLayout>
    );
  }

  if (!schoolDetails) {
    return (
      <MainLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">School Details</h1>
          <p className="text-gray-500">No school information available</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{schoolDetails.name}</h1>
          <p className="text-gray-600">School Information and Details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">School Name</label>
                <p className="text-lg">{schoolDetails.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Registration Number</label>
                <p>{schoolDetails.registration_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">School Type</label>
                <p className="capitalize">{schoolDetails.type}</p>
              </div>
              {schoolDetails.established_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Established</label>
                  <p>{new Date(schoolDetails.established_date).getFullYear()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{schoolDetails.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{schoolDetails.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{schoolDetails.subdomain}.lovable.app</span>
              </div>
            </CardContent>
          </Card>

          {schoolDetails.description && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>About the School</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{schoolDetails.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SchoolDetails;
