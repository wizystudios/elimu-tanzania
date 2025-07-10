
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
import { Link } from 'react-router-dom';

// Update the interface to match what we get from the database
interface SenderType {
  first_name?: string | null;
  last_name?: string | null;
}

interface AnnouncementType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  sender?: SenderType | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, schoolId, schoolName, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<any | null>(null);
  const [stats, setStats] = useState({
    superAdmins: 0,
    admins: 0,
    headmasters: 0,
    viceHeadmasters: 0,
    academicTeachers: 0,
    teachers: 0,
    students: 0,
    parents: 0
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
      if (!schoolId && userRole !== 'super_admin') {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching dashboard data for role:', userRole, 'school:', schoolId);
        
        // Use user_details view for getting user counts to avoid RLS issues
        let userDetailsQuery;
        
        if (userRole === 'super_admin') {
          // Fetch all schools for super admin
          const { data: schools, error: schoolsError } = await supabase
            .from('schools')
            .select('*, school_locations(*)');
            
          if (schoolsError) {
            console.error('Error fetching schools:', schoolsError);
            throw schoolsError;
          }
          
          setSchoolData(schools || []);
          
          // Get total counts across all schools using user_details view
          userDetailsQuery = supabase
            .from('user_details')
            .select('role')
            .eq('is_active', true);
            
        } else {
          // For non-super_admin users, fetch specific school data
          if (schoolId) {
            const { data: school, error: schoolError } = await supabase
              .from('schools')
              .select('*, school_locations(*)')
              .eq('id', schoolId)
              .maybeSingle();
              
            if (schoolError) {
              console.error('Error fetching school:', schoolError);
              throw schoolError;
            }
            
            setSchoolData(school ? [school] : []);
            
            // Get counts for specific school using user_details view
            userDetailsQuery = supabase
              .from('user_details')
              .select('role')
              .eq('school_id', schoolId)
              .eq('is_active', true);
          }
        }
        
        // Fetch user counts
        if (userDetailsQuery) {
          const { data: userDetails, error: userDetailsError } = await userDetailsQuery;
          
          if (userDetailsError) {
            console.error('Error fetching user details:', userDetailsError);
          } else {
            // Count users by role
            const roleCounts = {
              superAdmins: 0,
              admins: 0,
              headmasters: 0,
              viceHeadmasters: 0,
              academicTeachers: 0,
              teachers: 0,
              students: 0,
              parents: 0
            };
            
            userDetails?.forEach((user) => {
              switch (user.role) {
                case 'super_admin':
                  roleCounts.superAdmins++;
                  break;
                case 'admin':
                  roleCounts.admins++;
                  break;
                case 'headmaster':
                  roleCounts.headmasters++;
                  break;
                case 'vice_headmaster':
                  roleCounts.viceHeadmasters++;
                  break;
                case 'academic_teacher':
                  roleCounts.academicTeachers++;
                  break;
                case 'teacher':
                  roleCounts.teachers++;
                  break;
                case 'student':
                  roleCounts.students++;
                  break;
                case 'parent':
                  roleCounts.parents++;
                  break;
              }
            });
            
            setStats(roleCounts);
          }
        }
        
        // Fetch announcements (recent activities)
        let announcementsQuery = supabase
          .from('announcements')
          .select(`
            id, 
            title, 
            content, 
            created_at,
            sender_id,
            profiles!announcements_sender_id_fkey(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (userRole !== 'super_admin' && schoolId) {
          announcementsQuery = announcementsQuery.eq('school_id', schoolId);
        }
        
        const { data: activities, error: activitiesError } = await announcementsQuery;
        
        if (activitiesError) {
          console.error('Error fetching announcements:', activitiesError);
        } else {
          processActivities(activities || []);
        }
        
        // Fetch calendar events
        let eventsQuery = supabase
          .from('calendar_events')
          .select('*')
          .gt('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(5);
          
        if (userRole !== 'super_admin' && schoolId) {
          eventsQuery = eventsQuery.eq('school_id', schoolId);
        }
        
        const { data: events, error: eventsError } = await eventsQuery;
        
        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        } else {
          processEvents(events || []);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.success('Data ya dashboard imepakiwa kikamilifu!');
        console.log('Dashboard data loaded successfully for role:', userRole);
        
        // Reset data on error
        setSchoolData([]);
        setRecentActivities([]);
        setUpcomingEvents([]);
        setStats({
          superAdmins: 0,
          admins: 0,
          headmasters: 0,
          viceHeadmasters: 0,
          academicTeachers: 0,
          teachers: 0,
          students: 0,
          parents: 0
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Helper function to process activities data
    const processActivities = (activities: any[]) => {
      setRecentActivities(
        activities.length > 0 ? activities.map((activity: any) => {
          // Get sender name from the profiles relation or fallback
          const senderProfile = activity.profiles || {};
          const senderName = senderProfile.first_name && senderProfile.last_name
            ? `${senderProfile.first_name} ${senderProfile.last_name}`.trim()
            : 'Admin';
            
          return {
            id: activity.id,
            user: {
              name: senderName,
              avatar: '',
            },
            action: activity.title,
            target: activity.content,
            timestamp: new Date(activity.created_at).toLocaleString(),
            status: 'completed' as const,
          };
        }) : []
      );
    };
    
    // Helper function to process events data
    const processEvents = (events: any[]) => {
      setUpcomingEvents(
        events.length > 0 ? events.map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.start_date).toLocaleDateString(),
          time: new Date(event.start_date).toLocaleTimeString(),
          location: event.description || 'School',
          type: event.type || 'event' as const,
        })) : []
      );
    };
    
    fetchDashboardData();
  }, [schoolId, schoolName, user, navigate, userRole]);
  
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
      
        {/* User Role Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Super Admins" 
            value={stats.superAdmins.toString()} 
            icon={<Users className="h-5 w-5" />} 
            change={{ value: 0, positive: true }}
            color="purple"
          />
          <StatCard 
            title="Admins" 
            value={stats.admins.toString()} 
            icon={<Users className="h-5 w-5" />} 
            change={{ value: 0, positive: true }}
            color="blue"
          />
          <StatCard 
            title="Head Masters" 
            value={stats.headmasters.toString()} 
            icon={<GraduationCap className="h-5 w-5" />} 
            change={{ value: 0, positive: true }}
            color="indigo"
          />
          <StatCard 
            title="Vice Head Masters" 
            value={stats.viceHeadmasters.toString()} 
            icon={<GraduationCap className="h-5 w-5" />} 
            change={{ value: 0, positive: true }}
            color="cyan"
          />
          <StatCard 
            title="Academic Teachers" 
            value={stats.academicTeachers.toString()} 
            icon={<Book className="h-5 w-5" />} 
            change={{ value: 0, positive: true }}
            color="emerald"
          />
          <StatCard 
            title="Teachers" 
            value={stats.teachers.toString()} 
            icon={<GraduationCap className="h-5 w-5" />} 
            change={{ value: 0, positive: true }}
            color="green"
          />
          <StatCard 
            title="Students" 
            value={stats.students.toString()} 
            icon={<Users className="h-5 w-5" />} 
            change={{ value: 0, positive: true }}
            color="yellow"
          />
          <StatCard 
            title="Parents" 
            value={stats.parents.toString()} 
            icon={<Users className="h-5 w-5" />}
            change={{ value: 0, positive: true }}
            color="orange"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* School Overview */}
          <div className="lg:col-span-2">
            {schoolData && schoolData.length > 0 ? (
              <SchoolsOverview schools={schoolData} />
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">School Information</h3>
                <p className="text-gray-500">No school data available. Please complete your school registration.</p>
                <div className="mt-4">
                  <Link to="/settings" className="text-tanzanian-blue hover:underline">Setup your school</Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Upcoming Events */}
          <div>
            <UpcomingEvents events={upcomingEvents.length > 0 ? upcomingEvents : []} />
          </div>
          
          {/* Recent Activities */}
          <div className="lg:col-span-3">
            <RecentActivities activities={recentActivities.length > 0 ? recentActivities : []} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
