import { useState, Fragment } from 'react';
import { 
    Target, 
    TrendingUp, 
    Plus, 
    Calendar,
    X,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// --- TYPE DEFINITIONS ---
type Health = 'On Track' | 'At Risk' | 'Off Track';
type Status = 'In Progress' | 'Completed' | 'Pending';

// --- MOCK DATA ---
const clients = [
    { id: 'client-1', name: 'Nexus Corp' },
    { id: 'client-2', name: 'Stellar Solutions' },
    { id: 'client-3', name: 'Quantum Leap' },
];

type GoalData = {
    mainObjective: string;
    timeline: string;
    keyResults: {
        id: string;
        title: string;
        target: number;
        current: number;
        health: Health;
    }[];
    initiatives: {
        id: string;
        title: string;
        team: string;
        status: Status;
        dueDate: string;
    }[];
};

const goalsData: { [key: string]: GoalData } = {
    'client-1': {
        mainObjective: 'Increase Brand Awareness by 20% in Q3',
        timeline: 'July 1, 2025 - Sep 30, 2025',
        keyResults: [
            { id: 'kr1', title: 'Website Traffic', target: 500000, current: 312000, health: 'On Track' },
            { id: 'kr2', title: 'Social Media Reach', target: 2000000, current: 1500000, health: 'On Track' },
            { id: 'kr3', title: 'Media Mentions', target: 50, current: 25, health: 'At Risk' },
        ],
        initiatives: [
            { id: 'init1', title: 'Launch "Future Forward" PR Campaign', team: 'Alpha Squad', status: 'In Progress', dueDate: '2025-08-15' },
            { id: 'init2', title: 'Run targeted ad campaign on LinkedIn', team: 'Alpha Squad', status: 'Completed', dueDate: '2025-07-30' },
            { id: 'init3', title: 'Collaborate with 5 industry influencers', team: 'Bravo Unit', status: 'Pending', dueDate: '2025-09-01' },
        ]
    },
    'client-2': {
        mainObjective: 'Generate 1,000 New Leads in July',
        timeline: 'July 1, 2025 - July 31, 2025',
        keyResults: [
            { id: 'kr4', title: 'Demo Signups', target: 500, current: 410, health: 'On Track' },
            { id: 'kr5', title: 'Ebook Downloads', target: 500, current: 250, health: 'Off Track' },
        ],
        initiatives: [
            { id: 'init4', title: 'Create "Ultimate Guide" Ebook', team: 'Bravo Unit', status: 'Completed', dueDate: '2025-07-10' },
            { id: 'init5', title: 'Host a webinar on industry trends', team: 'Bravo Unit', status: 'In Progress', dueDate: '2025-07-25' },
        ]
    }
};

const statusStyles = {
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
    'Pending': 'bg-gray-100 text-gray-800',
};

const healthStyles = {
    'On Track': { icon: <CheckCircle className="text-green-500"/>, text: 'text-green-600' },
    'At Risk': { icon: <AlertTriangle className="text-yellow-500"/>, text: 'text-yellow-600' },
    'Off Track': { icon: <X className="text-red-500"/>, text: 'text-red-600' },
};

// --- REUSABLE COMPONENTS ---
const RadialProgress = ({ progress, health }: any) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    const color = health === 'On Track' ? '#10B981' : health === 'At Risk' ? '#F59E0B' : '#EF4444';

    return (
        <div className="relative h-32 w-32">
            <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 120 120">
                <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
                <circle
                    style={{ stroke: color }}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">{Math.round(progress)}%</span>
        </div>
    );
};

type KeyResultCardProps = {
    title: string;
    target: number;
    current: number;
    health: Health;
};

const KeyResultCard = ({ title, target, current, health }: KeyResultCardProps) => {
    const progress = (current / target) * 100;
    const HealthIcon = healthStyles[health].icon;
    const healthTextColor = healthStyles[health].text;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow flex items-center space-x-6" style={{ borderLeftColor: '#0000CC' }}>
            <RadialProgress progress={progress} health={health} />
            <div>
                <h4 className="font-bold text-gray-800">{title}</h4>
                <p className="text-2xl font-bold text-gray-900 mt-1">{current.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Target: {target.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                    {HealthIcon}
                    <span className={`ml-1.5 text-sm font-semibold ${healthTextColor}`}>{health}</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const ClientGoalsSection = () => {
    const [selectedClient, setSelectedClient] = useState(clients[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const clientData = goalsData[selectedClient.id] || { mainObjective: 'No goals set.', timeline: '', keyResults: [], initiatives: [] };
    const overallProgress = clientData.keyResults.length > 0 
        ? clientData.keyResults.reduce((acc: number, kr: any) => acc + (kr.current / kr.target) * 100, 0) / clientData.keyResults.length
        : 0;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#0000CC' }}>
                    Client Targets & Goals
                </h1>
                <div className="flex items-center space-x-4">
                    <select 
                        value={selectedClient.id} 
                        onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value) || clients[0])}
                        className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                    >
                        {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="flex items-center px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-sm"
                        style={{ backgroundColor: '#0000CC' }}
                    >
                        <Plus className="h-5 w-5 mr-2 -ml-1"/>
                        Add Goal
                    </button>
                </div>
            </div>

            {/* Main Objective */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Objective</h2>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{clientData.mainObjective}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" style={{ color: '#0000CC' }}/>
                        <span>{clientData.timeline}</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                     <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Objective Health</h2>
                     <div className="flex items-center space-x-4">
                        <RadialProgress progress={overallProgress} health="On Track" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                            <p className="text-sm text-gray-500">Average of all key results.</p>
                        </div>
                     </div>
                </div>
            </div>

            {/* Key Results */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Key Results</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {clientData.keyResults.map((kr: any) => <KeyResultCard key={kr.id} {...kr} />)}
            </div>

            {/* Initiatives */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Supporting Initiatives</h3>
            <div className="bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initiative</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Team</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clientData.initiatives.map((init: { id: string; title: string; team: string; status: Status; dueDate: string; }) => (
                                <tr key={init.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{init.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{init.team}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(init.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[init.status]}`}>
                                            {init.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Add Goal Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border-2" style={{ borderColor: '#0000CC' }}>
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6" style={{ color: '#0000CC' }}>
                                        Add New Goal for {selectedClient.name}
                                    </Dialog.Title>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Main Objective</label>
                                            <input 
                                                placeholder="e.g., Increase Brand Awareness..." 
                                                className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                                                style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Key Result 1</label>
                                            <div className="flex items-center space-x-2">
                                                <input 
                                                    placeholder="Title (e.g., Website Traffic)" 
                                                    className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                                                    style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="Start" 
                                                    className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                                                    style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="Target" 
                                                    className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                                                    style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                                />
                                            </div>
                                        </div>
                                         <button className="text-sm font-semibold hover:opacity-80" style={{ color: '#0000CC' }}>
                                             + Add another key result
                                         </button>
                                    </div>
                                    <div className="mt-6 flex justify-end space-x-2">
                                        <button 
                                            onClick={() => setIsModalOpen(false)} 
                                            className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => setIsModalOpen(false)} 
                                            className="px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90"
                                            style={{ backgroundColor: '#0000CC' }}
                                        >
                                            Save Goal
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ClientGoalsSection;
