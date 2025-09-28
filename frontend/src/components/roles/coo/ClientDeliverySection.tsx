import React, { useState, Fragment } from 'react';
import { 
    Users, 
    Package, 
    Download, 
    Calendar, 
    Filter,
    Plus,
    Image as ImageIcon,
    Video as VideoIcon,
    FileText as ReportIcon,
    X,
    Loader
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// --- TYPE DEFINITIONS ---
type DeliveryType = 'Social Media Kit' | 'Video Ad' | 'Brand Report';

interface Delivery {
    id: string;
    clientId: string;
    title: string;
    type: DeliveryType;
    deliveryDate: string;
    team: string;
    assetCount: number;
    thumbnailUrl: string;
}

// --- MOCK DATA ---
const clients = [
    { id: 'client-1', name: 'Nexus Corp' },
    { id: 'client-2', name: 'Stellar Solutions' },
    { id: 'client-3', name: 'Quantum Leap' },
];

const initialDeliveriesData: Delivery[] = [
    { 
        id: 'del-1', 
        clientId: 'client-1', 
        title: 'Q3 Instagram Campaign Assets', 
        type: 'Social Media Kit', 
        deliveryDate: '2025-07-28', 
        team: 'Alpha Squad', 
        assetCount: 15, 
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-6d221bde3840?q=80&w=2874&auto=format&fit=crop' 
    },
    { 
        id: 'del-2', 
        clientId: 'client-2', 
        title: 'Summer Sale Video Ad (Final Cut)', 
        type: 'Video Ad', 
        deliveryDate: '2025-07-25', 
        team: 'Bravo Unit', 
        assetCount: 3, 
        thumbnailUrl: 'https://images.unsplash.com/photo-1516253593875-bd7ba04221a3?q=80&w=2940&auto=format&fit=crop' 
    },
    { 
        id: 'del-3', 
        clientId: 'client-1', 
        title: 'July 2025 Performance Report', 
        type: 'Brand Report', 
        deliveryDate: '2025-08-01', 
        team: 'Alpha Squad', 
        assetCount: 1, 
        thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2940&auto=format&fit=crop' 
    },
     { 
        id: 'del-4', 
        clientId: 'client-3', 
        title: 'Odyssey Product Launch Kit', 
        type: 'Social Media Kit', 
        deliveryDate: '2025-08-05', 
        team: 'Charlie Crew', 
        assetCount: 25, 
        thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2874&auto=format&fit=crop' 
    },
];

const typeIcons: Record<DeliveryType, JSX.Element> = {
    'Social Media Kit': <ImageIcon className="h-5 w-5 text-pink-500" />,
    'Video Ad': <VideoIcon className="h-5 w-5 text-purple-500" />,
    'Brand Report': <ReportIcon className="h-5 w-5 text-blue-500" />,
};

// --- REUSABLE DELIVERY CARD COMPONENT ---
const DeliveryCard = ({ delivery }: { delivery: Delivery }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        setIsDownloading(true);
        console.log(`Downloading ${delivery.assetCount} assets for ${delivery.title}...`);
        setTimeout(() => {
            setIsDownloading(false);
        }, 1500); // Simulate download time
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group flex flex-col">
            <div className="h-40 overflow-hidden">
                <img src={delivery.thumbnailUrl} alt={delivery.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
            </div>
            <div className="p-4 flex-grow">
                <div className="flex items-center space-x-2">
                    {typeIcons[delivery.type]}
                    <span className="text-xs font-semibold text-gray-500 uppercase">{delivery.type}</span>
                </div>
                <h3 className="mt-2 font-bold text-gray-800 truncate">{delivery.title}</h3>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5"/>
                        <span>{new Date(delivery.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1.5"/>
                        <span>{delivery.team}</span>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 p-3">
                 <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <>
                            <Loader className="h-4 w-4 mr-2 animate-spin"/>
                            Downloading...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2"/>
                            Download ({delivery.assetCount} Assets)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// --- LOG NEW DELIVERY MODAL ---
const DeliveryFormModal = ({ isOpen, onClose, onAddDelivery, selectedClient }: any) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<DeliveryType>('Social Media Kit');

    const handleSubmit = () => {
        if (!title) return;
        const newDelivery: Delivery = {
            id: `del-${Date.now()}`,
            clientId: selectedClient.id,
            title,
            type,
            deliveryDate: new Date().toISOString().split('T')[0],
            team: 'Alpha Squad', // Placeholder
            assetCount: Math.floor(Math.random() * 20) + 1, // Placeholder
            thumbnailUrl: 'https://placehold.co/600x400/cccccc/ffffff?text=New+Delivery'
        };
        onAddDelivery(newDelivery);
        onClose();
        setTitle('');
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">Log New Delivery for {selectedClient.name}</Dialog.Title>
                                <div className="mt-4 space-y-4">
                                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Delivery Title (e.g., Q4 Campaign Launch)" className="w-full p-2 border rounded-md"/>
                                    <select value={type} onChange={e => setType(e.target.value as DeliveryType)} className="w-full p-2 border rounded-md">
                                        <option>Social Media Kit</option>
                                        <option>Video Ad</option>
                                        <option>Brand Report</option>
                                    </select>
                                    <textarea placeholder="Add notes (optional)..." className="w-full p-2 border rounded-md" rows={3}></textarea>
                                </div>
                                <div className="mt-6 flex justify-end space-x-2">
                                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Log Delivery</button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};


// --- THE MAIN DASHBOARD COMPONENT ---
const ClientDeliverySection = () => {
    const [selectedClient, setSelectedClient] = useState(clients[0]);
    const [deliveries, setDeliveries] = useState(initialDeliveriesData);
    const [filterType, setFilterType] = useState('All Types');
    const [filterMonth, setFilterMonth] = useState('2025-07');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleAddDelivery = (newDelivery: Delivery) => {
        setDeliveries(prev => [newDelivery, ...prev]);
    };

    const filteredDeliveries = deliveries
        .filter(d => d.clientId === selectedClient.id)
        .filter(d => filterType === 'All Types' || d.type === filterType)
        .filter(d => d.deliveryDate.startsWith(filterMonth));

    return (
        <div className="p-2 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Client Deliveries</h1>
                <div className="flex items-center space-x-4">
                    <select 
                        value={selectedClient.id} 
                        onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value)!)}
                        className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="h-5 w-5 mr-2 -ml-1"/>
                        Log New Delivery
                    </button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
                <Filter className="h-5 w-5 text-gray-500"/>
                <span className="font-semibold text-gray-700">Filter by:</span>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
                    <option>All Types</option>
                    <option>Social Media Kit</option>
                    <option>Video Ad</option>
                    <option>Brand Report</option>
                </select>
                 <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"/>
            </div>

            {/* Deliveries Grid */}
            {filteredDeliveries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredDeliveries.map((delivery) => (
                        <DeliveryCard key={delivery.id} delivery={delivery} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                    <Package className="mx-auto h-12 w-12 text-gray-400"/>
                    <h3 className="mt-2 text-lg font-semibold text-gray-800">No Deliveries Found</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no deliveries matching your current filters.</p>
                </div>
            )}
            
            <DeliveryFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddDelivery={handleAddDelivery}
                selectedClient={selectedClient}
            />
        </div>
    );
};

export default ClientDeliverySection;
