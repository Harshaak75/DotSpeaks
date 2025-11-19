import { useState, Fragment } from 'react';
import {
  ChevronDown,
  Star,
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
    name: 'SAMEERA VERMA',
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


// Updated health styles - ALL RED with white text
const healthStyles: Record<ClientHealth, string> = {
  'On Track': 'bg-red-600 text-white',
  'At Risk': 'bg-red-600 text-white',
  'Critical': 'bg-red-600 text-white',
};


// --- MODAL COMPONENTS ---
const ScheduleMeetingModal = ({ isOpen, onClose, targetName }: any) => {
  if (!isOpen) return null;
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
          <div className="fixed inset-0 bg-black/30" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title 
                    className="text-lg font-bold text-gray-900"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Schedule Meeting with {targetName}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                  <textarea
                    placeholder="Meeting agenda..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                  <button
                    className="w-full px-4 py-2 text-white rounded-md hover:opacity-90 font-semibold"
                    style={{ backgroundColor: '#0000CC', fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Send Invite
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


const ChatModal = ({ isOpen, onClose, targetName }: any) => {
  if (!isOpen) return null;
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
          <div className="fixed inset-0 bg-black/30" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title 
                    className="text-lg font-bold text-gray-900"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Chat with {targetName}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div 
                  className="h-64 overflow-y-auto mb-4 p-3 bg-gray-50 rounded-md"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Chat history would appear here...
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                  <button
                    className="px-4 py-2 text-white rounded-md hover:opacity-90"
                    style={{ backgroundColor: '#0000CC' }}
                  >
                    <Send className="h-4 w-4" />
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
const CooDashboardReview = () => {
  const [openPM, setOpenPM] = useState<string | null>(projectManagersData[0].id);
  const [modalState, setModalState] = useState<{ isOpen: boolean; targetName: string; actionType: 'Meeting' | 'Chat' | null }>({ 
    isOpen: false, 
    targetName: '', 
    actionType: null 
  });


  const togglePM = (id: string) => {
    setOpenPM(prev => (prev === id ? null : id));
  };


  const openActionModal = (targetName: string, actionType: 'Meeting' | 'Chat') => {
    setModalState({ isOpen: true, targetName, actionType });
  };


  const StarRating = ({ score }: any) => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );


  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#FEF9F5' }}>
      <h1 
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#0000CC' }}
      >
        COO Dashboard: Manager & Client Overview
      </h1>


      <div className="space-y-4">
        {projectManagersData.map(pm => (
          <div 
            key={pm.id} 
            className="rounded-xl shadow-lg overflow-hidden"
            style={{ backgroundColor: '#0000CC' }}
          >
            <button 
              onClick={() => togglePM(pm.id)} 
              className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center space-x-4">
                <img src={pm.avatarUrl} alt={pm.name} className="h-12 w-12 rounded-full" />
                <div>
                  <h2 
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    {pm.name}
                  </h2>
                  <p 
                    className="text-white"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
                  >
                    Project Manager
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div>
                  <p 
                    className="text-xs text-white uppercase tracking-wide"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Revenue Managed
                  </p>
                  <p 
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    ₹{(pm.totalRevenue / 1000000).toFixed(2)}M
                  </p>
                </div>
                
                <div>
                  <p 
                    className="text-xs text-white uppercase tracking-wide"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Performance Trend
                  </p>
                  <div className="flex items-center space-x-1">
                    {pm.performanceTrend === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-green-300" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-300" />
                    )}
                    <span 
                      className={`text-sm font-semibold ${pm.performanceTrend === 'up' ? 'text-green-300' : 'text-red-300'}`}
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {pm.performanceTrend === 'up' ? 'Improving' : 'Declining'}
                    </span>
                  </div>
                </div>


                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openActionModal(pm.name, 'Meeting'); }} 
                    className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors" 
                    title="Schedule Meeting"
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openActionModal(pm.name, 'Chat'); }} 
                    className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors" 
                    title="Start Chat"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <ChevronDown 
                    className={`h-6 w-6 text-white transition-transform ${openPM === pm.id ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>
            </button>


            {openPM === pm.id && (
              <div className="bg-white p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th 
                        className="text-left py-3 px-4 font-semibold"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#0000CC' }}
                      >
                        Client
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-semibold"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#0000CC' }}
                      >
                        Health Status
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-semibold"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#0000CC' }}
                      >
                        Internal Review
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-semibold"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#0000CC' }}
                      >
                        Client Satisfaction
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-semibold"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#0000CC' }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pm.clients.map(client => (
                      <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td 
                          className="py-3 px-4 font-medium"
                          style={{ fontFamily: 'Roboto, sans-serif', color: '#333' }}
                        >
                          {client.name}
                        </td>
                        <td className="py-3 px-4">
                          <span 
                            className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${healthStyles[client.health]}`}
                            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                          >
                            {client.health}
                          </span>
                        </td>
                        <td 
                          className="py-3 px-4"
                          style={{ fontFamily: 'Roboto, sans-serif', color: '#333' }}
                        >
                          {client.pm_review_score} / 10
                        </td>
                        <td className="py-3 px-4">
                          <StarRating score={client.client_review_score} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => openActionModal(client.name, 'Meeting')} 
                              className="p-2 rounded-full hover:bg-gray-200 transition-colors" 
                              title="Schedule Meeting with Client"
                              style={{ color: '#0000CC' }}
                            >
                              <Calendar className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => openActionModal(client.name, 'Chat')} 
                              className="p-2 rounded-full hover:bg-gray-200 transition-colors" 
                              title="Start Chat with Client"
                              style={{ color: '#0000CC' }}
                            >
                              <MessageSquare className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
