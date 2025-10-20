import React, { useState, useMemo, useEffect } from 'react';
import { Users, Zap, Briefcase, BarChart3 } from 'lucide-react';

// --- HELPER FUNCTION: Score/Value Formatting ---
// Used by KPICard when isScore=false (e.g., for Manager Name, Role)
const formatValue = (value: any) => {
    // Keeping a placeholder function for generic text/number formatting
    if (typeof value === 'number') {
        return value.toFixed(1);
    }
    return value;
};

// --- STATIC MOCK PERFORMANCE DATA ---
const PERFORMANCE_DATA = [
    // CEO/Top Leaders
    { id: 'ceo_1', name: 'John Doe', role: 'CEO', score: 85.5, managerId: null, performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 80 + Math.random() * 10 })) },
    { id: 'coo_1', name: 'Alice Smith', role: 'COO', score: 78.2, managerId: 'ceo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 75 + Math.random() * 8 })) },
    { id: 'cmo_1', name: 'Bob Johnson', role: 'CMO', score: 65.9, managerId: 'ceo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 60 + Math.random() * 10 })) },
    { id: 'cto_1', name: 'Carol Williams', role: 'CTO', score: 92.1, managerId: 'ceo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 90 + Math.random() * 5 })) },
    { id: 'cfo_1', name: 'David Brown', role: 'CFO', score: 88.8, managerId: 'ceo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 85 + Math.random() * 7 })) },
    { id: 'hr_1', name: 'Eve Davis', role: 'HR', score: 72.5, managerId: 'ceo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 70 + Math.random() * 6 })) },

    // COO -> Project Managers
    { id: 'pm_a', name: 'Mike Green', role: 'PM', score: 85.0, managerId: 'coo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 80 + Math.random() * 10 })) },
    { id: 'pm_b', name: 'Sara Lee', role: 'PM', score: 70.3, managerId: 'coo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 65 + Math.random() * 10 })) },
    { id: 'pm_c', name: 'Tom Hardy', role: 'PM', score: 95.8, managerId: 'coo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 90 + Math.random() * 8 })) },

    // CMO -> Business Developers
    { id: 'bd_a', name: 'Jenna Ross', role: 'BD', score: 60.1, managerId: 'cmo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 55 + Math.random() * 10 })) },
    { id: 'bd_b', name: 'Kevin Hart', role: 'BD', score: 75.7, managerId: 'cmo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 70 + Math.random() * 8 })) },
    { id: 'bd_c', name: 'Liam Neeson', role: 'BD', score: 90.4, managerId: 'cmo_1', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 85 + Math.random() * 10 })) },

    // PM -> Brand Heads
    { id: 'bh_1', name: 'Oscar Wilde', role: 'BH', score: 90.0, managerId: 'pm_a', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 88 + Math.random() * 5 })) },
    { id: 'bh_2', name: 'Phoebe Buffay', role: 'BH', score: 80.6, managerId: 'pm_a', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 78 + Math.random() * 5 })) },
    { id: 'bh_3', name: 'Quinn Fabray', role: 'BH', score: 65.2, managerId: 'pm_c', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 60 + Math.random() * 10 })) },

    // BD -> Tele People
    { id: 'tele_1', name: 'Ryan Gosling', role: 'Tele', score: 70.9, managerId: 'bd_b', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 65 + Math.random() * 8 })) },
    { id: 'tele_2', name: 'Scarlett Johansson', role: 'Tele', score: 95.3, managerId: 'bd_c', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 90 + Math.random() * 5 })) },
    { id: 'tele_3', name: 'Trent Reznor', role: 'Tele', score: 55.4, managerId: 'bd_c', performanceHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: 50 + Math.random() * 10 })) },
];


// --- COMMON COMPONENTS ---

// KPI CARD COMPONENT
const KPICard = ({ title, value, icon: Icon, color, isScore = false }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-xl transition-all hover:shadow-2xl border-b-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <Icon className="h-6 w-6" style={{ color: color }} />
        </div>
        <div className="mt-2 flex flex-col">
            <div className="text-3xl font-extrabold text-gray-900">
                {isScore ? `${value.toFixed(1)}/100` : formatValue(value)}
            </div>
        </div>
    </div>
);

