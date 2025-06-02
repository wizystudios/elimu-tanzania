
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatUser {
  id: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  role: string;
  is_online?: boolean;
}

interface ChatUserListProps {
  onSelectUser: (user: ChatUser) => void;
  selectedUserId?: string;
}

const ChatUserList: React.FC<ChatUserListProps> = ({ onSelectUser, selectedUserId }) => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, schoolId } = useAuth();

  useEffect(() => {
    if (user && schoolId) {
      fetchUsers();
    }
  }, [user, schoolId]);

  const fetchUsers = async () => {
    if (!user || !schoolId) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles:user_id (
            id,
            first_name,
            last_name,
            profile_image
          )
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .neq('user_id', user.id);

      if (error) throw error;

      const formattedUsers = data?.map(item => ({
        id: item.user_id,
        first_name: item.profiles?.first_name || '',
        last_name: item.profiles?.last_name || '',
        profile_image: item.profiles?.profile_image,
        role: item.role,
        is_online: false // We can implement real presence later
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           user.role.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'headmaster':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'teacher':
        return 'bg-green-100 text-green-800';
      case 'student':
        return 'bg-yellow-100 text-yellow-800';
      case 'parent':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <CardTitle>Users</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <div className="p-4 space-y-2">
            {filteredUsers.map((chatUser) => (
              <div
                key={chatUser.id}
                onClick={() => onSelectUser(chatUser)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUserId === chatUser.id ? 'bg-tanzanian-blue/10 border-l-4 border-tanzanian-blue' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chatUser.profile_image} />
                    <AvatarFallback>
                      {chatUser.first_name[0]}{chatUser.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {chatUser.is_online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {chatUser.first_name} {chatUser.last_name}
                  </p>
                  <Badge variant="secondary" className={`text-xs ${getRoleColor(chatUser.role)}`}>
                    {chatUser.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatUserList;
