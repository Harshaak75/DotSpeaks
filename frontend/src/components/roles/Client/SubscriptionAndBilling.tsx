import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
    CheckCircle,
    XCircle,
    ArrowRight,
    Shield,
    Rocket,
    Crown,
    Zap,
    Gem,
    Star,
    X,
    FileText,
    Download
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Plan {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: JSX.Element;
    features: {
        'Brand Strategy': boolean;
        'Dedicated Team': boolean;
        'Monthly Reports': boolean;
        'Priority Support': boolean;
        'Advanced Analytics': boolean;
    };
}

interface Invoice {
    id: string;
    date: string;
    planName: string;
    amount: number;
    status: 'Paid' | 'Due';
}

// --- MOCK DATA ---
const plans: Plan[] = [
    { id: 'spark', name: 'SPARK', price: 499, description: 'Foundation-level brand support', icon: <Shield/>, features: { 'Brand Strategy': true, 'Dedicated Team': false, 'Monthly Reports': true, 'Priority Support': false, 'Advanced Analytics': false } },
    { id: 'rise', name: 'RISE', price: 999, description: 'For expanding businesses', icon: <Rocket/>, features: { 'Brand Strategy': true, 'Dedicated Team': true, 'Monthly Reports': true, 'Priority Support': false, 'Advanced Analytics': false } },
    { id: 'scale', name: 'SCALE', price: 1999, description: 'Comprehensive market domination', icon: <Crown/>, features: { 'Brand Strategy': true, 'Dedicated Team': true, 'Monthly Reports': true, 'Priority Support': true, 'Advanced Analytics': false } },
    { id: 'lead', name: 'LEAD', price: 2999, description: 'Fast-paced market entry', icon: <Zap/>, features: { 'Brand Strategy': true, 'Dedicated Team': true, 'Monthly Reports': true, 'Priority Support': true, 'Advanced Analytics': true } },
    { id: 'signature', name: 'SIGNATURE', price: 4999, description: 'Top-tier strategic partnership', icon: <Gem/>, features: { 'Brand Strategy': true, 'Dedicated Team': true, 'Monthly Reports': true, 'Priority Support': true, 'Advanced Analytics': true } },
    { id: 'tailored', name: 'TAILORED', price: 0, description: 'Bespoke solutions for unique needs', icon: <Star/>, features: { 'Brand Strategy': true, 'Dedicated Team': true, 'Monthly Reports': true, 'Priority Support': true, 'Advanced Analytics': true } },
];

const invoices: Invoice[] = [
    { id: 'inv-003', date: 'July 31, 2025', planName: 'RISE Plan', amount: 999, status: 'Paid' },
    { id: 'inv-002', date: 'June 30, 2025', planName: 'RISE Plan', amount: 999, status: 'Paid' },
    { id: 'inv-001', date: 'May 31, 2025', planName: 'SPARK Plan', amount: 499, status: 'Paid' },
];

