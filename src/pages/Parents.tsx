
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { users, students } from '@/data/mockData';
import { User, Search, Plus } from 'lucide-react';

const Parents = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filter users to get only parents
  const parentUsers = users.filter(user => user.role === 'parent');
  
  // Get students' guardian information
  const parentsWithGuardianInfo = parentUsers.map(parent => {
    const associatedStudents = students.filter(
      student => student.guardianInfo.name.toLowerCase().includes(parent.firstName.toLowerCase()) ||
                student.guardianInfo.name.toLowerCase().includes(parent.lastName.toLowerCase())
    );
    
    return {
      ...parent,
      children: associatedStudents
    };
  });

  const filteredParents = parentsWithGuardianInfo.filter((parent) => {
    const fullName = `${parent.firstName} ${parent.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (parent.phoneNumber && parent.phoneNumber.includes(searchQuery));
  });

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Parents/Guardians</h1>
            <p className="text-gray-600">Manage parents and guardians of enrolled students</p>
          </div>
          <button className="bg-tanzanian-blue hover:bg-tanzanian-blue/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add Parent</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-tanzanian-blue focus:border-transparent"
              placeholder="Search parents by name, email, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Parents List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParents.map((parent) => (
            <div key={parent.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-tanzanian-blue/10 flex items-center justify-center overflow-hidden">
                    {parent.profileImage ? (
                      <img
                        className="h-12 w-12 object-cover"
                        src={parent.profileImage}
                        alt={`${parent.firstName} ${parent.lastName}`}
                      />
                    ) : (
                      <User className="h-6 w-6 text-tanzanian-blue" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{parent.firstName} {parent.lastName}</h3>
                    <p className="text-sm text-gray-500 capitalize">{parent.role.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <p className="text-sm text-gray-600">{parent.email}</p>
                  </div>
                  {parent.phoneNumber && (
                    <div className="flex items-start space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <p className="text-sm text-gray-600">{parent.phoneNumber}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Children:</h4>
                  {parent.children.length > 0 ? (
                    <ul className="space-y-2">
                      {parent.children.map((child) => {
                        const childUserData = users.find(u => u.id === child.userId);
                        return (
                          <li key={child.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-tanzanian-green rounded-full"></span>
                              <span className="text-sm">{childUserData?.firstName} {childUserData?.lastName}</span>
                            </div>
                            <span className="text-xs text-gray-500">{child.currentClass}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No children linked</p>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
                <button className="text-sm text-tanzanian-blue hover:underline">View Profile</button>
                <button className="text-sm text-tanzanian-green hover:underline">Edit</button>
              </div>
            </div>
          ))}
          {filteredParents.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No parents found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Parents;
