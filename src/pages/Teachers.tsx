
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { teachers, users } from '@/data/mockData';
import { User, Search, Plus, Filter } from 'lucide-react';

const Teachers = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);
  
  // Get all unique subjects
  const allSubjects = [...new Set(teachers.flatMap(teacher => teacher.subjects))];
  
  // Merge teacher data with user data
  const teachersWithUserData = teachers.map(teacher => {
    const userData = users.find(user => user.id === teacher.userId);
    return {
      ...teacher,
      user: userData
    };
  });

  const filteredTeachers = teachersWithUserData.filter((teacher) => {
    const fullName = `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          teacher.staffId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === null || teacher.subjects.includes(selectedSubject);
    
    return matchesSearch && matchesSubject;
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Teachers</h1>
            <p className="text-gray-600">Manage all teaching staff</p>
          </div>
          <button className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Register Teacher</span>
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
                placeholder="Search teachers by name or staff ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Filter by subject:</span>
              <div className="flex items-center space-x-2">
                <button 
                  className={`px-3 py-1 rounded-full ${selectedSubject === null ? 'bg-gray-200 text-gray-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                  onClick={() => setSelectedSubject(null)}
                >
                  All
                </button>
                {allSubjects.map((subject) => (
                  <button 
                    key={subject}
                    className={`px-3 py-1 rounded-full ${selectedSubject === subject ? 'bg-blue-100 text-blue-800' : 'bg-white border border-gray-300 text-gray-600'}`}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teachers List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subjects
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qualifications
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {teacher.user?.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={teacher.user.profileImage}
                              alt={`${teacher.user?.firstName} ${teacher.user?.lastName}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-tanzanian-blue/10 flex items-center justify-center text-tanzanian-blue">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.user?.firstName} {teacher.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {teacher.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.staffId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {teacher.classesAssigned.map((className, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {className}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ul className="text-sm text-gray-500 list-disc list-inside">
                        {teacher.qualifications.map((qualification, index) => (
                          <li key={index}>{qualification}</li>
                        ))}
                      </ul>
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
            {filteredTeachers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No teachers found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Teachers;
