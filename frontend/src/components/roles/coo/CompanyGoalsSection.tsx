import React, { useState, Fragment } from 'react';
import { Target, Flag, X, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// --- TYPE DEFINITIONS ---
interface KeyPerformanceIndicator {
    id: string;
    metric: string;
    target: string;
    currentProgress: number;
}

interface QuarterlyGoal {
    id: string;
    title: string;
    description: string;
    owner: string; // e.g., 'CEO'
    kpis: KeyPerformanceIndicator[];
}

// --- MOCK DATA ---
const companyQuarterlyGoals: QuarterlyGoal[] = [
    { 
        id: 'qg-1', 
        title: 'Increase Enterprise Market Share by 5% in Q3', 
        description: 'Focus on acquiring new large-scale clients and expanding existing enterprise accounts.', 
        owner: 'CEO',
        kpis: [
            { id: 'kpi-1', metric: 'New Enterprise Clients', target: '30', currentProgress: 60 },
            { id: 'kpi-2', metric: 'Enterprise Revenue Growth', target: '15%', currentProgress: 45 },
            { id: 'kpi-3', metric: 'Client Retention Rate', target: '95%', currentProgress: 80 },
        ]
    },
    { 
        id: 'qg-2', 
        title: 'Launch "Project Phoenix" Successfully', 
        description: 'Ensure a smooth product launch with a target of 10,000 new user sign-ups in the first month.', 
        owner: 'CEO',
        kpis: [
            { id: 'kpi-4', metric: 'New User Sign-ups', target: '10,000', currentProgress: 70 },
            { id: 'kpi-5', metric: 'Media Mentions', target: '50', currentProgress: 50 },
            { id: 'kpi-6', metric: 'App Store Rating', target: '4.8 Stars', currentProgress: 90 },
        ]
    },
];

// --- GOAL DETAIL MODAL ---
const GoalDetailModal = ({ isOpen, onClose, goal }: any) => {
    if (!goal) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 flex justify-between items-start">
                                    {goal.title}
                                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="h-5 w-5"/></button>
                                </Dialog.Title>
                                <p className="text-sm text-gray-500 mt-1">Owner: {goal.owner}</p>
                                <p className="mt-4 text-gray-600">{goal.description}</p>
                                
                                <div className="mt-6 border-t pt-4">
                                    <h4 className="font-semibold text-gray-800">Key Performance Indicators (KPIs)</h4>
                                    <div className="mt-3 space-y-3">
                                        {goal.kpis.map((kpi: any) => (
                                            <div key={kpi.id}>
                                                <div className="flex justify-between items-center text-sm font-medium">
                                                    <p className="text-gray-700">{kpi.metric}</p>
                                                    <p className="text-gray-500">Target: <span className="font-bold text-gray-800">{kpi.target}</span></p>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${kpi.currentProgress}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Close</button>
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
const CompanyGoalsSection: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<QuarterlyGoal | null>(null);

    const handleViewGoal = (goal: QuarterlyGoal) => {
        setSelectedGoal(goal);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Company Goals (Q3 2025)</h1>
                <p className="text-sm text-gray-500">Read-only view of CEO directives</p>
            </div>

            {/* Quarterly Goals from CEO */}
            <div className="space-y-4">
                {companyQuarterlyGoals.map(goal => (
                    <button 
                        key={goal.id} 
                        onClick={() => handleViewGoal(goal)}
                        className="w-full text-left bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start">
                            <div className="p-3 bg-blue-100 rounded-full mr-4">
                                <Flag className="h-6 w-6 text-blue-600"/>
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-gray-800">{goal.title}</h2>
                                <p className="text-sm text-gray-600">{goal.description}</p>
                                <p className="text-xs text-gray-400 mt-1">Owner: {goal.owner}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <GoalDetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                goal={selectedGoal}
            />
        </div>
    );
};

export default CompanyGoalsSection;
