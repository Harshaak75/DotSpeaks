import React, { useState, useMemo, useEffect } from "react";
import {
  Flag,
  Users,
  BarChart,
  Package,
  Clock,
  DollarSign,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../../../utils/supabase";
import { api } from "../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";

// --- CONSTANTS ---
const TARGET_QUARTER_REVENUE = 2500000;
const MONTHLY_LEADS_TARGET = 1667;
const TIME_SCOPES = ["Monthly", "Quarterly", "Yearly"];
const CACHE_KEY = "cmo_target_cache";
const CACHE_EXPIRATION_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

const LEAD_PACKAGES = [
  {
    key: "all",
    name: "All Packages",
    percentage: 1.0,
    price: 0,
    color: "#3b82f6",
  },
  {
    key: "spark",
    name: "Spark-15k",
    percentage: 0.1,
    price: 15000,
    color: "#f59e0b",
  },
  {
    key: "rise",
    name: "Rise-25k",
    percentage: 0.45,
    price: 25000,
    color: "#10b981",
  },
  {
    key: "scale",
    name: "Scale-40k",
    percentage: 0.3,
    price: 40000,
    color: "#ef4444",
  },
  {
    key: "lead",
    name: "Lead-55k",
    percentage: 0.1,
    price: 55000,
    color: "#6366f1",
  },
  {
    key: "signature",
    name: "Signature-75k",
    percentage: 0.05,
    price: 75000,
    color: "#ec4899",
  },
];

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: any) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getPeriodsForScope = (scope: any) => {
  switch (scope) {
    case "Monthly":
      return ["Week 1", "Week 2", "Week 3", "Week 4"];
    case "Quarterly":
      return ["Q1", "Q2", "Q3", "Q4"];
    case "Yearly":
      return ["2023", "2024", "2025"];
    default:
      return [];
  }
};

const generateMockData = (selectedPackageKey: any, selectedTimeScope: any) => {
  const pkg =
    LEAD_PACKAGES.find((p) => p.key === selectedPackageKey) || LEAD_PACKAGES[0];
  const baseTarget = MONTHLY_LEADS_TARGET * pkg.percentage;
  const data = [];

  if (selectedTimeScope === "Monthly") {
    for (let i = 1; i <= 4; i++) {
      const target = Math.ceil(baseTarget / 4);
      const achieved = Math.ceil(target * (0.8 + Math.random() * 0.2));
      data.push({ name: `Week ${i}`, Targeted: target, Achieved: achieved });
    }
  } else if (selectedTimeScope === "Quarterly") {
    const quarterlyTarget = Math.ceil(baseTarget * 3);
    for (let i = 1; i <= 4; i++) {
      const target = quarterlyTarget;
      const achieved = Math.ceil(target * (0.85 + Math.random() * 0.15));
      data.push({ name: `Q${i}`, Targeted: target, Achieved: achieved });
    }
  } else if (selectedTimeScope === "Yearly") {
    const yearlyTarget = Math.ceil(baseTarget * 12);
    [2023, 2024, 2025].forEach((year) => {
      const target = yearlyTarget;
      const achieved = Math.ceil(target * (0.9 + Math.random() * 0.1));
      data.push({ name: `${year}`, Targeted: target, Achieved: achieved });
    });
  }
  return data;
};

