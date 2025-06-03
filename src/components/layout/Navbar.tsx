
import { useState } from 'react';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, userRole, teacherRole, schoolName, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  const getUserDisplayRole = () => {
    if (teacherRole) {
      // Format teacher role for display
      const roleMap: Record<string, string> = {
        'normal_teacher': 'Teacher',
        'headmaster': 'Headmaster',
        'vice_headmaster': 'Vice Headmaster',
        'academic_teacher': 'Academic Teacher',
        'discipline_teacher': 'Discipline Teacher',
        'sports_teacher': 'Sports Teacher',
        'environment_teacher': 'Environment Teacher'
      };
      return roleMap[teacherRole] || 'Teacher';
    }
    
    // Format user role for display
    const roleMap: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'School Admin',
      'teacher': 'Teacher',
      'student': 'Student',
      'parent': 'Parent'
    };
    return roleMap[userRole || ''] || 'User';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
      {/* Search Bar */}
      <div className="relative w-1/3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-tanzanian-blue focus:border-tanzanian-blue block w-full pl-10 p-2.5"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* School Name */}
      {schoolName && (
        <div className="hidden md:block">
          <h2 className="text-lg font-medium text-tanzanian-blue">{schoolName}</h2>
        </div>
      )}
      
      {/* Right Side Elements */}
      <div className="flex items-center">
        {/* Notifications */}
        <div className="relative mr-4">
          <button 
            className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-tanzanian-blue"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-tanzanian-red"></span>
          </button>
          
          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm text-gray-800">Welcome to {schoolName || 'Elimu Tanzania'}!</p>
                  <p className="text-xs text-gray-500 mt-1">Just now</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="w-full text-center text-sm text-tanzanian-blue hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="relative">
          <button 
            className="flex items-center space-x-3 focus:outline-none"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-700">
                {user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {getUserDisplayRole()}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-tanzanian-blue flex items-center justify-center text-white overflow-hidden">
              <User className="h-5 w-5" />
            </div>
          </button>
          
          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile');
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="h-4 w-4 mr-2" />
                Your Profile
              </button>
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              <div className="border-t border-gray-100"></div>
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