// --- CONFIRMATION MODAL ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, plan, action }: any) => {
    if (!isOpen) return null;
    const isCancel = action === 'cancel';
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/50" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">{isCancel ? 'Cancel Subscription' : `Switch to ${plan.name}`}</Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {isCancel 
                                        ? `Are you sure you want to cancel your ${plan.name} plan? This action is irreversible.`
                                        : `You are about to switch to the ${plan.name} plan for $${plan.price}/month. Your next bill will be updated.`
                                    }
                                </p>
                            </div>
                            <div className="mt-6 flex justify-end space-x-2">
                                <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200">Go Back</button>
                                <button onClick={() => { onConfirm(plan); onClose(); }} className={`px-4 py-2 text-white font-semibold rounded-lg ${isCancel ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {isCancel ? 'Confirm Cancellation' : 'Confirm Switch'}
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
};

// --- UPGRADE MODAL ---
const UpgradeModal = ({ isOpen, onClose, onSelectPlan, currentPlanId }: any) => {
    const availableUpgrades = plans.filter(p => p.id !== currentPlanId);
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/50" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">Upgrade Your Plan</Dialog.Title>
                            <p className="text-sm text-gray-500 mt-1">Choose a new plan that fits your needs.</p>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableUpgrades.map(plan => (
                                    <div key={plan.id} className="border rounded-lg p-4 flex flex-col">
                                        <div className="flex items-center">
                                            {plan.icon}
                                            <h4 className="ml-2 font-bold">{plan.name}</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 flex-grow">{plan.description}</p>
                                        <p className="text-2xl font-bold mt-4">{plan.price > 0 ? `$${plan.price}`: 'Custom'}<span className="text-sm font-normal text-gray-500">{plan.price > 0 && '/mo'}</span></p>
                                        <button onClick={() => onSelectPlan(plan)} className="w-full mt-4 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Choose Plan</button>
                                    </div>
                                ))}
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
}

// --- MAIN COMPONENT ---
const SubscriptionDashboard = () => {
    const [currentPlanId, setCurrentPlanId] = useState('rise');
    const [modalState, setModalState] = useState({ isOpen: false, plan: null, action: '' });
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const currentPlan = plans.find(p => p.id === currentPlanId);

    const openConfirmationModal = (plan: any, action: any) => {
        setModalState({ isOpen: true, plan, action });
    };
    
    const handlePlanSelect = (plan: any) => {
        setIsUpgradeModalOpen(false);
        openConfirmationModal(plan, 'switch');
    };

    const handleConfirm = (plan: any) => {
        if (modalState.action === 'cancel') {
            alert(`Your subscription to the ${plan.name} plan has been cancelled.`);
            setCurrentPlanId('');
        } else {
            alert(`You have successfully switched to the ${plan.name} plan.`);
            setCurrentPlanId(plan.id);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Subscription & Billing</h1>
                
                {/* Current Plan Card */}
                {currentPlan ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800">Your Current Plan</h2>
                            <div className="mt-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">{currentPlan.icon}</div>
                                    <div className="ml-4">
                                        <p className="font-bold text-lg text-gray-900">{currentPlan.name}</p>
                                        <p className="text-sm text-gray-500">₹{currentPlan.price}/month</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Next billing date: <span className="font-semibold text-gray-700">August 31, 2025</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 border-t">
                            <h3 className="font-semibold text-gray-700 mb-3">Features included in your plan:</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {Object.entries(currentPlan.features).map(([feature, included]) => (
                                    <li key={feature} className="flex items-center text-sm">
                                        {included ? <CheckCircle className="h-4 w-4 text-green-500 mr-2"/> : <XCircle className="h-4 w-4 text-gray-300 mr-2"/>}
                                        <span className={included ? 'text-gray-800' : 'text-gray-400'}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 flex justify-end space-x-2">
                            <button onClick={() => openConfirmationModal(currentPlan, 'cancel')} className="px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 rounded-lg">Cancel Subscription</button>
                            <button onClick={() => setIsUpgradeModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Upgrade Plan</button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                        <p className="text-gray-600 mb-4">You do not have an active subscription.</p>
                        <button onClick={() => setIsUpgradeModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Choose a Plan</button>
                    </div>
                )}

                {/* NEW: Billing History Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Billing History</h2>
                    </div>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoices.map(invoice => (
                                <tr key={invoice.id}>
                                    <td className="py-4 px-6 font-medium text-gray-700">{invoice.date}</td>
                                    <td className="py-4 px-6 text-gray-600">{invoice.planName}</td>
                                    <td className="py-4 px-6 text-gray-600">₹{invoice.amount.toFixed(2)}</td>
                                    <td className="py-4 px-6">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{invoice.status}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <button onClick={() => alert(`Downloading invoice ${invoice.id}`)} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                                            <Download className="h-4 w-4 mr-1.5"/>
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UpgradeModal 
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onSelectPlan={handlePlanSelect}
                currentPlanId={currentPlanId}
            />
            <ConfirmationModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, plan: null, action: '' })}
                onConfirm={handleConfirm}
                plan={modalState.plan}
                action={modalState.action}
            />
        </div>
    );
};

export default SubscriptionDashboard;
