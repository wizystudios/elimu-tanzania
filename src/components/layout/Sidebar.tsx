
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
  Bot,
  UserCog,
  BookMarked,
  Trophy,
  Shield,
  TreePine
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, userRole } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      { path: '/', label: 'Dashboard', icon: Home, roles: ['all'] }
    ];

    const roleSpecificItems = [
      // Super Admin & Admin
      { path: '/schools', label: 'Schools', icon: School, roles: ['super_admin'] },
      { path: '/users', label: 'Users', icon: Users, roles: ['super_admin', 'admin'] },
      
      // Teachers Management (Admin, Headmaster, Vice Headmaster)
      { path: '/teachers', label: 'Teachers', icon: GraduationCap, roles: ['super_admin', 'admin', 'headmaster', 'vice_headmaster'] },
      
      // Students Management (Admin, All Teachers)
      { path: '/students', label: 'Students', icon: UserCheck, roles: ['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher', 'teacher'] },
      
      // Parents Management (Admin, Headmaster, Vice Headmaster, Academic Teacher)
      { path: '/parents', label: 'Parents', icon: ParentsIcon, roles: ['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher'] },
      
      // Academic Management
      { path: '/subjects', label: 'Subjects', icon: BookOpen, roles: ['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher'] },
      { path: '/classes', label: 'Classes', icon: School, roles: ['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher'] },
      
      // Calendar (All users)
      { path: '/calendar', label: 'Calendar', icon: Calendar, roles: ['all'] },
      
      // Exams (Academic focused)
      { path: '/exams', label: 'Exams', icon: ClipboardList, roles: ['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher', 'teacher'] },
      
      // Communication
      { path: '/messages', label: 'Messages', icon: MessageSquare, roles: ['all'] },
      { path: '/real-time-chat', label: 'Chat', icon: MessageSquare, roles: ['all'] },
      { path: '/chatbot', label: 'Help Assistant', icon: Bot, roles: ['all'] },
      
      // Settings (Admin level)
      { path: '/settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'admin', 'headmaster'] },
    ];

    return baseItems.concat(
      roleSpecificItems.filter(item => 
        item.roles.includes('all') || 
        (userRole && item.roles.includes(userRole))
      )
    );
  };

  const menuItems = getMenuItems();

  // Role-based quick actions
  const getQuickActions = () => {
    const actions = [];
    
    if (userRole && ['super_admin', 'admin', 'headmaster', 'vice_headmaster'].includes(userRole)) {
      actions.push(
        { path: '/users/add', label: 'Add User', icon: UserPlus },
        { path: '/students/add', label: 'Add Student', icon: Plus },
        { path: '/teachers/add', label: 'Add Teacher', icon: Plus }
      );
    }
    
    if (userRole && ['super_admin', 'admin', 'headmaster', 'vice_headmaster', 'academic_teacher'].includes(userRole)) {
      actions.push(
        { path: '/subjects/add', label: 'Add Subject', icon: BookMarked },
        { path: '/classes/create', label: 'Create Class', icon: School }
      );
    }

    return actions;
  };

  const quickActions = getQuickActions();

  // Role display with appropriate icon
  const getRoleDisplay = () => {
    if (!userRole) return null;
    
    const roleIcons: Record<string, any> = {
      'super_admin': '👑',
      'admin': '🛡️',
      'headmaster': '🎓',
      'vice_headmaster': '📚',
      'academic_teacher': '🏆',
      'teacher': '📖',
      'student': '🎒',
      'parent': '👨‍👩‍👧‍👦'
    };

    return (
      <div className="mb-4 p-3 bg-tanzanian-blue/10 rounded-lg">
        <div className="text-xs text-gray-600">Current Role</div>
        <div className="text-sm font-medium text-tanzanian-blue">
          {roleIcons[userRole]} {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-tanzanian-blue p-2 rounded-lg">
            <School className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">ElimuTanzania</h1>
            <p className="text-sm text-gray-600">School Management</p>
          </div>
        </div>

        {getRoleDisplay()}
        
        <nav className="space-y-2 mb-6">
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
        {quickActions.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

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
