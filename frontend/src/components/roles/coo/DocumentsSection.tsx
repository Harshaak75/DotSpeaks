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
    switch (level.toLowerCase()) {
      case 'confidential':
        return <Lock className="h-4 w-4 text-red-500" />;
      case 'restricted':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'internal':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConfidentialityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'confidential':
        return 'bg-red-100 text-red-800';
      case 'restricted':
        return 'bg-orange-100 text-orange-800';
      case 'internal':
        return 'bg-blue-100 text-blue-800';
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
        <h2 className="text-2xl font-bold text-gray-900">Legal Documents</h2>
        <div className="text-sm text-gray-500">
          View-only access • {documents.length} documents
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDocuments.map((document) => (
          <div key={document.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {getConfidentialityIcon(document.confidentiality)}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidentialityColor(document.confidentiality)}`}>
                  {document.confidentiality}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{document.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{document.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{document.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{document.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">v{document.version}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Modified:</span>
                <span className="font-medium">{new Date(document.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Eye className="h-4 w-4 mr-2" />
                View
              </button>
              <button className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No documents found for the selected category</p>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;