
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Plus } from 'lucide-react';
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

// Calendar event type
type CalendarEvent = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  type: string;
  description?: string;
  class_ids?: string[];
};

const Calendar = () => {
  const { schoolId } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [eventFilter, setEventFilter] = useState<string>('all');
  
  // Fetch calendar events
  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar_events', schoolId, currentMonth],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('school_id', schoolId)
        .or(`start_date.gte.${monthStart.toISOString()},end_date.gte.${monthStart.toISOString()}`)
        .lt('start_date', monthEnd.toISOString());
        
      if (error) throw error;
      return data as CalendarEvent[] || [];
    }
  });
  
  // Filter events based on selected type
  const filteredEvents = events?.filter(event => {
    if (eventFilter === 'all') return true;
    return event.type === eventFilter;
  });
  
  // Get events for selected date
  const selectedDateEvents = filteredEvents?.filter(event => {
    const eventStart = new Date(event.start_date);
    const eventEnd = new Date(event.end_date);
    return isSameDay(selectedDate, eventStart) || 
           (isWithinInterval(selectedDate, { start: eventStart, end: eventEnd }));
  }) || [];
  
  // Handle previous month/week/day
  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    } else if (viewMode === 'week') {
      setCurrentMonth(addDays(currentMonth, -7));
    } else {
      setCurrentMonth(addDays(currentMonth, -1));
    }
  };
  
  // Handle next month/week/day
  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    } else if (viewMode === 'week') {
      setCurrentMonth(addDays(currentMonth, 7));
    } else {
      setCurrentMonth(addDays(currentMonth, 1));
    }
  };
  
  // Get color for event type
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800 border-red-800';
      case 'holiday': return 'bg-green-100 text-green-800 border-green-800';
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-800';
      case 'activity': return 'bg-amber-100 text-amber-800 border-amber-800';
      default: return 'bg-purple-100 text-purple-800 border-purple-800';
    }
  };
  
  // Get label for event type
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'Exam';
      case 'holiday': return 'Holiday';
      case 'meeting': return 'Meeting';
      case 'activity': return 'Activity';
      default: return 'Event';
    }
  };
  
  // Format time range for display
  const formatTimeRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If the event spans multiple days
    if (!isSameDay(start, end)) {
      return `${format(start, 'MMM d, h:mm a')} - ${format(end, 'MMM d, h:mm a')}`;
    }
    
    // If it's the same day
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  // Render day cell content
  const renderDayCellContent = (day: Date) => {
    if (!filteredEvents) return null;
    
    // Get events for this day
    const dayEvents = filteredEvents.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      return isSameDay(day, eventStart) || 
             (isWithinInterval(day, { start: eventStart, end: eventEnd }));
    });
    
    if (dayEvents.length === 0) return null;
    
    // Only show the first 2 events, with a +X more indicator if there are more
    return (
      <div className="absolute bottom-1 left-1 right-1">
        {dayEvents.slice(0, 2).map((event, index) => (
          <div
            key={event.id}
            className={`text-xs truncate px-1 my-0.5 rounded ${getEventTypeColor(event.type)}`}
          >
            {event.title}
          </div>
        ))}
        {dayEvents.length > 2 && (
          <div className="text-xs text-center text-gray-500">
            +{dayEvents.length - 2} more
          </div>
        )}
      </div>
    );
  };
  
  // Get days to display for the current view mode
  const getDaysToView = () => {
    if (viewMode === 'month') {
      return [];
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentMonth);
      return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    } else {
      return [currentMonth];
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">School Calendar</h1>
            <p className="text-gray-600">Manage and view school events and schedules</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Calendar</CardTitle>
              <div className="flex items-center space-x-2">
                <Select
                  value={eventFilter}
                  onValueChange={setEventFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="exam">Exams</SelectItem>
                    <SelectItem value="meeting">Meetings</SelectItem>
                    <SelectItem value="holiday">Holidays</SelectItem>
                    <SelectItem value="activity">Activities</SelectItem>
                  </SelectContent>
                </Select>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week' | 'day')}>
                  <TabsList>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="day">Day</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="text-lg font-medium">
                  {viewMode === 'month' && format(currentMonth, 'MMMM yyyy')}
                  {viewMode === 'week' && `Week of ${format(startOfWeek(currentMonth), 'MMM d, yyyy')}`}
                  {viewMode === 'day' && format(currentMonth, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="flex flex-col items-center">
                  <Spinner className="h-8 w-8" />
                  <p className="mt-4 text-gray-500">Loading calendar events...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                {/* Calendar Display */}
                <div className={viewMode === 'day' ? 'md:col-span-3' : 'md:col-span-7'}>
                  {viewMode === 'month' && (
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      className="rounded-md border shadow-sm"
                      components={{
                        DayContent: ({ day }) => (
                          <div className="relative h-14 w-full">
                            <div>{format(day, 'd')}</div>
                            {renderDayCellContent(day)}
                          </div>
                        )
                      }}
                      classNames={{
                        day_today: "bg-tanzanian-blue/10 text-tanzanian-blue font-bold",
                        day_selected: "bg-tanzanian-blue text-white",
                        day_outside: "text-gray-300 opacity-50"
                      }}
                    />
                  )}
                  
                  {viewMode === 'week' && (
                    <div className="border rounded-md overflow-hidden">
                      <div className="grid grid-cols-7 text-center border-b bg-gray-50 p-2">
                        {getDaysToView().map((day, i) => (
                          <div key={i} className="text-sm font-medium">
                            <div>{format(day, 'EEE')}</div>
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center mx-auto mt-1",
                              isSameDay(day, new Date()) ? "bg-tanzanian-blue text-white" : "",
                              isSameDay(day, selectedDate) && !isSameDay(day, new Date()) ? "bg-gray-200" : ""
                            )}>
                              {format(day, 'd')}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 min-h-[400px] p-2">
                        {getDaysToView().map((day, i) => {
                          const dayEvents = filteredEvents?.filter(event => {
                            const eventStart = new Date(event.start_date);
                            const eventEnd = new Date(event.end_date);
                            return isSameDay(day, eventStart) || 
                                  (isWithinInterval(day, { start: eventStart, end: eventEnd }));
                          }) || [];
                          
                          return (
                            <div 
                              key={i} 
                              className={cn(
                                "border-r last:border-r-0 space-y-1 p-1 cursor-pointer",
                                isSameDay(day, selectedDate) ? "bg-gray-50" : ""
                              )}
                              onClick={() => setSelectedDate(day)}
                            >
                              {dayEvents.map(event => (
                                <div 
                                  key={event.id}
                                  className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                                >
                                  {format(new Date(event.start_date), 'HH:mm')} - {event.title}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {viewMode === 'day' && (
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 p-4 text-center border-b">
                        <div className="text-lg font-medium">
                          {format(currentMonth, 'EEEE')}
                        </div>
                        <div className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center mx-auto mt-1 text-2xl",
                          isSameDay(currentMonth, new Date()) ? "bg-tanzanian-blue text-white" : "bg-gray-200"
                        )}>
                          {format(currentMonth, 'd')}
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Time slots for day view would go here */}
                        <div className="text-center text-gray-500">
                          Day view details will be available soon.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Event details for selected day */}
                <div className={viewMode === 'day' ? 'md:col-span-4' : 'md:col-span-7'}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Events for {format(selectedDate, 'MMMM d, yyyy')}
                      </CardTitle>
                      <CardDescription>
                        {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedDateEvents.length > 0 ? (
                        <div className="space-y-4">
                          {selectedDateEvents.map(event => (
                            <div key={event.id} className="border rounded-md p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-medium">{event.title}</h3>
                                  <div className={`text-xs inline-flex items-center px-2 py-0.5 rounded-full mt-1 ${getEventTypeColor(event.type)}`}>
                                    {getEventTypeLabel(event.type)}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">Edit</Button>
                                  <Button variant="outline" size="sm" className="text-red-600">Delete</Button>
                                </div>
                              </div>
                              
                              <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{formatTimeRange(event.start_date, event.end_date)}</span>
                                </div>
                                {event.description && (
                                  <div className="flex items-start">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                                    <span>{event.description}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <CalendarDays className="h-12 w-12 text-gray-300" />
                          <p className="mt-4 text-gray-500">No events scheduled for this day</p>
                          <Button className="mt-4">
                            Add Event
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-sm text-gray-500">
          <p>Note: Event creation and management functionality will be fully implemented soon.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Calendar;
