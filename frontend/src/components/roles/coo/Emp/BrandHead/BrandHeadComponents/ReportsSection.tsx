import { useState, Fragment } from 'react';
import { 
    FileText, 
    BarChart2, 
    Users, 
    Calendar, 
    Plus,
    Download,
    Eye,
    Loader,
    X,
    CheckCircle,
    MessageSquare,
    Sparkles,
    UserCheck,
    UserX,
    AlertTriangle,
    DollarSign,
    Briefcase,
    Send
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// --- TYPE DEFINITIONS ---
type ReportType = 'Client Performance' | 'Team Productivity' | 'Quarterly Business Review';

interface Report {
    id: string;
    title: string;
    type: ReportType;
    clientName: string;
    dateRange: string;
    generatedBy: string;
    generatedAt: string;
}

// --- MOCK DATA ---
const initialReportsData: Report[] = [
    { id: 'rep-001', title: 'Nexus Corp - Q2 Performance Review', type: 'Client Performance', clientName: 'Nexus Corp', dateRange: 'Apr 1 - Jun 30, 2025', generatedBy: 'Brand Head', generatedAt: '2025-07-05' },
    { id: 'rep-002', title: 'Alpha Squad - July Productivity', type: 'Team Productivity', clientName: 'All Clients', dateRange: 'Jul 1 - Jul 31, 2025', generatedBy: 'Brand Head', generatedAt: '2025-08-01' },
];

const clients = [
    { id: 'client-1', name: 'Nexus Corp', assignedTeam: 'Alpha Squad' },
    { id: 'client-2', name: 'Stellar Solutions', assignedTeam: 'Bravo Unit' },
];

type Task = { id: string; description: string; status: string; assignedTo: string; };
type Blocker = { role: string; note: string; taskId: string; };
type MonthData = { tasks: Task[]; blockers: Blocker[]; };
type ClientTaskData = { [clientName: string]: { [month: string]: MonthData } };

const clientTaskData: ClientTaskData = {
    'Nexus Corp': {
        '2025-07': {
            tasks: [
                { id: 't1', description: 'Launch "Future Forward" PR Campaign', status: 'Completed', assignedTo: 'Digital Marketer' },
                { id: 't2', description: 'Finalize Q3 Instagram Post Designs', status: 'Completed', assignedTo: 'Graphics Designer' },
                { id: 't3', description: 'Run targeted ad campaign on LinkedIn', status: 'Blocked', assignedTo: 'Digital Marketer' },
                { id: 't4', description: 'Develop new landing page mockups', status: 'Blocked', assignedTo: 'Graphics Designer' },
                { id: 't5', description: 'Collaborate with 5 industry influencers', status: 'In Progress', assignedTo: 'Digital Marketer' },
            ],
            blockers: [
                { role: 'Graphics Designer', note: 'Client feedback on the initial landing page wireframes was delayed by 4 days, pushing back the final design delivery.', taskId: 't4' },
                { role: 'Digital Marketer', note: 'Ad budget approval is still pending from the client\'s finance department.', taskId: 't3' }
            ]
        }
    }
};

const reportTypeIcons: Record<ReportType, JSX.Element> = {
    'Client Performance': <BarChart2 className="h-5 w-5 text-blue-500" />,
    'Team Productivity': <Users className="h-5 w-5 text-purple-500" />,
    'Quarterly Business Review': <FileText className="h-5 w-5 text-green-500" />,
};

// --- GENERATE REPORT MODAL ---
const GenerateReportModal = ({ isOpen, onClose, onGenerate }: any) => {
    const [selectedClientName, setSelectedClientName] = useState(clients[0].name);
    const [selectedMonth, setSelectedMonth] = useState('2025-07');
    const [reportData, setReportData] = useState<MonthData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [brandHeadReview, setBrandHeadReview] = useState('');

    const handleFetchData = () => {
        setIsLoading(true);
        setAiSummary('');
        setBrandHeadReview('');
        setTimeout(() => {
            setReportData(clientTaskData[selectedClientName]?.[selectedMonth]);
            setIsLoading(false);
        }, 1000);
    };
    
    const generateAISummary = async () => {
        if (!reportData) return;
        setIsGeneratingSummary(true);

        const prompt = `
            Generate a concise, professional executive summary for a client report based on the following data.
            The client is ${selectedClientName}. The report is for ${selectedMonth}.
            Tasks completed: ${reportData.tasks.filter((t: any) => t.status === 'Completed').length} out of ${reportData.tasks.length}.
            Blocker reasons: ${reportData.blockers.map((b: any) => `${b.role} reported: "${b.note}"`).join('. ')}
            The Brand Head's final review is: "${brandHeadReview}"
            Incorporate all this information into a cohesive summary. Start with the overall performance, explain any shortfalls using the provided reasons, and conclude with the Brand Head's strategic notes.
        `;
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
            });
            const result = await response.json();
            setAiSummary(result.candidates[0].content.parts[0].text.trim());
        } catch (error) {
            console.error("Gemini API error:", error);
            setAiSummary("Failed to generate AI summary.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const completionPercentage = reportData ? (reportData.tasks.filter((t: any) => t.status === 'Completed').length / reportData.tasks.length) * 100 : 0;
    const selectedClientData = clients.find(c => c.name === selectedClientName);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-50 text-left align-middle shadow-xl transition-all border-2" style={{ borderColor: '#0000CC' }}>
                                <div className="p-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6" style={{ color: '#0000CC' }}>
                                        Generate Client Performance Report
                                    </Dialog.Title>
                                    <div className="mt-4 flex items-end space-x-4 p-4 bg-white rounded-lg border">
                                        <div className="flex-grow">
                                            <label className="block text-sm font-medium text-gray-700">Client</label>
                                            <select 
                                                value={selectedClientName} 
                                                onChange={e => setSelectedClientName(e.target.value)} 
                                                className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                                                style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                            >
                                                {clients.map(c => <option key={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Month</label>
                                            <input 
                                                type="month" 
                                                value={selectedMonth} 
                                                onChange={e => setSelectedMonth(e.target.value)} 
                                                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                                                style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleFetchData} 
                                            disabled={isLoading} 
                                            className="px-4 py-2 flex items-center justify-center text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                                            style={{ backgroundColor: isLoading ? '#9CA3AF' : '#0000CC' }}
                                        >
                                            {isLoading ? <><Loader className="h-4 w-4 mr-2 animate-spin"/> Fetching...</> : 'Fetch Data'}
                                        </button>
                                    </div>
                                </div>
                                
                                {reportData && (
                                    <div className="p-6 bg-white border-t">
                                        <h3 className="font-bold text-lg mb-4 text-center">Monthly Performance Report</h3>
                                        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg border mb-6">
                                            <div>
                                                <p className="text-sm text-gray-500">Client</p>
                                                <p className="font-bold text-lg text-gray-900">{selectedClientName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Assigned Team</p>
                                                <p className="font-bold text-lg text-gray-900">{selectedClientData?.assignedTeam}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Period</p>
                                                <p className="font-bold text-lg text-gray-900">{selectedMonth}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Overall Task Completion</label>
                                            <div className="flex items-center mt-1">
                                                <div className="w-full bg-gray-200 rounded-full h-4">
                                                    <div className="h-4 rounded-full" style={{ width: `${completionPercentage}%`, backgroundColor: '#0000CC' }}></div>
                                                </div>
                                                <span className="ml-4 font-bold text-lg">{Math.round(completionPercentage)}%</span>
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <h4 className="font-semibold text-gray-800">Key Initiatives</h4>
                                            <ul className="mt-2 space-y-2">
                                                {reportData.tasks.map((task: any) => (
                                                    <li key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border">
                                                        <div className="flex items-center">
                                                            {task.status === 'Completed' ? <CheckCircle className="h-5 w-5 mr-3 text-green-500"/> : <MessageSquare className="h-5 w-5 mr-3 text-yellow-500"/>}
                                                            {task.description}
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-500">{task.assignedTo}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {completionPercentage < 100 && (
                                            <div className="mt-6">
                                                <h4 className="font-semibold text-red-700">Analysis of Shortfall</h4>
                                                {reportData.blockers.map((blocker: any, i: number) => (
                                                    <div key={i} className="mt-2 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                                                        <p className="font-semibold text-sm text-gray-800 flex items-center">
                                                            {blocker.role === 'Digital Marketer' ? <UserCheck className="h-4 w-4 mr-2"/> : <UserX className="h-4 w-4 mr-2"/>}
                                                            {blocker.role} reported:
                                                        </p>
                                                        <p className="text-sm text-gray-600 italic pl-6">"{blocker.note}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-6">
                                            <h4 className="font-semibold text-gray-800">Brand Head's Review</h4>
                                            <textarea 
                                                value={brandHeadReview}
                                                onChange={(e) => setBrandHeadReview(e.target.value)}
                                                placeholder="Add your final comments, strategic recommendations, or next steps here..."
                                                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="mt-4">
                                            <button 
                                                onClick={generateAISummary} 
                                                disabled={isGeneratingSummary || !brandHeadReview} 
                                                className="flex items-center text-sm font-semibold hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ color: '#0000CC' }}
                                            >
                                                <Sparkles className="h-4 w-4 mr-2"/> {isGeneratingSummary ? 'Generating...' : 'Generate AI Executive Summary'}
                                            </button>
                                            {aiSummary && <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">{aiSummary}</div>}
                                        </div>
                                    </div>
                                )}
                                <div className="p-6 flex justify-end space-x-2 bg-gray-100 border-t">
                                    <button 
                                        onClick={onClose} 
                                        className="px-4 py-2 bg-white border rounded-lg font-semibold hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => { onGenerate(reportData); onClose(); }} 
                                        className="px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90"
                                        style={{ backgroundColor: '#0000CC' }}
                                    >
                                        Generate & Send
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

// --- COMPONENT TO DISPLAY THE FINAL GENERATED REPORT ---
const GeneratedReport = ({ report, onClose }: any) => {
    const reportDetails = {
        objective: "Increase Brand Awareness by 20% in Q3",
        completion: 60,
        keyResults: [
            { title: 'Website Traffic', current: '312k', target: '500k', progress: 62.4 },
            { title: 'Social Media Reach', current: '1.5M', target: '2M', progress: 75 },
            { title: 'Media Mentions', current: '25', target: '50', progress: 50 },
        ],
        financials: {
            budget: 10000,
            spend: 9500,
            roas: 4.2,
            cpa: 25.50
        },
        blockers: clientTaskData['Nexus Corp']['2025-07'].blockers,
        aiSummary: "The Q2 campaign for Nexus Corp successfully increased brand reach, achieving 75% of its social media goal. However, overall progress is at 60% due to significant blockers. The Graphics Designer faced a 4-day delay awaiting client feedback for landing page mockups, and the Digital Marketer is still pending ad budget approval. Financially, the campaign was efficient, coming in 5% under budget with a strong 4.2x ROAS. The strategic priority is to resolve client-side dependencies to unlock the remaining campaign potential.",
        nextSteps: "Schedule a follow-up meeting with the client's finance and marketing teams to expedite approvals. Re-allocate design resources to the influencer campaign until landing page feedback is received."
    };

    const RadialProgress = ({ progress }: any) => {
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;
        return (
            <div className="relative h-20 w-20">
                <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 80 80">
                    <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="40" cy="40" />
                    <circle strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx="40" cy="40" style={{ stroke: '#0000CC' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">{Math.round(progress)}%</span>
            </div>
        );
    };

    return (
        <div className="p-8 bg-white">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
                    <p className="text-sm text-gray-500">Date Range: {report.dateRange}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="h-5 w-5"/></button>
            </div>

            <div className="space-y-8">
                {/* Executive Summary */}
                <div className="p-4 bg-blue-50 rounded-lg border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                    <h3 className="font-semibold text-gray-800 flex items-center" style={{ color: '#0000CC' }}>
                        <Sparkles className="h-5 w-5 mr-2"/>
                        Executive Summary
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{reportDetails.aiSummary}</p>
                </div>

                {/* Objective & Progress */}
                <div className="p-4 bg-white rounded-lg border-l-4 flex items-center justify-between" style={{ borderLeftColor: '#0000CC' }}>
                    <div>
                        <h3 className="font-semibold text-gray-800">Main Objective</h3>
                        <p className="text-lg text-gray-600">{reportDetails.objective}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: '#0000CC' }}>
                            {Math.round(reportDetails.completion)}%
                        </p>
                        <p className="text-xs text-gray-500">Completed</p>
                    </div>
                </div>

                {/* Key Results */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Key Results Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {reportDetails.keyResults.map(kr => (
                            <div key={kr.title} className="bg-gray-50 p-4 rounded-lg border-l-4 flex items-center space-x-4" style={{ borderLeftColor: '#0000CC' }}>
                                <RadialProgress progress={kr.progress} />
                                <div>
                                    <p className="font-semibold text-gray-700">{kr.title}</p>
                                    <p className="text-sm text-gray-500">{kr.current} / {kr.target}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial & ROI Analysis */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Financial & ROI Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                            <h4 className="text-sm font-medium text-gray-500">Budget vs. Spend</h4>
                            <p className="text-2xl font-bold text-gray-900 mt-1">${reportDetails.financials.spend.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">of ${reportDetails.financials.budget.toLocaleString()} budget</p>
                        </div>
                         <div className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: '#10B981' }}>
                            <h4 className="text-sm font-medium text-gray-500">Return on Ad Spend (ROAS)</h4>
                            <p className="text-2xl font-bold text-green-600 mt-1">{reportDetails.financials.roas}x</p>
                            <p className="text-sm text-gray-500">Revenue per dollar spent</p>
                        </div>
                         <div className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                            <h4 className="text-sm font-medium text-gray-500">Cost Per Acquisition (CPA)</h4>
                            <p className="text-2xl font-bold text-gray-900 mt-1">${reportDetails.financials.cpa.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">To acquire a new customer</p>
                        </div>
                    </div>
                </div>

                {/* Shortfall Analysis */}
                {reportDetails.completion < 100 && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                        <h3 className="font-semibold text-red-800 flex items-center"><AlertTriangle className="h-5 w-5 mr-2"/>Analysis of Shortfall</h3>
                        <ul className="mt-2 space-y-2">
                            {reportDetails.blockers.map((blocker: any, i: number) => (
                                <li key={i} className="text-sm">
                                    <strong className="text-gray-700">{blocker.role}:</strong>
                                    <span className="text-gray-600 ml-1">"{blocker.note}"</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Next Steps */}
                <div className="p-4 bg-white rounded-lg border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                    <h3 className="font-semibold text-gray-800">Next Steps & Recommendations</h3>
                    <p className="mt-2 text-sm text-gray-600">{reportDetails.nextSteps}</p>
                </div>
            </div>
        </div>
    );
};

// --- THE MAIN DASHBOARD COMPONENT ---
const ReportsSection = () => {
    const [reports, setReports] = useState(initialReportsData);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingReport, setViewingReport] = useState<Report | null>(null);

    const handleAddReport = (newReport: any) => {
        const report: Report = {
            id: `rep-${Date.now()}`,
            title: `Generated Report - ${new Date().toLocaleDateString()}`,
            type: 'Client Performance',
            clientName: 'Nexus Corp',
            dateRange: '2025-07-01 to 2025-07-31',
            generatedBy: 'Brand Head',
            generatedAt: new Date().toISOString()
        };
        setReports(prev => [report, ...prev]);
    };

    const handleViewReport = (report: Report) => {
        setViewingReport(report);
        setIsViewModalOpen(true);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#0000CC' }}>
                    Reports
                </h1>
                <button 
                    onClick={() => setIsGenerateModalOpen(true)} 
                    className="flex items-center px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-sm"
                    style={{ backgroundColor: '#0000CC' }}
                >
                    <Plus className="h-5 w-5 mr-2 -ml-1"/>
                    Generate New Report
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reports.map(report => (
                            <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{report.title}</p>
                                    <p className="text-sm text-gray-500">{report.dateRange}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        {reportTypeIcons[report.type]}
                                        <span className="ml-2">{report.type}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handleViewReport(report)} 
                                            className="p-2 text-gray-500 hover:rounded-full hover:bg-gray-100 transition-colors" 
                                            style={{ '--hover-color': '#0000CC' } as React.CSSProperties}
                                            title="View Report"
                                        >
                                            <Eye className="h-4 w-4"/>
                                        </button>
                                        <button 
                                            onClick={() => alert(`Downloading PDF for ${report.title}`)} 
                                            className="p-2 text-gray-500 hover:rounded-full hover:bg-gray-100 transition-colors"
                                            title="Download PDF"
                                        >
                                            <Download className="h-4 w-4"/>
                                        </button>
                                        <button 
                                            onClick={() => alert(`Sending report to Project Manager for ${report.title}`)} 
                                            className="p-2 text-gray-500 hover:rounded-full hover:bg-gray-100 transition-colors"
                                            title="Send to Project Manager"
                                        >
                                            <Briefcase className="h-4 w-4"/>
                                        </button>
                                        <button 
                                            onClick={() => alert(`Sending report to Client: ${report.clientName}`)} 
                                            className="p-2 text-gray-500 hover:rounded-full hover:bg-gray-100 transition-colors"
                                            title="Send to Client"
                                        >
                                            <Send className="h-4 w-4"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <GenerateReportModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onGenerate={handleAddReport}
            />
            
            <Transition appear show={isViewModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsViewModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                                    {viewingReport && <GeneratedReport report={viewingReport} onClose={() => setIsViewModalOpen(false)} />}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ReportsSection;
