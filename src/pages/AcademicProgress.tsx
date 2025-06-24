
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, BookOpen, BarChart3, AlertCircle } from 'lucide-react';

const AcademicProgress = () => {
  const { userRole } = useAuth();

  if (!['parent', 'student'].includes(userRole || '')) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600">This page is only accessible to parents and students.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Academic Progress</h1>
          <p className="text-gray-600">Track academic performance and achievements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Overall Performance</span>
              </CardTitle>
              <CardDescription>
                General academic performance overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current GPA</span>
                  <span className="text-2xl font-bold text-blue-600">--</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-0"></div>
                </div>
                <p className="text-xs text-gray-500">Performance metrics coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span>Achievements</span>
              </CardTitle>
              <CardDescription>
                Awards and recognitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">0</div>
                  <p className="text-sm text-gray-600">Total achievements</p>
                </div>
                <p className="text-xs text-gray-500 text-center">Academic achievements will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span>Subject Performance</span>
              </CardTitle>
              <CardDescription>
                Performance by subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Best Subject</p>
                  <div className="text-xl font-bold text-green-600">--</div>
                </div>
                <p className="text-xs text-gray-500 text-center">Subject-wise performance coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Progress Charts</span>
              </CardTitle>
              <CardDescription>
                Visual progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-500">Chart placeholder</p>
                </div>
                <p className="text-xs text-gray-500 text-center">Progress charts coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AcademicProgress;
