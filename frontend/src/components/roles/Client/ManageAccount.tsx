import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
    Lock,
    Shield,
    Plus,
    Eye,
    EyeOff,
    Trash2,
    Instagram,
    Facebook,
    Linkedin,
    Youtube,
    Twitter,
    ExternalLink,
    X
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type Platform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'Twitter';

interface SocialAccount {
    id: number;
    platform: Platform;
    username: string;
    password?: string;
}

// --- MOCK DATA ---
const initialAccounts: SocialAccount[] = [
    { id: 1, platform: 'Instagram', username: 'nexuscorp_official', password: 'password123' },
    { id: 2, platform: 'LinkedIn', username: 'Nexus Corporation', password: 'password456' },
];

const platformConfig = {
    Instagram: { icon: Instagram, color: 'text-pink-600', url: 'https://instagram.com/' },
    Facebook: { icon: Facebook, color: 'text-blue-700', url: 'https://facebook.com/' },
    LinkedIn: { icon: Linkedin, color: 'text-sky-600', url: 'https://linkedin.com/company/' },
    YouTube: { icon: Youtube, color: 'text-red-600', url: 'https://youtube.com/' },
    Twitter: { icon: Twitter, color: 'text-blue-400', url: 'https://twitter.com/' },
};

// --- MODAL FOR ADDING/EDITING ACCOUNTS ---
const AccountFormModal = ({ isOpen, onClose, onSave, accountToEdit }: any) => {
    const [platform, setPlatform] = useState<Platform>('Instagram');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    React.useEffect(() => {
        if (accountToEdit) {
            setPlatform(accountToEdit.platform);
            setUsername(accountToEdit.username);
            setPassword(accountToEdit.password || '');
        } else {
            setPlatform('Instagram');
            setUsername('');
            setPassword('');
        }
    }, [accountToEdit, isOpen]);

    const handleSave = () => {
        onSave({
            id: accountToEdit ? accountToEdit.id : Date.now(),
            platform,
            username,
            password,
        });
        onClose();
    };

    const PlatformIcon = platformConfig[platform].icon;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/50" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">{accountToEdit ? 'Edit Account' : 'Add New Account'}</Dialog.Title>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Platform</label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <PlatformIcon className={`h-5 w-5 ${platformConfig[platform].color}`} />
                                        </div>
                                        <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-10 pr-3">
                                            {Object.keys(platformConfig).map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username or Email</label>
                                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="relative mt-1">
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-md"/>
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400"/> : <Eye className="h-5 w-5 text-gray-400"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-2">
                                <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Credentials</button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
};


// --- MAIN COMPONENT ---
const SocialAccountsDashboard = () => {
    const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accountToEdit, setAccountToEdit] = useState<SocialAccount | null>(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setAccountToEdit(null);
    };

    const handleEdit = (account: SocialAccount) => {
        setAccountToEdit(account);
        openModal();
    };

    const handleSave = (accountData: SocialAccount) => {
        if (accountToEdit) {
            setAccounts(accounts.map(acc => acc.id === accountData.id ? accountData : acc));
        } else {
            setAccounts([...accounts, accountData]);
        }
    };

    const handleDelete = (accountId: number) => {
        if (window.confirm("Are you sure you want to delete these credentials?")) {
            setAccounts(accounts.filter(acc => acc.id !== accountId));
        }
    };

    return (
        <div className="p-1 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Social Media Credentials</h1>
                        <p className="text-gray-500 mt-1">Manage your connected social media accounts.</p>
                    </div>
                    <button onClick={openModal} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="h-5 w-5 mr-2 -ml-1"/>
                        Add New Account
                    </button>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8 flex items-center">
                    <Shield className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0"/>
                    <div>
                        <h3 className="font-bold text-blue-800">Your Security is Our Priority</h3>
                        <p className="text-sm text-blue-700">Your credentials are encrypted and will never be shared. They are used solely to manage your marketing campaigns as agreed.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {accounts.map(account => {
                        const PlatformIcon = platformConfig[account.platform].icon;
                        const platformUrl = `${platformConfig[account.platform].url}${account.username}`;
                        return (
                            <div key={account.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
                                <div className="flex items-center">
                                    <PlatformIcon className={`h-8 w-8 mr-4 ${platformConfig[account.platform].color}`}/>
                                    <div>
                                        <p className="font-bold text-gray-800">{account.platform}</p>
                                        <p className="text-sm text-gray-600">{account.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <a href={platformUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full" title="Visit Profile">
                                        <ExternalLink className="h-5 w-5"/>
                                    </a>
                                    <button onClick={() => handleEdit(account)} className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200">View & Edit</button>
                                    <button onClick={() => handleDelete(account.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Delete">
                                        <Trash2 className="h-5 w-5"/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AccountFormModal 
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                accountToEdit={accountToEdit}
            />
        </div>
    );
};

export default SocialAccountsDashboard;
