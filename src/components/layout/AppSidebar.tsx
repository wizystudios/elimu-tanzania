
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
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { state } = useSidebar();
  
  const isActive = (path: string) => location.pathname === path;
  
  const mainMenuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/exams', label: 'Exams', icon: ClipboardList },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/real-time-chat', label: 'Chat', icon: MessageSquare },
    { path: '/chatbot', label: 'Help Bot', icon: Bot },
  ];

  const managementItems = [
    { 
      label: 'User Management',
      icon: Users,
      items: [
        { path: '/users', label: 'All Users', icon: Users },
        { path: '/users/add', label: 'Add User', icon: UserPlus },
      ]
    },
    { 
      label: 'Academic Staff',
      icon: GraduationCap,
      items: [
        { path: '/teachers', label: 'Teachers', icon: GraduationCap },
        { path: '/teachers/add', label: 'Add Teacher', icon: Plus },
      ]
    },
    { 
      label: 'Students',
      icon: UserCheck,
      items: [
        { path: '/students', label: 'All Students', icon: UserCheck },
        { path: '/students/add', label: 'Add Student', icon: Plus },
      ]
    },
    { 
      label: 'Parents',
      icon: ParentsIcon,
      items: [
        { path: '/parents', label: 'All Parents', icon: ParentsIcon },
        { path: '/parents/add', label: 'Add Parent', icon: Plus },
        { path: '/parents/link', label: 'Link Parents', icon: Plus },
      ]
    },
    { 
      label: 'Academic',
      icon: BookOpen,
      items: [
        { path: '/subjects', label: 'Subjects', icon: BookOpen },
        { path: '/subjects/add', label: 'Add Subject', icon: Plus },
        { path: '/classes', label: 'Classes', icon: School },
        { path: '/classes/create', label: 'Create Class', icon: Plus },
      ]
    },
  ];

  return (
    <Sidebar variant="sidebar" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center space-x-2 px-2 py-2">
          <div className="bg-tanzanian-blue p-2 rounded-lg">
            <School className="h-6 w-6 text-white" />
          </div>
          {state === "expanded" && (
            <div>
              <h1 className="text-lg font-bold text-gray-800">ElimuTanzania</h1>
              <p className="text-xs text-gray-600">School Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive(item.path)}>
                      <Link to={item.path}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Management Section with Dropdowns */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((section) => {
                const Icon = section.icon;
                return (
                  <Collapsible key={section.label} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="group/trigger">
                          <Icon className="h-4 w-4" />
                          <span>{section.label}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map((item) => {
                            const SubIcon = item.icon;
                            return (
                              <SidebarMenuSubItem key={item.path}>
                                <SidebarMenuSubButton asChild isActive={isActive(item.path)}>
                                  <Link to={item.path}>
                                    <SubIcon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/settings')}>
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {state === "expanded" && (
          <div className="p-2">
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>Email:</strong> info@elimutanzania.co.tz
              </p>
              <p>
                <strong>Simu:</strong> +255784813540
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
