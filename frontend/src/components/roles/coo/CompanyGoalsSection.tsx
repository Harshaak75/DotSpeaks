import React, { useState, Fragment } from 'react';
import { Flag, X } from 'lucide-react';
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
    owner: string;
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title 
                                    as="h3" 
                                    className="text-xl leading-6 flex justify-between items-start"
                                    style={{ 
                                        fontFamily: 'Inter, sans-serif', 
                                        fontWeight: 'bold',
                                        color: '#0000CC'
                                    }}
                                >
                                    {goal.title}
                                    <button 
                                        onClick={onClose} 
                                        className="p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" style={{ color: '#0000CC' }} />
                                    </button>
                                </Dialog.Title>
                                <p 
                                    className="text-sm text-gray-500 mt-1"
                                    style={{ fontFamily: 'Roboto, sans-serif' }}
                                >
                                    Owner: {goal.owner}
                                </p>
                                <p 
                                    className="mt-4 text-gray-600"
                                    style={{ fontFamily: 'Roboto, sans-serif' }}
                                >
                                    {goal.description}
                                </p>
                                
                                <div className="mt-6 border-t pt-4">
                                    <h4 
                                        className="text-gray-800"
                                        style={{ 
                                            fontFamily: 'Inter, sans-serif', 
                                            fontWeight: 'bold',
                                            color: '#0000CC'
                                        }}
                                    >
                                        Key Performance Indicators (KPIs)
                                    </h4>
                                    <div className="mt-3 space-y-3">
                                        {goal.kpis.map((kpi: any) => (
                                            <div key={kpi.id}>
                                                <div className="flex justify-between items-center text-sm">
                                                    <p 
                                                        className="text-gray-700"
                                                        style={{ 
                                                            fontFamily: 'Roboto, sans-serif',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        {kpi.metric}
                                                    </p>
                                                    <p 
                                                        className="text-gray-500"
                                                        style={{ fontFamily: 'Roboto, sans-serif' }}
                                                    >
                                                        Target: <span 
                                                            className="text-gray-800"
                                                            style={{ 
                                                                fontFamily: 'Inter, sans-serif', 
                                                                fontWeight: 'bold' 
                                                            }}
                                                        >
                                                            {kpi.target}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div 
                                                        className="h-2 rounded-full" 
                                                        style={{ 
                                                            width: `${kpi.currentProgress}%`,
                                                            backgroundColor: '#0000CC'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={onClose} 
                                        className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                                        style={{ 
                                            backgroundColor: '#0000CC',
                                            fontFamily: 'Inter, sans-serif',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Close
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


// --- MAIN COMPONENT ---
const CompanyGoalsSection: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<QuarterlyGoal | null>(null);

    const handleViewGoal = (goal: QuarterlyGoal) => {
        setSelectedGoal(goal);
        setIsModalOpen(true);
    };

    return (
        <div 
            className="p-6 min-h-screen"
            style={{ backgroundColor: '#FEF9F5' }}
        >
            <div className="flex justify-between items-center mb-6">
                <h1 
                    className="text-3xl"
                    style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontWeight: 'bold',
                        color: '#0000CC'
                    }}
                >
                    Company Goals (Q3 2025)
                </h1>
                <p 
                    className="text-sm text-gray-500"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                    Read-only view of CEO directives
                </p>
            </div>

            {/* Quarterly Goals from CEO */}
            <div className="space-y-4">
                {companyQuarterlyGoals.map(goal => (
                    <button 
                        key={goal.id} 
                        onClick={() => handleViewGoal(goal)}
                        className="w-full text-left rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                        style={{ backgroundColor: '#0000CC' }}
                    >
                        {/* Goal Header */}
                        <div className="p-6">
                            <div className="flex items-start">
                                <div 
                                    className="p-3 rounded-full mr-4"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <Flag className="h-6 w-6 text-white"/>
                                </div>
                                <div className="flex-1">
                                    <h2 
                                        className="text-lg text-white mb-2"
                                        style={{ 
                                            fontFamily: 'Inter, sans-serif', 
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {goal.title}
                                    </h2>
                                    <p 
                                        className="text-sm text-white"
                                        style={{ 
                                            fontFamily: 'Roboto, sans-serif',
                                            opacity: 0.9
                                        }}
                                    >
                                        {goal.description}
                                    </p>
                                    <p 
                                        className="text-xs text-white mt-2"
                                        style={{ 
                                            fontFamily: 'Roboto, sans-serif',
                                            opacity: 0.7
                                        }}
                                    >
                                        Owner: {goal.owner}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* KPI Summary in White Background */}
                        <div className="bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <span 
                                    className="text-sm text-gray-600"
                                    style={{ fontFamily: 'Roboto, sans-serif' }}
                                >
                                    {goal.kpis.length} Key Performance Indicators
                                </span>
                                <span 
                                    className="text-sm"
                                    style={{ 
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 'bold',
                                        color: '#0000CC'
                                    }}
                                >
                                    Click to view details →
                                </span>
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
