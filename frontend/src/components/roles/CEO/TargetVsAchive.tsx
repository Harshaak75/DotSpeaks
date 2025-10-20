import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, TrendingDown, Calendar, CheckCircle, XCircle, Grid, Clock } from 'lucide-react';

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
/**
 * Distributes quarterly data evenly across 13 weeks to simulate weekly performance.
 * Also includes quarter ID for filtering.
 * @param quarters - Array of quarterly data objects.
 * @returns Array of 52 weekly data objects.
 */
const generateWeeklyData = (quarters: any) => {
    const weeksPerQuarter = 13;
    const allWeeks: any = [];
    let weekCounter = 1; // Sequential week number 1 to 52

    quarters.forEach((q: any) => {
        // Distribute quarter data evenly across 13 weeks
        const weeklyTarget = q.target / weeksPerQuarter;
        const weeklyAchieved = q.achieved / weeksPerQuarter;
        
        for (let i = 1; i <= weeksPerQuarter; i++) {
            allWeeks.push({
                id: `${q.id}-W${i}`,
                label: `W${weekCounter++}`, // 'W1', 'W2', ... 'W52'
                target: weeklyTarget,
                achieved: weeklyAchieved,
                note: `Weekly average based on ${q.label} performance. ${q.note}`, 
                quarterLabel: q.label, // Q1 2024
                quarterId: q.id // Q1, Q2, Q3, Q4 (used for filtering)
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

    // 1. Calculate Max Value for Scaling (Target or Achieved)
    const maxVal = useMemo(() => {
        // Find max value across all data points (quarters or weeks)
        const allValues = data.flatMap((item: any) => [item.target, item.achieved]);
        // Use 1Cr (10,000,000) as a minimum scale if values are small
        return Math.max(...allValues, 10000000); 
    }, [data]);
    
    // 2. Calculate Scale
    const scale = (chartHeight - 2 * padding) / maxVal;

    const getBarHeight = (value: any) => Math.min(chartHeight, value * scale);
    
    // 3. Y-Axis Label Positions
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

    // Use a fixed width per bar for the scrollable weekly view, and dynamic width for quarterly
    const barWidth = view === 'weekly' ? 35 : 100 / data.length;
    const chartAreaWidth = view === 'weekly' ? data.length * 35 : '100%';

    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 relative">
            <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" /> 
                {view === 'weekly' ? 'Weekly Revenue Performance' : 'Quarterly Revenue Performance'} ({year})
            </h3>
            
            {/* Chart Area Container */}
            <div className="flex relative overflow-x-auto pb-4" style={{ height: `${chartHeight + 50}px` }}> 
                
                {/* 1. Y-Axis Labels/Guides Area (Fixed width) */}
                <div className="w-20 h-full text-right text-xs text-gray-500 pr-3 relative flex-shrink-0 pt-3">
                    {yAxisLabels.map((label, index) => (
                        <div key={index}>
                            <div className="absolute -translate-y-1/2 font-semibold" style={{ top: `${label.y}px` }}>
                                {label.label.replace(' Cr', '').replace(' L', '')}
                            </div>
                            {/* Grid Line */}
                            <div className={`absolute w-full border-t border-gray-200 ${label.value === 0 ? 'border-gray-400' : ''}`} style={{ top: `${label.y}px`, right: '-3px' }}></div>
                        </div>
                    ))}
                    <div className="absolute -bottom-1 left-0 text-gray-700 font-bold">Value (Cr/L)</div>
                </div>

                {/* 2. Main Chart Area - Dynamic width for weekly view */}
                <div 
                    className="relative border-l border-gray-300 ml-1 flex-1"
                    style={{ width: chartAreaWidth }} 
                >
                    <div className="flex w-full h-full relative z-20 justify-around">
                        {data.map((item: any, i: any) => {
                            // Calculate heights
                            const targetHeight = getBarHeight(item.target);
                            const achievedHeight = getBarHeight(item.achieved);

                            // Determine achievement status for color
                            const exceeded = item.achieved >= item.target;
                            const achievedColorClass = exceeded ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600';
                            const targetColorClass = 'from-blue-400 to-blue-600';

                            const isHovered = hoveredItem?.id === item.id;

                            return (
                                <div 
                                    key={item.id || i} // Use unique ID for key
                                    className={`absolute cursor-pointer h-full p-1 flex justify-center`}
                                    style={{ 
                                        left: view === 'weekly' ? `${i * barWidth}px` : `${i * barWidth}%`, 
                                        width: view === 'weekly' ? `${barWidth}px` : `${barWidth}%`, 
                                        minWidth: '35px' 
                                    }}
                                    onMouseEnter={() => setHoveredItem(item)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <div className={`flex w-full space-x-[2px] items-end h-full relative 
                                                     transition-transform duration-300 ${isHovered ? 'translate-y-[-5px]' : ''}`}>
                                        
                                        {/* Target Bar (Left) */}
                                        <div 
                                            style={{ height: `${targetHeight}px` }}
                                            className={`w-1/2 bg-gradient-to-t ${targetColorClass} 
                                                        opacity-80 transition-all duration-300 rounded-t-md 
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
                                        <div className="absolute top-0 right-0 -mr-1 -mt-2"> {/* Adjusted position */}
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

            {/* X-Axis Labels (Quarter/Week Labels) */}
            <div className="flex pt-2 border-t border-gray-300 ml-20" style={{ width: chartAreaWidth }}>
                {data.map((item: any, i: number) => (
                    <div 
                        key={item.id || item.label} 
                        className="text-[10px] font-bold text-gray-700 text-center flex-1 p-1" // Made labels bolder
                         style={{ 
                            width: view === 'weekly' ? `${barWidth}px` : `${barWidth}%`, 
                            minWidth: '35px' 
                        }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>


            {/* Tooltip / Detailed Hover Info (Updated Style) */}
            {hoveredItem && (
                <div 
                    className="absolute top-4 right-4 p-4 bg-white border-2 border-indigo-400 rounded-xl shadow-2xl z-30 w-80 transition-opacity duration-200"
                    style={{ pointerEvents: 'none' }}
                >
                    <h4 className="font-bold text-indigo-700 text-lg mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-indigo-500" /> 
                        
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
                            <span className="font-semibold text-blue-600">Target Revenue:</span>
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
                    <div className="mt-3 text-xs p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <span className="font-semibold text-gray-700">Note:</span> {hoveredItem.note}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex justify-center mt-4 space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full"></div>
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
    // State to toggle between 'quarterly' or 'weekly' view
    const [view, setView] = useState('quarterly'); 
    // State to filter down to a specific quarter or week ('all', 'Q1', 'W2', etc.)
    const [selectedFilter, setSelectedFilter] = useState('all'); 

    const currentYearData = useMemo(() => TARGET_DATA[selectedYear], [selectedYear]);

    // Handlers to reset the detailed filter when changing main context
    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        setSelectedFilter('all'); 
    };

    const handleViewChange = (newView: string) => {
        setView(newView);
        setSelectedFilter('all'); 
    };

    // Define all possible quarter and week filters
    const allQuarterFilters = ['all', 'Q1', 'Q2', 'Q3', 'Q4'];
    // Specific weekly filters requested by the user
    const specificWeekFilters = ['W1', 'W2', 'W3', 'W4'];

    const filterOptions = useMemo(() => {
        if (view === 'quarterly') {
            return allQuarterFilters;
        } else {
            // For weekly view, show all quarter filters (to zoom 13 weeks)
            // AND the specific weekly filters (to zoom 1 week)
            return [...allQuarterFilters, ...specificWeekFilters];
        }
    }, [view]);


    // Data to be displayed in the chart, dynamically filtered by view and selectedFilter
    const dataToShow = useMemo(() => {
        let data: any;

        if (view === 'weekly') {
            data = generateWeeklyData(currentYearData.quarters);
            
            if (selectedFilter === 'all') {
                return data;
            } else if (selectedFilter.startsWith('Q')) {
                // Filter by Quarter ID (shows 13 weeks: W1-W13, W14-W26, etc.)
                return data.filter((item: any) => item.quarterId === selectedFilter);
            } else if (selectedFilter.startsWith('W')) {
                // Filter by specific global Week Label (shows 1 week: W1, W2, W3, W4)
                return data.filter((item: any) => item.label === selectedFilter);
            }
            return data;
            
        } else { // Quarterly view
            data = currentYearData.quarters;

            if (selectedFilter !== 'all') {
                // Filter quarterly data by the selected quarter ID (Q1, Q2, etc.)
                return data.filter((item: any) => item.id === selectedFilter);
            }
            return data;
        }
    }, [view, currentYearData, selectedFilter]);

    // KPI calculations always use the full annual data (quarters), regardless of chart view
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
                /* Ensure responsive layout and prevent horizontal scrolling on chart container */
                .overflow-x-auto {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
            `}</style>
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header and View Filters */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-indigo-800 drop-shadow-sm">
                        Annual Revenue Target Review
                    </h1>
                    <div className="flex flex-wrap items-center space-x-4 mt-4 sm:mt-0">
                        
                        {/* 1. Year Filter */}
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Year:</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
                                className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* 2. View Filter (Quarterly/Weekly) */}
                        <div className="flex space-x-2 mt-2 sm:mt-0 bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => handleViewChange('quarterly')}
                                className={`p-2 px-4 text-sm rounded-lg font-bold transition-colors shadow-md ${
                                    view === 'quarterly' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Quarterly View
                            </button>
                            <button 
                                onClick={() => handleViewChange('weekly')}
                                className={`p-2 px-4 text-sm rounded-lg font-bold transition-colors shadow-md ${
                                    view === 'weekly' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Weekly View
                            </button>
                        </div>

                    </div>
                </header>

                {/* Quarter/Week Filter Bar */}
                <div className="flex justify-start flex-wrap gap-2 p-3 bg-white rounded-xl shadow-lg border-l-4 border-purple-500">
                    {filterOptions.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className={`px-4 py-2 text-xs rounded-lg font-bold transition-colors shadow-sm whitespace-nowrap ${
                                selectedFilter === filter
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
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
                        color="#2563EB" // Indigo Blue
                    />
                    <KPICard 
                        title={`Total Achieved Revenue (${selectedYear})`} 
                        value={totalAchieved} 
                        icon={CheckCircle} 
                        color={isTargetAchieved ? "#10B981" : "#F59E0B"} // Green/Amber
                    />
                    <KPICard 
                        title="Annual Variance" 
                        value={annualVariance} 
                        icon={annualVariance >= 0 ? TrendingUp : TrendingDown} 
                        color={annualVariance >= 0 ? "#10B981" : "#EF4444"} // Green/Red
                    />
                </div>

                {/* Main Graph Section */}
                <TargetAchievementChart data={dataToShow} year={selectedYear} view={view} />
                
                {/* Overall Company Performance Summary Note */}
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
