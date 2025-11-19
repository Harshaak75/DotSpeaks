import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const CEOProfitAndLoss = () => {
  const [filter, setFilter] = useState("Yearly");
  const [subFilter, setSubFilter] = useState("");

  // ---------------------- STATIC DATA ----------------------
  const revenueTrends: any = {
    Weekly: [
      { name: "Week 1", revenue: 12000, netProfit: 15000 },
      { name: "Week 2", revenue: 18500, netProfit: 9000 },
      { name: "Week 3", revenue: 15700, netProfit: 7400 },
      { name: "Week 4", revenue: 21200, netProfit: 11000 },
    ],
    Quarterly: [
      { name: "Q1", revenue: 52000, netProfit: 25000 },
      { name: "Q2", revenue: 64000, netProfit: 31500 },
      { name: "Q3", revenue: 58000, netProfit: 28500 },
      { name: "Q4", revenue: 70000, netProfit: 37000 },
    ],
    Yearly: [
      { name: "2021", revenue: 240000, netProfit: 115000 },
      { name: "2022", revenue: 310000, netProfit: 152000 },
      { name: "2023", revenue: 365000, netProfit: 180000 },
      { name: "2024", revenue: 420000, netProfit: 210000 },
      { name: "2025", revenue: 470000, netProfit: 250000 },
    ],
  };

  const expenseData = [
    { name: "Salaries", value: 32000, color: "#0000CC" },
    { name: "Marketing", value: 18000, color: "#3B82F6" },
    { name: "Operations", value: 25000, color: "#60A5FA" },
    { name: "R&D", value: 12000, color: "#93C5FD" },
    { name: "Miscellaneous", value: 8000, color: "#DBEAFE" },
  ];

  const profitdata = [
    { name: "Total Revenue", value: 32000, color: "#0000CC" },
    { name: "Net Profit", value: 18000, color: "#10B981" },
  ];

  const kpiData = {
    revenue: 65540,
    expenses: 25900,
    grossProfit: 32753,
    netProfit: 21996,
    grossMargin: 69.91,
    netMargin: 57.05,
  };

  // ---------------------- FILTER LOGIC ----------------------
  const getFilteredData = () => {
    const data = revenueTrends[filter];
    if (!subFilter) return data;
    return data.filter((d: any) => d.name === subFilter);
  };

  const chartData = getFilteredData();

  const subFilters =
    filter === "Weekly"
      ? ["Week 1", "Week 2", "Week 3", "Week 4"]
      : filter === "Quarterly"
      ? ["Q1", "Q2", "Q3", "Q4"]
      : ["2021", "2022", "2023", "2024", "2025"];

  // ---------------------- ACHIEVEMENT CHART DATA ----------------------
  const getAchievementChartData = () => {
    if (!chartData.length) return [];
    const d = chartData[0];
    return [
      { label: "Start", revenue: 0, netProfit: 0 },
      { label: "Revenue", revenue: d.revenue, netProfit: d.netProfit },
    ];
  };

  const achievementData = getAchievementChartData();

  // ---------------------- COMPONENT ----------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ---------- Header ---------- */}
        <header className="flex justify-between items-center border-b pb-4">
          <h1 className="text-4xl font-extrabold drop-shadow-sm" style={{ color: '#0000CC' }}>
            Profit And Loss Dashboard
          </h1>
          <div className="flex items-center space-x-3">
            {["Weekly", "Quarterly", "Yearly"].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setSubFilter("");
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === f
                    ? "text-white shadow-md"
                    : "bg-white border text-gray-600 hover:bg-blue-50"
                }`}
                style={filter === f ? { backgroundColor: '#0000CC' } : {}}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {/* ---------- Sub Filters ---------- */}
        <div className="flex flex-wrap gap-3 mt-2">
          {subFilters.map((s) => (
            <button
              key={s}
              onClick={() => setSubFilter(s)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                subFilter === s
                  ? "text-white shadow-sm"
                  : "bg-white border text-gray-600"
              }`}
              style={subFilter === s ? { backgroundColor: '#0000CC', borderColor: '#0000CC' } : { borderColor: '#0000CC' }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ---------- KPI CARDS ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          {/* Revenue */}
          <div className="bg-white p-5 rounded-xl shadow-md border-t-4" style={{ borderTopColor: '#0000CC' }}>
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm font-medium">Revenue</p>
              <TrendingUp className="h-5 w-5" style={{ color: '#0000CC' }} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              ₹{kpiData.revenue.toLocaleString()}
            </h2>
            <p className="text-sm text-gray-600 mt-2">+24.48% growth</p>
          </div>

          {/* Expenses */}
          <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-red-500">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm font-medium">Expenses</p>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              ₹{kpiData.expenses.toLocaleString()}
            </h2>
            <p className="text-sm text-gray-600 mt-2">+18.74% this {filter}</p>
          </div>

          {/* Gross Profit */}
          <div className="bg-white p-5 rounded-xl shadow-md border-t-4" style={{ borderTopColor: '#0000CC' }}>
            <p className="text-gray-500 text-sm font-medium mb-2">
              Gross Profit Margin
            </p>
            <h2 className="text-3xl font-bold" style={{ color: '#0000CC' }}>
              {kpiData.grossMargin}%
            </h2>
            <p className="text-sm text-gray-500">
              ₹{kpiData.grossProfit.toLocaleString()}
            </p>
          </div>

          {/* Net Profit */}
          <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-green-500">
            <p className="text-gray-500 text-sm font-medium mb-2">
              Net Profit Margin
            </p>
            <h2 className="text-3xl font-bold text-green-600">
              {kpiData.netMargin}%
            </h2>
            <p className="text-sm text-gray-500">
              ₹{kpiData.netProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ---------- CHART SECTION ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mt-6">
          {/* Revenue vs Net Profit Trend */}
          <div className="bg-white w-full p-6 rounded-xl shadow-md" style={{ borderLeft: '4px solid #0000CC' }}>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {subFilter
                ? `${subFilter} Revenue Achievement`
                : `${filter} Revenue & Net Profit Trend`}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {subFilter ? (
                  // Achievement style chart
                  <LineChart
                    data={achievementData}
                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fill: "#6b7280" }} />
                    <YAxis tick={{ fill: "#6b7280" }} />
                    <Tooltip
                      formatter={(val) => `₹${val.toLocaleString()}`}
                      labelStyle={{ fontWeight: "bold" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0000CC"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      name="Revenue Target"
                    />
                    <Line
                      type="monotone"
                      dataKey="netProfit"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      name="Net Profit Achieved"
                    />
                  </LineChart>
                ) : (
                  // Normal trend line
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#0000CC"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="#0000CC"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="netGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10B981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                    <YAxis tick={{ fill: "#6b7280" }} />
                    <Tooltip
                      formatter={(val) => `₹${val.toLocaleString()}`}
                      labelStyle={{ fontWeight: "bold" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0000CC"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      fill="url(#revenueGradient)"
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="netProfit"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      fill="url(#netGradient)"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex gap-6 w-full">
          <div className="bg-white p-6 rounded-xl w-[50%] shadow-md flex flex-col justify-between" style={{ borderLeft: '4px solid #0000CC' }}>
            <h3 className="text-lg font-semibold pb-3 text-gray-700 mb-2 text-center">
              Expense Breakdown
            </h3>
            <div className="flex justify-center items-center h-72 pb-3">
              <ResponsiveContainer width="90%" height="120%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    label
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `₹${value.toLocaleString()}`,
                      name,
                    ]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl w-[50%] shadow-md flex flex-col justify-between" style={{ borderLeft: '4px solid #0000CC' }}>
            <h3 className="text-lg font-semibold pb-3 text-gray-700 mb-2 text-center">
              Total Revenue vs Net Profit
            </h3>
            <div className="flex justify-center items-center h-72 pb-3">
              <ResponsiveContainer width="90%" height="120%">
                <PieChart>
                  <Pie
                    data={profitdata}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    label
                  >
                    {profitdata.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `₹${value.toLocaleString()}`,
                      name,
                    ]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ---------- FOOTER ---------- */}
        <footer className="text-center text-gray-500 text-sm pt-6 border-t">
          © 2025 FinSight Analytics · All Rights Reserved
        </footer>
      </div>
    </div>
  );
};

export default CEOProfitAndLoss;
