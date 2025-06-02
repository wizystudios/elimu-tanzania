
import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, User, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your ElimuTanzania assistant. I\'m here to help you with any questions about the school management system. How can I assist you today?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Predefined responses for common questions
  const getResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('password') && lowerMessage.includes('reset')) {
      return 'To reset a password, an admin can go to the Users page, find the user, and click "Edit" to set a new password. The user will then be able to log in with the new password immediately.';
    }
    
    if (lowerMessage.includes('add') && lowerMessage.includes('user')) {
      return 'To add a new user, go to the Users page and click "Add User". Fill in the required information including name, email, password, and role. The user will be able to log in immediately with the credentials you provide.';
    }
    
    if (lowerMessage.includes('chat') || lowerMessage.includes('message')) {
      return 'You can use the Chat feature to communicate with other users in real-time. Go to the Chat page, select a user from the list, and start chatting. You can also use the Messages page for announcements.';
    }
    
    if (lowerMessage.includes('student') && lowerMessage.includes('add')) {
      return 'To add a student, go to the Students page and click "Add Student". You\'ll need to provide their personal information, contact details, and assign them to a class.';
    }
    
    if (lowerMessage.includes('teacher') && lowerMessage.includes('add')) {
      return 'To add a teacher, go to the Teachers page and click "Add Teacher". Provide their information and you can assign them to subjects and classes later.';
    }
    
    if (lowerMessage.includes('class') || lowerMessage.includes('subject')) {
      return 'You can manage classes and subjects from their respective pages. Create classes, assign teachers, and enroll students. Subjects can be created and linked to classes and teachers.';
    }
    
    if (lowerMessage.includes('exam') || lowerMessage.includes('result')) {
      return 'The Exams page allows you to create exams, schedule them, and record results. You can view exam schedules in the calendar and generate reports.';
    }
    
    if (lowerMessage.includes('settings') || lowerMessage.includes('school')) {
      return 'In Settings, you can update school information, contact details, location, administrator information, and system preferences including language settings.';
    }
    
    if (lowerMessage.includes('attendance')) {
      return 'Track student attendance from the Students page. You can mark attendance for classes and generate attendance reports.';
    }
    
    if (lowerMessage.includes('parent')) {
      return 'Parents can be added from the Parents page and linked to students. They can view their children\'s progress and communicate with teachers.';
    }
    
    if (lowerMessage.includes('calendar') || lowerMessage.includes('event')) {
      return 'Use the Calendar to view and manage school events, exam schedules, and important dates. You can add events and set reminders.';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return 'For additional support, you can contact us at info@elimutanzania.co.tz or call +255784813540. You can also explore the various features through the navigation menu.';
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! Welcome to ElimuTanzania. I\'m here to help you navigate the school management system. What would you like to know?';
    }
    
    // Default response
    return 'I understand you\'re asking about "' + message + '". Here are some things I can help you with:\n\n• Adding and managing users, students, teachers\n• Password resets and user management\n• Using the chat and messaging features\n• Managing classes, subjects, and exams\n• School settings and configuration\n• Attendance tracking\n• Calendar and events\n\nCould you please be more specific about what you need help with?';
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getResponse(newMessage);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How do I add a new user?",
    "How do I reset a password?",
    "How do I use the chat feature?",
    "How do I add students?",
    "How do I manage exams?"
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Bot className="h-7 w-7 text-tanzanian-blue" />
            <span>Help Assistant</span>
          </h1>
          <p className="text-gray-600">Get instant help with the ElimuTanzania school management system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Help */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>Quick Help</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start text-xs"
                    onClick={() => setNewMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Contact Support</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Email:</strong> info@elimutanzania.co.tz</p>
                    <p><strong>Phone:</strong> +255784813540</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-tanzanian-blue" />
                  <span>Chat with Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={message.isBot ? 'bg-tanzanian-blue text-white' : 'bg-gray-600 text-white'}>
                              {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`px-3 py-2 rounded-lg ${
                              message.isBot
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-tanzanian-blue text-white'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-tanzanian-blue text-white">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="px-3 py-2 rounded-lg bg-gray-100">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about the system..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send your message
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chatbot;
