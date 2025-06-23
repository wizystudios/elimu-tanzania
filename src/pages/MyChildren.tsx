
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';

const MyChildren = () => {
  const { userRole } = useAuth();

  if (userRole !== 'parent') {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>This page is only accessible to parents.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Children</h1>
          <p className="text-gray-600">View and manage your children's information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Children Overview</span>
              </CardTitle>
              <CardDescription>
                View all your registered children
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Coming soon - Children list and details</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Academic Performance</span>
              </CardTitle>
              <CardDescription>
                Track academic progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">View grades and performance metrics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Attendance</span>
              </CardTitle>
              <CardDescription>
                Monitor attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Check daily attendance status</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyChildren;
