import { useState, useEffect } from 'react';
import { FileUp, TrendingUp, Upload, Table, Loader, FileText } from 'lucide-react';
import { api } from '../../../utils/api/Employees/api';
import { useDispatch, useSelector } from 'react-redux';

// --- TYPE DEFINITIONS ---
interface UploadHistoryItem {
    id: string;
    fileName: string;
    leadCount: number;
    uploadDate: number;
    quarter: string;
}

// --- MOCK DATA ---
const initialHistory: UploadHistoryItem[] = [
    {
        id: 'mock-1',
        fileName: 'Q3_Campaign_Leads_V1.xlsx',
        leadCount: 4500,
        uploadDate: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        quarter: 'Q3',
    },
    {
        id: 'mock-2',
        fileName: 'Q3_Website_Forms.csv',
        leadCount: 1200,
        uploadDate: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        quarter: 'Q3',
    },
    {
        id: 'mock-3',
        fileName: 'Q2_Final_Export.xlsx',
        leadCount: 6100,
        uploadDate: Date.now() - (90 * 24 * 60 * 60 * 1000), // 90 days ago
        quarter: 'Q2',
    },
];

// --- HELPER FUNCTIONS ---
const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// --- MAIN COMPONENT ---
const CMOLeadDataUploader = () => {
    // --- State Initialization ---
    const [allHistory, setAllHistory] = useState<UploadHistoryItem[]>(initialHistory);
    const [history, setHistory] = useState<UploadHistoryItem[]>([]);
    const [selectedQuarter, setSelectedQuarter] = useState('Q3');
    const [selectedPackage, setSelectedPackage] = useState('SPARK');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const accessToken = useSelector((state: any) => state.auth.accessToken);
    const dispatch = useDispatch();

    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const packages = ["SPARK", "RISE", "SCALE", "LEAD", "SIGNATURE"];

    // Update displayed history whenever selectedQuarter or allHistory changes
    useEffect(() => {
        setIsLoading(true);
        // Simulate a small delay for a smooth transition
        const timer = setTimeout(() => {
            const filteredHistory = allHistory
                .filter(item => item.quarter === selectedQuarter)
                .sort((a, b) => b.uploadDate - a.uploadDate);
            
            setHistory(filteredHistory);
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedQuarter, allHistory]);

    // --- Simulated Upload Function ---
    const handleSimulatedUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 1. Generate Simulated Data
        const mockLeadCount = Math.floor(Math.random() * 5000) + 500; // 500 to 5500 leads

        const newUpload: UploadHistoryItem = {
            id: `upload-${Date.now()}-${Math.random()}`,
            fileName: selectedFile.name,
            leadCount: mockLeadCount,
            uploadDate: Date.now(),
            quarter: selectedQuarter,
        };

        try {
            console.log(selectedQuarter, selectedFile);
            const response = await api.cmo.uploadLeads.post(accessToken, dispatch, selectedQuarter, selectedFile, selectedPackage);
            console.log("response from backend: ", response);
            // 2. Update Local State
            setAllHistory(prev => [...prev, newUpload]);
            
            // 3. Reset state
            setSelectedFile(null);
            
            // Show success message
            console.log(`Success! File "${newUpload.fileName}" uploaded for ${selectedQuarter}. Leads: ${newUpload.leadCount.toLocaleString('en-IN')}`);
            alert(`Upload successful! File: ${newUpload.fileName}, Leads: ${newUpload.leadCount.toLocaleString('en-IN')}`);

        } catch (error) {
            console.error("Error saving upload history:", error);
        } finally {
            setIsUploading(false);
        }
    };

    // --- RENDER FUNCTIONS ---
    const renderUploadForm = () => (
        <div 
            className="p-6 rounded-2xl shadow-xl border-2 space-y-4"
            style={{ 
                backgroundColor: 'white',
                borderColor: '#E6E6FF'
            }}
        >
            <h2 
                className="text-xl flex items-center border-b pb-3"
                style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#0000CC'
                }}
            >
                <FileUp 
                    className="h-5 w-5 mr-2"
                    style={{ color: '#0000CC' }}
                />
                Upload New Leads Data Sheet
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quarter Selector */}
                <div>
                    <label 
                        className="block text-sm mb-1"
                        style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#4B5563'
                        }}
                    >
                        Target Quarter
                    </label>
                    <select
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(e.target.value)}
                        className="w-full p-3 border-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2"
                        style={{ 
                            borderColor: '#E6E6FF',
                            fontFamily: 'Roboto, sans-serif'
                        }}
                    >
                        {quarters.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                </div>

                {/* Package Selector */}
                <div>
                    <label 
                        className="block text-sm mb-1"
                        style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#4B5563'
                        }}
                    >
                        Target Package
                    </label>
                    <select
                        value={selectedPackage}
                        onChange={(e) => setSelectedPackage(e.target.value)}
                        className="w-full p-3 border-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2"
                        style={{ 
                            borderColor: '#E6E6FF',
                            fontFamily: 'Roboto, sans-serif'
                        }}
                    >
                        {packages.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                </div>

                {/* File Input */}
                <div className="md:col-span-1">
                    <label 
                        className="block text-sm mb-1"
                        style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#4B5563'
                        }}
                    >
                        Select Excel File (.xlsx, .csv)
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="file"
                            id="file-upload"
                            accept=".xlsx, .csv"
                            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                        />
                        <label 
                            htmlFor="file-upload" 
                            className={`flex-grow p-3 border-2 rounded-lg cursor-pointer transition-all text-sm flex items-center justify-between ${
                                selectedFile 
                                    ? 'border-green-500 bg-green-50 text-green-700' 
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                            style={{ 
                                borderColor: selectedFile ? undefined : '#E6E6FF',
                                fontFamily: 'Roboto, sans-serif',
                                fontWeight: '500'
                            }}
                        >
                            <div className="truncate">
                                {selectedFile ? selectedFile.name : 'Choose File...'}
                            </div>
                            <FileText className="h-5 w-5 ml-2 flex-shrink-0"/>
                        </label>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSimulatedUpload}
                disabled={!selectedFile || isUploading}
                className="w-full mt-4 px-5 py-3 text-white rounded-lg shadow-md hover:opacity-90 transition-all disabled:bg-gray-400 flex items-center justify-center space-x-2"
                style={{ 
                    backgroundColor: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                }}
            >
                {isUploading ? (
                    <>
                        <Loader className="h-5 w-5 animate-spin"/> 
                        <span>Processing Upload...</span>
                    </>
                ) : (
                    <>
                        <Upload className="h-5 w-5"/> 
                        <span>Simulate Upload & Get Credit</span>
                    </>
                )}
            </button>
        </div>
    );

    const renderHistoryTable = () => {
        if (isLoading) {
            return (
                <div 
                    className="p-8 text-center"
                    style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#0000CC'
                    }}
                >
                    <Loader className="h-6 w-6 inline animate-spin mr-2" /> Loading History...
                </div>
            );
        }

        if (history.length === 0) {
            return (
                <div 
                    className="text-center p-12 text-gray-500"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                    <Table 
                        className="h-10 w-10 mx-auto mb-3"
                        style={{ color: '#0000CC' }}
                    />
                    <p 
                        className="text-xl mb-1"
                        style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold'
                        }}
                    >
                        No upload records found for {selectedQuarter}.
                    </p>
                    <p className="mt-1">Upload your first leads sheet above to create a record.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead style={{ backgroundColor: '#F9FAFB' }}>
                        <tr>
                            <th 
                                className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                                style={{ 
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 'bold',
                                    color: '#0000CC'
                                }}
                            >
                                File Name
                            </th>
                            <th 
                                className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                                style={{ 
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 'bold',
                                    color: '#0000CC'
                                }}
                            >
                                Leads Count
                            </th>
                            <th 
                                className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                                style={{ 
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 'bold',
                                    color: '#0000CC'
                                }}
                            >
                                Date Uploaded
                            </th>
                            <th 
                                className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                                style={{ 
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 'bold',
                                    color: '#0000CC'
                                }}
                            >
                                Quarter
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center space-x-2"
                                    style={{ 
                                        fontFamily: 'Roboto, sans-serif',
                                        fontWeight: '500'
                                    }}
                                >
                                    <FileText 
                                        className="h-4 w-4"
                                        style={{ color: '#0000CC' }}
                                    />
                                    <span>{item.fileName}</span>
                                </td>
                                <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm text-green-600"
                                    style={{ 
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {item.leadCount.toLocaleString('en-IN')}
                                </td>
                                <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm text-gray-500"
                                    style={{ fontFamily: 'Roboto, sans-serif' }}
                                >
                                    {formatDate(item.uploadDate)}
                                </td>
                                <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm"
                                    style={{ 
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 'bold',
                                        color: '#0000CC'
                                    }}
                                >
                                    {item.quarter}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div 
            className="min-h-screen p-8"
            style={{ 
                backgroundColor: '#FEF9F5',
                fontFamily: 'Roboto, sans-serif'
            }}
        >
            <div className="max-w-6xl mx-auto space-y-10">
                <header className="mb-8 border-b pb-4">
                    <h1 
                        className="text-4xl flex items-center"
                        style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#0000CC'
                        }}
                    >
                        <TrendingUp 
                            className="h-7 w-7 mr-3"
                            style={{ color: '#0000CC' }}
                        /> 
                        Lead Data Credit Portal
                    </h1>
                    <p 
                        className="mt-2 text-lg text-gray-600"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                        Document and track successful lead sheet uploads against quarterly targets. Data is temporary and stored locally.
                    </p>
                </header>
                
                {renderUploadForm()}

                {/* Upload History Display */}
                <div className="space-y-4">
                    <h2 
                        className="text-2xl flex items-center"
                        style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#0000CC'
                        }}
                    >
                        <Table 
                            className="h-6 w-6 mr-2"
                            style={{ color: '#0000CC' }}
                        />
                        Upload History for {selectedQuarter}
                    </h2>
                    <div 
                        className="p-6 rounded-2xl shadow-xl border-2"
                        style={{ 
                            backgroundColor: 'white',
                            borderColor: '#E6E6FF'
                        }}
                    >
                        {renderHistoryTable()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMOLeadDataUploader;
