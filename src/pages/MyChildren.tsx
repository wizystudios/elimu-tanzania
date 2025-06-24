
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const MyChildren = () => {
  const { userRole } = useAuth();

  if (userRole !== 'parent') {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600">This page is only accessible to parents.</p>
          </div>
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
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-tanzanian-blue" />
                <span>Children Overview</span>
              </CardTitle>
              <CardDescription>
                View all your registered children
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Feature coming soon</p>
                <div className="text-2xl font-bold text-tanzanian-blue">0</div>
                <p className="text-xs text-gray-500">Registered children</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span>Academic Performance</span>
              </CardTitle>
              <CardDescription>
                Track academic progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">View grades and performance metrics</p>
                <div className="text-2xl font-bold text-green-600">--</div>
                <p className="text-xs text-gray-500">Average grade</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span>Attendance</span>
              </CardTitle>
              <CardDescription>
                Monitor attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Check daily attendance status</p>
                <div className="text-2xl font-bold text-orange-600">--%</div>
                <p className="text-xs text-gray-500">Attendance rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Recent Updates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">No recent updates available</p>
              <p className="text-sm text-gray-400 mt-2">Check back later for new information about your children</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MyChildren;
