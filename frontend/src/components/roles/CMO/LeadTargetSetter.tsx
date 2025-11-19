import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  BarChart,
  Zap,
  Flag,
  Package,
  Loader,
  MinusCircle,
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
  const [isSaving, setIsSaving] = useState(false);
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();

  const [packageData, setPackageData] = useState(
    BASE_LEAD_PACKAGES.map((pkg) => ({
      ...pkg,
      percentageInput: (pkg.percentage * 100).toString(),
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

    const payload = {
      targetQuarter: selectedQuarter,
      monthlyRevenue: Math.round(monthlyRevenue),
      totalTargetLeads: leadsTarget,
      monthlyUnits: Math.round(minPackagesSold),
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
    result,
    resultUnit = "INR",
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
      <div 
        className="p-4 rounded-xl shadow-lg border-2 flex items-center justify-between"
        style={{ 
          backgroundColor: 'white',
          borderColor: '#E6E6FF'
        }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full text-white text-sm"
            style={{ 
              backgroundColor: '#0000CC',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
          >
            {step}
          </div>
          <h3 
            className="text-base"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              color: '#111827'
            }}
          >
            {title}
          </h3>
        </div>
        <div className="flex-shrink-0 text-right">
          <p 
            className="text-xs"
            style={{ 
              fontFamily: 'Roboto, sans-serif',
              fontWeight: '500',
              color: '#6B7280'
            }}
          >
            {resultLabel}
          </p>
          <p 
            className="text-xl"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              color: '#0000CC'
            }}
          >
            {formattedResult}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="p-8 rounded-2xl shadow-xl border-2 space-y-8"
      style={{ 
        backgroundColor: 'white',
        borderColor: '#E6E6FF'
      }}
    >
      <h2 
        className="text-2xl flex items-center border-b pb-3"
        style={{ 
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          color: '#0000CC'
        }}
      >
        <TrendingUp 
          className="h-6 w-6 mr-3"
          style={{ color: '#0000CC' }}
        />
        1. Define Quarterly Target
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <label 
            className="block text-sm mb-1"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              color: '#4B5563'
            }}
          >
            Select Target Quarter
          </label>
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="w-full p-3 border-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2"
            style={{ 
              borderColor: '#E6E6FF',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            {quarters.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label 
            className="block text-sm mb-1"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              color: '#4B5563'
            }}
          >
            Quarterly Revenue Target (INR)
          </label>
          <div className="relative">
            <span 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              ₹
            </span>
            <input
              type="text"
              placeholder="e.g., 25,00,000"
              value={revenue !== null ? revenue.toLocaleString("en-IN") : ""}
              onChange={handleRevenueChange}
              className="w-full pl-8 pr-3 py-3 text-lg border-2 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{ 
                borderColor: '#E6E6FF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold'
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <h3 
          className="text-lg flex items-center"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            color: '#374151'
          }}
        >
          Calculation Breakdown:
        </h3>
        <CalculationStep
          step={1}
          title="Monthly Revenue Target"
          result={monthlyRevenue}
          icon={Calendar}
        />
        <CalculationStep
          step={2}
          title="Monthly Sales Units"
          result={minPackagesSold}
          resultUnit="Sales"
          icon={Zap}
        />
        <CalculationStep
          step={3}
          title="Total Leads Target (Monthly)"
          result={leadsTarget}
          resultUnit="Leads"
          icon={Users}
        />
      </div>

      {/* Package Distribution Section */}
      <div className="pt-6 border-t border-gray-200">
        <h3 
          className="text-lg mb-3 flex items-center"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            color: '#374151'
          }}
        >
          <Package 
            className="h-5 w-5 mr-2"
            style={{ color: '#0000CC' }}
          />
          Package Distribution (%)
        </h3>

        <p 
          className="text-sm text-gray-500 mb-4"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Divide total leads (
          <span 
            className="font-semibold"
            style={{ color: '#0000CC' }}
          >
            {leadsTarget.toLocaleString("en-IN")}
          </span>
          ) across packages. Ensure the total percentage equals{" "}
          <strong>100%</strong>.
        </p>

        <div className="overflow-hidden border-2 rounded-xl" style={{ borderColor: '#E6E6FF' }}>
          <table className="min-w-full bg-white">
            <thead style={{ backgroundColor: '#F9FAFB' }} className="border-b">
              <tr>
                <th 
                  className="text-left py-3 px-4 text-sm"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}
                >
                  Package Name
                </th>
                <th 
                  className="text-center py-3 px-4 text-sm"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}
                >
                  Percentage (%)
                </th>
                <th 
                  className="text-center py-3 px-4 text-sm"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}
                >
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
                    <td 
                      className="py-3 px-4 text-gray-800 flex items-center space-x-2"
                      style={{ 
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: '500'
                      }}
                    >
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
                        className="w-24 p-2 text-center border border-gray-300 rounded-md text-gray-700 focus:ring-2"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold'
                        }}
                      />
                    </td>
                    <td 
                      className="text-center py-3 px-4 text-gray-700"
                      style={{ 
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      {packageLeads.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t bg-gray-100">
                <td 
                  className="py-3 px-4 text-gray-700"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  Total
                </td>
                <td
                  className={`text-center py-3 px-4 ${
                    Math.round(totalPercentage) === 100
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  {totalPercentage.toFixed(1)}%
                </td>
                <td 
                  className="text-center py-3 px-4"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#0000CC'
                  }}
                >
                  {leadsTarget.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {Math.round(totalPercentage) !== 100 && (
          <p 
            className="text-red-600 text-sm mt-2 flex items-center space-x-2"
            style={{ 
              fontFamily: 'Roboto, sans-serif',
              fontWeight: '500'
            }}
          >
            <MinusCircle className="h-4 w-4" />
            <span>Total percentage must equal 100% before finalizing.</span>
          </p>
        )}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={handleFinalize}
          disabled={!isReady || isSaving}
          className="px-8 py-4 text-white rounded-full shadow-lg hover:opacity-90 transition-all focus:outline-none focus:ring-4 flex items-center justify-center space-x-2 mx-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: '#0000CC',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold'
          }}
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
const TrackingDashboard = ({ goal, onReset }: any) => {
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

  return (
    <div 
      className="p-8 rounded-2xl shadow-xl border-t-8 space-y-8"
      style={{ 
        backgroundColor: 'white',
        borderColor: '#0000CC'
      }}
    >
      <h2 
        className="text-2xl flex justify-between items-center border-b pb-3"
        style={{ 
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          color: '#0000CC'
        }}
      >
        <span className="flex items-center">
          <BarChart 
            className="h-6 w-6 mr-3"
            style={{ color: '#0000CC' }}
          />
          2. Leads Tracking Dashboard: {goal.targetQuarter}
        </span>
        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to reset the current target? This will delete all progress."
              )
            ) {
              onReset();
            }
          }}
          className="text-red-500 text-sm hover:text-red-700 flex items-center space-x-1"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500'
          }}
        >
          <MinusCircle className="h-4 w-4" />
          <span>Reset Target</span>
        </button>
      </h2>

      {/* Total Target Summary */}
      <div
        className={`p-6 rounded-xl text-white shadow-lg ${
          isComplete ? "bg-green-600" : ""
        }`}
        style={{ 
          backgroundColor: isComplete ? undefined : '#0000CC'
        }}
      >
        <p 
          className="text-lg uppercase tracking-wider"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold'
          }}
        >
          Total Leads Progress
        </p>
        <div className="flex justify-between items-center mt-2">
          <div 
            className="text-6xl"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
          >
            {completionPercentage}%
          </div>
          <div className="text-right">
            <p 
              className="text-xl"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold'
              }}
            >
              Target: {totalTarget.toLocaleString("en-IN")}
            </p>
            <p 
              className="text-sm"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
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
        <p 
          className="text-sm mt-2 flex items-center justify-center space-x-2"
          style={{ 
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '500'
          }}
        >
          <Users className="h-4 w-4" />
          <span>Leads Remaining: {totalTarget - totalAchieved}</span>
        </p>
      </div>

      {/* Package Breakdown */}
      <div className="space-y-4">
        <h3 
          className="text-xl flex items-center"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            color: '#374151'
          }}
        >
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
                  className={`text-[1.5rem] flex items-center space-x-2 ${pkg.color}`}
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  {pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1)}
                </h4>
                <div className="text-right">
                  <p 
                    className="text-sm text-gray-800"
                    style={{ 
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 'bold'
                    }}
                  >
                    Target: {pkg.target.toLocaleString("en-IN")}
                  </p>
                  <p 
                    className="text-xs text-gray-500"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Remaining:{" "}
                    {Math.max(0, pkg.remaining).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${Math.min(100, pkgCompletion)}%` }}
                ></div>
              </div>
              <p 
                className="text-sm text-gray-600 mt-2"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {pkgCompletion}% Completed (
                {pkg.achieved.toLocaleString("en-IN")} Achieved)
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const CMOTracker = () => {
  const [quarterlyRevenue, setQuarterlyRevenue] = useState(2500000);
  const [currentGoal, setCurrentGoal] = useState<any>(null);

  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();

  const GetTargets = async () => {
    if (!Quarter) {
      Quarter = localStorage.getItem("CMO_quarter");
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
  }, [accessToken, dispatch]);

  const handleFinalizeTarget = async (calculatedGoal: any) => {
    try {
      alert("Target finalized successfully!");

      const response: any = await GetTargets();

      if (response && response.data) {
        setCurrentGoal(response.data);
      } else {
        setCurrentGoal(calculatedGoal);
      }
    } catch (error) {
      console.error("Failed to fetch updated targets:", error);
      setCurrentGoal(calculatedGoal);
    }
  };

  const handleResetTarget = () => {
    setCurrentGoal(null);
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: '#FEF9F5',
        fontFamily: 'Roboto, sans-serif'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-12 py-12 px-4 sm:px-6 lg:px-8">
        <header 
          className="mb-10 border-b-4 pb-4 shadow-md p-6 rounded-xl"
          style={{ 
            backgroundColor: 'white',
            borderColor: '#0000CC'
          }}
        >
          <h1 
            className="text-4xl flex items-center"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              color: '#0000CC'
            }}
          >
            <BarChart 
              className="h-7 w-7 mr-3"
              style={{ color: '#0000CC' }}
            />
            CMO Leads Goal Management
          </h1>
          <p 
            className="mt-2 text-lg text-gray-600"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {currentGoal
              ? "Monitor progress towards the current financial goal."
              : "Set the quarterly revenue target to begin tracking."}
          </p>
        </header>

        {currentGoal ? (
          <TrackingDashboard goal={currentGoal} onReset={handleResetTarget} />
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
