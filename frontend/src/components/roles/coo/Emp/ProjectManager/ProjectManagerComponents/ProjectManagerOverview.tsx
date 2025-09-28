import React, { useState, Fragment } from 'react';
import { 
    Briefcase,
    User,
    Users,
    ChevronDown,
    FileText,
    Paintbrush,
    Mic,
    CheckCircle,
    AlertTriangle,
    X,
    Gem,
    Zap,
    Rocket,
    Crown,
    Star,
    Shield,
    MessageSquare,
    Send
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// --- TYPE DEFINITIONS ---
type Role = 'Digital Marketer' | 'Graphics Designer' | 'Content Strategist';
type ClientHealth = 'On Track' | 'At Risk' | 'Needs Attention';
type ReportStatus = 'Pending Review' | 'Reviewed' | 'Action Required';

interface Member {
    name: string;
    role: Role;
    avatarUrl: string;
}

interface Team {
    name: string;
    members: Member[];
}

interface ReportComment {
    author: string;
    text: string;
    timestamp: string;
}

interface Report {
    title: string;
    summary: string;
    status: ReportStatus;
    discussion: ReportComment[];
}

interface Client {
    id: string;
    name: string;
    health: ClientHealth;
    team: Team;
    report: Report;
}

interface BrandHead {
    id: string;
    name: string;
    avatarUrl: string;
    clients: Client[];
}

interface Package {
    id: string;
    name: string;
    description: string;
    icon: JSX.Element;
    brandHeads: BrandHead[];
}

// --- MOCK DATA ---
const initialBrandHeadsData: BrandHead[] = [
    {
        id: 'bh-1', name: 'Anika Sharma', avatarUrl: 'https://placehold.co/100x100/f87171/ffffff?text=AS',
        clients: [
            { id: 'c-1', name: 'Nexus Corp', health: 'On Track', team: { name: 'Alpha Squad', members: [ { name: 'Rohan Sharma', role: 'Digital Marketer', avatarUrl: 'https://placehold.co/100x100/E9D5FF/7C3AED?text=RS' }, { name: 'Priya Patel', role: 'Graphics Designer', avatarUrl: 'https://placehold.co/100x100/FECACA/DC2626?text=PP' } ] }, report: { title: 'Nexus Corp - July Report', summary: 'Campaign is performing well, exceeding traffic goals by 15%.', status: 'Reviewed', discussion: [{author: 'Project Manager', text: 'Great work, team. Approved.', timestamp: '2 days ago'}] } },
            { id: 'c-2', name: 'Stellar Solutions', health: 'At Risk', team: { name: 'Bravo Unit', members: [ { name: 'Sneha Reddy', role: 'Digital Marketer', avatarUrl: 'https://placehold.co/100x100/E9D5FF/7C3AED?text=SR' }, { name: 'Vikram Kumar', role: 'Graphics Designer', avatarUrl: 'https://placehold.co/100x100/FECACA/DC2626?text=VK' } ] }, report: { title: 'Stellar Solutions - July Report', summary: 'Engagement is lower than projected. Awaiting client feedback on new creative assets.', status: 'Pending Review', discussion: [] } },
        ]
    },
    {
        id: 'bh-2', name: 'Rajesh Kumar', avatarUrl: 'https://placehold.co/100x100/60a5fa/ffffff?text=RK',
        clients: [
            { id: 'c-3', name: 'Quantum Leap', health: 'On Track', team: { name: 'Charlie Crew', members: [ { name: 'Deepak Joshi', role: 'Digital Marketer', avatarUrl: 'https://placehold.co/100x100/E9D5FF/7C3AED?text=DJ' }, { name: 'Meera Desai', role: 'Graphics Designer', avatarUrl: 'https://placehold.co/100x100/FECACA/DC2626?text=MD' } ] }, report: { title: 'Quantum Leap - July Report', summary: 'Product launch campaign was a success, achieving all major KPIs.', status: 'Reviewed', discussion: [{author: 'Project Manager', text: 'Excellent results.', timestamp: '5 days ago'}] } },
        ]
    },
    { id: 'bh-3', name: 'Priya Singh', avatarUrl: 'https://placehold.co/100x100/facc15/ffffff?text=PS', clients: [] },
];

const packagesData: Package[] = [
    { id: 'pkg-1', name: 'SPARK', description: 'Foundation-level brand support', icon: <Shield className="h-6 w-6"/>, brandHeads: [initialBrandHeadsData[0]] },
    { id: 'pkg-2', name: 'RISE', description: 'For expanding businesses', icon: <Rocket className="h-6 w-6"/>, brandHeads: [initialBrandHeadsData[1]] },
    { id: 'pkg-3', name: 'SCALE', description: 'Comprehensive market domination', icon: <Crown className="h-6 w-6"/>, brandHeads: [initialBrandHeadsData[2]] },
    { id: 'pkg-4', name: 'LEAD', description: 'Fast-paced market entry', icon: <Zap className="h-6 w-6"/>, brandHeads: [] },
    { id: 'pkg-5', name: 'SIGNATURE', description: 'Top-tier strategic partnership', icon: <Gem className="h-6 w-6"/>, brandHeads: [] },
    { id: 'pkg-6', name: 'TAILORED', description: 'Bespoke solutions for unique needs', icon: <Star className="h-6 w-6"/>, brandHeads: [] },
];

const reportStatusStyles: Record<ReportStatus, string> = {
    'Pending Review': 'bg-yellow-100 text-yellow-800',
    'Reviewed': 'bg-green-100 text-green-800',
    'Action Required': 'bg-red-100 text-red-800',
};

// --- REPORT VIEW MODAL ---
const ReportViewModal = ({ isOpen, onClose, client, onUpdateReport }: any) => {
    const [newComment, setNewComment] = useState('');

    if (!client) return null;

    const handlePostComment = () => {
        if (!newComment.trim()) return;
        const updatedReport = {
            ...client.report,
            discussion: [
                ...client.report.discussion,
                { author: 'Project Manager', text: newComment, timestamp: 'Just now' }
            ]
        };
        onUpdateReport(client.id, updatedReport);
        setNewComment('');
    };
    
    const handleUpdateStatus = (status: ReportStatus) => {
        const updatedReport = { ...client.report, status };
        onUpdateReport(client.id, updatedReport);
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                <div className="p-6">
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">{client.report.title}</Dialog.Title>
                                    <p className="text-sm text-gray-500">For Client: {client.name}</p>
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="font-semibold text-gray-800">Executive Summary from Brand Head</h4>
                                        <p className="mt-2 text-sm text-gray-600 italic">"{client.report.summary}"</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 border-t">
                                    <h4 className="font-semibold text-gray-800 flex items-center mb-4"><MessageSquare className="h-5 w-5 mr-2"/>Discussion & Actions</h4>
                                    <div className="space-y-4 max-h-48 overflow-y-auto">
                                        {client.report.discussion.map((comment: any, index: any) => (
                                            <div key={index} className="text-sm">
                                                <p className="font-semibold text-gray-700">{comment.author} <span className="text-xs text-gray-400 font-normal ml-2">{comment.timestamp}</span></p>
                                                <p className="text-gray-600">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-center space-x-2">
                                        <input 
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add your comment..."
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        />
                                        <button onClick={handlePostComment} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Send className="h-5 w-5"/></button>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-100 border-t flex justify-end space-x-2">
                                    <button onClick={() => handleUpdateStatus('Action Required')} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600">Request Follow-up</button>
                                    <button onClick={() => handleUpdateStatus('Reviewed')} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Mark as Reviewed & Closed</button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

// --- MAIN COMPONENT ---
const ProjectManagerOverview = () => {
    const [brandHeads, setBrandHeads] = useState<BrandHead[]>(initialBrandHeadsData);
    const [activePackage, setActivePackage] = useState<Package>(packagesData[0]);
    const [openBrandHead, setOpenBrandHead] = useState<string | null>(null);
    const [openClient, setOpenClient] = useState<string | null>(null);
    const [viewingClient, setViewingClient] = useState<Client | null>(null);

    const handlePackageSelect = (pkg: Package) => {
        setActivePackage(pkg);
        setOpenBrandHead(null);
        setOpenClient(null);
    };

    const toggleBrandHead = (id: string) => {
        setOpenBrandHead(prev => (prev === id ? null : id));
        setOpenClient(null);
    };

    const toggleClient = (id: string) => {
        setOpenClient(prev => (prev === id ? null : id));
    };

    const handleUpdateReport = (clientId: string, updatedReport: Report) => {
        setBrandHeads(prevBrandHeads => {
            return prevBrandHeads.map(bh => ({
                ...bh,
                clients: bh.clients.map(c => c.id === clientId ? { ...c, report: updatedReport } : c)
            }));
        });
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Project Manager Overview</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {packagesData.map(pkg => (
                    <button 
                        key={pkg.id} 
                        onClick={() => handlePackageSelect(pkg)}
                        className={`p-4 rounded-lg text-left transition-all duration-300 ${activePackage.id === pkg.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white hover:bg-gray-100 shadow-sm border'}`}
                    >
                        <div className={`p-2 rounded-full w-min mb-2 ${activePackage.id === pkg.id ? 'bg-white/20 text-[#D70707]' : 'bg-gray-100 text-gray-600'}`}>
                            {pkg.icon}
                        </div>
                        <p className="my-2">{pkg.name}</p>
                        <p className={`text-xs ${activePackage.id === pkg.id ? 'text-blue-200' : 'text-gray-500'}`}>{pkg.description}</p>
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Brand Heads in "{activePackage.name}" Package</h2>
                {activePackage.brandHeads.length > 0 ? activePackage.brandHeads.map(bh => (
                    <div key={bh.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <button onClick={() => toggleBrandHead(bh.id)} className="w-full flex items-center justify-between p-4 text-left">
                            <div className="flex items-center">
                                <img src={bh.avatarUrl} alt={bh.name} className="h-12 w-12 rounded-full"/>
                                <div className="ml-4">
                                    <p className="font-bold text-lg text-gray-900">{bh.name}</p>
                                    <p className="text-sm text-gray-500">Brand Head</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">{bh.clients.length} Clients</span>
                                <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform ${openBrandHead === bh.id ? 'rotate-180' : ''}`} />
                            </div>
                        </button>

                        {openBrandHead === bh.id && (
                            <div className="px-4 pb-4">
                                <div className="border-t pt-4 space-y-2">
                                    {bh.clients.map(client => (
                                        <div key={client.id} className="bg-gray-50 rounded-lg">
                                            <button onClick={() => toggleClient(client.id)} className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 rounded-lg">
                                                <div className="flex items-center">
                                                    <Briefcase className="h-5 w-5 text-gray-500 mr-3"/>
                                                    <p className="font-semibold text-gray-800">{client.name}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${reportStatusStyles[client.report.status]}`}>{client.report.status}</span>
                                                    <ChevronDown className={`h-5 w-5 text-gray-400 ml-3 transition-transform ${openClient === client.id ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>

                                            {openClient === client.id && (
                                                <div className="p-4 border-t">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Assigned Team: {client.team.name}</h4>
                                                            <div className="space-y-2">
                                                                {client.team.members.map(member => (
                                                                    <div key={member.name} className="flex items-center text-sm">
                                                                        <img src={member.avatarUrl} alt={member.name} className="h-6 w-6 rounded-full mr-2"/>
                                                                        <span className="font-medium text-gray-800">{member.name}</span>
                                                                        <span className="text-gray-500 ml-auto">{member.role}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg">
                                                            <button onClick={() => setViewingClient(client)} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                                                <FileText className="h-5 w-5 mr-2"/>
                                                                Review Report
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <p className="text-gray-500">No Brand Heads assigned to this package yet.</p>
                    </div>
                )}
            </div>

            <ReportViewModal 
                isOpen={!!viewingClient}
                onClose={() => setViewingClient(null)}
                client={viewingClient}
                onUpdateReport={handleUpdateReport}
            />
        </div>
    );
};

export default ProjectManagerOverview;
