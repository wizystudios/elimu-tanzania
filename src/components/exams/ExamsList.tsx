
import React from 'react';
import { format } from 'date-fns';
import { Book, Clock, GraduationCap, Calendar, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Exam } from '@/types';

interface ExamsListProps {
  exams: Exam[];
  title: string;
  isLoading?: boolean;
}

export const ExamsList: React.FC<ExamsListProps> = ({ exams, title, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted animate-pulse h-24 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="text-center py-8 border rounded-lg bg-background">
          <p className="text-muted-foreground">No exams found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-card"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{exam.title}</h4>
                  <Badge
                    className={
                      exam.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        : exam.status === 'completed'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                    }
                    variant="outline"
                  >
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Book className="h-3.5 w-3.5 mr-1" />
                    {exam.subject}
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-3.5 w-3.5 mr-1" />
                    {exam.educationLevel === 'chekechea' 
                      ? 'Kindergarten'
                      : exam.educationLevel.startsWith('darasa') 
                        ? `Primary ${exam.educationLevel.replace('darasa', '')}` 
                        : `Form ${exam.educationLevel.replace('form', '')}`}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {exam.duration} minutes
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                <div className="text-sm font-medium flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {format(new Date(exam.date), 'MMM d, yyyy')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(exam.date), 'hh:mm a')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button variant="outline" size="sm">View Details</Button>
              {exam.status === 'scheduled' && (
                <Button size="sm" className="flex items-center">
                  <CheckSquare className="h-4 w-4 mr-1.5" />
                  Mark Results
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
