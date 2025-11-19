import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Lock, Shield } from 'lucide-react';
import { api } from '../../../utils/api/Employees/api';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccessToken } from '../../../redux/slice/authSlice';


interface Document {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  fileUrl: string;
  description: string;
  category: string;
  size: string;
  confidentiality: string;
  version: string;
}


const DocumentsSection: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  const categories = ['All', 'Employment', 'Financial', 'Legal', 'Compliance'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const documentsData = await api.coo.documents.get(accessToken, dispatch);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    filterCategory === 'All' || doc.category === filterCategory
  );

  const getConfidentialityIcon = (level: string) => {
    const iconStyle = { color: '#0000CC' };
    switch (level.toLowerCase()) {
      case 'confidential':
        return <Lock className="h-4 w-4" style={iconStyle} />;
      case 'restricted':
        return <Shield className="h-4 w-4" style={iconStyle} />;
      case 'internal':
        return <Eye className="h-4 w-4" style={iconStyle} />;
      default:
        return <FileText className="h-4 w-4" style={iconStyle} />;
    }
  };

  const getConfidentialityColor = () => {
    // All confidentiality levels now have white background with blue text
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
          Legal Documents
        </h1>
        <div 
          className="text-sm text-gray-500"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          View-only access • {documents.length} documents
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDocuments.map((document) => (
          <div 
            key={document.id} 
            className="rounded-xl shadow-lg overflow-hidden"
            style={{ backgroundColor: '#0000CC' }}
          >
            {/* Document Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <FileText className="h-5 w-5 text-white mr-2" />
                  <h3 
                    className="text-lg text-white"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    {document.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {getConfidentialityIcon(document.confidentiality)}
                  <span 
                    className={`inline-flex px-3 py-1 text-xs rounded-lg ${getConfidentialityColor()}`}
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    {document.confidentiality}
                  </span>
                </div>
              </div>

              <p 
                className="text-sm text-white mb-4"
                style={{ fontFamily: 'Roboto, sans-serif', opacity: 0.9 }}
              >
                {document.description}
              </p>
            </div>

            {/* Document Content */}
            <div className="bg-white p-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Type:
                  </span>
                  <span 
                    className="font-medium"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    {document.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Category:
                  </span>
                  <span 
                    className="font-medium"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    {document.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Size:
                  </span>
                  <span 
                    className="font-medium"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    {document.size}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Version:
                  </span>
                  <span 
                    className="font-medium"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    v{document.version}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Last Modified:
                  </span>
                  <span 
                    className="font-medium"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    {new Date(document.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  className="flex-1 flex items-center justify-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </button>
                <button 
                  className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                  style={{ 
                    backgroundColor: '#E6E6FF',
                    color: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FileText 
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: '#0000CC' }}
          />
          <p 
            className="text-gray-500"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            No documents found for the selected category
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
