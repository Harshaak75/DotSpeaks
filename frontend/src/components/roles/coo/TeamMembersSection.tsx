import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Calendar, Briefcase, Star } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'away':
        return 'bg-yellow-100 text-yellow-800';
      case 'busy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Team Members Reporting to COO</h2>
        <div className="text-sm text-gray-500">
          {teamMembers.length} direct reports
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.title}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                  {member.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <a href={`mailto:${member.email}`} className="text-blue-600 hover:text-blue-800">
                  {member.email}
                </a>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-700">{member.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-700">{member.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-700">Joined {new Date(member.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-700">{member.directReports} direct reports</span>
              </div>
            </div>

            {/* Performance */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Performance</span>
                <div className="flex items-center">
                  <Star className={`h-4 w-4 mr-1 ${getPerformanceColor(member.performance)}`} />
                  <span className={`font-medium ${getPerformanceColor(member.performance)}`}>
                    {member.performance}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Projects */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Projects</h4>
              <div className="flex flex-wrap gap-1">
                {member.currentProjects.slice(0, 3).map((project, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    <Briefcase className="h-3 w-3 mr-1" />
                    {project}
                  </span>
                ))}
                {member.currentProjects.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{member.currentProjects.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Key Skills</h4>
              <div className="flex flex-wrap gap-1">
                {member.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {member.skills.length > 4 && (
                  <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{member.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMember(member)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No team members found</p>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Team Member Details</h3>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center mb-6">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">{selectedMember.name}</h4>
                  <p className="text-gray-600">{selectedMember.title}</p>
                  <p className="text-sm text-gray-500">{selectedMember.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Contact Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{selectedMember.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{selectedMember.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Work Information</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Join Date: </span>
                      <span>{new Date(selectedMember.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Direct Reports: </span>
                      <span>{selectedMember.directReports}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Performance: </span>
                      <span className={getPerformanceColor(selectedMember.performance)}>
                        {selectedMember.performance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="font-medium text-gray-900 mb-3">Current Projects</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.currentProjects.map((project, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      <Briefcase className="h-3 w-3 mr-1" />
                      {project}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h5 className="font-medium text-gray-900 mb-3">Skills & Expertise</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
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