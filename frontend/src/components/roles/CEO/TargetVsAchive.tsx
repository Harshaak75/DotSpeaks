import { useState, useMemo } from 'react';
import { Target, TrendingUp, TrendingDown, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

// --- MOCK DATA FOR TARGETS AND ACHIEVEMENTS ---
const TARGET_DATA: any = {
    2024: {
        annualTarget: 180000000,
        quarters: [
            { id: 'Q1', label: 'Q1 2024', target: 40000000, achieved: 42500000, note: "Strong market entry campaign boosted Q1 performance above targets." },
            { id: 'Q2', label: 'Q2 2024', target: 45000000, achieved: 41000000, note: "Seasonal dips in client acquisition led to a slight miss despite cost control." },
            { id: 'Q3', label: 'Q3 2024', target: 45000000, achieved: 49200000, note: "Major contract renewal and effective cross-selling resulted in an excellent Q3." },
            { id: 'Q4', label: 'Q4 2024', target: 50000000, achieved: 48000000, note: "End-of-year holidays slightly impacted deal closing speed, leading to a minor shortfall." },
        ]
    },
    2023: {
        annualTarget: 150000000,
        quarters: [
            { id: 'Q1', label: 'Q1 2023', target: 35000000, achieved: 32000000, note: "Unexpected rise in raw material costs compressed margins." },
            { id: 'Q2', label: 'Q2 2023', target: 37500000, achieved: 38500000, note: "Efficient supply chain management allowed us to slightly exceed expectations." },
            { id: 'Q3', label: 'Q3 2023', target: 37500000, achieved: 36000000, note: "A competitor's aggressive pricing strategy impacted market share." },
            { id: 'Q4', label: 'Q4 2023', target: 40000000, achieved: 41000000, note: "Successful holiday marketing campaign ensured a strong finish to the year." },
        ]
    }
};

// --- HELPER FUNCTION: Currency Formatting (Cr) ---
const formatCurrency = (value: any) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 10000000) {
        return `${sign}₹${(absValue / 10000000).toFixed(2)} Cr`;
    }
    if (absValue >= 100000) {
        return `${sign}₹${(absValue / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
};

// --- HELPER FUNCTION: GENERATE WEEKLY DATA ---
const generateWeeklyData = (quarters: any) => {
    const weeksPerQuarter = 13;
    const allWeeks: any = [];
    let weekCounter = 1;

    quarters.forEach((q: any) => {
        const weeklyTarget = q.target / weeksPerQuarter;
        const weeklyAchieved = q.achieved / weeksPerQuarter;
        
        for (let i = 1; i <= weeksPerQuarter; i++) {
            allWeeks.push({
                id: `${q.id}-W${i}`,
                label: `W${weekCounter++}`,
                target: weeklyTarget,
                achieved: weeklyAchieved,
                note: `Weekly average based on ${q.label} performance. ${q.note}`, 
                quarterLabel: q.label,
                quarterId: q.id
            });
        }
    });

    return allWeeks;
};

// --- KPI CARD COMPONENT ---
const KPICard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-xl transition-all hover:shadow-2xl border-b-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <Icon className="h-6 w-6" style={{ color: color }} />
        </div>
        <div className="mt-2 flex flex-col">
            <div className="text-3xl font-extrabold text-gray-900">{formatCurrency(value)}</div>
        </div>
    </div>
);

// --- INTERACTIVE TARGET VS. ACHIEVED BAR CHART ---
const TargetAchievementChart = ({ data, year, view }: any) => {
    const [hoveredItem, setHoveredItem] = useState<any>(null);
    const chartHeight = 350;
    const padding = 20;

    const maxVal = useMemo(() => {
        const allValues = data.flatMap((item: any) => [item.target, item.achieved]);
        return Math.max(...allValues, 10000000); 
    }, [data]);
    
    const scale = (chartHeight - 2 * padding) / maxVal;

    const getBarHeight = (value: any) => Math.min(chartHeight, value * scale);
    
    const yAxisLabels = useMemo(() => {
        const labels = [];
        const numLabels = 5;
        const step = maxVal / numLabels;
        for (let i = 0; i <= numLabels; i++) {
            const value = Math.round(maxVal - i * step);
            const y = padding + (i / numLabels) * (chartHeight - 2 * padding);
            labels.push({ value, y, label: formatCurrency(value).replace('₹', '') });
        }
        return labels;
    }, [maxVal, chartHeight, padding]);

    const barWidth = view === 'weekly' ? 35 : 100 / data.length;
    const chartAreaWidth = view === 'weekly' ? data.length * 35 : '100%';

    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl border-l-4 relative" style={{ borderLeftColor: '#0000CC' }}>
            <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
                <Target className="h-5 w-5 mr-2" style={{ color: '#0000CC' }} /> 
                {view === 'weekly' ? 'Weekly Revenue Performance' : 'Quarterly Revenue Performance'} ({year})
            </h3>
            
            <div className="flex relative overflow-x-auto pb-4" style={{ height: `${chartHeight + 50}px` }}> 
                
                <div className="w-20 h-full text-right text-xs text-gray-500 pr-3 relative flex-shrink-0 pt-3">
                    {yAxisLabels.map((label, index) => (
                        <div key={index}>
                            <div className="absolute -translate-y-1/2 font-semibold" style={{ top: `${label.y}px` }}>
                                {label.label.replace(' Cr', '').replace(' L', '')}
                            </div>
                            <div className={`absolute w-full border-t border-gray-200 ${label.value === 0 ? 'border-gray-400' : ''}`} style={{ top: `${label.y}px`, right: '-3px' }}></div>
                        </div>
                    ))}
                    <div className="absolute -bottom-1 left-0 text-gray-700 font-bold">Value (Cr/L)</div>
                </div>

                <div 
                    className="relative border-l border-gray-300 ml-1 flex-1"
                    style={{ width: chartAreaWidth }} 
                >
                    <div className="flex w-full h-full relative z-20 justify-around">
                        {data.map((item: any, index: number) => {
                            const targetHeight = getBarHeight(item.target);
                            const achievedHeight = getBarHeight(item.achieved);

                            const exceeded = item.achieved >= item.target;
                            const achievedColorClass = exceeded ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600';

                            const isHovered = hoveredItem?.id === item.id;

                            return (
                                <div 
                                    key={item.id || index}
                                    className={`absolute cursor-pointer h-full p-1 flex justify-center`}
                                    style={{ 
                                        left: view === 'weekly' ? `${index * barWidth}px` : `${index * barWidth}%`, 
                                        width: view === 'weekly' ? `${barWidth}px` : `${barWidth}%`, 
                                        minWidth: '35px' 
                                    }}
                                    onMouseEnter={() => setHoveredItem(item)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <div className={`flex w-full space-x-[2px] items-end h-full relative 
                                                     transition-transform duration-300 ${isHovered ? 'translate-y-[-5px]' : ''}`}>
                                        
                                        {/* Target Bar (Left) - Blue */}
                                        <div 
                                            style={{ height: `${targetHeight}px`, background: 'linear-gradient(to top, #0000CC, #3B82F6)' }}
                                            className={`w-1/2 opacity-80 transition-all duration-300 rounded-t-md 
                                                        shadow-lg ${isHovered ? 'shadow-xl' : ''}`}
                                        ></div>

                                        {/* Achieved Bar (Right) */}
                                        <div 
                                            style={{ height: `${achievedHeight}px` }}
                                            className={`w-1/2 bg-gradient-to-t ${achievedColorClass} 
                                                        transition-all duration-300 rounded-t-md 
                                                        shadow-xl ${isHovered ? 'shadow-2xl' : ''}`}
                                        ></div>

                                        {/* Status Icon */}
                                        <div className="absolute top-0 right-0 -mr-1 -mt-2">
                                            {exceeded 
                                                ? <CheckCircle className="h-4 w-4 text-green-600 bg-white rounded-full shadow-md p-[1px]" />
                                                : <XCircle className="h-4 w-4 text-red-600 bg-white rounded-full shadow-md p-[1px]" />
                                            }
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex pt-2 border-t border-gray-300 ml-20" style={{ width: chartAreaWidth }}>
                {data.map((item: any) => (
                    <div 
                        key={item.id || item.label} 
                        className="text-[10px] font-bold text-gray-700 text-center flex-1 p-1"
                         style={{ 
                            width: view === 'weekly' ? `${barWidth}px` : `${barWidth}%`, 
                            minWidth: '35px' 
                        }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Tooltip */}
            {hoveredItem && (
                <div 
                    className="absolute top-4 right-4 p-4 bg-white rounded-xl shadow-2xl z-30 w-80 transition-opacity duration-200 border-2"
                    style={{ pointerEvents: 'none', borderColor: '#0000CC' }}
                >
                    <h4 className="font-bold text-lg mb-2 flex items-center" style={{ color: '#0000CC' }}>
                        <Clock className="h-4 w-4 mr-2" style={{ color: '#0000CC' }} /> 
                        
                        {view === 'weekly' ? (
                            <>
                                {hoveredItem.quarterLabel} / {hoveredItem.label} 
                                <span className="text-sm font-normal text-gray-500 ml-2">(7-Day Period)</span>
                            </>
                        ) : (
                            <>{hoveredItem.label} Performance</>
                        )}
                    </h4>
                    <div className="space-y-1">
                        <p className="text-sm flex justify-between">
                            <span className="font-semibold" style={{ color: '#0000CC' }}>Target Revenue:</span>
                            <span>{formatCurrency(hoveredItem.target)}</span>
                        </p>
                        <p className={`text-sm flex justify-between ${hoveredItem.achieved >= hoveredItem.target ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="font-semibold">Achieved Revenue:</span>
                            <span>{formatCurrency(hoveredItem.achieved)}</span>
                        </p>
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm font-bold flex justify-between">
                                <span className="text-gray-700">Variance:</span>
                                <span className={hoveredItem.achieved - hoveredItem.target >= 0 ? 'text-green-700' : 'text-red-700'}>
                                    {formatCurrency(hoveredItem.achieved - hoveredItem.target)}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 text-xs p-2 bg-blue-50 rounded-lg border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                        <span className="font-semibold text-gray-700">Note:</span> {hoveredItem.note}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex justify-center mt-4 space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(to top, #0000CC, #3B82F6)' }}></div>
                    <span>Target</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-t from-green-400 to-green-600 rounded-full"></div>
                    <span>Achieved (&gt; Target)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-t from-red-400 to-red-600 rounded-full"></div>
                    <span>Achieved (&lt; Target)</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN CEO DASHBOARD COMPONENT ---
const TargetVsAchive = () => {
    const years = useMemo(() => Object.keys(TARGET_DATA).map(Number).sort((a, b) => b - a), []);
    const [selectedYear, setSelectedYear] = useState(years[0]);
    const [view, setView] = useState('quarterly'); 
    const [selectedFilter, setSelectedFilter] = useState('all'); 

    const currentYearData = useMemo(() => TARGET_DATA[selectedYear], [selectedYear]);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        setSelectedFilter('all'); 
    };

    const handleViewChange = (newView: string) => {
        setView(newView);
        setSelectedFilter('all'); 
    };

    const allQuarterFilters = ['all', 'Q1', 'Q2', 'Q3', 'Q4'];
    const specificWeekFilters = ['W1', 'W2', 'W3', 'W4'];

    const filterOptions = useMemo(() => {
        if (view === 'quarterly') {
            return allQuarterFilters;
        } else {
            return [...allQuarterFilters, ...specificWeekFilters];
        }
    }, [view]);

    const dataToShow = useMemo(() => {
        let data: any;

        if (view === 'weekly') {
            data = generateWeeklyData(currentYearData.quarters);
            
            if (selectedFilter === 'all') {
                return data;
            } else if (selectedFilter.startsWith('Q')) {
                return data.filter((item: any) => item.quarterId === selectedFilter);
            } else if (selectedFilter.startsWith('W')) {
                return data.filter((item: any) => item.label === selectedFilter);
            }
            return data;
            
        } else {
            data = currentYearData.quarters;

            if (selectedFilter !== 'all') {
                return data.filter((item: any) => item.id === selectedFilter);
            }
            return data;
        }
    }, [view, currentYearData, selectedFilter]);

    const totalAchieved = useMemo(() => 
        currentYearData.quarters.reduce((sum: any, q: any) => sum + q.achieved, 0), [currentYearData]);

    const annualVariance = totalAchieved - currentYearData.annualTarget;
    const isTargetAchieved = annualVariance >= 0;

    const overallPerformanceNote = useMemo(() => {
        const achievedVsTarget = (totalAchieved / currentYearData.annualTarget) * 100;
        let note = `The company achieved **${achievedVsTarget.toFixed(2)}%** of the annual target. `;
        
        if (isTargetAchieved) {
            note += `This success was driven by **strong Q3 performance** and effective cost management. The proactive sales strategy in the first half set a solid foundation.`;
        } else {
            note += `The shortfall was primarily due to **Q2's miss** and a minor miss in Q4. Focus must shift to stabilizing acquisition funnels during seasonal lows and ensuring Q4 closes all pipeline deals.`;
        }
        return note;
    }, [isTargetAchieved, totalAchieved, currentYearData]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <style>{`
                .overflow-x-auto {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
            `}</style>
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header and View Filters */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <h1 className="text-3xl font-extrabold drop-shadow-sm" style={{ color: '#0000CC' }}>
                        Annual Revenue Target Review
                    </h1>
                    <div className="flex flex-wrap items-center space-x-4 mt-4 sm:mt-0">
                        
                        {/* Year Filter */}
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Year:</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
                                className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 transition-all font-semibold"
                                style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* View Filter */}
                        <div className="flex space-x-2 mt-2 sm:mt-0 bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => handleViewChange('quarterly')}
                                className={`p-2 px-4 text-sm rounded-lg font-bold transition-colors shadow-md ${
                                    view === 'quarterly' ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                style={view === 'quarterly' ? { backgroundColor: '#0000CC' } : {}}
                            >
                                Quarterly View
                            </button>
                            <button 
                                onClick={() => handleViewChange('weekly')}
                                className={`p-2 px-4 text-sm rounded-lg font-bold transition-colors shadow-md ${
                                    view === 'weekly' ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                style={view === 'weekly' ? { backgroundColor: '#0000CC' } : {}}
                            >
                                Weekly View
                            </button>
                        </div>
                    </div>
                </header>

                {/* Filter Bar */}
                <div className="flex justify-start flex-wrap gap-2 p-3 bg-white rounded-xl shadow-lg border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                    {filterOptions.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className={`px-4 py-2 text-xs rounded-lg font-bold transition-colors shadow-sm whitespace-nowrap ${
                                selectedFilter === filter
                                    ? 'text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={selectedFilter === filter ? { backgroundColor: '#0000CC' } : {}}
                        >
                            {filter === 'all' ? 'All Data' : filter}
                        </button>
                    ))}
                    <span className="text-xs text-gray-500 self-center ml-4 hidden sm:inline-block">
                        * {view === 'quarterly' ? 'Q1-Q4 filter by Quarter.' : 'Q1-Q4 filter by 13 weeks; W1-W4 filter by individual week (7 days).'}
                    </span>
                </div>

                {/* KPI Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard 
                        title={`Total Target Revenue (${selectedYear})`} 
                        value={currentYearData.annualTarget} 
                        icon={Target} 
                        color="#0000CC"
                    />
                    <KPICard 
                        title={`Total Achieved Revenue (${selectedYear})`} 
                        value={totalAchieved} 
                        icon={CheckCircle} 
                        color={isTargetAchieved ? "#10B981" : "#F59E0B"}
                    />
                    <KPICard 
                        title="Annual Variance" 
                        value={annualVariance} 
                        icon={annualVariance >= 0 ? TrendingUp : TrendingDown} 
                        color={annualVariance >= 0 ? "#10B981" : "#EF4444"}
                    />
                </div>

                {/* Main Graph */}
                <TargetAchievementChart data={dataToShow} year={selectedYear} view={view} />
                
                {/* Performance Summary */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4" style={{ borderColor: isTargetAchieved ? '#10B981' : '#EF4444' }}>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                        Executive Review: {selectedYear} Performance Summary
                    </h2>
                    <div className="flex items-start space-x-4">
                        {isTargetAchieved 
                            ? <TrendingUp className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                            : <TrendingDown className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                        }
                        <p className="mt-1 text-gray-600" dangerouslySetInnerHTML={{ __html: overallPerformanceNote }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TargetVsAchive;
