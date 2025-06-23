
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, BookOpen, BarChart3 } from 'lucide-react';

const AcademicProgress = () => {
  const { userRole } = useAuth();

  if (!['parent', 'student'].includes(userRole || '')) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>This page is only accessible to parents and students.</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Overall Performance</span>
              </CardTitle>
              <CardDescription>
                General academic performance overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Performance metrics and trends</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Achievements</span>
              </CardTitle>
              <CardDescription>
                Awards and recognitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Academic achievements and awards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Subject Performance</span>
              </CardTitle>
              <CardDescription>
                Performance by subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Detailed subject-wise performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Progress Charts</span>
              </CardTitle>
              <CardDescription>
                Visual progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Charts and graphs showing progress over time</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AcademicProgress;
