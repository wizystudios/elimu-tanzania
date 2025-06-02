
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ChatUserList from '@/components/chat/ChatUserList';
import ImprovedChatWindow from '@/components/chat/ImprovedChatWindow';
import { MessageCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChatUser {
  id: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  role: string;
  is_online?: boolean;
}

const ImprovedRealTimeChat = () => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  const handleSelectUser = (user: ChatUser) => {
    setSelectedUser(user);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <MessageCircle className="h-7 w-7 text-tanzanian-blue" />
            <span>Professional Chat</span>
          </h1>
          <p className="text-gray-600">Connect and collaborate with your school community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User List */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <Users className="h-5 w-5" />
                  <span>Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ChatUserList onSelectUser={handleSelectUser} selectedUserId={selectedUser?.id} />
              </CardContent>
            </Card>
          </div>
          
          {/* Chat Window */}
          <div className="lg:col-span-3">
            {selectedUser ? (
              <ImprovedChatWindow
                receiverId={selectedUser.id}
                receiverName={`${selectedUser.first_name} ${selectedUser.last_name}`}
                receiverRole={selectedUser.role}
                receiverImage={selectedUser.profile_image}
              />
            ) : (
              <Card className="h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-dashed border-2 border-gray-300">
                <div className="text-center">
                  <div className="bg-white rounded-full p-6 shadow-lg mb-6 mx-auto w-fit">
                    <MessageCircle className="h-16 w-16 text-tanzanian-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Professional Chat</h3>
                  <p className="text-gray-500 max-w-md">
                    Select a contact from the list to start a professional conversation. 
                    Connect with teachers, students, parents, and administrators.
                  </p>
                  <div className="mt-6 flex justify-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Real-time messaging</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Professional interface</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ImprovedRealTimeChat;
