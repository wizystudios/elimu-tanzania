
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ChatUserList from '@/components/chat/ChatUserList';
import ChatWindow from '@/components/chat/ChatWindow';
import { MessageCircle } from 'lucide-react';

interface ChatUser {
  id: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  role: string;
  is_online?: boolean;
}

const RealTimeChat = () => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  const handleSelectUser = (user: ChatUser) => {
    setSelectedUser(user);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <MessageCircle className="h-7 w-7" />
            <span>Real-Time Chat</span>
          </h1>
          <p className="text-gray-600">Communicate with teachers, students, parents, and administrators</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ChatUserList onSelectUser={handleSelectUser} selectedUserId={selectedUser?.id} />
          </div>
          
          <div className="lg:col-span-2">
            {selectedUser ? (
              <ChatWindow
                receiverId={selectedUser.id}
                receiverName={`${selectedUser.first_name} ${selectedUser.last_name}`}
                receiverRole={selectedUser.role}
              />
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Select a user to start chatting</h3>
                  <p className="text-gray-500">Choose someone from the list to begin a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RealTimeChat;
