import { useState, Fragment } from 'react';
import { 
    Target,
    Send,
    Info,
    DollarSign
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// --- TYPE DEFINITIONS ---
type WeeklyTaskStatus = 'Draft' | 'Sent to Brand Head';

interface BrandHead {
    id: string;
    name: string;
}

interface WeeklyTask {
    id: string;
    week: string;
    task: string;
    assignedBrandHead: BrandHead | null;
}

interface KPI {
    metric: string;
    target: string;
}

interface MonthlyObjective {
    id: string;
    title: string;
    description: string;
    from: 'COO';
    kpis: KPI[];
    budget: number;
}

interface ObjectiveDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    objective: MonthlyObjective;
}

// --- MOCK DATA ---
const companyGoal = {
    title: 'Increase Enterprise Market Share by 5% in Q3',
    owner: 'CEO'
};

const cooMonthlyObjective: MonthlyObjective = {
    id: 'mo-2',
    title: 'Launch the "Enterprise Suite" marketing campaign.',
    description: 'Focus on digital channels to generate 2M impressions and 500 new leads in August.',
    from: 'COO',
    kpis: [
        { metric: 'Social Media Impressions', target: '2,000,000' },
        { metric: 'New Qualified Leads', target: '500' },
        { metric: 'Website Conversion Rate', target: '5.0%' },
    ],
    budget: 50000,
};

const brandHeads: BrandHead[] = [
    { id: 'bh-1', name: 'Anika Sharma' },
    { id: 'bh-2', name: 'Rajesh Kumar' },
];

const initialWeeklyTasks: WeeklyTask[] = [
    { id: 'wt-1', week: 'Week 1 (Aug 1-7)', task: 'Finalize campaign creative concepts and ad copy for all platforms. Coordinate with the design team to ensure assets align with the "Enterprise Suite" branding.', assignedBrandHead: brandHeads[0] },
    { id: 'wt-2', week: 'Week 2 (Aug 8-14)', task: 'Launch initial wave of social media posts and begin influencer outreach. Monitor initial engagement metrics.', assignedBrandHead: brandHeads[0] },
    { id: 'wt-3', week: 'Week 3 (Aug 15-21)', task: 'Deploy targeted ad campaign on LinkedIn & Twitter. A/B test ad copy for performance.', assignedBrandHead: brandHeads[1] },
    { id: 'wt-4', week: 'Week 4 (Aug 22-31)', task: 'Analyze initial campaign data from all channels. Prepare a mid-campaign report and provide recommendations for spend optimization.', assignedBrandHead: brandHeads[1] },
];

