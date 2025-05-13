
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Check, X, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

interface StudentWithProfile {
  id: string;
  user_id: string;
  registration_number: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    profile_image?: string;
  } | null;
}

const StudentAttendance = () => {
  const { toast } = useToast();
  const { schoolId, userRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Store the attendance data
  const [attendanceData, setAttendanceData] = useState<Record<string, { 
    id?: string, 
    status: string,
    notes: string 
  }>>({});

  // Fetch classes
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, education_level')
        .eq('school_id', schoolId)
        .order('name');
        
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch students for the selected class
  const { data: students, isLoading: loadingStudents } = useQuery<StudentWithProfile[]>({
    queryKey: ['students_in_class', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          registration_number,
          profiles:user_id (
            first_name,
            last_name,
            profile_image
          )
        `)
        .eq('current_class_id', selectedClass)
        .eq('school_id', schoolId);
        
      if (error) throw error;
      return (data || []) as StudentWithProfile[];
    },
    enabled: !!selectedClass
  });

  // Fetch existing attendance records
  const { data: existingAttendance, isLoading: loadingAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance', selectedClass, selectedDate?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!selectedClass || !selectedDate) return [];
      
      const dateString = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', dateString)
        .eq('school_id', schoolId);
        
      if (error) throw error;
      
      // Format existing attendance into a more usable structure
      const formatted: Record<string, { id: string, status: string, notes: string }> = {};
      data?.forEach(record => {
        formatted[record.student_id] = {
          id: record.id,
          status: record.status,
          notes: record.notes || ''
        };
      });
      
      setAttendanceData(formatted);
      
      return data || [];
    },
    enabled: !!selectedClass && !!selectedDate
  });

  // Handle attendance status change
  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  // Handle notes change
  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  // Save attendance records
  const saveAttendance = async () => {
    if (!selectedClass || !selectedDate || !schoolId) {
      toast({
        title: "Error",
        description: "Please select a class and date first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      const dateString = selectedDate.toISOString().split('T')[0];
      
      // We need to get the user ID differently now
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session?.user?.id) {
        throw new Error("User authentication required");
      }
      
      const userId = sessionData.session.user.id;

      // Process each student's attendance
      for (const [studentId, record] of Object.entries(attendanceData)) {
        if (!record.status) continue; // Skip if no status selected

        if (record.id) {
          // Update existing record
          const { error } = await supabase
            .from('attendance')
            .update({
              status: record.status,
              notes: record.notes,
              updated_at: new Date().toISOString(),
              marked_by: userId
            })
            .eq('id', record.id);

          if (error) throw error;
        } else {
          // Create new record
          const { error } = await supabase
            .from('attendance')
            .insert({
              student_id: studentId,
              class_id: selectedClass,
              school_id: schoolId,
              date: dateString,
              status: record.status,
              notes: record.notes,
              marked_by: userId
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Attendance records saved successfully."
      });
      
      // Refresh attendance data
      refetchAttendance();
      
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance records.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = loadingClasses || loadingStudents || loadingAttendance;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Student Attendance</h1>
          <p className="text-gray-600">Manage daily student attendance records</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="class-select">Select Class</Label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={saveAttendance}
                disabled={!selectedClass || !selectedDate || isSaving}
                className="w-full"
              >
                {isSaving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-10">
              <div className="flex flex-col items-center">
                <Spinner className="h-8 w-8" />
                <p className="mt-4 text-gray-500">Loading attendance data...</p>
              </div>
            </div>
          )}

          {!isLoading && selectedClass && students && students.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-gray-500">No students found in this class.</p>
            </div>
          )}

          {!isLoading && selectedClass && students && students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Registration No.</th>
                    <th className="px-4 py-2 text-center">Present</th>
                    <th className="px-4 py-2 text-center">Absent</th>
                    <th className="px-4 py-2 text-center">Late</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const attendance = attendanceData[student.id] || { status: '', notes: '' };
                    
                    return (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {student.profiles?.profile_image ? (
                                <img 
                                  src={student.profiles.profile_image} 
                                  alt={`${student.profiles?.first_name || ''} ${student.profiles?.last_name || ''}`}
                                  className="h-10 w-10 rounded-full object-cover" 
                                />
                              ) : (
                                <User className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {student.profiles?.first_name || 'Unknown'} {student.profiles?.last_name || 'Student'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{student.registration_number}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                            className={`rounded-full h-8 w-8 flex items-center justify-center ${
                              attendance.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                            className={`rounded-full h-8 w-8 flex items-center justify-center ${
                              attendance.status === 'absent' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'late')}
                            className={`rounded-full h-8 w-8 flex items-center justify-center ${
                              attendance.status === 'late' 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <span className="text-xs font-bold">L</span>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={attendance.notes || ''}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            placeholder="Add notes if needed"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentAttendance;
