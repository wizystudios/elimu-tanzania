
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivities from '@/components/dashboard/RecentActivities';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import SchoolsOverview from '@/components/dashboard/SchoolsOverview';
import { schools } from '@/data/mockData';
import { School, GraduationCap, Users, Book } from 'lucide-react';

const Dashboard = () => {
  // Mock data for recent activities
  const recentActivities = [
    {
      id: '1',
      user: {
        name: 'Fatima Hassan',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop',
      },
      action: 'registered a new student in',
      target: 'Class 4A',
      timestamp: '10 minutes ago',
      status: 'completed' as const,
    },
    {
      id: '2',
      user: {
        name: 'Emmanuel Mwenda',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop',
      },
      action: 'submitted exam results for',
      target: 'Mathematics - Class 4B',
      timestamp: '2 hours ago',
      status: 'completed' as const,
    },
    {
      id: '3',
      user: {
        name: 'Grace Makonjo',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1374&auto=format&fit=crop',
      },
      action: 'updated the class schedule for',
      target: 'Form 2B',
      timestamp: '4 hours ago',
      status: 'pending' as const,
    },
    {
      id: '4',
      user: {
        name: 'James Kimaro',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1374&auto=format&fit=crop',
      },
      action: 'registered a new school',
      target: 'Zanzibar Secondary School',
      timestamp: '1 day ago',
      status: 'completed' as const,
    },
    {
      id: '5',
      user: {
        name: 'David Munuo',
      },
      action: 'requested access to student records',
      timestamp: '1 day ago',
      status: 'pending' as const,
    }
  ];

  // Mock data for upcoming events
  const upcomingEvents = [
    {
      id: '1',
      title: 'End of Term Examinations',
      date: 'May 15, 2025',
      time: '8:00 AM',
      location: 'All Schools',
      type: 'exam' as const,
    },
    {
      id: '2',
      title: 'Teachers Meeting',
      date: 'May 10, 2025',
      time: '2:00 PM',
      location: 'Main Conference Room',
      type: 'meeting' as const,
    },
    {
      id: '3',
      title: 'Parents Day',
      date: 'May 20, 2025',
      time: '9:00 AM',
      location: 'School Grounds',
      type: 'meeting' as const,
    },
    {
      id: '4',
      title: 'National Holiday - Workers Day',
      date: 'May 1, 2025',
      type: 'holiday' as const,
    }
  ];

  return (
    <MainLayout>
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to Elimu Tanzania School Management System.</p>
      
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Total Schools" 
            value="4" 
            icon={<School className="h-5 w-5" />} 
            change={{ value: 25, positive: true }}
            color="blue"
          />
          <StatCard 
            title="Students" 
            value="156" 
            icon={<Users className="h-5 w-5" />} 
            change={{ value: 12, positive: true }}
            color="green"
          />
          <StatCard 
            title="Teachers" 
            value="28" 
            icon={<GraduationCap className="h-5 w-5" />} 
            change={{ value: 5, positive: true }}
            color="purple"
          />
          <StatCard 
            title="Classes" 
            value="18" 
            icon={<Book className="h-5 w-5" />}
            change={{ value: 8, positive: true }}
            color="yellow"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schools Overview */}
          <div className="lg:col-span-2">
            <SchoolsOverview schools={schools} />
          </div>
          
          {/* Upcoming Events */}
          <div>
            <UpcomingEvents events={upcomingEvents} />
          </div>
          
          {/* Recent Activities */}
          <div className="lg:col-span-3">
            <RecentActivities activities={recentActivities} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
