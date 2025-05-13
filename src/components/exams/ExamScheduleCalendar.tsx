
import React, { useState } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Exam } from '@/types';

interface ExamScheduleCalendarProps {
  exams: Exam[];
  isLoading?: boolean; // Added isLoading prop as optional
}

export const ExamScheduleCalendar: React.FC<ExamScheduleCalendarProps> = ({ exams, isLoading = false }) => {
  // If loading, show a loading state
  if (isLoading) {
    return <div className="h-96 flex items-center justify-center">Loading exam schedule...</div>;
  }

  const [currentDate, setCurrentDate] = useState(new Date());
  
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Expand to show previous/next month days to fill calendar grid
  const firstDayOfMonth = startDate.getDay();
  const lastDayOfMonth = endDate.getDay();
  
  // Add days from previous month
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
    return addDays(startDate, -(firstDayOfMonth - i));
  });
  
  // Add days from next month
  const nextMonthDays = Array.from({ length: 6 - lastDayOfMonth }, (_, i) => {
    return addDays(endDate, i + 1);
  });
  
  // All calendar days to display
  const allCalendarDays = [...prevMonthDays, ...days, ...nextMonthDays];
  
  // Group exams by date
  const examsByDate = exams.reduce<Record<string, Exam[]>>((acc, exam) => {
    const dateKey = format(new Date(exam.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(exam);
    return acc;
  }, {});
  
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {allCalendarDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayExams = examsByDate[dateKey] || [];
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={index}
              className={`min-h-24 border rounded-md p-1 ${
                isCurrentMonth ? 'bg-card' : 'bg-muted/30'
              } ${isToday ? 'ring-2 ring-tanzanian-blue' : ''}`}
            >
              <div className="text-right text-xs font-medium p-1">
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1 mt-1">
                {dayExams.length > 0 ? (
                  dayExams.length <= 2 ? (
                    dayExams.map((exam) => (
                      <HoverCard key={exam.id} openDelay={200}>
                        <HoverCardTrigger asChild>
                          <div className="text-xs px-1.5 py-1 bg-tanzanian-blue/10 text-tanzanian-blue rounded cursor-pointer truncate">
                            {exam.title}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-medium">{exam.title}</h4>
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <Badge>{exam.subject}</Badge>
                                <span className="text-muted-foreground">
                                  {format(new Date(exam.date), 'hh:mm a')}
                                </span>
                                <span className="text-muted-foreground">
                                  {exam.duration} mins
                                </span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))
                  ) : (
                    <>
                      <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                          <div className="text-xs px-1.5 py-1 bg-tanzanian-blue/10 text-tanzanian-blue rounded cursor-pointer">
                            {dayExams[0].title}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-medium">{dayExams[0].title}</h4>
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <Badge>{dayExams[0].subject}</Badge>
                                <span className="text-muted-foreground">
                                  {format(new Date(dayExams[0].date), 'hh:mm a')}
                                </span>
                                <span className="text-muted-foreground">
                                  {dayExams[0].duration} mins
                                </span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      
                      <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                          <div className="text-xs px-1.5 py-1 bg-gray-100 text-gray-700 rounded cursor-pointer">
                            +{dayExams.length - 1} more
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-3">
                            <h4 className="font-medium">All Exams on {format(day, 'MMMM d')}</h4>
                            <div className="space-y-2">
                              {dayExams.map((exam) => (
                                <div key={exam.id} className="text-sm border-l-2 border-tanzanian-blue pl-2">
                                  <div className="font-medium">{exam.title}</div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{exam.subject}</span>
                                    <span>•</span>
                                    <span>{format(new Date(exam.date), 'hh:mm a')}</span>
                                    <span>•</span>
                                    <span>{exam.duration} mins</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </>
                  )
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
