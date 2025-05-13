
import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar as CalendarComponent, CalendarProps } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, BookOpen, Users, GraduationCap, Calendar as CalendarLucide, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Define types for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  type: 'exam' | 'meeting' | 'holiday' | 'task' | 'other';
  description?: string;
  class_ids?: string[];
}

// Define custom day content props
interface CustomDayProps {
  date: Date;
  events: CalendarEvent[];
}

// Define a month name array
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Define event types with colors
const EVENT_TYPES = [
  { value: 'all', label: 'All Events', color: 'bg-gray-200 text-gray-800' },
  { value: 'exam', label: 'Exams', color: 'bg-red-100 text-red-800' },
  { value: 'meeting', label: 'Meetings', color: 'bg-blue-100 text-blue-800' },
  { value: 'holiday', label: 'Holidays', color: 'bg-green-100 text-green-800' },
  { value: 'task', label: 'Tasks', color: 'bg-amber-100 text-amber-800' },
  { value: 'other', label: 'Other', color: 'bg-purple-100 text-purple-800' }
];

// Function to get color for event types
const getEventTypeColor = (type: string) => {
  const eventType = EVENT_TYPES.find(et => et.value === type);
  return eventType ? eventType.color : EVENT_TYPES[0].color;
};

const Calendar = () => {
  const { schoolId } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  
  // Calculate current month and year
  const currentMonthName = MONTH_NAMES[currentMonth.getMonth()];
  const currentYear = currentMonth.getFullYear();
  
  // Function to handle month navigation
  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };
  
  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };
  
  // Fetch calendar events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar_events', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('school_id', schoolId);
        
      if (error) throw error;
      
      return (data || []) as CalendarEvent[];
    }
  });
  
  // Filter events based on selected event type
  const filteredEvents = useMemo(() => {
    if (selectedEventType === 'all') return events;
    return events.filter(event => event.type === selectedEventType);
  }, [events, selectedEventType]);
  
  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    
    return filteredEvents.filter(event => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      const currentDate = startOfDay(selectedDate);
      
      // Check if the selected date is within the event duration
      return currentDate >= startOfDay(startDate) && currentDate <= startOfDay(endDate);
    });
  }, [selectedDate, filteredEvents]);
  
  // Custom day content renderer for the calendar
  const customDayContent = (props: React.HTMLAttributes<HTMLButtonElement> & { date: Date }) => {
    // Get events for this date
    const dayEvents = filteredEvents.filter(event => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      return props.date >= startOfDay(startDate) && props.date <= startOfDay(endDate);
    });
    
    // Group events by type
    const eventTypes = dayEvents.reduce((types: Record<string, number>, event) => {
      types[event.type] = (types[event.type] || 0) + 1;
      return types;
    }, {});
    
    const hasEvents = dayEvents.length > 0;
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div>{props.date.getDate()}</div>
        {hasEvents && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-0.5">
            {Object.keys(eventTypes).map((type, index) => (
              <div 
                key={index} 
                className={`h-1.5 w-1.5 rounded-full ${getEventTypeColor(type).split(' ')[0]}`} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">School Calendar</h1>
            <p className="text-gray-600">View and manage school events and schedules</p>
          </div>
          <Button variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarLucide className="h-5 w-5 text-gray-500" />
                    <CardTitle>{currentMonthName} {currentYear}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  View and manage your school calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-2">
                  <CalendarComponent 
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="rounded-md border"
                    components={{
                      DayContent: (props) => customDayContent(props)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Events for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
                <CardDescription>
                  Details of events scheduled for the selected date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No events scheduled for this date</p>
                  ) : (
                    selectedDateEvents.map(event => (
                      <div 
                        key={event.id} 
                        className="border rounded-md p-4 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-md ${getEventTypeColor(event.type)}`}>
                              {event.type === 'exam' && <BookOpen className="h-5 w-5" />}
                              {event.type === 'meeting' && <Users className="h-5 w-5" />}
                              {event.type === 'holiday' && <CalendarIcon className="h-5 w-5" />}
                              {event.type === 'task' && <Clock className="h-5 w-5" />}
                              {event.type === 'other' && <GraduationCap className="h-5 w-5" />}
                            </div>
                            <div>
                              <h4 className="font-semibold">{event.title}</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p className="flex items-center">
                                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                  {format(new Date(event.start_date), 'MMM d')} - {format(new Date(event.end_date), 'MMM d, yyyy')}
                                </p>
                                {event.description && <p>{event.description}</p>}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={getEventTypeColor(event.type)}>
                            {EVENT_TYPES.find(t => t.value === event.type)?.label.slice(0, -1) || 'Event'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Event Filter</CardTitle>
                <CardDescription>Filter events by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {EVENT_TYPES.map(eventType => (
                    <Button 
                      key={eventType.value}
                      variant={selectedEventType === eventType.value ? "default" : "outline"}
                      className="w-full justify-start mb-2"
                      onClick={() => setSelectedEventType(eventType.value)}
                    >
                      <span className={`h-2 w-2 rounded-full mr-2 ${eventType.color.split(' ')[0]}`} />
                      {eventType.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events in the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents
                    .filter(event => {
                      const startDate = new Date(event.start_date);
                      const now = startOfDay(new Date());
                      const nextWeek = addDays(now, 7);
                      return startDate >= now && startDate <= nextWeek;
                    })
                    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className="flex items-start space-x-3 pb-3 border-b">
                        <div className={`p-1.5 rounded ${getEventTypeColor(event.type)}`}>
                          {event.type === 'exam' && <BookOpen className="h-4 w-4" />}
                          {event.type === 'meeting' && <Users className="h-4 w-4" />}
                          {event.type === 'holiday' && <CalendarIcon className="h-4 w-4" />}
                          {event.type === 'task' && <Clock className="h-4 w-4" />}
                          {event.type === 'other' && <GraduationCap className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(event.start_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  {filteredEvents
                    .filter(event => {
                      const startDate = new Date(event.start_date);
                      const now = startOfDay(new Date());
                      const nextWeek = addDays(now, 7);
                      return startDate >= now && startDate <= nextWeek;
                    }).length === 0 && (
                    <p className="text-center py-4 text-gray-500">No upcoming events</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Calendar;
