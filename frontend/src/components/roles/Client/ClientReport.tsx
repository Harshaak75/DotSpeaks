import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
    FileText,
    CheckCircle,
    MessageSquare,
    Send,
    X,
    Eye,
    ThumbsUp,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type ReportStatus = 'Pending Your Review' | 'Approved' | 'Rework Requested';

interface ReportComment {
    author: 'Brand Head' | 'Client';
    text: string;
}

interface Report {
    id: string;
    title: string;
    date: string;
    status: ReportStatus;
    summary: string;
    discussion: ReportComment[];
}

// --- MOCK DATA ---
const initialReportsData: Report[] = [
    { 
        id: 'rep-001', 
        title: 'July 2025 Performance Report', 
        date: '2025-08-01', 
        status: 'Pending Your Review',
        summary: 'The campaign for July showed strong growth in social media reach, exceeding targets by 15%. However, website traffic was slightly below projection due to a delay in the new ad creative launch. Overall, the month was positive with a strong ROAS of 4.2x.',
        discussion: [
            { author: 'Brand Head', text: 'Here is the performance report for July. Please let us know if you have any feedback.' }
        ]
    },
    { 
        id: 'rep-002', 
        title: 'June 2025 Performance Report', 
        date: '2025-07-01', 
        status: 'Approved',
        summary: 'June was a highly successful month, with all major KPIs being met or exceeded. The influencer collaboration was particularly effective.',
        discussion: [
            { author: 'Brand Head', text: 'Presenting the June report.' },
            { author: 'Client', text: 'Excellent results, thank you! Approved.' }
        ]
    },
    { 
        id: 'rep-003', 
        title: 'May 2025 Performance Report', 
        date: '2025-06-01', 
        status: 'Rework Requested',
        summary: 'May performance was steady. We recommend reallocating budget from Twitter to Instagram for better engagement.',
        discussion: [
            { author: 'Brand Head', text: 'Here is the May report for your review.' },
            { author: 'Client', text: 'Thanks for this. Could you please provide a more detailed breakdown of the Cost Per Acquisition for the Facebook campaign?' }
        ]
    },
];

const statusStyles: Record<ReportStatus, string> = {
    'Pending Your Review': 'bg-yellow-100 text-yellow-800 border-yellow-400',
    'Approved': 'bg-green-100 text-green-800 border-green-400',
    'Rework Requested': 'bg-red-100 text-red-800 border-red-400',
};

// --- REPORT VIEW MODAL ---
const ReportViewModal = ({ isOpen, onClose, report, onUpdateReport }: any) => {
    const [newComment, setNewComment] = useState('');

    if (!report) return null;

    const handlePostComment = () => {
        if (!newComment.trim()) return;
        const updatedReport = {
            ...report,
            discussion: [...report.discussion, { author: 'Client', text: newComment }]
        };
        onUpdateReport(updatedReport);
        setNewComment('');
    };

    const handleApprove = () => {
        const updatedReport = { ...report, status: 'Approved' as ReportStatus };
        onUpdateReport(updatedReport);
        onClose();
    };

    const handleRework = () => {
        if (!newComment.trim()) {
            alert("Please provide a comment explaining the required changes before requesting a rework.");
            return;
        }
        const updatedReport = { 
            ...report, 
            status: 'Rework Requested' as ReportStatus,
            discussion: [...report.discussion, { author: 'Client', text: `Rework Request: ${newComment}` }]
        };
        onUpdateReport(updatedReport);
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/60 backdrop-blur-sm" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                            <div className="p-6">
                                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">{report.title}</Dialog.Title>
                                <p className="text-sm text-gray-500">Report Date: {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <div className="mt-4 border-t pt-4">
                                    <h4 className="font-semibold text-gray-800">Executive Summary</h4>
                                    <p className="mt-2 text-sm text-gray-600 italic">"{report.summary}"</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 border-t">
                                <h4 className="font-semibold text-gray-800 flex items-center mb-4"><MessageSquare className="h-5 w-5 mr-2"/>Feedback & Discussion</h4>
                                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                                    {report.discussion.map((comment: any, index: any) => (
                                        <div key={index} className={`text-sm flex ${comment.author === 'Client' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-3 rounded-lg max-w-md ${comment.author === 'Client' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                <p className="font-semibold">{comment.author}</p>
                                                <p>{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center space-x-2">
                                    <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Type your feedback here..." className="w-full p-2 border border-gray-300 rounded-md"/>
                                    <button onClick={handlePostComment} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Send className="h-5 w-5"/></button>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-100 border-t flex justify-end space-x-2">
                                <button onClick={handleRework} className="px-4 py-2 flex items-center bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600"><RefreshCw className="h-4 w-4 mr-2"/>Request Rework</button>
                                <button onClick={handleApprove} className="px-4 py-2 flex items-center bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"><ThumbsUp className="h-4 w-4 mr-2"/>Approve Report</button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
};

// --- MAIN COMPONENT ---
const ClientReportsDashboard = () => {
    const [reports, setReports] = useState<Report[]>(initialReportsData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingReport, setViewingReport] = useState<Report | null>(null);

    const handleViewReport = (report: Report) => {
        setViewingReport(report);
        setIsModalOpen(true);
    };

    const handleUpdateReport = (updatedReport: Report) => {
        setReports(prevReports => 
            prevReports.map(r => r.id === updatedReport.id ? updatedReport : r)
        );
    };

    return (
        <div className=" min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900">Your Reports</h1>
                    <p className="mt-3 text-lg text-gray-600">Review performance, provide feedback, and track the progress of your campaigns.</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map(report => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(report.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[report.status]}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <button onClick={() => handleViewReport(report)} className="flex items-center text-blue-600 hover:text-blue-800">
                                                <Eye className="h-4 w-4 mr-1.5"/>
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ReportViewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                report={viewingReport}
                onUpdateReport={handleUpdateReport}
            />
        </div>
    );
};

export default ClientReportsDashboard;
