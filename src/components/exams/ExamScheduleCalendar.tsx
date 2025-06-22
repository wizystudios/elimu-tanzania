
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Exam } from '@/types';

export interface ExamScheduleCalendarProps {
  exams: Exam[];
  isLoading?: boolean;
}

export const ExamScheduleCalendar: React.FC<ExamScheduleCalendarProps> = ({ exams, isLoading = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tanzanian-blue"></div>
            <span className="ml-2">Loading exam schedule...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Add empty slots for days before the start of the month
  const startDay = startDate.getDay();
  const daysOffset = Array(startDay).fill(null);
  
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  // Group exams by date
  const examsByDate = exams.reduce((acc: { [key: string]: Exam[] }, exam) => {
    const date = format(new Date(exam.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(exam);
    return acc;
  }, {});
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Exam Schedule</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the start of the month */}
          {daysOffset.map((_, index) => (
            <div key={`empty-${index}`} className="h-32 border rounded-lg bg-gray-50"></div>
          ))}
          
          {/* Actual calendar days */}
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayExams = examsByDate[dateKey] || [];
            const hasExams = dayExams.length > 0;
            
            return (
              <div 
                key={day.toString()} 
                className={`relative h-32 p-2 border rounded-lg transition-colors overflow-hidden ${
                  isToday(day) 
                    ? 'border-tanzanian-blue bg-blue-50' 
                    : hasExams 
                    ? 'bg-green-50 border-green-200'
                    : ''
                }`}
              >
                <div className={`text-right font-medium ${isToday(day) ? 'text-tanzanian-blue' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="mt-2 space-y-1 overflow-hidden">
                  {dayExams.slice(0, 3).map((exam) => (
                    <TooltipProvider key={exam.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="block text-xs p-1 rounded bg-white border truncate hover:bg-tanzanian-blue/5 cursor-pointer">
                            <div className="font-medium truncate">{exam.title}</div>
                            <div className="flex items-center text-gray-500 mt-0.5">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(exam.date), 'HH:mm')}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="font-medium">{exam.title}</div>
                            <div className="text-xs">{exam.subject}</div>
                            <div className="text-xs mt-1">
                              {format(new Date(exam.date), 'PPP p')} ({exam.duration} mins)
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  
                  {dayExams.length > 3 && (
                    <div className="text-center mt-1">
                      <Badge variant="secondary" className="w-full text-xs">
                        +{dayExams.length - 3} more
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
