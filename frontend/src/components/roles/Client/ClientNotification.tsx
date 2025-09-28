import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
    Bell,
    FileText,
    Gift,
    Calendar,
    Check,
    X
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type NotificationType = 'Report' | 'Offer' | 'Meeting';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
    relatedId?: string; // To link to a specific report, offer, etc.
}

// --- MOCK DATA ---
const initialNotificationsData: Notification[] = [
    { 
        id: 'notif-1', 
        type: 'Report', 
        title: 'New Report Ready for Review',
        description: 'The performance report for July 2025 has been submitted by your Brand Head.',
        timestamp: '2 hours ago',
        read: false,
        relatedId: 'rep-001'
    },
    { 
        id: 'notif-2', 
        type: 'Offer', 
        title: 'Exclusive Diwali Discount!',
        description: 'A special 20% discount offer is now available for you to claim.',
        timestamp: '1 day ago',
        read: false,
        relatedId: 'offer-1'
    },
    { 
        id: 'notif-3', 
        type: 'Meeting', 
        title: 'Meeting Scheduled: Q3 Strategy Kick-off',
        description: 'A meeting has been scheduled for August 5, 2025, at 10:00 AM.',
        timestamp: '3 days ago',
        read: true,
        relatedId: 'meet-1'
    },
     { 
        id: 'notif-4', 
        type: 'Report', 
        title: 'Report Approved',
        description: 'You have approved the June 2025 Performance Report.',
        timestamp: '5 days ago',
        read: true,
        relatedId: 'rep-002'
    },
];

const notificationIcons: Record<NotificationType, JSX.Element> = {
    'Report': <FileText className="h-6 w-6 text-blue-500"/>,
    'Offer': <Gift className="h-6 w-6 text-orange-500"/>,
    'Meeting': <Calendar className="h-6 w-6 text-green-500"/>,
};

// --- MAIN COMPONENT ---
const ClientNotificationDashboard = () => {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotificationsData);
    const [activeFilter, setActiveFilter] = useState<'All' | NotificationType>('All');

    const handleMarkAsRead = (notificationId: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        // In a real app, you would also open the related item here
        alert(`Opening details for notification ${notificationId}...`);
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const filteredNotifications = notifications.filter(n => 
        activeFilter === 'All' || n.type === activeFilter
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className=" min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="px-3 py-1 text-sm font-semibold bg-red-500 text-white rounded-full">
                            {unreadCount} New
                        </span>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center border-b border-gray-200 mb-6">
                    {(['All', 'Report', 'Offer', 'Meeting'] as const).map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${
                                activeFilter === filter 
                                ? 'border-b-2 border-blue-600 text-blue-600' 
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                    <button onClick={handleMarkAllRead} className="ml-auto text-xs text-blue-600 font-semibold hover:underline">
                        Mark all as read
                    </button>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? filteredNotifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`relative bg-white p-4 rounded-lg shadow-sm border-l-4 transition-all ${
                                notification.read ? 'border-gray-200' : 'border-blue-500'
                            }`}
                        >
                            {!notification.read && (
                                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                            <div className="flex items-start">
                                <div className="p-3 bg-gray-100 rounded-full mr-4">
                                    {notificationIcons[notification.type]}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-gray-800">{notification.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                                    <p className="text-xs text-gray-400 mt-2">{notification.timestamp}</p>
                                </div>
                                <button 
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="ml-4 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                            <Bell className="mx-auto h-12 w-12 text-gray-300"/>
                            <h3 className="mt-2 text-lg font-semibold text-gray-800">All Caught Up!</h3>
                            <p className="mt-1 text-sm text-gray-500">You have no new notifications in this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientNotificationDashboard;
