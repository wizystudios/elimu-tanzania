
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Search, Plus, Filter, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

const Subjects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  
  // Define education levels for filtering
  const educationLevels = [
    { value: 'chekechea', label: 'Kindergarten' },
    { value: 'darasa1', label: 'Standard 1' },
    { value: 'darasa2', label: 'Standard 2' },
    { value: 'darasa3', label: 'Standard 3' },
    { value: 'darasa4', label: 'Standard 4' },
    { value: 'darasa5', label: 'Standard 5' },
    { value: 'darasa6', label: 'Standard 6' },
    { value: 'darasa7', label: 'Standard 7' },
    { value: 'form1', label: 'Form 1' },
    { value: 'form2', label: 'Form 2' },
    { value: 'form3', label: 'Form 3' },
    { value: 'form4', label: 'Form 4' },
    { value: 'form5', label: 'Form 5' },
    { value: 'form6', label: 'Form 6' },
  ];

  // Fetch subjects from Supabase
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects', levelFilter],
    queryFn: async () => {
      let query = supabase
        .from('subjects')
        .select('*');
      
      // TODO: In production, filter by school_id from auth context
      // query = query.eq('school_id', schoolId);
      
      // Filter by education level if selected
      if (levelFilter) {
        query = query.contains('applicable_levels', [levelFilter]);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        console.error('Error fetching subjects:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Get education level label from value
  const getEducationLevelLabel = (value: string): string => {
    const level = educationLevels.find(level => level.value === value);
    return level ? level.label : value;
  };

  // Filter subjects by search query
  const filteredSubjects = subjects?.filter(subject => {
    return (
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Subjects</h1>
            <p className="text-gray-600">Manage academic subjects and curriculum</p>
          </div>
          <Link 
            to="/subjects/add" 
            className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Subject</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent"
                placeholder="Search subjects by name, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm whitespace-nowrap">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Level:</span>
              <select 
                className="border border-gray-300 rounded-md px-3 py-1"
                value={levelFilter || ''}
                onChange={(e) => setLevelFilter(e.target.value || null)}
              >
                <option value="">All Levels</option>
                {educationLevels.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subjects List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tanzanian-blue"></div>
          </div>
        ) : filteredSubjects && filteredSubjects.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Subject</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Code</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Educational Levels</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Description</th>
                    <th className="text-right px-6 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{subject.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{subject.code}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {subject.applicable_levels?.map((level: string) => (
                            <Badge key={level} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {getEducationLevelLabel(level)}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 truncate max-w-xs">
                        {subject.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/subjects/${subject.id}`} className="text-tanzanian-blue hover:underline text-sm">View</Link>
                          <Link to={`/subjects/${subject.id}/edit`} className="text-tanzanian-green hover:underline text-sm">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Subjects Found</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {searchQuery || levelFilter 
                  ? "No subjects match your search criteria. Try adjusting your filters."
                  : "There are no subjects created yet. Add your first subject to get started."}
              </p>
              <Link 
                to="/subjects/add" 
                className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Subject</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Subjects;
