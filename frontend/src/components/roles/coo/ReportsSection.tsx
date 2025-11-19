import React, { useState, useEffect } from "react";
import { FileText, Upload, Download, Filter, X } from "lucide-react";
import { api } from "../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../redux/slice/authSlice";


interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  fileUrl: string;
  summary: any;
  uploadedBy: string;
  fileSize: string;
}


const ReportsSection: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const reportTypes = ["All", "Monthly", "Weekly", "Quarterly"];

  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsData = await api.coo.reports.get(accessToken, dispatch);
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(
    (report) => filterType === "All" || report.type === filterType
  );

  const getStatusColor = () => {
    // All statuses now have white background with blue text
    return "bg-white";
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
      className="min-h-screen p-6"
      style={{ backgroundColor: '#FEF9F5' }}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 
            className="text-3xl"
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontWeight: 'bold',
              color: '#0000CC'
            }}
          >
            Reports
          </h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: '#0000CC',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Report
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-4">
          <Filter 
            className="h-5 w-5"
            style={{ color: '#0000CC' }}
          />
          <div className="flex space-x-2">
            {reportTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterType === type
                    ? "text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                }`}
                style={filterType === type ? { 
                  backgroundColor: '#0000CC',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold'
                } : {
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{ backgroundColor: '#0000CC' }}
            >
              {/* Report Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1">
                    <FileText className="h-5 w-5 text-white mr-2" />
                    <h3 
                      className="text-lg text-white"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                    >
                      {report.title}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 text-xs rounded-lg ${getStatusColor()}`}
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    {report.status}
                  </span>
                </div>
              </div>

              {/* Report Content */}
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
                      {report.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span 
                      className="text-gray-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Date:
                    </span>
                    <span 
                      className="font-medium"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#333'
                      }}
                    >
                      {new Date(report.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span 
                      className="text-gray-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Uploaded by:
                    </span>
                    <span 
                      className="font-medium"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#333'
                      }}
                    >
                      {report.uploadedBy}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span 
                      className="text-gray-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      File size:
                    </span>
                    <span 
                      className="font-medium"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#333'
                      }}
                    >
                      {report.fileSize}
                    </span>
                  </div>
                </div>

                {/* Performance Summary */}
                {report.summary && (
                  <div 
                    className="rounded-lg p-4 mb-4"
                    style={{ backgroundColor: '#E6E6FF' }}
                  >
                    <h4 
                      className="text-sm mb-3"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#0000CC'
                      }}
                    >
                      Performance Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span 
                          className="text-gray-600"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Revenue:
                        </span>
                        <span 
                          className="ml-2"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#333'
                          }}
                        >
                          {report.summary.revenue}
                        </span>
                      </div>
                      <div>
                        <span 
                          className="text-gray-600"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Growth:
                        </span>
                        <span 
                          className="ml-2 text-green-600"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold'
                          }}
                        >
                          {report.summary.growth}
                        </span>
                      </div>
                      <div>
                        <span 
                          className="text-gray-600"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Target:
                        </span>
                        <span 
                          className="ml-2"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#333'
                          }}
                        >
                          {report.summary.target}
                        </span>
                      </div>
                      <div>
                        <span 
                          className="text-gray-600"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Completion:
                        </span>
                        <span 
                          className="ml-2"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#333'
                          }}
                        >
                          {report.summary.completion}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  className="w-full flex items-center justify-center px-4 py-2 rounded-lg transition-opacity"
                  style={{ 
                    backgroundColor: '#E6E6FF',
                    color: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <FileText 
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: '#0000CC' }}
            />
            <p 
              className="text-gray-500"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              No reports found for the selected filter
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="rounded-xl shadow-lg overflow-hidden w-96"
            style={{ backgroundColor: '#0000CC' }}
          >
            {/* Modal Header */}
            <div className="p-6 flex items-center justify-between">
              <h3 
                className="text-xl text-white"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
              >
                Upload New Report
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="bg-white p-6">
              <div className="space-y-4">
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Report Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                    placeholder="Enter report title"
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Report Type
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Upload File
                  </label>
                  <div 
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#0000CC' }}
                  >
                    <Upload 
                      className="h-8 w-8 mx-auto mb-2"
                      style={{ color: '#0000CC' }}
                    />
                    <p 
                      className="text-sm text-gray-500"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Drop files here or click to upload
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#666'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
