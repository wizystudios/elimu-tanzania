
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { students, users } from '@/data/mockData';
import { User, Search, Plus, Filter } from 'lucide-react';

const Students = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string | null>(null);
  
  // Merge student data with user data
  const studentsWithUserData = students.map(student => {
    const userData = users.find(user => user.id === student.userId);
    return {
      ...student,
      user: userData
    };
  });

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

  const getEducationLevelBadgeColor = (level: string) => {
    if (level === 'chekechea') {
      return 'bg-amber-100 text-amber-800';
    } else if (level.startsWith('darasa')) {
      return 'bg-green-100 text-green-800';
    } else if (['form1', 'form2', 'form3', 'form4'].includes(level)) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-purple-100 text-purple-800';
    }
  };

  const filteredStudents = studentsWithUserData.filter((student) => {
    const fullName = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = selectedLevel === null || student.educationLevel === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-gray-600">Manage all enrolled students</p>
          </div>
          <button className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Register Student</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent"
                placeholder="Search students by name or registration number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Filter by level:</span>
              <div className="flex items-center space-x-2 flex-wrap">
                <button 
                  className={`px-3 py-1 rounded-full ${selectedLevel === null ? 'bg-gray-200 text-gray-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedLevel(null)}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedLevel === 'chekechea' ? 'bg-amber-100 text-amber-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedLevel('chekechea')}
                >
                  Kindergarten
                </button>
                <button 
                  className={`px-3 py-1 rounded-full ${selectedLevel === 'darasa4' ? 'bg-green-100 text-green-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedLevel('darasa4')}
                >
                  Standard 4
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guardian
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {student.user?.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={student.user.profileImage}
                              alt={`${student.user?.firstName} ${student.user?.lastName}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-tanzanian-blue/10 flex items-center justify-center text-tanzanian-blue">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.user?.firstName} {student.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEducationLevelBadgeColor(student.educationLevel)}`}>
                        {getEducationLevelLabel(student.educationLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.currentClass}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.guardianInfo.name}</div>
                      <div className="text-xs text-gray-500">{student.guardianInfo.relationship} • {student.guardianInfo.contact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-tanzanian-blue hover:text-tanzanian-blue/80 mr-4">View</button>
                      <button className="text-tanzanian-green hover:text-tanzanian-green/80 mr-4">Edit</button>
                      <button className="text-tanzanian-red hover:text-tanzanian-red/80">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No students found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Students;
