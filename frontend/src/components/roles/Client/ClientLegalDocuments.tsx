import React from 'react';
import { 
    FileText,
    Shield,
    Download,
    Eye,
    UploadCloud,
    Plus,
    CheckCircle,
    Clock
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type DocumentStatus = 'Signed' | 'Pending Signature' | 'Archived';

interface LegalDocument {
    id: string;
    name: string;
    type: string;
    date: string;
    status: DocumentStatus;
}

// --- MOCK DATA ---
const legalDocumentsData: LegalDocument[] = [
    { id: 'doc-001', name: 'Master Service Agreement (MSA)', type: 'Contract', date: '2025-01-15', status: 'Signed' },
    { id: 'doc-002', name: 'Statement of Work (SOW) - Q3 Campaign', type: 'Agreement', date: '2025-06-20', status: 'Signed' },
    { id: 'doc-003', name: 'Non-Disclosure Agreement (NDA)', type: 'Agreement', date: '2025-01-10', status: 'Signed' },
    { id: 'doc-004', name: 'SOW Amendment - Q3 Video Add-on', type: 'Agreement', date: '2025-08-01', status: 'Pending Signature' },
];

const statusStyles: Record<DocumentStatus, string> = {
    'Signed': 'bg-green-100 text-green-800',
    'Pending Signature': 'bg-yellow-100 text-yellow-800',
    'Archived': 'bg-gray-100 text-gray-800',
};

// --- MAIN COMPONENT ---
const LegalDocumentsDashboard = () => {
    // In a real app, you would manage state for modals and uploads here.
    // For this design component, we'll use alerts for button clicks.

    return (
        <div className=" min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Legal Documents</h1>
                        <p className="mt-2 text-lg text-gray-600">A secure repository for all your contracts and agreements with DotSpeaks.</p>
                    </div>
                    <button 
                        onClick={() => alert('Opening upload modal...')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <UploadCloud className="h-5 w-5 mr-2 -ml-1"/>
                        Upload Signed Document
                    </button>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8 flex items-center">
                    <Shield className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0"/>
                    <div>
                        <h3 className="font-bold text-blue-800">Security & Confidentiality</h3>
                        <p className="text-sm text-blue-700">All documents are stored with end-to-end encryption. Your privacy and data security are our utmost priority.</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {legalDocumentsData.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FileText className="h-5 w-5 text-gray-400 mr-3"/>
                                                <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[doc.status]}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full" title="View Document">
                                                    <Eye className="h-4 w-4"/>
                                                </button>
                                                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full" title="Download Document">
                                                    <Download className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalDocumentsDashboard;
