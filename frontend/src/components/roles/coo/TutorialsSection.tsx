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
    const iconClass = "h-4 w-4";
    switch (type.toLowerCase()) {
      case 'video':
        return <Play className={iconClass} />;
      case 'pdf':
      case 'document':
        return <FileText className={iconClass} />;
      default:
        return <BookOpen className={iconClass} />;
    }
  };

  const getStatusColor = () => {
    // All statuses now have white background with blue text
    return 'bg-white';
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
          Training Tutorials
        </h1>
        <div 
          className="text-sm text-gray-500"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {tutorials.filter(t => t.status === 'Completed').length} of {tutorials.length} completed
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex space-x-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filterCategory === category
                ? 'text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
            style={filterCategory === category ? { 
              backgroundColor: '#0000CC',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            } : {
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTutorials.map((tutorial) => (
          <div 
            key={tutorial.id} 
            className="rounded-xl shadow-lg overflow-hidden"
            style={{ backgroundColor: '#0000CC' }}
          >
            {/* Thumbnail - NOW WITH TRANSPARENT OVERLAY */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={tutorial.thumbnailUrl}
                alt={tutorial.title}
                className="w-full h-full object-cover"
              />
              
              {/* Transparent overlay removed - only badge remains */}
              <div className="absolute top-4 left-4">
                <div 
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg"
                  style={{ backgroundColor: 'rgba(0, 0, 204, 0.9)' }}
                >
                  <div style={{ color: 'white' }}>
                    {getTypeIcon(tutorial.type)}
                  </div>
                  <span 
                    className="text-sm text-white"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    {tutorial.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Completion badge */}
              {tutorial.status === 'Completed' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="h-8 w-8 text-green-500 bg-white rounded-full p-1 shadow-lg" />
                </div>
              )}
            </div>

            {/* Tutorial Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 
                  className="text-lg text-white flex-1"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  {tutorial.title}
                </h3>
                <span 
                  className={`inline-flex px-3 py-1 text-xs rounded-lg ml-2 ${getStatusColor()}`}
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    fontWeight: 'bold',
                    color: '#0000CC'
                  }}
                >
                  {tutorial.status}
                </span>
              </div>

              <p 
                className="text-sm text-white mb-4"
                style={{ fontFamily: 'Roboto, sans-serif', opacity: 0.9 }}
              >
                {tutorial.description}
              </p>
            </div>

            {/* Tutorial Content */}
            <div className="bg-white p-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock 
                      className="h-4 w-4 mr-2"
                      style={{ color: '#0000CC' }}
                    />
                    <span 
                      className="text-gray-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Duration: {tutorial.duration}
                    </span>
                  </div>
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Category: {tutorial.category}
                  </span>
                </div>
                
                {tutorial.instructor && (
                  <div className="flex items-center text-sm">
                    <User 
                      className="h-4 w-4 mr-2"
                      style={{ color: '#0000CC' }}
                    />
                    <span 
                      className="text-gray-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Instructor: {tutorial.instructor}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Progress
                  </span>
                  <span 
                    className="font-medium"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    {tutorial.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${tutorial.progress}%`,
                      backgroundColor: '#0000CC'
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(tutorial.url, '_blank')}
                  className="flex-1 flex items-center justify-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  <div style={{ color: 'white' }}>
                    {getTypeIcon(tutorial.type)}
                  </div>
                  <span className="ml-2">
                    {tutorial.type.toLowerCase() === 'video' ? 'Watch' : tutorial.type.toLowerCase() === 'pdf' ? 'View PDF' : 'View Document'}
                  </span>
                </button>
                <button
                  onClick={() => handleMarkAsWatched(tutorial.id, tutorial.status !== 'Completed')}
                  className="px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                  style={{ 
                    backgroundColor: '#E6E6FF',
                    color: '#0000CC'
                  }}
                  title={tutorial.status === 'Completed' ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {tutorial.status === 'Completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div 
                className="mt-3 text-xs text-gray-500"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Last updated: {new Date(tutorial.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTutorials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <BookOpen 
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: '#0000CC' }}
          />
          <p 
            className="text-gray-500"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            No tutorials found for the selected category
          </p>
        </div>
      )}
    </div>
  );
};

export default TutorialsSection;
