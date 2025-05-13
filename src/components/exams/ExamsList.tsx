
import React from 'react';
import { format } from 'date-fns';
import { CalendarClock, GraduationCap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Exam } from '@/types';

export interface ExamsListProps {
  exams: Exam[];
  title: string;
  isLoading?: boolean;
}

export const ExamsList: React.FC<ExamsListProps> = ({ exams, title, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tanzanian-blue"></div>
        </div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <CalendarClock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Exams Scheduled</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            There are no exams scheduled at the moment. Create a new exam to get started.
          </p>
          <Button asChild>
            <a href="#create-exam">Schedule New Exam</a>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><AlertCircle className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEducationLevelLabel = (level: string): string => {
    if (level.startsWith('darasa')) {
      const classNumber = level.replace('darasa', '');
      return `Standard ${classNumber}`;
    } else if (level.startsWith('form')) {
      const formNumber = level.replace('form', '');
      return `Form ${formNumber}`;
    } else if (level === 'chekechea') {
      return 'Kindergarten';
    }
    return level;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Exam</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Subject</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Level</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Date & Time</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Duration</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-right px-6 py-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exams.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{exam.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {exam.description.length > 50 
                      ? `${exam.description.substring(0, 50)}...` 
                      : exam.description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-tanzanian-blue mr-2" />
                    <span>{exam.subject}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{getEducationLevelLabel(exam.educationLevel)}</Badge>
                </td>
                <td className="px-6 py-4">
                  {format(new Date(exam.date), 'PPP p')}
                </td>
                <td className="px-6 py-4">
                  {exam.duration} mins
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(exam.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <a href={`/exams/${exam.id}`} className="text-tanzanian-blue hover:underline text-sm">View</a>
                    {exam.status !== 'completed' && (
                      <a href={`/exams/${exam.id}/edit`} className="text-tanzanian-green hover:underline text-sm">Edit</a>
                    )}
                    {exam.status === 'completed' && (
                      <a href={`/exams/results?exam=${exam.id}`} className="text-tanzanian-blue hover:underline text-sm">Results</a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
