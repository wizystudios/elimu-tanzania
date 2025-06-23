
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import { useAuthData } from '@/hooks/useAuthData';

const UserProfile = () => {
  const { userDetails, isLoading } = useAuthData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Profile</span>
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

  if (!userDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No user information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>User Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 flex-shrink-0">
            {userDetails.profile_image ? (
              <img 
                src={userDetails.profile_image} 
                alt={`${userDetails.first_name || ''} ${userDetails.last_name || ''}`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-tanzanian-blue flex items-center justify-center text-white font-semibold text-lg">
                {userDetails.first_name?.charAt(0) || ''}
                {userDetails.last_name?.charAt(0) || ''}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {userDetails.first_name} {userDetails.last_name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="capitalize">
                {userDetails.role}
              </Badge>
              {userDetails.teacher_role && (
                <Badge variant="outline" className="capitalize">
                  {userDetails.teacher_role}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{userDetails.email}</span>
          </div>
          
          {userDetails.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{userDetails.phone}</span>
            </div>
          )}
          
          {userDetails.date_of_birth && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{new Date(userDetails.date_of_birth).toLocaleDateString()}</span>
            </div>
          )}
          
          {userDetails.school_name && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{userDetails.school_name}</span>
            </div>
          )}
        </div>

        {userDetails.national_id && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-gray-500">National ID: {userDetails.national_id}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;
