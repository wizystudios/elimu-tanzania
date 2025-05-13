
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Send, Plus, MoreHorizontal, Star, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    participants: [
      { id: 'user2', name: 'Anna Malinga', avatar: null, isOnline: true },
    ],
    lastMessage: {
      id: 'm1',
      text: 'When is the next staff meeting scheduled?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      sender: 'user2',
      read: false,
    },
    isStarred: true,
  },
  {
    id: '2',
    participants: [
      { id: 'user3', name: 'Joseph Mwenda', avatar: null, isOnline: false },
    ],
    lastMessage: {
      id: 'm2',
      text: "I'll send you the exam schedule later today",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      sender: 'currentUser',
      read: true,
    },
    isStarred: false,
  },
  {
    id: '3',
    participants: [
      { id: 'user4', name: 'Headmaster', avatar: null, isOnline: true },
    ],
    lastMessage: {
      id: 'm3',
      text: 'Please submit your term reports by Friday',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      sender: 'user4',
      read: true,
    },
    isStarred: false,
  },
  {
    id: '4',
    participants: [
      { id: 'user5', name: 'Sarah Kimani', avatar: null, isOnline: false },
      { id: 'user6', name: 'Daniel Okumu', avatar: null, isOnline: false },
      { id: 'user7', name: 'Maria Nkosi', avatar: null, isOnline: false },
    ],
    lastMessage: {
      id: 'm4',
      text: 'Thank you all for attending the meeting',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30),
      sender: 'currentUser',
      read: true,
    },
    isStarred: false,
    isGroup: true,
    groupName: 'Math Department'
  },
];

// Mock messages for the selected conversation
const mockMessages = [
  {
    id: '1',
    text: 'Hello! When is the next staff meeting scheduled?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    sender: 'user2',
  },
  {
    id: '2',
    text: 'Hi Anna, the staff meeting is scheduled for Wednesday at 2 PM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    sender: 'currentUser',
  },
  {
    id: '3',
    text: 'Will it be in the conference room?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
    sender: 'user2',
  },
  {
    id: '4',
    text: 'Yes, in the main conference room. The agenda will be sent tomorrow morning.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    sender: 'currentUser',
  },
  {
    id: '5',
    text: 'Thanks for the information!',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    sender: 'user2',
  },
];

