
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Search, Filter, Plus, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { Link, useNavigate } from 'react-router-dom';

const Announcements = () => {
  const { schoolId } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Fetch announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          content,
          created_at,
          is_important,
          recipient_type,
          sender_id,
          profiles:sender_id (
            first_name,
            last_name,
            profile_image
          )
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  // Filter announcements based on search query and filter selection
  const filteredAnnouncements = announcements?.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'important') return matchesSearch && announcement.is_important;
    
    // Filter by recipient_type
    return matchesSearch && announcement.recipient_type === filter;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="text-gray-600">View and manage all school announcements</p>
          </div>
          <Button asChild>
            <Link to="/announcements/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
            <CardDescription>
              Browse and search through all announcements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    className="pl-10" 
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Filter:</span>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={filter === 'all' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    <Button 
                      variant={filter === 'important' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('important')}
                    >
                      Important
                    </Button>
                    <Button 
                      variant={filter === 'all_school' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('all_school')}
                    >
                      School-wide
                    </Button>
                    <Button 
                      variant={filter === 'teachers' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('teachers')}
                    >
                      Teachers
                    </Button>
                    <Button 
                      variant={filter === 'students' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('students')}
                    >
                      Students
                    </Button>
                    <Button 
                      variant={filter === 'parents' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFilter('parents')}
                    >
                      Parents
                    </Button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="flex flex-col items-center">
                    <Spinner className="h-8 w-8" />
                    <p className="mt-4 text-gray-500">Loading announcements...</p>
                  </div>
                </div>
              ) : filteredAnnouncements && filteredAnnouncements.length > 0 ? (
                <div className="divide-y">
                  {filteredAnnouncements.map(announcement => (
                    <div 
                      key={announcement.id}
                      className="py-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/announcements/${announcement.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 flex-shrink-0">
                            {announcement.profiles?.profile_image ? (
                              <img 
                                src={announcement.profiles.profile_image} 
                                alt={`${announcement.profiles.first_name} ${announcement.profiles.last_name}`}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-tanzanian-blue flex items-center justify-center text-white">
                                {announcement.profiles?.first_name?.charAt(0) || ''}
                                {announcement.profiles?.last_name?.charAt(0) || ''}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{announcement.title}</h3>
                              {announcement.is_important && (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              By {announcement.profiles?.first_name || 'Unknown'} {announcement.profiles?.last_name || 'User'} • 
                              {format(new Date(announcement.created_at), ' MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                          {announcement.recipient_type === 'all_school' && 'School-wide'}
                          {announcement.recipient_type === 'teachers' && 'Teachers'}
                          {announcement.recipient_type === 'students' && 'Students'}
                          {announcement.recipient_type === 'parents' && 'Parents'}
                        </div>
                      </div>
                      <div className="mt-2 text-gray-600 line-clamp-2 pl-[3.25rem]">
                        {announcement.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto" />
                  <h3 className="mt-4 font-medium text-gray-700">No announcements found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchQuery 
                      ? 'Try adjusting your search or filters' 
                      : 'There are no announcements yet'}
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/announcements/create">
                      Create New Announcement
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Announcements;
