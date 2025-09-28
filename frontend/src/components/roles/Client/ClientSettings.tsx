import React, { useState } from 'react';
import { 
    User,
    Bell,
    Shield,
    Mail,
    Phone,
    Building,
    Save,
    KeyRound,
    Monitor,
    LogOut
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface ProfileSettings {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
}

interface NotificationSettings {
    newReport: { inApp: boolean; email: boolean };
    taskApproved: { inApp: boolean; email: boolean };
    newOffer: { inApp: boolean; email: boolean };
    meetingScheduled: { inApp: boolean; email: boolean };
}

// --- MOCK DATA ---
const initialProfileData: ProfileSettings = {
    companyName: 'Nexus Corp',
    contactPerson: 'Jane Doe',
    email: 'jane.doe@nexuscorp.com',
    phone: '+1 (555) 123-4567',
};

const initialNotificationData: NotificationSettings = {
    newReport: { inApp: true, email: true },
    taskApproved: { inApp: true, email: false },
    newOffer: { inApp: true, email: true },
    meetingScheduled: { inApp: false, email: true },
};

// --- HELPER COMPONENTS ---
const SettingsCard = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icon className="h-6 w-6 text-blue-600 mr-3"/>
                {title}
            </h2>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const Toggle = ({ enabled, setEnabled }: any) => (
    <button
        onClick={() => setEnabled(!enabled)}
        className={`${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
    >
        <span className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
    </button>
);

// --- MAIN COMPONENT ---
const ClientSettingsDashboard = () => {
    const [profile, setProfile] = useState(initialProfileData);
    const [notifications, setNotifications] = useState(initialNotificationData);

    const handleNotificationChange = (key: keyof NotificationSettings, type: 'inApp' | 'email') => {
        setNotifications(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [type]: !prev[key][type]
            }
        }));
    };

    return (
        <div className=" min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-lg text-gray-600">Manage your account, notifications, and security preferences.</p>
                </div>

                <div className="space-y-8">
                    {/* Profile Information */}
                    <SettingsCard title="Profile Information" icon={User}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input type="text" value={profile.companyName} onChange={e => setProfile({...profile, companyName: e.target.value})} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                                <input type="text" value={profile.contactPerson} onChange={e => setProfile({...profile, contactPerson: e.target.value})} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                                <Save className="h-4 w-4 mr-2"/>
                                Save Profile
                            </button>
                        </div>
                    </SettingsCard>

                    {/* Notification Settings */}
                    <SettingsCard title="Notification Preferences" icon={Bell}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">New Report Submitted</p>
                                    <p className="text-xs text-gray-500">Notify me when a new performance report is ready for review.</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-gray-400"/><Toggle enabled={notifications.newReport.email} setEnabled={() => handleNotificationChange('newReport', 'email')}/></div>
                                    <div className="flex items-center space-x-2"><Monitor className="h-4 w-4 text-gray-400"/><Toggle enabled={notifications.newReport.inApp} setEnabled={() => handleNotificationChange('newReport', 'inApp')}/></div>
                                </div>
                            </div>
                             <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">New Offer Available</p>
                                    <p className="text-xs text-gray-500">Notify me about new exclusive offers and discounts.</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-gray-400"/><Toggle enabled={notifications.newOffer.email} setEnabled={() => handleNotificationChange('newOffer', 'email')}/></div>
                                    <div className="flex items-center space-x-2"><Monitor className="h-4 w-4 text-gray-400"/><Toggle enabled={notifications.newOffer.inApp} setEnabled={() => handleNotificationChange('newOffer', 'inApp')}/></div>
                                </div>
                            </div>
                             <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">Meeting Scheduled</p>
                                    <p className="text-xs text-gray-500">Notify me when a new meeting is scheduled with my team.</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-gray-400"/><Toggle enabled={notifications.meetingScheduled.email} setEnabled={() => handleNotificationChange('meetingScheduled', 'email')}/></div>
                                    <div className="flex items-center space-x-2"><Monitor className="h-4 w-4 text-gray-400"/><Toggle enabled={notifications.meetingScheduled.inApp} setEnabled={() => handleNotificationChange('meetingScheduled', 'inApp')}/></div>
                                </div>
                            </div>
                        </div>
                    </SettingsCard>

                    {/* Security Settings */}
                    <SettingsCard title="Security" icon={Shield}>
                        <div>
                            <h3 className="font-semibold text-gray-800">Change Password</h3>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="password" placeholder="Current Password"className="w-full p-2 border rounded-md"/>
                                <input type="password" placeholder="New Password"className="w-full p-2 border rounded-md"/>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button className="flex items-center px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900">
                                    <KeyRound className="h-4 w-4 mr-2"/>
                                    Update Password
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 border-t pt-6">
                             <h3 className="font-semibold text-gray-800">Recent Login Activity</h3>
                             <p className="text-sm text-gray-500 mt-2">Last login: July 31, 2025 at 3:30 PM from Bengaluru, India.</p>
                        </div>
                    </SettingsCard>
                </div>
            </div>
        </div>
    );
};

export default ClientSettingsDashboard;