// --- PERFORMANCE LINE GRAPH (Displays individual user score history) ---
const PerformanceLineGraph = ({ data, userName }: any) => {
    const chartWidth = 600;
    const chartHeight = 300;
    const padding = 30;

    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 overflow-x-auto">
            <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" /> 
                {userName}'s Monthly Performance Score
            </h3>
            
            <div className="relative" style={{ minWidth: '300px', width: '100%', height: `${chartHeight + padding}px` }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight + padding}`} className="block h-full w-full">
                    {useMemo(() => {
                        const maxVal = 100;
                        const minVal = 0;
                        const valueRange = maxVal - minVal;
                        const xStep = (chartWidth - 2 * padding) / (data.length - 1);

                        const scaleY = (value: number) => 
                            chartHeight - padding - ((value - minVal) / valueRange) * (chartHeight - 2 * padding);
                        const scaleX = (index: number) => padding + index * xStep;

                        const points = data.map((d: any, i: number) => 
                            `${scaleX(i)},${scaleY(d.value)}`
                        ).join(' ');

                        // Calculate grid lines (Y-axis)
                        const yGridLines = [20, 40, 60, 80, 100].map(value => ({
                            y: scaleY(value),
                            label: value,
                        }));

                        return (
                            <g>
                                {/* Y-Axis Grid Lines */}
                                {yGridLines.map((line, i) => (
                                    <g key={i}>
                                        <line x1={padding} y1={line.y} x2={chartWidth - padding} y2={line.y} 
                                              stroke="#e5e7eb" strokeDasharray="4 4" />
                                        <text x={padding - 5} y={line.y + 4} textAnchor="end" fontSize="10" fill="#6b7280">{line.label}</text>
                                    </g>
                                ))}
                                
                                {/* X-Axis Labels (Months) */}
                                {data.map((d: any, i: number) => (
                                    <text key={i} x={scaleX(i)} y={chartHeight} textAnchor="middle" fontSize="10" fill="#6b7280">
                                        {d.month}
                                    </text>
                                ))}

                                {/* Area Fill */}
                                <polyline fill="url(#areaGradient)" points={`${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`} />

                                {/* Line */}
                                <polyline fill="none" stroke="#4f46e5" strokeWidth="3" points={points} />

                                {/* Data Points */}
                                {data.map((d: any, i: number) => (
                                    <circle key={i} cx={scaleX(i)} cy={scaleY(d.value)} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="2" />
                                ))}
                            </g>
                        );
                    }, [data])}

                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
};


// --- PERFORMANCE DASHBOARD COMPONENT ---
const PerformanceDashboard = ({ performanceData, selectUser, selectedUser }: any) => {

    // Level 0: Top Leaders (COO, CMO, etc.)
    const allPersonnel = useMemo(() => {
        const leaders = performanceData.filter((p: any) => ['COO', 'CMO', 'CTO', 'CFO', 'HR'].includes(p.role));
        // Sort leaders by score (low to high)
        return leaders.sort((a: any, b: any) => a.score - b.score);
    }, [performanceData]);

    // Level 1: PMs for COO, BDs for CMO (or generic for others)
    const level1Personnel = useMemo(() => {
        if (!selectedUser.leader) return [];
        let filtered = performanceData.filter((p: any) => p.managerId === selectedUser.leader.id);
        
        if (selectedUser.leader.role === 'COO') {
            filtered = filtered.filter((p: any) => p.role === 'PM');
        } else if (selectedUser.leader.role === 'CMO') {
            filtered = filtered.filter((p: any) => p.role === 'BD');
        } else {
            // CTO/CFO/HR: Show all direct reports (PMs or BDs)
            filtered = filtered.filter((p: any) => ['PM', 'BD'].includes(p.role));
        }
        return filtered.sort((a: any, b: any) => a.score - b.score); // Low to high
    }, [performanceData, selectedUser.leader]);

    // Level 2: BHs for PMs, Tele for BDs
    const level2Personnel = useMemo(() => {
        if (!selectedUser.level1) return [];
        let filtered = performanceData.filter((p: any) => p.managerId === selectedUser.level1.id);
        if (selectedUser.level1.role === 'PM') {
            filtered = filtered.filter((p: any) => p.role === 'BH');
        } else if (selectedUser.level1.role === 'BD') {
            filtered = filtered.filter((p: any) => p.role === 'Tele');
        }
        return filtered.sort((a: any, b: any) => a.score - b.score); // Low to high
    }, [performanceData, selectedUser.level1]);

    // The user whose graph/KPIs are currently displayed
    const activeUser = selectedUser.level2 || selectedUser.level1 || selectedUser.leader;

    const renderUserList = (users: any[], level: number) => (
        <div className="flex flex-wrap gap-3 mt-4">
            {users.map((user: any) => (
                <button
                    key={user.id}
                    onClick={() => selectUser(user, level)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-md flex items-center space-x-2 
                        ${(level === 0 && selectedUser.leader?.id === user.id) || 
                          (level === 1 && selectedUser.level1?.id === user.id) || 
                          (level === 2 && selectedUser.level2?.id === user.id)
                            ? 'bg-purple-600 text-white ring-4 ring-purple-300'
                            : 'bg-gray-100 text-gray-800 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                >
                    <Briefcase className="w-4 h-4" />
                    <span>{user.name} ({user.role})</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.score < 70 ? 'bg-red-200 text-red-800' : (user.score < 85 ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800')}`}>
                        {user.score.toFixed(1)}
                    </span>
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Level 0: Leadership Filter (COO, CMO, etc.) */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Executive Leadership Performance (Sorted Low to High)
                </h2>
                <p className="text-sm text-gray-500 mt-1">Select a leader to drill down into their team's performance.</p>
                {renderUserList(allPersonnel, 0)}
            </div>
            
            {/* Level 1: Manager/Developer Filter (PMs or BDs) */}
            {selectedUser.leader && (
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-blue-600" />
                        {selectedUser.leader.role} Team - Level 1 Personnel (Sorted Low to High)
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Personnel reporting directly to {selectedUser.leader.name}.</p>
                    {renderUserList(level1Personnel, 1)}
                </div>
            )}

            {/* Level 2: Execution Filter (BHs or Tele) */}
            {selectedUser.level1 && level2Personnel.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                        {selectedUser.level1.role} Team - Level 2 Personnel (Sorted Low to High)
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Personnel managed by {selectedUser.level1.name}.</p>
                    {renderUserList(level2Personnel, 2)}
                </div>
            )}

            {/* Performance Graph Area */}
            <div className="pt-4">
                {activeUser ? (
                    <>
                        <h2 className="text-2xl font-extrabold text-indigo-700 mb-6">
                            Performance Analysis: {activeUser.name} ({activeUser.role})
                        </h2>
                        {/* KPIs for the selected user */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <KPICard title="Current Score" value={activeUser.score} icon={Zap} color="#6366F1" isScore={true} />
                            <KPICard title="Role" value={activeUser.role} icon={Briefcase} color="#FBBF24" isScore={false} />
                            <KPICard title="Manager" value={activeUser.managerId ? performanceData.find((p: any) => p.id === activeUser.managerId)?.name || 'N/A' : 'CEO'} icon={Users} color="#10B981" isScore={false} />
                        </div>
                        {/* Performance Graph for the selected user */}
                        <PerformanceLineGraph data={activeUser.performanceHistory} userName={activeUser.name} />
                    </>
                ) : (
                    <div className="text-center p-12 bg-white rounded-xl shadow-lg">
                        <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg text-gray-500">Select an executive or team member above to view their detailed performance graph and metrics.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- MAIN EXECUTIVE DASHBOARD COMPONENT (Simplified) ---
const ExecutiveDashboard = () => {
    const [performanceData] = useState<any[]>(PERFORMANCE_DATA);

    const [selectedUser, setSelectedUser] = useState<any>({
        leader: null, 
        level1: null, 
        level2: null, 
    });

    // --- User Selection Logic ---
    const selectUser = (user: any, level: number) => {
        let newSelection: any = { leader: null, level1: null, level2: null };
        const data = PERFORMANCE_DATA; 

        if (level === 0) { // Selecting Leader (COO, CMO, etc.)
            newSelection.leader = user;
            // Find lowest scoring Level 1 to auto-select (to demonstrate drill-down)
            const nextLevel1 = data.filter(p => p.managerId === user.id && ['PM', 'BD'].includes(p.role)).sort((a,b) => a.score - b.score)[0];
            
            if (nextLevel1) {
                 newSelection.level1 = nextLevel1;
                 // Find lowest scoring Level 2 to auto-select
                 const nextLevel2 = data.filter(p => p.managerId === nextLevel1.id && ['BH', 'Tele'].includes(p.role)).sort((a,b) => a.score - b.score)[0];
                 if (nextLevel2) {
                    newSelection.level2 = nextLevel2;
                 }
            } else {
                newSelection.level1 = null;
                newSelection.level2 = null;
            }

        } else if (level === 1) { // Selecting Level 1 (PM, BD)
            newSelection.leader = selectedUser.leader;
            newSelection.level1 = user;
            // Find lowest scoring Level 2 to auto-select
            const nextLevel2 = data.filter(p => p.managerId === user.id && ['BH', 'Tele'].includes(p.role)).sort((a,b) => a.score - b.score)[0];
            if (nextLevel2) {
                newSelection.level2 = nextLevel2;
            } else {
                newSelection.level2 = null;
            }

        } else if (level === 2) { // Selecting Level 2 (BH, Tele)
            newSelection = { ...selectedUser, level2: user };
        }
        
        setSelectedUser(newSelection);
    };
    
    // Auto-select the COO on initial load
    useEffect(() => {
        if (performanceData.length > 0 && !selectedUser.leader) {
            const coo = performanceData.find(p => p.role === 'COO');
            if (coo) {
                selectUser(coo, 0); 
            }
        }
    }, []); 


    return (
        <div className="min-h-screen bg-gray-50 sm:p-8 font-sans">
            <style>{`
                .overflow-x-auto { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            `}</style>
            <div className="max-w-7xl mx-auto space-y-6">
                
                <header className="border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-indigo-800 drop-shadow-sm mb-4 flex items-center">
                        <Users className="w-7 h-7 inline mr-3 align-text-bottom text-purple-600" />
                        Executive Team Performance Hierarchy
                    </h1>
                </header>

                <PerformanceDashboard 
                    performanceData={performanceData}
                    selectUser={selectUser}
                    selectedUser={selectedUser}
                />
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
