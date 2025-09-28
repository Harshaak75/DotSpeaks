import React, { useState, Fragment } from 'react';
import { 
    Target,
    Calendar,
    ChevronDown,
    Send,
    CheckCircle,
    Loader,
    Flag,
    Users,
    X,
    Edit,
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

interface MonthlyObjective {
    id: string;
    title: string;
    description: string;
    from: 'COO';
    kpis: { metric: string; target: string }[];
    budget: number;
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
const ObjectiveDetailModal = ({ isOpen, onClose, objective }: any) => {
    if (!objective) return null;
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/50" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">Monthly Objective Details</Dialog.Title>
                            <p className="text-sm text-gray-500">From: {objective.from}</p>
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold text-gray-800">{objective.title}</h4>
                                <p className="mt-2 text-sm text-gray-600">{objective.description}</p>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-800">Key Performance Indicators (KPIs)</h4>
                                <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                                    {objective.kpis.map((kpi: any) => <li key={kpi.metric}><strong>{kpi.metric}:</strong> {kpi.target}</li>)}
                                </ul>
                            </div>
                             <div className="mt-4">
                                <h4 className="font-semibold text-gray-800 flex items-center"><DollarSign className="h-4 w-4 mr-2"/>Allocated Budget</h4>
                                <p className="text-lg font-bold text-green-600">${objective.budget.toLocaleString()}</p>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Close</button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
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
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Project Manager: Goal Planning</h1>

            <div className="bg-gray-200 p-4 rounded-lg mb-6 text-center">
                <p className="text-sm font-semibold text-gray-600">Context: Company Goal (Q3)</p>
                <p className="text-lg text-gray-800">{companyGoal.title}</p>
            </div>

            <button onClick={() => setIsObjectiveModalOpen(true)} className="w-full text-left bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 hover:border-blue-500 hover:shadow-md transition-all">
                <div className="flex items-start">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <Target className="h-6 w-6 text-blue-600"/>
                    </div>
                    <div>
                        <div className="flex items-center">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Monthly Objective (from COO)</h2>
                            <Info className="h-4 w-4 text-gray-400 ml-2"/>
                        </div>
                        <p className="text-xl font-bold text-gray-800 mt-1">{cooMonthlyObjective.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{cooMonthlyObjective.description}</p>
                    </div>
                </div>
            </button>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Weekly Task Breakdown</h2>
                        <p className="text-sm text-gray-500">Break down the monthly objective into weekly tasks for your Brand Heads.</p>
                    </div>
                    <div className={`px-3 py-1 text-sm font-semibold rounded-full ${planStatus === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {planStatus}
                    </div>
                </div>

                <div className="space-y-4">
                    {weeklyTasks.map(task => (
                        <div key={task.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-3 bg-gray-50 rounded-lg border">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500">{task.week}</label>
                                <textarea 
                                    defaultValue={task.task}
                                    rows={3}
                                    className="mt-1 w-full p-2 border-gray-300 rounded-md text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Assign to Brand Head</label>
                                <select 
                                    value={task.assignedBrandHead?.id || ''}
                                    onChange={(e) => handleAssignBrandHead(task.id, e.target.value)}
                                    className="mt-1 w-full p-2 border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">Select...</option>
                                    {brandHeads.map(bh => <option key={bh.id} value={bh.id}>{bh.name}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t flex justify-end">
                    <button 
                        onClick={handleSendPlan}
                        disabled={planStatus === 'Sent to Brand Head'}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
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
