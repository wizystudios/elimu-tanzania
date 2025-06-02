
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Users as ParentsIcon, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  MessageSquare, 
  Settings, 
  School,
  UserPlus,
  Plus,
  Bot
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/teachers', label: 'Teachers', icon: GraduationCap },
    { path: '/students', label: 'Students', icon: UserCheck },
    { path: '/parents', label: 'Parents', icon: ParentsIcon },
    { path: '/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/classes', label: 'Classes', icon: School },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/exams', label: 'Exams', icon: ClipboardList },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/real-time-chat', label: 'Chat', icon: MessageSquare },
    { path: '/chatbot', label: 'Help Bot', icon: Bot },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-tanzanian-blue p-2 rounded-lg">
            <School className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">ElimuTanzania</h1>
            <p className="text-sm text-gray-600">School Management</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-tanzanian-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              to="/users/add"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </Link>
            <Link
              to="/students/add"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Student</span>
            </Link>
            <Link
              to="/teachers/add"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Teacher</span>
            </Link>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="mb-2">
              <strong>Email:</strong> info@elimutanzania.co.tz
            </p>
            <p>
              <strong>Simu:</strong> +255784813540
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
