
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, Phone, Mail, Calendar, Users } from 'lucide-react';
import { useAuthData } from '@/hooks/useAuthData';

const SchoolInfo = () => {
  const { schoolDetails, isLoading } = useAuthData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>School Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!schoolDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>School Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No school information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5" />
          <span>School Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{schoolDetails.name}</h3>
          <p className="text-sm text-gray-600">Registration: {schoolDetails.registration_number}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{schoolDetails.email}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{schoolDetails.phone}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="capitalize">{schoolDetails.type} School</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {schoolDetails.established_date && (
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Est. {new Date(schoolDetails.established_date).getFullYear()}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{schoolDetails.subdomain}.lovable.app</span>
            </div>
          </div>
        </div>

        {schoolDetails.description && (
          <div className="mt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">About</h4>
            <p className="text-sm text-gray-600">{schoolDetails.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolInfo;
