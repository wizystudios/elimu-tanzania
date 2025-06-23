
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

// Define the type for the announcement data structure
interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_important: boolean;
  recipient_type: string;
  sender_id: string;
  class_id: string | null;
  profiles: {
    first_name: string;
    last_name: string;
    profile_image: string | null;
  } | null;
  classes: {
    name: string;
  } | null;
}

const AnnouncementDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { schoolId } = useAuth();

  // Fetch announcement details
  const { data: announcement, isLoading } = useQuery({
    queryKey: ['announcement', id],
    queryFn: async (): Promise<AnnouncementData | null> => {
      if (!id || !schoolId) return null;
      
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
          class_id,
          profiles!sender_id (
            first_name,
            last_name,
            profile_image
          ),
          classes!class_id (
            name
          )
        `)
        .eq('id', id)
        .eq('school_id', schoolId)
        .single();
        
      if (error) throw error;
      return data as AnnouncementData;
    },
    enabled: !!id && !!schoolId
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Spinner className="h-8 w-8" />
            <p className="mt-4 text-gray-500">Loading announcement...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!announcement) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-700">Announcement not found</h2>
          <p className="text-gray-500 mt-2">The announcement you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/announcements')} className="mt-4">
            Back to Announcements
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getRecipientTypeDisplay = (type: string) => {
    switch (type) {
      case 'all_school': return 'School-wide';
      case 'teachers': return 'Teachers';
      case 'students': return 'Students';
      case 'parents': return 'Parents';
      case 'class': return `Class: ${announcement.classes?.name || 'Unknown'}`;
      default: return type;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/announcements')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Announcements
          </Button>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                  {announcement.is_important && (
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>
                      {announcement.profiles?.first_name} {announcement.profiles?.last_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(announcement.created_at), 'PPP')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {getRecipientTypeDisplay(announcement.recipient_type)}
                </Badge>
                {announcement.is_important && (
                  <Badge variant="destructive">Important</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {announcement.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AnnouncementDetails;
