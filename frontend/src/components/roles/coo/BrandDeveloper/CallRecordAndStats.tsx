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

// Subtle outcome styles with rectangular rounded tags
const outcomeStyles: Record<CallOutcome, { bg: string; text: string; border: string }> = {
    'Converted': { 
        bg: '#F0FDF4', 
        text: '#059669', 
        border: '#BBF7D0' 
    },
    'Not Interested': { 
        bg: '#FEF2F2', 
        text: '#DC2626', 
        border: '#FECACA' 
    },
    'Follow-up Scheduled': { 
        bg: '#EFF6FF', 
        text: '#2563EB', 
        border: '#BFDBFE' 
    },
};

// --- MAIN COMPONENT ---
const CallRecordsDashboard = () => {
    
    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <h1 className="text-3xl font-bold mb-6" style={{ color: '#0000CC' }}>
                    Dashboard
                </h1>
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Calls Card */}
                    <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">
                                    Total Calls
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {stats.totalCalls}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">This month</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F0F0FF' }}>
                                <Phone className="h-6 w-6" style={{ color: '#0000CC' }}/>
                            </div>
                        </div>
                    </div>

                    {/* Leads Converted Card */}
                    <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">
                                    Leads Converted
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {stats.leadsConverted}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Successful</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50">
                                <CheckCircle className="h-6 w-6 text-green-600"/>
                            </div>
                        </div>
                    </div>

                    {/* Conversion Rate Card */}
                    <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">
                                    Conversion Rate
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {stats.conversionRate}%
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Average rate</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F0F0FF' }}>
                                <TrendingUp className="h-6 w-6" style={{ color: '#0000CC' }}/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Call Performance Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <BarChart3 className="mr-3 h-5 w-5" style={{ color: '#0000CC' }}/>
                                Call Performance (Last 7 Days)
                            </h2>
                        </div>
                        <div className="flex justify-between items-end h-64 pt-4">
                            {stats.callsLast7Days.map((calls, index) => {
                                const maxHeight = Math.max(...stats.callsLast7Days);
                                const heightPercentage = (calls / maxHeight) * 100;
                                return (
                                    <div key={index} className="flex flex-col items-center flex-1">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">
                                            {calls}
                                        </div>
                                        <div 
                                            className="w-10 rounded-t-lg transition-all duration-200 hover:opacity-80" 
                                            style={{
                                                height: `${heightPercentage}%`,
                                                backgroundColor: '#0000CC',
                                                opacity: 0.8,
                                                minHeight: '10px'
                                            }}
                                        ></div>
                                        <div className="text-xs font-medium text-gray-500 mt-3">
                                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Call Log */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Calendar className="mr-3 h-5 w-5" style={{ color: '#0000CC' }}/>
                            Recent Call Log
                        </h2>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {callRecords.map(record => (
                                <div 
                                    key={record.id} 
                                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {record.companyName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <span 
                                        className="inline-block px-3 py-1 text-xs font-semibold rounded-md border"
                                        style={{
                                            backgroundColor: outcomeStyles[record.outcome].bg,
                                            color: outcomeStyles[record.outcome].text,
                                            borderColor: outcomeStyles[record.outcome].border
                                        }}
                                    >
                                        {record.outcome}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallRecordsDashboard;
