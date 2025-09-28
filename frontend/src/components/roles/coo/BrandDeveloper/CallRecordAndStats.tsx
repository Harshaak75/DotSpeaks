import React, { useState } from 'react';
import { 
    Phone, 
    CheckCircle,
    TrendingUp,
    BarChart3,
    Calendar
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type CallOutcome = 'Converted' | 'Not Interested' | 'Follow-up Scheduled';

interface CallRecord {
    id: string;
    companyName: string;
    date: string;
    outcome: CallOutcome;
}

// --- MOCK DATA ---
const callRecords: CallRecord[] = [
    { id: 'call-1', companyName: 'Eco Solutions', date: '2025-08-01', outcome: 'Converted' },
    { id: 'call-2', companyName: 'Tech Giants', date: '2025-07-30', outcome: 'Not Interested' },
    { id: 'call-3', companyName: 'Innovate Inc.', date: '2025-08-02', outcome: 'Follow-up Scheduled' },
    { id: 'call-4', companyName: 'Future Gadgets', date: '2025-08-02', outcome: 'Converted' },
    { id: 'call-5', companyName: 'Data Systems', date: '2025-08-03', outcome: 'Follow-up Scheduled' },
    { id: 'call-6', companyName: 'Global Net', date: '2025-08-04', outcome: 'Not Interested' },
    { id: 'call-7', companyName: 'Pioneer Tech', date: '2025-08-04', outcome: 'Converted' },
];

const stats = {
    totalCalls: 124,
    leadsConverted: 18,
    conversionRate: 14.5,
    callsLast7Days: [12, 18, 15, 22, 17, 10, 20] // Mon to Sun
};

const outcomeStyles: Record<CallOutcome, string> = {
    'Converted': 'bg-green-100 text-green-800',
    'Not Interested': 'bg-red-100 text-red-800',
    'Follow-up Scheduled': 'bg-blue-100 text-blue-800',
};

// --- MAIN COMPONENT ---
const CallRecordsDashboard = () => {
    
    return (
        <div className=" bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full"><Phone className="h-6 w-6 text-blue-600"/></div>
                        <p className="ml-4 text-sm font-medium text-gray-500">Total Calls (This Month)</p>
                    </div>
                    <p className="mt-4 text-4xl font-bold text-gray-800">{stats.totalCalls}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full"><CheckCircle className="h-6 w-6 text-green-600"/></div>
                        <p className="ml-4 text-sm font-medium text-gray-500">Leads Converted</p>
                    </div>
                    <p className="mt-4 text-4xl font-bold text-gray-800">{stats.leadsConverted}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full"><TrendingUp className="h-6 w-6 text-purple-600"/></div>
                        <p className="ml-4 text-sm font-medium text-gray-500">Conversion Rate</p>
                    </div>
                    <p className="mt-4 text-4xl font-bold text-gray-800">{stats.conversionRate}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Call Performance Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><BarChart3 className="mr-3 text-blue-600"/>Call Performance (Last 7 Days)</h2>
                    <div className="flex justify-between items-end h-64 pt-4">
                        {stats.callsLast7Days.map((calls, index) => {
                            const maxHeight = Math.max(...stats.callsLast7Days);
                            const heightPercentage = (calls / maxHeight) * 100;
                            return (
                                <div key={index} className="flex flex-col items-center w-1/7">
                                    <div className="text-sm font-semibold text-gray-700">{calls}</div>
                                    <div className="w-8 bg-blue-200 rounded-t-lg" style={{height: `${heightPercentage}%`}}></div>
                                    <div className="text-xs font-medium text-gray-500 mt-2">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Call Log */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Calendar className="mr-3 text-blue-600"/>Recent Call Log</h2>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {callRecords.map(record => (
                            <div key={record.id} className="p-3 bg-gray-50 rounded-lg border">
                                <p className="font-semibold text-gray-800">{record.companyName}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${outcomeStyles[record.outcome]}`}>
                                        {record.outcome}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallRecordsDashboard;
