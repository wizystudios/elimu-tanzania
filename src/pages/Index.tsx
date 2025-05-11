
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivities from '@/components/dashboard/RecentActivities';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import SchoolsOverview from '@/components/dashboard/SchoolsOverview';
import { School, GraduationCap, Users, Book } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, schoolId, schoolName, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<any | null>(null);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      if (!schoolId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching school data for ID:', schoolId);
        
        // Fetch school data
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('*, school_locations(*)')
          .eq('id', schoolId)
          .maybeSingle();
          
        if (schoolError) {
          console.error('Error fetching school data:', schoolError);
          throw schoolError;
        }
        
        console.log('Fetched school data:', school);
        setSchoolData(school);
        
        // Fetch stats
        const [studentsResult, teachersResult, classesResult] = await Promise.all([
          supabase
            .from('students')
            .select('id', { count: 'exact' })
            .eq('school_id', schoolId),
          supabase
            .from('user_roles')
            .select('id', { count: 'exact' })
            .eq('school_id', schoolId)
            .eq('role', 'teacher'),
          supabase
            .from('classes')
            .select('id', { count: 'exact' })
            .eq('school_id', schoolId)
        ]);
        
        setStats({
          students: studentsResult.count || 0,
          teachers: teachersResult.count || 0,
          classes: classesResult.count || 0
        });
        
        // Fetch recent activities
        const { data: activities } = await supabase
          .from('announcements')
          .select('*, sender:sender_id(first_name, last_name)')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentActivities(
          activities ? activities.map(activity => ({
            id: activity.id,
            user: {
              name: activity.sender?.first_name + ' ' + activity.sender?.last_name || 'Admin',
              avatar: '',
            },
            action: activity.title,
            target: activity.content,
            timestamp: new Date(activity.created_at).toLocaleString(),
            status: 'completed' as const,
          })) : [{
            id: '1',
            user: {
              name: user?.email?.split('@')[0] || 'Admin',
              avatar: '',
            },
            action: 'registered the school',
            target: schoolName,
            timestamp: 'recently',
            status: 'completed' as const,
          }]
        );
        
        // Fetch upcoming events
        const { data: events } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('school_id', schoolId)
          .gt('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(5);
          
        setUpcomingEvents(
          events ? events.map(event => ({
            id: event.id,
            title: event.title,
            date: new Date(event.start_date).toLocaleDateString(),
            time: new Date(event.start_date).toLocaleTimeString(),
            location: event.description || 'School',
            type: event.type || 'event' as const,
          })) : [{
            id: '1',
            title: 'Complete School Setup',
            date: new Date().toLocaleDateString(),
            time: 'Today',
            location: 'Admin Dashboard',
            type: 'task' as const,
          }]
        );
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Hitilafu imetokea wakati wa kupakua data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [schoolId, schoolName, user, navigate]);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center">
            <Spinner className="h-8 w-8" />
            <p className="mt-4 text-gray-600">Inapakia data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">
          {schoolName ? `Karibu kwenye ${schoolName}` : 'Karibu kwenye Elimu Tanzania School Management System.'}
        </p>
      
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatCard 
            title="Students" 
            value={stats.students.toString()} 
            icon={<Users className="h-5 w-5" />} 
            change={{ value: 0, positive: true }}
            color="green"
          />
          <StatCard 
            title="Teachers" 
            value={stats.teachers.toString()} 
            icon={<GraduationCap className="h-5 w-5" />} 
            change={{ value: 0, positive: true }}
            color="purple"
          />
          <StatCard 
            title="Classes" 
            value={stats.classes.toString()} 
            icon={<Book className="h-5 w-5" />}
            change={{ value: 0, positive: true }}
            color="yellow"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* School Overview */}
          <div className="lg:col-span-2">
            {schoolData ? (
              <SchoolsOverview schools={[schoolData]} />
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">School Information</h3>
                <p>No school data available.</p>
              </div>
            )}
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
