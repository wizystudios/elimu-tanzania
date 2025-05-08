
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
  Settings, 
  User
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Schools', path: '/schools', icon: <School className="h-5 w-5" /> },
    { name: 'Students', path: '/students', icon: <Users className="h-5 w-5" /> },
    { name: 'Teachers', path: '/teachers', icon: <GraduationCap className="h-5 w-5" /> },
    { name: 'Classes', path: '/classes', icon: <Book className="h-5 w-5" /> },
    { name: 'Schedules', path: '/schedules', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Exams', path: '/exams', icon: <FileText className="h-5 w-5" /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Parents', path: '/parents', icon: <User className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

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
      <nav className="mt-6 px-2">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-white text-tanzanian-blue font-medium"
                    : "text-white hover:bg-tanzanian-blue/30"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {expanded && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