// --- REUSABLE COMPONENTS ---
const TimeScopeSelector = ({ selected, onSelect }: any) => (
  <div className="flex space-x-2 p-1 bg-gray-100 rounded-xl shadow-inner">
    {TIME_SCOPES.map((scope) => (
      <button
        key={scope}
        onClick={() => onSelect(scope)}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
          selected === scope
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-200"
        }`}
      >
        {scope}
      </button>
    ))}
  </div>
);

const PeriodSelector = ({
  periods,
  selected,
  onSelect,
  selectedTimeScope,
}: any) => (
  <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-inner mt-2">
    <button
      key="all-periods"
      onClick={() => onSelect(null)}
      className={`px-4 py-2 text-xs font-semibold rounded-full transition-all ${
        selected === null
          ? "bg-blue-600 text-white shadow-md border-2 border-blue-700"
          : "text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
      }`}
    >
      Show All {selectedTimeScope}
    </button>
    {periods.map((period: any) => (
      <button
        key={period}
        onClick={() => onSelect(period)}
        className={`px-4 py-2 text-xs font-semibold rounded-full transition-all ${
          selected === period
            ? "bg-purple-600 text-white shadow-md border-2 border-purple-700"
            : "text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
        }`}
      >
        {period}
      </button>
    ))}
  </div>
);

const PackageFilter = ({ selected, onSelect }: any) => (
  <div className="flex flex-wrap gap-2">
    {LEAD_PACKAGES.map((pkg) => (
      <button
        key={pkg.key}
        onClick={() => onSelect(pkg.key)}
        style={{
          backgroundColor: selected === pkg.key ? pkg.color : "#f3f4f6",
          color: selected === pkg.key ? "white" : "#4b5563",
          borderColor: pkg.color,
        }}
        className="text-xs sm:text-sm font-medium px-3 py-1 rounded-full border-2 transition-all shadow-sm hover:shadow-md"
      >
        {pkg.name}
      </button>
    ))}
  </div>
);

const LeadsLineChart = ({ data, timeScope, selectedPackage }: any) => {
  const pkg = LEAD_PACKAGES.find((p) => p.key === selectedPackage);
  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 h-96">
      <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
        <BarChart className="h-5 w-5 mr-2 text-blue-600" />
        Leads Performance: {pkg?.name} ({timeScope} View)
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Comparison of Targeted vs. Achieved Leads
      </p>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value, name) => [
              `${value.toLocaleString("en-IN")} Leads`,
              name,
            ]}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
          <Line
            type="monotone"
            dataKey="Targeted"
            stroke="#3b82f6"
            strokeWidth={4}
            dot={{ r: 6 }}
            activeDot={{ r: 8, fill: "#3b82f6" }}
            name="Targeted Leads"
          />
          <Line
            type="monotone"
            dataKey="Achieved"
            stroke="#10b981"
            strokeWidth={4}
            dot={{ r: 6 }}
            activeDot={{ r: 8, fill: "#10b981" }}
            name="Achieved Leads"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- MAIN COMPONENT ---
const CMOAnalyticalDashboard = () => {
  const [selectedTimeScope, setSelectedTimeScope] = useState("Monthly");
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState("all");
  const [liveTargetData, setLiveTargetData] = useState({
    revenue: 0,
    quarter: "N/A",
  });

  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();

  // --- Smart Cache & API Fetch ---
  useEffect(() => {
    const fetchCachedOrAPI = async () => {
      // 1. Check localStorage cache
      const cachedString = localStorage.getItem(CACHE_KEY);
      if (cachedString) {
        try {
          const cached = JSON.parse(cachedString);
          const isFresh = Date.now() - cached.timestamp < CACHE_EXPIRATION_MS;
          if (isFresh) {
            setLiveTargetData(cached.data);
          }
        } catch (err) {
          console.warn("Invalid cached CMO data, ignoring.", err);
        }
      }

      // 2. Always fetch latest from API to avoid stale data
      try {
        const response = await api.cmo.getCurrentQuarter.get(
          accessToken,
          dispatch
        );
        console.log(response.payload)
        if (response?.payload) {
          const latestData = {
            revenue: Number(response.payload.projectedRevenue),
            quarter: response.payload.quarterName || "N/A",
          };
          setLiveTargetData(latestData);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: latestData, timestamp: Date.now() })
          );
        }
      } catch (err) {
        console.error("Error fetching CMO data from API:", err);
      }
    };

    fetchCachedOrAPI();
  }, [accessToken, dispatch]);

  // --- Real-Time Supabase Broadcast ---
  useEffect(() => {
    if (!supabase?.channel) {
      console.warn("Supabase client not available.");
      return;
    }
    const channel = supabase.channel("projections");
    channel.on("broadcast", { event: "target_for_cmo" }, (payload: any) => {
      const latestData = {
        revenue: Number(payload.payload.data.projectedRevenue),
        quarter: payload.payload.quarter,
      };
      setLiveTargetData(latestData);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: latestData, timestamp: Date.now() })
      );
    });
    channel.subscribe();
    return () => {
      // ignore promise, just call it
      channel
        .unsubscribe()
        .catch((err) => console.warn("Unsubscribe error", err));
    };
  }, []);

  const handleTimeScopeSelect = (scope: any) => {
    setSelectedTimeScope(scope);
    setSelectedPeriod(null);
  };

  const fullChartData = useMemo(
    () => generateMockData(selectedPackage, selectedTimeScope),
    [selectedPackage, selectedTimeScope]
  );

  const filteredChartData = useMemo(() => {
    if (selectedPeriod === null) return fullChartData;
    const item = fullChartData.find((d) => d.name === selectedPeriod);
    return item ? [item] : [];
  }, [fullChartData, selectedPeriod]);

  const packageDetail = LEAD_PACKAGES.find((p) => p.key === selectedPackage);
  const availablePeriods = getPeriodsForScope(selectedTimeScope);
  const alertMessageScope = selectedPeriod
    ? `in period ${selectedPeriod}`
    : `(Full Scope) for ${selectedTimeScope}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <header className="border-b-4 border-blue-600 pb-4 shadow-sm bg-white p-6 rounded-xl">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
            <Flag className="h-8 w-8 mr-3 text-blue-600" />
            CMO Strategic Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Analyzing Lead Flow against {liveTargetData.quarter} Financial
            Targets
          </p>
        </header>

        {/* Financial Target Box */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <DollarSign className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {liveTargetData.quarter} Revenue Target (Mandated)
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-1">
                  {formatCurrency(liveTargetData.revenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Package className="h-6 w-6 mr-3 text-blue-600" /> Select Focus Area
          </h2>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Clock className="h-4 w-4 mr-2" /> Time Scope:
            </label>
            <TimeScopeSelector
              selected={selectedTimeScope}
              onSelect={handleTimeScopeSelect}
            />
            <PeriodSelector
              periods={availablePeriods}
              selected={selectedPeriod}
              onSelect={setSelectedPeriod}
              selectedTimeScope={selectedTimeScope}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Users className="h-4 w-4 mr-2" /> Leads Package:
            </label>
            <PackageFilter
              selected={selectedPackage}
              onSelect={setSelectedPackage}
            />
            {selectedPackage !== "all" && packageDetail && (
              <p className="text-sm text-gray-500 pt-2 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Focusing on {packageDetail.name} (
                {packageDetail.percentage * 100}% Lead Share @{" "}
                {formatCurrency(packageDetail.price)} avg. price)
              </p>
            )}
          </div>
        </div>

        {/* Chart Visualization */}
        <LeadsLineChart
          data={filteredChartData}
          timeScope={selectedTimeScope}
          selectedPackage={selectedPackage}
        />
      </div>
    </div>
  );
};

export default CMOAnalyticalDashboard;