// --- MODAL TO VIEW COO OBJECTIVE DETAILS ---
const ObjectiveDetailModal = ({ isOpen, onClose, objective }: ObjectiveDetailModalProps) => {
    if (!objective) return null;
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
                                        Monthly Objective Details
                                    </Dialog.Title>
                                    <p 
                                        className="text-sm text-white mt-1"
                                        style={{ 
                                            fontFamily: 'Roboto, sans-serif',
                                            opacity: 0.9
                                        }}
                                    >
                                        From: {objective.from}
                                    </p>
                                </div>
                                
                                {/* Modal Content */}
                                <div className="bg-white p-6 rounded-b-2xl">
                                    <div className="border-t pt-4">
                                        <h4 
                                            className="text-xl"
                                            style={{ 
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold',
                                                color: '#0000CC'
                                            }}
                                        >
                                            {objective.title}
                                        </h4>
                                        <p 
                                            className="mt-2 text-sm text-gray-600"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            {objective.description}
                                        </p>
                                    </div>
                                    
                                    <div 
                                        className="mt-4 p-4 rounded-xl"
                                        style={{ backgroundColor: '#F0F4FF' }}
                                    >
                                        <h4 
                                            className="text-base flex items-center"
                                            style={{ 
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold',
                                                color: '#0000CC'
                                            }}
                                        >
                                            <Target className="h-5 w-5 mr-2" style={{ color: '#0000CC' }} />
                                            Key Performance Indicators (KPIs)
                                        </h4>
                                        <ul 
                                            className="mt-3 space-y-2 text-sm"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            {objective.kpis.map((kpi: KPI) => (
                                                <li 
                                                    key={kpi.metric}
                                                    className="flex items-start"
                                                >
                                                    <span className="inline-block w-2 h-2 rounded-full mr-3 mt-1.5" style={{ backgroundColor: '#0000CC' }}></span>
                                                    <span>
                                                        <strong style={{ color: '#0000CC' }}>{kpi.metric}:</strong> {kpi.target}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div 
                                        className="mt-4 p-4 rounded-xl border-2"
                                        style={{ 
                                            backgroundColor: '#F0FDF4',
                                            borderColor: '#BBF7D0'
                                        }}
                                    >
                                        <h4 
                                            className="flex items-center text-base"
                                            style={{ 
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold',
                                                color: '#15803D'
                                            }}
                                        >
                                            <DollarSign className="h-5 w-5 mr-2" style={{ color: '#15803D' }} />
                                            Allocated Budget
                                        </h4>
                                        <p 
                                            className="text-2xl mt-2"
                                            style={{ 
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold',
                                                color: '#15803D'
                                            }}
                                        >
                                            ${objective.budget.toLocaleString()}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end">
                                        <button 
                                            onClick={onClose} 
                                            className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                                            style={{ 
                                                backgroundColor: '#0000CC',
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Close
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
const ProjectManagerGoals = () => {
    const [weeklyTasks, setWeeklyTasks] = useState(initialWeeklyTasks);
    const [planStatus, setPlanStatus] = useState<WeeklyTaskStatus>('Draft');
    const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);

    const handleAssignBrandHead = (taskId: string, brandHeadId: string) => {
        const brandHead = brandHeads.find(bh => bh.id === brandHeadId);
        setWeeklyTasks(prevTasks =>
            prevTasks.map(task => task.id === taskId ? { ...task, assignedBrandHead: brandHead || null } : task)
        );
    };

    const handleSendPlan = () => {
        alert("Weekly plan has been sent to all assigned Brand Heads.");
        setPlanStatus('Sent to Brand Head');
    };

    return (
        <div 
            className="p-8 min-h-screen"
            style={{ backgroundColor: '#FEF9F5' }}
        >
            {/* Header with blue accent */}
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
                    Project Manager: Goal Planning
                </h1>
                <p 
                    className="text-sm mt-2 text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                    Manage and assign weekly tasks to achieve monthly objectives
                </p>
            </div>

            {/* Company Goal Banner with stronger blue */}
            <div 
                className="p-6 rounded-xl mb-6 text-center shadow-lg border-2"
                style={{ 
                    backgroundColor: '#E6E6FF',
                    borderColor: '#0000CC'
                }}
            >
                <div className="flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 mr-2" style={{ color: '#0000CC' }} />
                    <p 
                        className="text-sm uppercase tracking-wider"
                        style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#0000CC'
                        }}
                    >
                        Company Goal (Q3)
                    </p>
                </div>
                <p 
                    className="text-xl"
                    style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#1e1e1e'
                    }}
                >
                    {companyGoal.title}
                </p>
            </div>

            {/* Monthly Objective Card with blue theme */}
            <button 
                onClick={() => setIsObjectiveModalOpen(true)} 
                className="w-full text-left bg-white p-6 rounded-2xl shadow-xl border-2 mb-8 hover:shadow-2xl transition-all"
                style={{ borderColor: '#0000CC' }}
            >
                <div className="flex items-start">
                    <div 
                        className="p-4 rounded-xl mr-4 shadow-sm"
                        style={{ backgroundColor: '#0000CC' }}
                    >
                        <Target className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center">
                            <h2 
                                className="text-xs uppercase tracking-wider"
                                style={{ 
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 'bold',
                                    color: '#0000CC'
                                }}
                            >
                                Your Monthly Objective (from COO)
                            </h2>
                            <Info className="h-4 w-4 ml-2" style={{ color: '#0000CC' }} />
                        </div>
                        <p 
                            className="text-2xl mt-2"
                            style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 'bold',
                                color: '#0000CC'
                            }}
                        >
                            {cooMonthlyObjective.title}
                        </p>
                        <p 
                            className="text-sm mt-2 text-gray-600"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                            {cooMonthlyObjective.description}
                        </p>
                        <p 
                            className="text-xs mt-3 text-gray-400"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                            Click to view full details and KPIs
                        </p>
                    </div>
                </div>
            </button>

            {/* Weekly Tasks Section with blue accents */}
            <div 
                className="bg-white p-8 rounded-2xl shadow-xl border-t-4"
                style={{ borderColor: '#0000CC' }}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 
                            className="text-3xl"
                            style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 'bold',
                                color: '#0000CC'
                            }}
                        >
                            Weekly Task Breakdown
                        </h2>
                        <p 
                            className="text-sm text-gray-500 mt-1"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                            Break down the monthly objective into weekly tasks for your Brand Heads.
                        </p>
                    </div>
                    <div 
                        className={`px-4 py-2 text-sm rounded-lg shadow-sm ${
                            planStatus === 'Draft' 
                                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' 
                                : 'bg-green-100 text-green-800 border-2 border-green-400'
                        }`}
                        style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold'
                        }}
                    >
                        {planStatus}
                    </div>
                </div>

                <div className="space-y-4">
                    {weeklyTasks.map(task => (
                        <div 
                            key={task.id} 
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow"
                            style={{ 
                                backgroundColor: '#F9FAFB',
                                borderColor: '#E6E6FF'
                            }}
                        >
                            <div className="md:col-span-2">
                                <label 
                                    className="block text-sm mb-2"
                                    style={{ 
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 'bold',
                                        color: '#0000CC'
                                    }}
                                >
                                    {task.week}
                                </label>
                                <textarea 
                                    defaultValue={task.task}
                                    rows={3}
                                    className="w-full p-3 border-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent"
                                    style={{ 
                                        fontFamily: 'Roboto, sans-serif',
                                        borderColor: '#E6E6FF',
                                        '--tw-ring-color': '#0000CC'
                                    } as React.CSSProperties}
                                />
                            </div>
                            <div>
                                <label 
                                    className="block text-sm mb-2"
                                    style={{ 
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 'bold',
                                        color: '#0000CC'
                                    }}
                                >
                                    Assign to Brand Head
                                </label>
                                <select 
                                    value={task.assignedBrandHead?.id || ''}
                                    onChange={(e) => handleAssignBrandHead(task.id, e.target.value)}
                                    className="w-full p-3 border-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent"
                                    style={{ 
                                        fontFamily: 'Roboto, sans-serif',
                                        borderColor: '#E6E6FF',
                                        '--tw-ring-color': '#0000CC'
                                    } as React.CSSProperties}
                                >
                                    <option value="">Select Brand Head...</option>
                                    {brandHeads.map(bh => (
                                        <option key={bh.id} value={bh.id}>{bh.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t-2 flex justify-end" style={{ borderColor: '#E6E6FF' }}>
                    <button 
                        onClick={handleSendPlan}
                        disabled={planStatus === 'Sent to Brand Head'}
                        className="flex items-center px-8 py-4 text-white rounded-xl hover:opacity-90 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        style={{ 
                            backgroundColor: '#0000CC',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold'
                        }}
                    >
                        <Send className="h-5 w-5 mr-2"/>
                        Send Plan to Brand Heads
                    </button>
                </div>
            </div>

            <ObjectiveDetailModal 
                isOpen={isObjectiveModalOpen}
                onClose={() => setIsObjectiveModalOpen(false)}
                objective={cooMonthlyObjective}
            />
        </div>
    );
};

export default ProjectManagerGoals;
