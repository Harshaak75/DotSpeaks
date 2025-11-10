import React, { useState, useEffect, useMemo } from "react";
import {
  IndianRupee,
  TrendingUp,
  Users,
  Calendar,
  BarChart,
  Zap,
  CheckCircle,
  Flag,
  Package,
  Send,
  Loader,
  MinusCircle,
  CheckSquare,
} from "lucide-react";
import { api } from "../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";

let Quarter: any;

// --- CONSTANTS ---
const MIN_PACKAGE_PRICE = 15000;
const LEAD_CONVERSION_FACTOR = 30;

const BASE_LEAD_PACKAGES = [
  {
    key: "spark",
    name: "Spark-15k",
    price: 15000,
    percentage: 0.1,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    key: "rise",
    name: "Rise-25k",
    price: 25000,
    percentage: 0.45,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    key: "scale",
    name: "Scale-40k",
    price: 40000,
    percentage: 0.3,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    key: "lead",
    name: "Lead-55k",
    price: 55000,
    percentage: 0.1,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    key: "signature",
    name: "Signature-75k",
    percentage: 0.05,
    color: "text-pink-600",
    bg: "bg-pink-100",
  },
];

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: any) => {
  if (value === 0 || value === null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// --- SUB-COMPONENTS ---

// Renders the calculation form (Phase 1)
const TargetSetter = ({ revenue, setRevenue, onFinalize }: any) => {
  const [selectedQuarter, setSelectedQuarter] = useState("Q3");
  const [isSaving, setIsSaving] = useState(false); // Local saving state for UX feedback
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  const cached = localStorage.getItem("cmo_target_cache");

  if (cached) {
    try {
      const parsed = JSON.parse(cached); // convert back from JSON
      revenue = parsed?.data?.revenue;   // safely access quarter

      console.log("✅ Quarter from cache:", revenue);
    } catch (err) {
      console.error("❌ Failed to parse cached data:", err);
    }
  }

  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();

  const [packageData, setPackageData] = useState(
    BASE_LEAD_PACKAGES.map((pkg) => ({
      ...pkg,
      percentageInput: (pkg.percentage * 100).toString(), // convert decimal to %
    }))
  );

  // Calculate total percentage
  const totalPercentage = packageData.reduce(
    (sum, pkg) => sum + parseFloat(pkg.percentageInput || "0"),
    0
  );

  // Handler for when user changes a percentage
  const handlePercentageChange = (key: string, value: string) => {
    setPackageData((prev) =>
      prev.map((pkg) =>
        pkg.key === key ? { ...pkg, percentageInput: value } : pkg
      )
    );
  };

  // --- CALCULATION LOGIC ---
  const isReady = revenue !== null && revenue > 0;
  const monthlyRevenue = isReady ? revenue / 3 : 0;
  const minPackagesSold =
    monthlyRevenue > 0 ? monthlyRevenue / MIN_PACKAGE_PRICE : 0;
  const leadsTarget =
    minPackagesSold > 0
      ? Math.ceil(minPackagesSold * LEAD_CONVERSION_FACTOR)
      : 0;

  const handleRevenueChange = (e: any) => {
    const value = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
    setRevenue(isNaN(value) ? null : value);
  };

  const handleFinalize = async () => {
    if (!isReady) return;
    setIsSaving(true);

    Quarter = selectedQuarter;
    localStorage.setItem("CMO_quarter", Quarter);

    // Simulate a small delay for UX feedback (was used for Firestore)
    const payload = {
      targetQuarter: selectedQuarter,
      monthlyRevenue: Math.round(monthlyRevenue),
      totalTargetLeads: leadsTarget,
      monthlyUnits: Math.round(minPackagesSold), // optional if you want to store total
      packages: packageData.map((pkg: any) => ({
        name: pkg.key,
        target: Math.ceil(
          (leadsTarget * (parseFloat(pkg.percentageInput) || 0)) / 100
        ),
        achieved: 0,
        percentage: parseFloat(pkg.percentageInput) || 0,
      })),
    };

    console.log(payload);

    try {
      await api.cmo.addcmoTargets.post(accessToken, dispatch, payload);

      onFinalize(payload);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  const CalculationStep = ({
    step,
    title,
    explanation,
    result,
    resultUnit = "INR",
    icon: Icon,
  }: any) => {
    const formattedResult =
      resultUnit === "INR"
        ? formatCurrency(result)
        : Math.ceil(result).toLocaleString("en-IN");
    const resultLabel =
      resultUnit === "INR"
        ? "Monthly Revenue"
        : resultUnit === "Sales"
        ? "Required Sales (Units)"
        : "Monthly Leads Target";
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-blue-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 font-extrabold text-sm">
            {step}
          </div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs font-medium text-gray-500">{resultLabel}</p>
          <p className="text-xl font-extrabold text-blue-700">
            {formattedResult}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 space-y-8">
      <h2 className="text-2xl font-bold text-blue-700 flex items-center border-b pb-3">
        <TrendingUp className="h-6 w-6 mr-3" />
        1. Define Quarterly Target (Local State)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Select Target Quarter
          </label>
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="w-full p-3 border-2 border-blue-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {quarters.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Quarterly Revenue Target (INR)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              ₹
            </span>
            <input
              type="text"
              placeholder="e.g., 25,00,000"
              value={revenue !== null ? revenue.toLocaleString("en-IN") : ""}
              onChange={handleRevenueChange}
              className="w-full pl-8 pr-3 py-3 text-lg font-semibold border-2 border-blue-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <h3 className="text-lg font-bold text-gray-700 flex items-center">
          Calculation Breakdown:
        </h3>
        <CalculationStep
          step={1}
          title="Monthly Revenue Target"
          explanation="Quarterly / 3"
          result={monthlyRevenue}
          icon={Calendar}
        />
        <CalculationStep
          step={2}
          title="Monthly Sales Units"
          explanation={`Revenue / Lowest Package (₹${
            MIN_PACKAGE_PRICE / 1000
          }k)`}
          result={minPackagesSold}
          resultUnit="Sales"
          icon={Zap}
        />
        <CalculationStep
          step={3}
          title="Total Leads Target (Monthly)"
          explanation={`Sales Units * Conversion Factor (1:${LEAD_CONVERSION_FACTOR})`}
          result={leadsTarget}
          resultUnit="Leads"
          icon={Users}
        />
      </div>

      {/* Package Distribution Section */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
          <Package className="h-5 w-5 mr-2 text-blue-600" />
          Package Distribution (%)
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          Divide total leads (
          <span className="font-semibold text-blue-700">
            {leadsTarget.toLocaleString("en-IN")}
          </span>
          ) across packages. Ensure the total percentage equals{" "}
          <strong>100%</strong>.
        </p>

        <div className="overflow-hidden border rounded-xl">
          <table className="min-w-full bg-white">
            <thead className="bg-blue-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Package Name
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Percentage (%)
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Calculated Leads
                </th>
              </tr>
            </thead>
            <tbody>
              {packageData.map((pkg) => {
                const percentage = parseFloat(pkg.percentageInput || "0");
                const packageLeads =
                  Math.round((leadsTarget * percentage) / 100) || 0;
                return (
                  <tr
                    key={pkg.key}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-800 font-medium flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${pkg.bg}`} />
                      <span>{pkg.name}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={pkg.percentageInput}
                        onChange={(e) =>
                          handlePercentageChange(pkg.key, e.target.value)
                        }
                        className="w-24 p-2 text-center border border-gray-300 rounded-md font-bold text-gray-700 focus:ring-2 focus:ring-blue-400"
                      />
                    </td>
                    <td className="text-center py-3 px-4 text-gray-700 font-semibold">
                      {packageLeads.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t bg-gray-100">
                <td className="py-3 px-4 font-bold text-gray-700">Total</td>
                <td
                  className={`text-center py-3 px-4 font-extrabold ${
                    Math.round(totalPercentage) === 100
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {totalPercentage.toFixed(1)}%
                </td>
                <td className="text-center py-3 px-4 font-bold text-blue-700">
                  {leadsTarget.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {Math.round(totalPercentage) !== 100 && (
          <p className="text-red-600 text-sm font-medium mt-2 flex items-center space-x-2">
            <MinusCircle className="h-4 w-4" />
            <span>Total percentage must equal 100% before finalizing.</span>
          </p>
        )}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={handleFinalize}
          disabled={!isReady || isSaving}
          className="px-8 py-4 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-4 focus:ring-green-300 flex items-center justify-center space-x-2 mx-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Flag className="h-5 w-5 mr-2" />
          )}
          <span>
            {isSaving ? "Finalizing Target..." : "Finalize & Set Target"}
          </span>
        </button>
      </div>
    </div>
  );
};

// Renders the tracking dashboard (Phase 2)
const TrackingDashboard = ({ goal, onAchieve, onReset }: any) => {
  const totalAchieved = goal.packages.reduce(
    (sum: any, pkg: any) => sum + pkg.achieved,
    0
  );
  const totalRemaining = goal.packages.reduce(
    (sum: any, pkg: any) => sum + pkg.remaining,
    0
  );
  const totalTarget = goal.totalTargetLeads;
  const completionPercentage =
    totalTarget > 0 ? Math.floor((totalAchieved / totalTarget) * 100) : 0;
  const isComplete = totalRemaining <= 0;

  // Simulate achievement for the next package requiring leads
  const handleSimulateAchievement = () => {
    // Find the first package that still has remaining leads
    const pkgToUpdate = goal.packages.find((pkg: any) => pkg.remaining > 0);
    if (pkgToUpdate) {
      // Simulate 5% achievement for this package
      const achievementAmount = Math.ceil(pkgToUpdate.target * 0.05);
      onAchieve(pkgToUpdate.key, achievementAmount);
    } else {
      // NOTE: Using a custom modal is preferred over alert() in production, but alert is used here for simplicity as instructed.
      alert("All targets met! The lead counter is at zero.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-blue-600 space-y-8">
      <h2 className="text-2xl font-bold text-blue-700 flex justify-between items-center border-b pb-3">
        <span className="flex items-center">
          <BarChart className="h-6 w-6 mr-3" />
          2. Leads Tracking Dashboard: {goal.targetQuarter}
        </span>
        <button
          onClick={() => {
            // NOTE: Using window.confirm() for reset safety since custom modal is disallowed.
            if (
              window.confirm(
                "Are you sure you want to reset the current target? This will delete all progress."
              )
            ) {
              onReset();
            }
          }}
          className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center space-x-1"
        >
          <MinusCircle className="h-4 w-4" />
          <span>Reset Target</span>
        </button>
      </h2>

      {/* Total Target Summary */}
      <div
        className={`p-6 rounded-xl text-white shadow-lg ${
          isComplete ? "bg-green-600" : "bg-blue-600"
        }`}
      >
        <p className="text-lg font-semibold uppercase tracking-wider">
          Total Leads Progress
        </p>
        <div className="flex justify-between items-center mt-2">
          <div className="text-6xl font-extrabold">{completionPercentage}%</div>
          <div className="text-right">
            <p className="text-xl font-bold">
              Target: {totalTarget.toLocaleString("en-IN")}
            </p>
            <p className="text-sm">
              Achieved: {totalAchieved.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="w-full bg-blue-400 rounded-full h-3 mt-4">
          <div
            className={`h-3 rounded-full ${
              isComplete ? "bg-green-300" : "bg-blue-300"
            }`}
            style={{ width: `${Math.min(100, completionPercentage)}%` }}
          ></div>
        </div>
        <p className="text-sm font-medium mt-2 flex items-center justify-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Leads Remaining: {totalTarget - totalAchieved}</span>
        </p>
      </div>

      {/* Package Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-700 flex items-center">
          <Package className="h-5 w-5 mr-2" /> Package Breakdown
        </h3>
        {goal.packages.map((pkg: any) => {
          const pkgCompletion =
            pkg.target > 0 ? Math.floor((pkg.achieved / pkg.target) * 100) : 0;
          return (
            <div
              key={pkg.key}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <h4
                  className={`text-[1.5rem] font-bold flex items-center space-x-2 ${pkg.color}`}
                >
                  {pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1)}
                </h4>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    Target: {pkg.target.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Remaining:{" "}
                    {Math.max(0, pkg.remaining).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full`}
                  style={{ width: `${Math.min(100, pkgCompletion)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {pkgCompletion}% Completed (
                {pkg.achieved.toLocaleString("en-IN")} Achieved)
              </p>
            </div>
          );
        })}
      </div>

      {/* Simulate Achievement Button */}
      <div className="text-center pt-4 border-t border-gray-200">
        {/* <button
                    onClick={handleSimulateAchievement}
                    disabled={isComplete}
                    className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 mx-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <CheckSquare className="h-5 w-5" />
                    <span>Simulate Lead Conversion (Excel Upload)</span>
                </button> */}
        {/* <p className='text-xs text-gray-500 mt-2'>
                    Clicking this simulates lead conversion and automatically decrements the remaining package leads.
                </p> */}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const CMOTracker = () => {
  const [quarterlyRevenue, setQuarterlyRevenue] = useState(2500000);
  const [currentGoal, setCurrentGoal] = useState<any>(null); // Local State for Goal data

  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();

  const GetTargets = async () => {
    if (!Quarter) {
      const cached = localStorage.getItem("cmo_target_cache");

      if (cached) {
        try {
          const parsed = JSON.parse(cached); // convert back from JSON
          Quarter = parsed?.data?.quarter; // safely access quarter

          console.log("✅ Quarter from cache:", Quarter);
        } catch (err) {
          console.error("❌ Failed to parse cached data:", err);
        }
      }
    }
    try {
      const response = await api.cmo.getTargets.get(
        accessToken,
        dispatch,
        Quarter
      );
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchTargets = async () => {
      if (!Quarter) {
        Quarter = localStorage.getItem("CMO_quarter");
      }
      try {
        const response: any = await api.cmo.getTargets.get(
          accessToken,
          dispatch,
          Quarter
        );
        console.log("r", response.response);

        if (response) {
          console.log("hi", response.data);
          setCurrentGoal(response.response);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchTargets();
  }, [accessToken, dispatch]); // add dependencies if needed

  // Handlers for Setting, Updating, and Resetting Goals
  const handleFinalizeTarget = async (calculatedGoal: any) => {
    try {
      alert("Target finalized successfully!");

      // Wait for API data after saving
      const response: any = await GetTargets();

      if (response && response.data) {
        // Set the latest goal data from API
        setCurrentGoal(response.data);
      } else {
        // Fallback to locally calculated goal if API returns nothing
        setCurrentGoal(calculatedGoal);
      }
    } catch (error) {
      console.error("Failed to fetch updated targets:", error);
      setCurrentGoal(calculatedGoal);
    }
  };

  const handleSimulateAchieve = (packageKey: any, achievementAmount: any) => {
    if (!currentGoal) return;

    const updatedPackages: any = currentGoal.packages.map((pkg: any) => {
      if (pkg.key === packageKey && pkg.remaining > 0) {
        const achievable = Math.min(pkg.remaining, achievementAmount);
        return {
          ...pkg,
          achieved: pkg.achieved + achievable,
          remaining: pkg.remaining - achievable,
        };
      }
      return pkg;
    });

    const newGoalData: any = {
      ...(currentGoal as object),
      packages: updatedPackages,
    };

    setCurrentGoal(newGoalData);
  };

  const handleResetTarget = () => {
    // Resetting the local state sets currentGoal back to null
    setCurrentGoal(null);
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-12 py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-10 border-b-4 border-blue-600 pb-4 shadow-md bg-white p-6 rounded-xl">
          <h1 className="text-4xl font-extrabold text-blue-800 flex items-center">
            <BarChart className="h-7 w-7 mr-3 text-blue-600" />
            CMO Leads Goal Management
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {currentGoal
              ? "Monitor progress towards the current financial goal."
              : "Set the quarterly revenue target to begin tracking."}
          </p>
        </header>

        {currentGoal ? (
          <TrackingDashboard
            goal={currentGoal}
            onAchieve={handleSimulateAchieve}
            onReset={handleResetTarget}
          />
        ) : (
          <TargetSetter
            revenue={quarterlyRevenue}
            setRevenue={setQuarterlyRevenue}
            onFinalize={handleFinalizeTarget}
          />
        )}
      </div>
    </div>
  );
};

export default CMOTracker;
