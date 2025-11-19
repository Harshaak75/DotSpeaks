import { useState, Fragment } from 'react';
import { 
    Briefcase,
    ChevronDown,
    FileText,
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

interface ReportViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onUpdateReport: (clientId: string, updatedReport: Report) => void;
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
    'Pending Review': 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400',
    'Reviewed': 'bg-green-100 text-green-800 border-2 border-green-400',
    'Action Required': 'bg-red-100 text-red-800 border-2 border-red-400',
};

// --- REPORT VIEW MODAL ---
const ReportViewModal = ({ isOpen, onClose, client, onUpdateReport }: ReportViewModalProps) => {
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
                <Transition.Child 
                    as={Fragment} 
                    enter="ease-out duration-300" 
                    enterFrom="opacity-0" 
                    enterTo="opacity-100" 
                    leave="ease-in duration-200" 
                    leaveFrom="opacity-100" 
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child 
                            as={Fragment} 
                            enter="ease-out duration-300" 
                            enterFrom="opacity-0 scale-95" 
                            enterTo="opacity-100 scale-100" 
                            leave="ease-in duration-200" 
                            leaveFrom="opacity-100 scale-100" 
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel 
                                className="w-full max-w-2xl transform overflow-hidden rounded-2xl shadow-xl transition-all"
                                style={{ backgroundColor: '#0000CC' }}
                            >
                                {/* Modal Header */}
                                <div className="p-6">
                                    <Dialog.Title 
                                        as="h3" 
                                        className="text-2xl text-white"
                                        style={{ 
                                            fontFamily: 'Inter, sans-serif',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {client.report.title}
                                    </Dialog.Title>
                                    <p 
                                        className="text-sm text-white mt-1"
                                        style={{ 
                                            fontFamily: 'Roboto, sans-serif',
                                            opacity: 0.9
                                        }}
                                    >
                                        For Client: {client.name}
                                    </p>
                                </div>
                                
                                {/* Modal Content */}
                                <div className="bg-white rounded-b-2xl">
                                    <div className="p-6 border-t">
                                        <h4 
                                            className="text-base flex items-center"
                                            style={{ 
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold',
                                                color: '#0000CC'
                                            }}
                                        >
                                            <FileText className="h-5 w-5 mr-2" style={{ color: '#0000CC' }} />
                                            Executive Summary from Brand Head
                                        </h4>
                                        <p 
                                            className="mt-3 text-sm text-gray-600 italic p-4 rounded-lg"
                                            style={{ 
                                                fontFamily: 'Roboto, sans-serif',
                                                backgroundColor: '#F0F4FF'
                                            }}
                                        >
                                            "{client.report.summary}"
                                        </p>
                                    </div>
                                    <div 
                                        className="p-6 border-t"
                                        style={{ backgroundColor: '#F9FAFB' }}
                                    >
                                        <h4 
                                            className="flex items-center mb-4"
                                            style={{ 
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold',
                                                color: '#0000CC'
                                            }}
                                        >
                                            <MessageSquare 
                                                className="h-5 w-5 mr-2"
                                                style={{ color: '#0000CC' }}
                                            />
                                            Discussion & Actions
                                        </h4>
                                        <div className="space-y-4 max-h-48 overflow-y-auto mb-4">
                                            {client.report.discussion.map((comment: ReportComment, index: number) => (
                                                <div 
                                                    key={index} 
                                                    className="text-sm p-3 rounded-lg bg-white"
                                                    style={{ fontFamily: 'Roboto, sans-serif' }}
                                                >
                                                    <p 
                                                        className="text-gray-700"
                                                        style={{ 
                                                            fontFamily: 'Inter, sans-serif',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {comment.author} 
                                                        <span 
                                                            className="text-xs text-gray-400 font-normal ml-2"
                                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                                        >
                                                            {comment.timestamp}
                                                        </span>
                                                    </p>
                                                    <p className="text-gray-600 mt-1">{comment.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add your comment..."
                                                className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                                                style={{ 
                                                    fontFamily: 'Roboto, sans-serif',
                                                    borderColor: '#E6E6FF',
                                                    '--tw-ring-color': '#0000CC'
                                                } as React.CSSProperties}
                                            />
                                            <button 
                                                onClick={handlePostComment} 
                                                className="p-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                                                style={{ backgroundColor: '#0000CC' }}
                                            >
                                                <Send className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </div>
                                    <div 
                                        className="p-6 border-t flex justify-end space-x-3"
                                        style={{ backgroundColor: '#F3F4F6' }}
                                    >
                                        <button 
                                            onClick={() => handleUpdateStatus('Action Required')} 
                                            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow-md transition-all"
                                            style={{ 
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Request Follow-up
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus('Reviewed')} 
                                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-all"
                                            style={{ 
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Mark as Reviewed
                                        </button>
                                    </div>
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
    const [, setBrandHeads] = useState<BrandHead[]>(initialBrandHeadsData);
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
        <div 
            className="p-8 min-h-screen"
            style={{ backgroundColor: '#FEF9F5' }}
        >
            {/* Header */}
            <div 
                className="mb-8 pb-4 border-b-4"
                style={{ borderColor: '#0000CC' }}
            >
                <h1 
                    className="text-4xl"
                    style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#0000CC'
                    }}
                >
                    Project Manager Overview
                </h1>
                <p 
                    className="text-sm mt-2 text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                    Monitor brand heads, clients, and campaign reports across all packages
                </p>
            </div>
            
            {/* Package Selection Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {packagesData.map(pkg => (
                    <button 
                        key={pkg.id} 
                        onClick={() => handlePackageSelect(pkg)}
                        className={`p-5 rounded-xl text-left transition-all duration-300 shadow-lg border-2 ${
                            activePackage.id === pkg.id 
                                ? 'text-white scale-105' 
                                : 'bg-white hover:shadow-xl hover:scale-102'
                        }`}
                        style={
                            activePackage.id === pkg.id 
                                ? { backgroundColor: '#0000CC', borderColor: '#0000CC' } 
                                : { borderColor: '#E6E6FF' }
                        }
                    >
                        <div 
                            className={`p-3 rounded-xl w-min mb-3 ${
                                activePackage.id === pkg.id 
                                    ? 'bg-white/20 text-white' 
                                    : ''
                            }`}
                            style={
                                activePackage.id !== pkg.id 
                                    ? { backgroundColor: '#E6E6FF', color: '#0000CC' } 
                                    : {}
                            }
                        >
                            {pkg.icon}
                        </div>
                        <p 
                            className="my-2 text-sm"
                            style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 'bold'
                            }}
                        >
                            {pkg.name}
                        </p>
                        <p 
                            className={`text-xs ${
                                activePackage.id === pkg.id 
                                    ? 'text-white' 
                                    : 'text-gray-500'
                            }`}
                            style={{ 
                                fontFamily: 'Roboto, sans-serif',
                                opacity: activePackage.id === pkg.id ? 0.9 : 1
                            }}
                        >
                            {pkg.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Brand Heads Section */}
            <div className="space-y-4">
                <h2 
                    className="text-2xl"
                    style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#0000CC'
                    }}
                >
                    Brand Heads in "{activePackage.name}" Package
                </h2>
                {activePackage.brandHeads.length > 0 ? activePackage.brandHeads.map(bh => (
                    <div 
                        key={bh.id} 
                        className="bg-white rounded-xl shadow-xl border-2"
                        style={{ borderColor: '#E6E6FF' }}
                    >
                        <button 
                            onClick={() => toggleBrandHead(bh.id)} 
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors rounded-t-xl"
                        >
                            <div className="flex items-center">
                                <img 
                                    src={bh.avatarUrl} 
                                    alt={bh.name} 
                                    className="h-14 w-14 rounded-full border-2"
                                    style={{ borderColor: '#0000CC' }}
                                />
                                <div className="ml-4">
                                    <p 
                                        className="text-xl"
                                        style={{ 
                                            fontFamily: 'Inter, sans-serif',
                                            fontWeight: 'bold',
                                            color: '#0000CC'
                                        }}
                                    >
                                        {bh.name}
                                    </p>
                                    <p 
                                        className="text-sm text-gray-500"
                                        style={{ fontFamily: 'Roboto, sans-serif' }}
                                    >
                                        Brand Head
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span 
                                    className="text-sm px-3 py-1 rounded-lg"
                                    style={{ 
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 'bold',
                                        backgroundColor: '#E6E6FF',
                                        color: '#0000CC'
                                    }}
                                >
                                    {bh.clients.length} Clients
                                </span>
                                <ChevronDown 
                                    className={`h-6 w-6 ml-3 transition-transform ${
                                        openBrandHead === bh.id ? 'rotate-180' : ''
                                    }`}
                                    style={{ color: '#0000CC' }}
                                />
                            </div>
                        </button>

                        {openBrandHead === bh.id && (
                            <div className="px-6 pb-6">
                                <div className="border-t-2 pt-4 space-y-3" style={{ borderColor: '#E6E6FF' }}>
                                    {bh.clients.map(client => (
                                        <div 
                                            key={client.id} 
                                            className="rounded-xl border-2"
                                            style={{ 
                                                backgroundColor: '#F9FAFB',
                                                borderColor: '#E6E6FF'
                                            }}
                                        >
                                            <button 
                                                onClick={() => toggleClient(client.id)} 
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 rounded-xl transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    <Briefcase 
                                                        className="h-6 w-6 mr-3"
                                                        style={{ color: '#0000CC' }}
                                                    />
                                                    <p 
                                                        className="font-semibold text-lg"
                                                        style={{ 
                                                            fontFamily: 'Inter, sans-serif',
                                                            color: '#333'
                                                        }}
                                                    >
                                                        {client.name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    <span 
                                                        className={`px-3 py-1 text-xs rounded-lg ${reportStatusStyles[client.report.status]}`}
                                                        style={{ 
                                                            fontFamily: 'Inter, sans-serif',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {client.report.status}
                                                    </span>
                                                    <ChevronDown 
                                                        className={`h-5 w-5 ml-3 transition-transform ${
                                                            openClient === client.id ? 'rotate-180' : ''
                                                        }`}
                                                        style={{ color: '#0000CC' }}
                                                    />
                                                </div>
                                            </button>

                                            {openClient === client.id && (
                                                <div className="p-6 border-t-2" style={{ borderColor: '#E6E6FF' }}>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 
                                                                className="text-sm mb-3"
                                                                style={{ 
                                                                    fontFamily: 'Inter, sans-serif',
                                                                    fontWeight: 'bold',
                                                                    color: '#0000CC'
                                                                }}
                                                            >
                                                                Assigned Team: {client.team.name}
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {client.team.members.map(member => (
                                                                    <div 
                                                                        key={member.name} 
                                                                        className="flex items-center text-sm p-2 rounded-lg bg-white"
                                                                        style={{ fontFamily: 'Roboto, sans-serif' }}
                                                                    >
                                                                        <img 
                                                                            src={member.avatarUrl} 
                                                                            alt={member.name} 
                                                                            className="h-8 w-8 rounded-full mr-3"
                                                                        />
                                                                        <span 
                                                                            className="font-medium flex-1"
                                                                            style={{ color: '#333' }}
                                                                        >
                                                                            {member.name}
                                                                        </span>
                                                                        <span className="text-gray-500 text-xs">
                                                                            {member.role}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-center bg-white p-6 rounded-xl border-2" style={{ borderColor: '#E6E6FF' }}>
                                                            <button 
                                                                onClick={() => setViewingClient(client)} 
                                                                className="flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all shadow-lg"
                                                                style={{ 
                                                                    backgroundColor: '#0000CC',
                                                                    fontFamily: 'Inter, sans-serif',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
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
                    <div className="text-center py-16 bg-white rounded-xl border-2 shadow-sm" style={{ borderColor: '#E6E6FF' }}>
                        <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#E6E6FF' }}>
                            <Briefcase className="h-12 w-12" style={{ color: '#0000CC' }} />
                        </div>
                        <p 
                            className="text-gray-500 text-lg"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                            No Brand Heads assigned to this package yet.
                        </p>
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
