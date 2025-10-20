import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  DollarSign,
  Briefcase,
  IndianRupee,
  Send,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../utils/api/Employees/api";

// --- Global Styles to hide number input arrows ---
const GlobalStyles = () => (
  <style>{`
        /* Hide arrows from number inputs - Chrome, Safari, Edge, Opera */
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        /* Hide arrows from number inputs - Firefox */
        input[type=number] {
            -moz-appearance: textfield;
        }
    `}</style>
);

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// --- MAIN CEO DASHBOARD COMPONENT ---
const CEOYearlyTargetDashboard = () => {
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);

  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
    setTotalRevenue(isNaN(value) ? null : value);
  };

  const handleSendTargets = async () => {
    if (!totalRevenue || totalRevenue < 0) {
      alert("The revenue should be graeter than 0");
      return;
    }

    const quterlyData = [1, 2, 3, 4].map((q: any) => {
      const quarterlyRevenue = totalRevenue / 4;
      const expenses = quarterlyRevenue * 0.6;
      const savings = quarterlyRevenue * 0.4;
      return {
        quarter: `Q${q}`,
        revenue: quarterlyRevenue,
        expenses,
        savings,
      };
    });

    try {
      const response = await api.ceo.setTargets.post(
        accessToken,
        dispatch,
        quterlyData,
        totalRevenue
      );
      alert("Targets sent successfully");
    } catch (error) {
      alert("Failed to send targets");
    }
  };

  const quarters = [
    { name: "Quarter 1", key: "q1" },
    { name: "Quarter 2", key: "q2" },
    { name: "Quarter 3", key: "q3" },
    { name: "Quarter 4", key: "q4" },
  ];

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen p-8 font-sans text-gray-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <header className="text-center">
            <h1 className="text-4xl font-extrabold text-blue-800 drop-shadow-sm">
              Financial Projections
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Strategize and visualize your company's financial future with a
              single click.
            </p>
          </header>

          {/* Total Revenue Input Section */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <IndianRupee className="h-7 w-7 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-700">
                  Enter Total Yearly Revenue Target (in INR)
                </h2>
              </div>
              <div className="relative w-full md:w-1/2 lg:w-1/3">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ₹
                </span>
                <input
                  type="text"
                  placeholder="e.g., 1,00,00,000"
                  value={
                    totalRevenue !== null
                      ? totalRevenue.toLocaleString("en-IN")
                      : ""
                  }
                  onChange={handleRevenueChange}
                  className="w-full pl-8 pr-3 py-3 text-lg text-center font-semibold border-2 border-blue-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quarterly Breakdown Section (Conditionally Rendered) */}
          {totalRevenue !== null && totalRevenue > 0 && (
            <div className="space-y-10">
              <h2 className="text-3xl font-bold text-blue-800 text-center">
                Quarterly Projections
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quarters.map((quarter) => {
                  const quarterlyRevenue = totalRevenue / 4;
                  const expenses = quarterlyRevenue * 0.6;
                  const savings = quarterlyRevenue * 0.4;
                  return (
                    <div
                      key={quarter.key}
                      className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 transition-transform transform hover:scale-105 hover:shadow-2xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-blue-600">
                          {quarter.name}
                        </h3>
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Revenue</p>
                            <p className="text-xl font-bold text-green-700">
                              {formatCurrency(quarterlyRevenue)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <TrendingDown className="h-6 w-6 text-red-600" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Expenses (60%)
                            </p>
                            <p className="text-xl font-bold text-red-700">
                              {formatCurrency(expenses)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <PiggyBank className="h-6 w-6 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Savings (40%)
                            </p>
                            <p className="text-xl font-bold text-blue-700">
                              {formatCurrency(savings)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-12">
                <button
                  onClick={handleSendTargets}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Targets to Team</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CEOYearlyTargetDashboard;
