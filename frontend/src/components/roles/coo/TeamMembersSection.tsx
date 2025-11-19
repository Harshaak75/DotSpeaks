import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Calendar, Briefcase, Star, X } from 'lucide-react';
import { api } from '../../../utils/api/Employees/api';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccessToken } from '../../../redux/slice/authSlice';


interface TeamMember {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  department: string;
  joinDate: string;
  currentProjects: string[];
  skills: string[];
  performance: string;
  avatar: string;
  status: string;
  location: string;
  directReports: number;
}


const TeamMembersSection: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const teamData = await api.coo.teamMembers.get(accessToken, dispatch);
      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    // All statuses now have white background with blue text
    return 'bg-white';
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return '#0000CC';
      case 'average':
        return 'text-yellow-600';
      case 'needs improvement':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: '#0000CC' }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6 space-y-6"
      style={{ backgroundColor: '#FEF9F5' }}
    >
      <div className="flex justify-between items-center">
        <h1 
          className="text-3xl"
          style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontWeight: 'bold',
            color: '#0000CC'
          }}
        >
          Team Members Reporting to COO
        </h1>
        <div 
          className="text-sm text-gray-500"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {teamMembers.length} direct reports
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div 
            key={member.id} 
            className="rounded-xl shadow-lg overflow-hidden"
            style={{ backgroundColor: '#0000CC' }}
          >
            {/* Member Header */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                />
                <div className="ml-4 flex-1">
                  <h3 
                    className="text-lg text-white"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    {member.name}
                  </h3>
                  <p 
                    className="text-sm text-white"
                    style={{ fontFamily: 'Roboto, sans-serif', opacity: 0.9 }}
                  >
                    {member.title}
                  </p>
                  <span 
                    className={`inline-flex px-3 py-1 text-xs rounded-lg mt-1 ${getStatusColor()}`}
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Member Content */}
            <div className="bg-white p-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <Mail 
                    className="h-4 w-4 mr-2"
                    style={{ color: '#0000CC' }}
                  />
                  <a 
                    href={`mailto:${member.email}`} 
                    className="hover:underline"
                    style={{ 
                      color: '#0000CC',
                      fontFamily: 'Roboto, sans-serif'
                    }}
                  >
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center text-sm">
                  <Phone 
                    className="h-4 w-4 mr-2"
                    style={{ color: '#0000CC' }}
                  />
                  <span 
                    className="text-gray-700"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {member.phone}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin 
                    className="h-4 w-4 mr-2"
                    style={{ color: '#0000CC' }}
                  />
                  <span 
                    className="text-gray-700"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {member.location}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar 
                    className="h-4 w-4 mr-2"
                    style={{ color: '#0000CC' }}
                  />
                  <span 
                    className="text-gray-700"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Joined {new Date(member.joinDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Users 
                    className="h-4 w-4 mr-2"
                    style={{ color: '#0000CC' }}
                  />
                  <span 
                    className="text-gray-700"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {member.directReports} direct reports
                  </span>
                </div>
              </div>

              {/* Performance */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Performance
                  </span>
                  <div className="flex items-center">
                    <Star 
                      className="h-4 w-4 mr-1"
                      style={{ color: getPerformanceColor(member.performance) }}
                    />
                    <span 
                      className="font-medium"
                      style={{ 
                        color: getPerformanceColor(member.performance),
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      {member.performance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Projects */}
              <div className="mb-4">
                <h4 
                  className="text-sm mb-2"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#0000CC'
                  }}
                >
                  Current Projects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {member.currentProjects.slice(0, 3).map((project, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-lg text-xs"
                      style={{ 
                        backgroundColor: '#E6E6FF',
                        color: '#0000CC',
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    >
                      <Briefcase className="h-3 w-3 mr-1" />
                      {project}
                    </span>
                  ))}
                  {member.currentProjects.length > 3 && (
                    <span 
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      +{member.currentProjects.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h4 
                  className="text-sm mb-2"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#0000CC'
                  }}
                >
                  Key Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {member.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 4 && (
                    <span 
                      className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      +{member.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="flex-1 px-3 py-2 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  View Details
                </button>
                <button 
                  className="px-3 py-2 text-sm rounded-lg hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: '#E6E6FF',
                    color: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Users 
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: '#0000CC' }}
          />
          <p 
            className="text-gray-500"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            No team members found
          </p>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: '#0000CC' }}
          >
            {/* Modal Header */}
            <div className="p-6 flex items-center justify-between">
              <h3 
                className="text-xl text-white"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
              >
                Team Member Details
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="bg-white p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <div className="flex items-center mb-6">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="h-16 w-16 rounded-full object-cover ring-4"
                  style={{ borderColor: '#0000CC' }}
                />
                <div className="ml-4">
                  <h4 
                    className="text-lg"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    {selectedMember.name}
                  </h4>
                  <p 
                    className="text-gray-700"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {selectedMember.title}
                  </p>
                  <p 
                    className="text-sm text-gray-500"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {selectedMember.department}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 
                    className="mb-3"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    Contact Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail 
                        className="h-4 w-4 mr-2"
                        style={{ color: '#0000CC' }}
                      />
                      <span style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {selectedMember.email}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone 
                        className="h-4 w-4 mr-2"
                        style={{ color: '#0000CC' }}
                      />
                      <span style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {selectedMember.phone}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin 
                        className="h-4 w-4 mr-2"
                        style={{ color: '#0000CC' }}
                      />
                      <span style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {selectedMember.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 
                    className="mb-3"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    Work Information
                  </h5>
                  <div 
                    className="space-y-2 text-sm"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <div>
                      <span className="text-gray-600">Join Date: </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}>
                        {new Date(selectedMember.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Direct Reports: </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}>
                        {selectedMember.directReports}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Performance: </span>
                      <span 
                        style={{ 
                          color: getPerformanceColor(selectedMember.performance),
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold'
                        }}
                      >
                        {selectedMember.performance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h5 
                  className="mb-3"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#0000CC'
                  }}
                >
                  Current Projects
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.currentProjects.map((project, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 text-sm rounded-lg"
                      style={{ 
                        backgroundColor: '#E6E6FF',
                        color: '#0000CC',
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    >
                      <Briefcase className="h-3 w-3 mr-1" />
                      {project}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h5 
                  className="mb-3"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#0000CC'
                  }}
                >
                  Skills & Expertise
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembersSection;
