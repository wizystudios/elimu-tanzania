
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  School, 
  Users, 
  Book, 
  GraduationCap, 
  Calendar, 
  FileText, 
  MessageSquare,
  Bell,
  Settings, 
  User,
  PlusCircle,
  ClipboardList,
  Award,
  UserCog,
  ShieldCheck,
  Activity,
  UserPlus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Define types for our navigation items
interface NavItemChild {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItemChild[];
}

const Sidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const { userRole } = useAuth();
  
  // Track open dropdown menus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  
  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    // Common items for all roles
    const commonItems: NavItem[] = [
      { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    ];

    // Admin specific items
    const adminItems: NavItem[] = [
      { name: 'Schools', path: '/schools', icon: <School className="h-5 w-5" /> },
      { name: 'Users', path: '/users', icon: <UserCog className="h-5 w-5" /> },
      { 
        name: 'Teachers', 
        path: '/teachers', 
        icon: <GraduationCap className="h-5 w-5" />,
        children: [
          { name: 'All Teachers', path: '/teachers' },
          { name: 'Add Teacher', path: '/teachers/add' },
          { name: 'Assign Subjects', path: '/teachers/assign' }
        ]
      },
      { 
        name: 'Students', 
        path: '/students', 
        icon: <Users className="h-5 w-5" />,
        children: [
          { name: 'All Students', path: '/students' },
          { name: 'Add Student', path: '/students/add' },
          { name: 'Attendance', path: '/students/attendance' }
        ]
      },
      { 
        name: 'Parents', 
        path: '/parents', 
        icon: <User className="h-5 w-5" />,
        children: [
          { name: 'All Parents', path: '/parents' },
          { name: 'Add Parent', path: '/parents/add' },
          { name: 'Link to Students', path: '/parents/link' }
        ]
      },
      { 
        name: 'Classes', 
        path: '/classes', 
        icon: <Book className="h-5 w-5" />,
        children: [
          { name: 'All Classes', path: '/classes' },
          { name: 'Create Class', path: '/classes/create' }
        ]
      },
      { 
        name: 'Subjects', 
        path: '/subjects', 
        icon: <ClipboardList className="h-5 w-5" />,
        children: [
          { name: 'All Subjects', path: '/subjects' },
          { name: 'Add Subject', path: '/subjects/add' }
        ]
      },
      { 
        name: 'Exams', 
        path: '/exams', 
        icon: <FileText className="h-5 w-5" />,
        children: [
          { name: 'All Exams', path: '/exams' },
          { name: 'Create Exam', path: '/exams/create' },
          { name: 'Results', path: '/exams/results' }
        ]
      },
      { 
        name: 'Calendar', 
        path: '/calendar', 
        icon: <Calendar className="h-5 w-5" />,
        children: [
          { name: 'School Calendar', path: '/calendar' },
          { name: 'Add Event', path: '/calendar/add' }
        ]
      },
      { 
        name: 'Announcements', 
        path: '/announcements', 
        icon: <Bell className="h-5 w-5" />,
        children: [
          { name: 'All Announcements', path: '/announcements' },
          { name: 'Create Announcement', path: '/announcements/create' }
        ]
      },
      { name: 'Messages', path: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
    ];

    // Teacher specific items
    const teacherItems: NavItem[] = [
      { name: 'My Classes', path: '/my-classes', icon: <Book className="h-5 w-5" /> },
      { name: 'Attendance', path: '/attendance', icon: <ClipboardList className="h-5 w-5" /> },
      { name: 'Assignments', path: '/assignments', icon: <FileText className="h-5 w-5" /> },
      { name: 'Exams', path: '/exams', icon: <Award className="h-5 w-5" /> },
      { name: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Messages', path: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
    ];

    // Headmaster specific additional items
    const headmasterItems: NavItem[] = [
      { name: 'Teacher Management', path: '/teacher-management', icon: <UserCog className="h-5 w-5" /> },
      { name: 'School Policies', path: '/policies', icon: <ShieldCheck className="h-5 w-5" /> },
    ];

    // Academic teacher specific items
    const academicTeacherItems: NavItem[] = [
      { name: 'Curriculum Plans', path: '/curriculum', icon: <ClipboardList className="h-5 w-5" /> },
      { name: 'Academic Reports', path: '/academic-reports', icon: <Activity className="h-5 w-5" /> },
    ];

    // Student specific items
    const studentItems: NavItem[] = [
      { name: 'My Classes', path: '/my-classes', icon: <Book className="h-5 w-5" /> },
      { name: 'Assignments', path: '/assignments', icon: <FileText className="h-5 w-5" /> },
      { name: 'Exams', path: '/exams', icon: <Award className="h-5 w-5" /> },
      { name: 'Attendance', path: '/attendance', icon: <ClipboardList className="h-5 w-5" /> },
      { name: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Messages', path: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
    ];

    // Parent specific items
    const parentItems: NavItem[] = [
      { name: 'My Children', path: '/my-children', icon: <Users className="h-5 w-5" /> },
      { name: 'Academic Progress', path: '/academic-progress', icon: <Activity className="h-5 w-5" /> },
      { name: 'Attendance', path: '/attendance', icon: <ClipboardList className="h-5 w-5" /> },
      { name: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Messages', path: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
    ];

    // Return items based on user role
    switch (userRole) {
      case 'super_admin':
        return [...commonItems, ...adminItems];
      case 'admin':
        return [...commonItems, ...adminItems];
      case 'teacher':
        return [...commonItems, ...teacherItems];
      case 'headmaster':
      case 'vice_headmaster':
        return [...commonItems, ...teacherItems, ...headmasterItems];
      case 'academic_teacher':
        return [...commonItems, ...teacherItems, ...academicTeacherItems];
      case 'discipline_teacher':
        return [...commonItems, ...teacherItems];
      case 'student':
        return [...commonItems, ...studentItems];
      case 'parent':
        return [...commonItems, ...parentItems];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  // Check if a path is active (exact match or child routes)
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside 
      className={cn(
        "bg-tanzanian-blue text-white transition-all duration-300 ease-in-out h-screen",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-tanzanian-blue/30">
        <div className="flex items-center">
          {expanded ? (
            <h1 className="text-xl font-bold">Elimu Tanzania</h1>
          ) : (
            <h1 className="text-xl font-bold">ET</h1>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-md hover:bg-tanzanian-blue/30"
        >
          {expanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      <nav className="mt-6 px-2 h-[calc(100vh-4rem)] overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              {item.children ? (
                // With dropdown menu
                <div>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3 text-sm rounded-md transition-colors",
                      isActive(item.path)
                        ? "bg-white/10 text-white font-medium"
                        : "text-white hover:bg-tanzanian-blue/30"
                    )}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      {expanded && <span>{item.name}</span>}
                    </div>
                    {expanded && (
                      openMenus[item.name] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Submenu items */}
                  {expanded && openMenus[item.name] && (
                    <ul className="pl-10 mt-1 space-y-1 overflow-hidden transition-all duration-300">
                      {item.children.map((child) => (
                        <li key={child.path} className="animate-fade-in">
                          <Link
                            to={child.path}
                            className={cn(
                              "flex items-center py-2 text-xs rounded-md transition-colors",
                              location.pathname === child.path
                                ? "text-white font-medium"
                                : "text-white/70 hover:text-white"
                            )}
                          >
                            <span>{child.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Without dropdown
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                    isActive(item.path)
                      ? "bg-white text-tanzanian-blue font-medium"
                      : "text-white hover:bg-tanzanian-blue/30"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {expanded && <span>{item.name}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
