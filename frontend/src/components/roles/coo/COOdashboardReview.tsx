import React, { useState, Fragment } from 'react';
import { 
    Briefcase,
    User,
    Users,
    ChevronDown,
    FileText,
    Star,
    Shield,
    MessageSquare,
    Calendar,
    X,
    TrendingUp,
    TrendingDown,
    Send
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// --- TYPE DEFINITIONS ---
type ClientHealth = 'On Track' | 'At Risk' | 'Critical';

interface Client {
    id: string;
    name: string;
    health: ClientHealth;
    pm_review_score: number;
    client_review_score: number;
}

interface ProjectManager {
    id: string;
    name: string;
    avatarUrl: string;
    clients: Client[];
    totalRevenue: number;
    performanceTrend: 'up' | 'down';
}

// --- MOCK DATA ---
const projectManagersData: ProjectManager[] = [
    {
        id: 'pm-1',
        name: 'Sameer Verma',
        avatarUrl: 'https://placehold.co/100x100/60a5fa/ffffff?text=SV',
        clients: [
            { id: 'c-1', name: 'Nexus Corp', health: 'On Track', pm_review_score: 9.2, client_review_score: 5 },
            { id: 'c-2', name: 'Stellar Solutions', health: 'At Risk', pm_review_score: 7.8, client_review_score: 4 },
            { id: 'c-3', name: 'Quantum Leap', health: 'On Track', pm_review_score: 8.9, client_review_score: 5 },
        ],
        totalRevenue: 1250000,
        performanceTrend: 'up',
    },
    {
        id: 'pm-2',
        name: 'Neha Desai',
        avatarUrl: 'https://placehold.co/100x100/f87171/ffffff?text=ND',
        clients: [
            { id: 'c-4', name: 'Apex Innovations', health: 'On Track', pm_review_score: 9.5, client_review_score: 5 },
            { id: 'c-5', name: 'Zenith Dynamics', health: 'Critical', pm_review_score: 6.1, client_review_score: 2 },
        ],
        totalRevenue: 850000,
        performanceTrend: 'down',
    },
];

const healthStyles: Record<ClientHealth, string> = {
    'On Track': 'bg-green-100 text-green-800',
    'At Risk': 'bg-yellow-100 text-yellow-800',
    'Critical': 'bg-red-100 text-red-800',
};

// --- MODAL COMPONENTS ---
const ScheduleMeetingModal = ({ isOpen, onClose, targetName }: any) => {
    if (!isOpen) return null;
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/50" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">Schedule Meeting with {targetName}</Dialog.Title>
                            <div className="mt-4 space-y-4">
                                <input type="text" placeholder="Meeting Title" className="w-full p-2 border rounded-md"/>
                                <input type="date" className="w-full p-2 border rounded-md"/>
                                <textarea placeholder="Agenda..." className="w-full p-2 border rounded-md" rows={3}/>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Send Invite</button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
};

const ChatModal = ({ isOpen, onClose, targetName }: any) => {
    if (!isOpen) return null;
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/50" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-lg h-[60vh] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all flex flex-col">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 border-b pb-4">Chat with {targetName}</Dialog.Title>
                            <div className="flex-grow my-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-500 italic">
                                Chat history would appear here...
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="text" placeholder="Type your message..." className="w-full p-2 border rounded-md"/>
                                <button className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Send className="h-5 w-5"/></button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
};

// --- MAIN COMPONENT ---
const CooDashboardReview = () => {
    const [openPM, setOpenPM] = useState<string | null>(projectManagersData[0].id);
    const [modalState, setModalState] = useState<{ isOpen: boolean; targetName: string; actionType: 'Meeting' | 'Chat' | null }>({ isOpen: false, targetName: '', actionType: null });

    const togglePM = (id: string) => {
        setOpenPM(prev => (prev === id ? null : id));
    };

    const openActionModal = (targetName: string, actionType: 'Meeting' | 'Chat') => {
        setModalState({ isOpen: true, targetName, actionType });
    };

    const StarRating = ({ score }: any) => (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < score ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
        </div>
    );

    return (
        <div className=" bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">COO Dashboard: Manager & Client Overview</h1>
            
            <div className="space-y-4">
                {projectManagersData.map(pm => (
                    <div key={pm.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div onClick={() => togglePM(pm.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                            <div className="flex items-center">
                                <img src={pm.avatarUrl} alt={pm.name} className="h-16 w-16 rounded-full"/>
                                <div className="ml-4">
                                    <p className="font-bold text-xl text-gray-900">{pm.name}</p>
                                    <p className="text-sm text-gray-500">Project Manager</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Revenue Managed</p>
                                    <p className="text-lg font-bold text-gray-800">₹{(pm.totalRevenue / 1000000).toFixed(2)}M</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Performance Trend</p>
                                    <div className={`flex items-center text-lg font-bold ${pm.performanceTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {pm.performanceTrend === 'up' ? <TrendingUp className="h-5 w-5 mr-1"/> : <TrendingDown className="h-5 w-5 mr-1"/>}
                                        <span>{pm.performanceTrend === 'up' ? 'Improving' : 'Declining'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                   <button onClick={(e) => { e.stopPropagation(); openActionModal(pm.name, 'Meeting'); }} className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200" title="Schedule Meeting"><Calendar className="h-5 w-5"/></button>
                                   <button onClick={(e) => { e.stopPropagation(); openActionModal(pm.name, 'Chat'); }} className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200" title="Start Chat"><MessageSquare className="h-5 w-5"/></button>
                                </div>
                               <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform ${openPM === pm.id ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {openPM === pm.id && (
                            <div className="px-4 pb-4">
                                <div className="border-t">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Health Status</th>
                                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Internal Review</th>
                                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Client Satisfaction</th>
                                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {pm.clients.map(client => (
                                                <tr key={client.id}>
                                                    <td className="py-3 px-3 font-medium text-gray-800">{client.name}</td>
                                                    <td className="py-3 px-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${healthStyles[client.health]}`}>{client.health}</span></td>
                                                    <td className="py-3 px-3 font-semibold text-gray-700">{client.pm_review_score} / 10</td>
                                                    <td className="py-3 px-3"><StarRating score={client.client_review_score} /></td>
                                                    <td className="py-3 px-3">
                                                         <div className="flex items-center space-x-2">
                                                            <button onClick={() => openActionModal(client.name, 'Meeting')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full" title="Schedule Meeting with Client"><Calendar className="h-4 w-4"/></button>
                                                            <button onClick={() => openActionModal(client.name, 'Chat')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full" title="Start Chat with Client"><MessageSquare className="h-4 w-4"/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <ScheduleMeetingModal 
                isOpen={modalState.isOpen && modalState.actionType === 'Meeting'}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                targetName={modalState.targetName}
            />
            <ChatModal 
                isOpen={modalState.isOpen && modalState.actionType === 'Chat'}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                targetName={modalState.targetName}
            />
        </div>
    );
};

export default CooDashboardReview;
