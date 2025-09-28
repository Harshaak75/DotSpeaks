import React, { useState, useEffect } from 'react';
import { Play, FileText, CheckCircle, Clock, BookOpen, User } from 'lucide-react';
import { api } from '../../../utils/api/Employees/api';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccessToken } from '../../../redux/slice/authSlice';

interface Tutorial {
  id: string;
  title: string;
  category: string;
  type: string;
  duration: string;
  progress: number;
  status: string;
  url: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  lastUpdated: string;
}

const TutorialsSection: React.FC = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Operations', 'Strategy', 'Leadership', 'Process Improvement', 'Quality', 'Finance'];

  const accessToken = useSelector(selectAccessToken);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const tutorialsData = await api.coo.tutorials.get(accessToken, dispatch);
      setTutorials(tutorialsData);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsWatched = async (tutorialId: string, isWatched: boolean) => {
    try {
      await api.coo.tutorials.updateWatchStatus(tutorialId, isWatched, accessToken, dispatch);
      setTutorials(tutorials.map(tutorial => 
        tutorial.id === tutorialId 
          ? { ...tutorial, progress: isWatched ? 100 : 0, status: isWatched ? 'Completed' : 'Not Started' }
          : tutorial
      ));
    } catch (error) {
      console.error('Error updating tutorial status:', error);
    }
  };

  const filteredTutorials = tutorials.filter(tutorial => 
    filterCategory === 'All' || tutorial.category === filterCategory
  );

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'pdf':
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'not started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h2 className="text-2xl font-bold text-gray-900">Training Tutorials</h2>
        <div className="text-sm text-gray-500">
          {tutorials.filter(t => t.status === 'Completed').length} of {tutorials.length} completed
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex space-x-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filterCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTutorials.map((tutorial) => (
          <div key={tutorial.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Thumbnail */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={tutorial.thumbnailUrl}
                alt={tutorial.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-white">
                  {getTypeIcon(tutorial.type)}
                  <span className="text-sm font-medium">{tutorial.type.toUpperCase()}</span>
                </div>
              </div>
              {tutorial.status === 'Completed' && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{tutorial.title}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tutorial.status)}`}>
                  {tutorial.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Duration: {tutorial.duration}</span>
                  </div>
                  <span className="text-gray-600">Category: {tutorial.category}</span>
                </div>
                
                {tutorial.instructor && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Instructor: {tutorial.instructor}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{tutorial.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${tutorial.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(tutorial.url, '_blank')}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {getTypeIcon(tutorial.type)}
                  <span className="ml-2">
                    {tutorial.type === 'video' ? 'Watch' : 'View'}
                  </span>
                </button>
                <button
                  onClick={() => handleMarkAsWatched(tutorial.id, tutorial.status !== 'Completed')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {tutorial.status === 'Completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Last updated: {new Date(tutorial.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTutorials.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tutorials found for the selected category</p>
        </div>
      )}
    </div>
  );
};

export default TutorialsSection;