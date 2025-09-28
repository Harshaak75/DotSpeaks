import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
    Gift,
    Percent,
    Sparkles,
    Ticket,
    X
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Offer {
    id: string;
    title: string;
    description: string;
    icon: JSX.Element;
    type: 'discount' | 'freebie';
    expiryDate: string;
}

// --- MOCK DATA ---
const specialOffers: Offer[] = [
    { 
        id: 'offer-1', 
        title: 'Diwali Festival Discount', 
        description: 'Celebrate the festival of lights with us! Get 20% off your next month\'s subscription fee as a token of our appreciation.', 
        icon: <Percent className="h-8 w-8 text-white"/>,
        type: 'discount',
        expiryDate: 'November 15, 2025'
    },
    { 
        id: 'offer-2', 
        title: 'Free Logo Redesign Package', 
        description: 'As a valued partner, claim a complimentary logo refresh package. Our top designers will work with you to elevate your brand\'s primary asset.', 
        icon: <Gift className="h-8 w-8 text-white"/>,
        type: 'freebie',
        expiryDate: 'December 31, 2025'
    },
    { 
        id: 'offer-3', 
        title: 'Early New Year Bonus', 
        description: 'Get a head start on the new year! Claim a 15% discount on any plan upgrade for the next 3 months.', 
        icon: <Sparkles className="h-8 w-8 text-white"/>,
        type: 'discount',
        expiryDate: 'December 25, 2025'
    },
];

const offerStyles = {
    discount: {
        bg: 'bg-gradient-to-br from-orange-500 to-red-600',
        iconBg: 'bg-white/20',
    },
    freebie: {
        bg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
        iconBg: 'bg-white/20',
    }
}

// --- OFFER MODAL ---
const OfferModal = ({ isOpen, onClose, offer }: any) => {
    if (!isOpen) return null;
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/50" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <div className="flex items-center">{offer.icon} <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 ml-3">{offer.title}</Dialog.Title></div>
                            <div className="mt-4"><p className="text-sm text-gray-500">{offer.description}</p></div>
                            <div className="mt-6 flex justify-end space-x-2">
                                <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200">Maybe Later</button>
                                <button onClick={() => { alert(`Offer "${offer.title}" claimed!`); onClose(); }} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Claim Now</button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
};

// --- MAIN COMPONENT ---
const ClientOffersDashboard = () => {
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    
    const openOfferModal = (offer: Offer) => {
        setSelectedOffer(offer);
        setIsOfferModalOpen(true);
    };

    return (
        <div className=" min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900">Exclusive Offers</h1>
                    <p className="mt-3 text-lg text-gray-600">As a valued client, you have access to these special promotions from DotSpeaks.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {specialOffers.map(offer => {
                        const styles = offerStyles[offer.type];
                        return (
                            <div key={offer.id} className={`rounded-xl shadow-lg text-white p-8 flex flex-col ${styles.bg}`}>
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-full ${styles.iconBg}`}>
                                        {offer.icon}
                                    </div>
                                </div>
                                <h3 className="mt-6 text-2xl font-bold">{offer.title}</h3>
                                <p className="mt-2 text-white/80 text-sm flex-grow">{offer.description}</p>
                                <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center">
                                    <div className="text-xs">
                                        <p className="text-white/70">Expires on:</p>
                                        <p className="font-semibold">{offer.expiryDate}</p>
                                    </div>
                                    <button 
                                        onClick={() => openOfferModal(offer)} 
                                        className="px-4 py-2 font-semibold bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Claim Offer
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <OfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                offer={selectedOffer}
            />
        </div>
    );
};

export default ClientOffersDashboard;