const Messages = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>('1'); // Default to the first conversation
  const [messageText, setMessageText] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  
  const filteredConversations = mockConversations.filter(conversation => {
    // Filter based on search query
    if (searchQuery) {
      const participantNames = conversation.participants.map(p => p.name.toLowerCase()).join(' ');
      const groupName = conversation.groupName?.toLowerCase() || '';
      
      return participantNames.includes(searchQuery.toLowerCase()) || 
             groupName.includes(searchQuery.toLowerCase()) ||
             conversation.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    // Filter based on tab
    if (currentTab === 'starred') {
      return conversation.isStarred;
    }
    
    if (currentTab === 'unread') {
      return !conversation.lastMessage.read && conversation.lastMessage.sender !== 'currentUser';
    }
    
    return true;
  });
  
  const activeConversation = mockConversations.find(convo => convo.id === activeConversationId);
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // In a real implementation, this would send the message to a backend
    console.log('Sending message:', messageText);
    
    // Clear the input
    setMessageText('');
  };
  
  const getConversationTitle = (conversation: any) => {
    if (conversation.isGroup) {
      return conversation.groupName;
    } else {
      return conversation.participants[0].name;
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)]">
        <div className="text-2xl font-bold mb-4">Messages</div>
        
        <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-full sm:w-72 md:w-80 border-r border-gray-200 flex flex-col">
            {/* Search and New Message */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search messages..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
            
            {/* Conversation Tabs */}
            <Tabs 
              value={currentTab} 
              onValueChange={setCurrentTab} 
              className="flex-1 flex flex-col"
            >
              <div className="px-2 border-b border-gray-200">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                  <TabsTrigger value="starred" className="flex-1">Starred</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="flex-1 overflow-y-auto m-0 data-[state=active]:flex flex-col">
                {renderConversations()}
              </TabsContent>
              
              <TabsContent value="unread" className="flex-1 overflow-y-auto m-0 data-[state=active]:flex flex-col">
                {renderConversations()}
              </TabsContent>
              
              <TabsContent value="starred" className="flex-1 overflow-y-auto m-0 data-[state=active]:flex flex-col">
                {renderConversations()}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Conversation Area */}
          <div className="hidden sm:flex flex-1 flex-col">
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-tanzanian-blue/10 flex items-center justify-center text-tanzanian-blue mr-3">
                      {activeConversation.isGroup ? (
                        <User className="h-5 w-5" />
                      ) : (
                        getInitials(activeConversation.participants[0].name)
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {getConversationTitle(activeConversation)}
                      </div>
                      {activeConversation.isGroup && (
                        <div className="text-xs text-gray-500">
                          {activeConversation.participants.length + 1} members
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
                  {mockMessages.map(message => {
                    const isCurrentUser = message.sender === 'currentUser';
                    
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-3 ${isCurrentUser ? 'bg-tanzanian-blue text-white' : 'bg-gray-100'}`}>
                          <div>{message.text}</div>
                          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                            {format(message.timestamp, 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex space-x-2"
                  >
                    <Input 
                      placeholder="Type your message..." 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!messageText.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col p-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <Send className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium">No conversation selected</h3>
                <p className="text-gray-500 text-center mt-2">Select a conversation to view messages or start a new one</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile view - show only list or only conversation */}
          <div className="sm:hidden flex-1 flex flex-col">
            {!activeConversationId ? (
              // Show conversation list on mobile when no conversation selected
              <div className="flex-1 overflow-y-auto">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                    <TabsTrigger value="starred" className="flex-1">Starred</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-0">
                    {renderConversations(true)}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              // Show selected conversation on mobile
              <>
                {/* Mobile Conversation Header with back button */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-2"
                    onClick={() => setActiveConversationId(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"/></svg>
                  </Button>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-tanzanian-blue/10 flex items-center justify-center text-tanzanian-blue mr-2">
                      {activeConversation && activeConversation.isGroup ? (
                        <User className="h-4 w-4" />
                      ) : (
                        activeConversation && getInitials(activeConversation.participants[0].name)
                      )}
                    </div>
                    <div className="font-medium">
                      {activeConversation && getConversationTitle(activeConversation)}
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-3 overflow-y-auto flex flex-col space-y-3">
                  {mockMessages.map(message => {
                    const isCurrentUser = message.sender === 'currentUser';
                    
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-3 ${isCurrentUser ? 'bg-tanzanian-blue text-white' : 'bg-gray-100'}`}>
                          <div>{message.text}</div>
                          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                            {format(message.timestamp, 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Message Input */}
                <div className="p-3 border-t border-gray-200">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex space-x-2"
                  >
                    <Input 
                      placeholder="Type your message..." 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!messageText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Note: This messaging interface is a demonstration. Full messaging functionality will be coming soon.</p>
        </div>
      </div>
    </MainLayout>
  );
  
  function renderConversations(isMobile = false) {
    return (
      <>
        {filteredConversations.length > 0 ? (
          <div>
            {filteredConversations.map(conversation => {
              const isActive = conversation.id === activeConversationId;
              const isUnread = !conversation.lastMessage.read && conversation.lastMessage.sender !== 'currentUser';
              
              return (
                <Card
                  key={conversation.id}
                  className={`mb-px rounded-none border-0 border-b border-gray-100 cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="mr-3 relative">
                        <div className="h-10 w-10 rounded-full bg-tanzanian-blue/10 flex items-center justify-center text-tanzanian-blue">
                          {conversation.isGroup ? (
                            <User className="h-5 w-5" />
                          ) : (
                            getInitials(conversation.participants[0].name)
                          )}
                        </div>
                        
                        {conversation.participants.some(p => p.isOnline) && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate">
                            {getConversationTitle(conversation)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(conversation.lastMessage.timestamp, 'h:mm a')}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center">
                          <p className={`text-sm truncate flex-1 ${isUnread ? 'font-medium' : 'text-gray-500'}`}>
                            {conversation.lastMessage.sender === 'currentUser' ? 'You: ' : ''}
                            {conversation.lastMessage.text}
                          </p>
                          <div className="flex ml-2">
                            {conversation.isStarred && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                            {isUnread && <div className="h-2 w-2 rounded-full bg-tanzanian-blue ml-1"></div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col p-8 text-center">
            <p className="text-gray-500">No conversations found</p>
            {searchQuery && <p className="text-sm text-gray-400 mt-1">Try different search terms</p>}
          </div>
        )}
      </>
    );
  }
};

export default Messages;
