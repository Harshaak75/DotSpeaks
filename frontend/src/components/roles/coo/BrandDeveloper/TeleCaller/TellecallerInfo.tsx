import { useState, Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Lightbulb } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Pie chart color palette
const PIE_COLORS = [
  "#0000CC",
  "#10b981",
  "#f59e42",
  "#f43f5e",
  "#6366f1",
  "#fbbf24",
];

// --- TYPE DEFINITIONS ---
type LeadStatus =
  | "New"
  | "Contacted"
  | "Follow-up"
  | "Interested"
  | "Forwarded"
  | "Not Interested";
type ActivityOutcome =
  | "Contacted - No Answer"
  | "Contacted - Left Voicemail"
  | "Emailed"
  | "Interested - Scheduled Follow-up"
  | "Not Interested";

interface Lead {
  id: string;
  name: string;
  company: string;
  phone?: string;
  email?: string;
  source: string;
  status: LeadStatus;
  contactedDate?: string;
}

// --- LOG ACTIVITY MODAL ---
const LogActivityModal = ({ isOpen, onClose, lead, onLogActivity }: any) => {
  const [outcome, setOutcome] = useState<ActivityOutcome>(
    "Contacted - No Answer"
  );
  const [notes, setNotes] = useState("");

  if (!isOpen || !lead) return null;

  const handleLog = () => {
    onLogActivity(lead.id, outcome);
    onClose();
    setNotes("");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className="w-full max-w-lg transform overflow-hidden rounded-2xl shadow-xl transition-all"
                style={{ backgroundColor: '#0000CC' }}
              >
                {/* Modal Header */}
                <div className="p-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl text-white"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold'
                    }}
                  >
                    Log Activity for {lead.name}
                  </Dialog.Title>
                </div>
                
                {/* Modal Content */}
                <div className="bg-white p-6">
                  <div className="space-y-4">
                    <div>
                      <label 
                        className="block text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold',
                          color: '#0000CC'
                        }}
                      >
                        Outcome
                      </label>
                      <select
                        value={outcome}
                        onChange={(e) =>
                          setOutcome(e.target.value as ActivityOutcome)
                        }
                        className="mt-1 w-full p-2 border rounded-md"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <option>Contacted - No Answer</option>
                        <option>Contacted - Left Voicemail</option>
                        <option>Emailed</option>
                        <option>Interested - Scheduled Follow-up</option>
                        <option>Not Interested</option>
                      </select>
                    </div>
                    <div>
                      <label 
                        className="block text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold',
                          color: '#0000CC'
                        }}
                      >
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="Add details about the interaction..."
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleLog}
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ 
                        backgroundColor: '#0000CC',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      Log Activity
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const callsMade = 20;
const dailyCallData = [
  { day: "Mon", calls: 15, target: 20 },
  { day: "Tue", calls: 18, target: 20 },
  { day: "Wed", calls: 22, target: 20 },
  { day: "Thu", calls: 19, target: 20 },
  { day: "Fri", calls: callsMade, target: 20 },
];

// --- MAIN COMPONENT ---
const NewLeadsDashboard = ({ info }: any) => {
  const [leads] = useState(info);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleLogActivity = (leadId: string, outcome: ActivityOutcome) => {
    alert(
      `Activity logged for lead ID ${leadId} with outcome: ${outcome}. In a real app, this lead would now move to the 'Contacted' queue.`
    );
  };

  const stats = useMemo(() => {
    const pieData = [
      {
        name: "New",
        value: leads.filter((l: any) => l.status === "New").length,
      },
      {
        name: "Contacted",
        value: leads.filter((l: any) => l.status === "Contacted").length,
      },
      {
        name: "Follow-up",
        value: leads.filter((l: any) => l.status === "Follow-up").length,
      },
      {
        name: "Interested",
        value: leads.filter((l: any) => l.status === "Interested").length,
      },
      {
        name: "Forwarded",
        value: leads.filter((l: any) => l.status === "Forwarded").length,
      },
    ];
    return {
      newLeads: leads.filter((l: any) => l.status === "New").length,
      callsToMake: leads.filter(
        (l: any) => l.status === "New" || l.status === "Follow-up"
      ).length,
      meetingsScheduled: 4,
      pendingFollowUps: leads.filter((l: any) => l.status === "Follow-up")
        .length,
      pieData,
    };
  }, [leads]);

  return (
    <div 
      className="min-h-screen p-8"
      style={{ backgroundColor: '#FEF9F5' }}
    >
      <h1 
        className="text-3xl mb-6"
        style={{ 
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          color: '#0000CC'
        }}
      >
        Telecommunicator Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className="p-4 rounded-xl shadow-lg border-2"
          style={{ 
            backgroundColor: 'white',
            borderColor: '#E6E6FF'
          }}
        >
          <p 
            className="text-sm text-gray-500"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Today's New Leads
          </p>
          <p 
            className="text-3xl"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              color: '#0000CC'
            }}
          >
            {stats.newLeads}
          </p>
        </div>
        <div 
          className="p-4 rounded-xl shadow-lg border-2"
          style={{ 
            backgroundColor: 'white',
            borderColor: '#E6E6FF'
          }}
        >
          <p 
            className="text-sm text-gray-500"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Calls to Make
          </p>
          <p 
            className="text-3xl text-gray-800"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
          >
            {stats.callsToMake}
          </p>
        </div>
        <div 
          className="p-4 rounded-xl shadow-lg border-2"
          style={{ 
            backgroundColor: 'white',
            borderColor: '#E6E6FF'
          }}
        >
          <p 
            className="text-sm text-gray-500"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Calls Made
          </p>
          <p 
            className="text-3xl text-green-600"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
          >
            {stats.meetingsScheduled}
          </p>
        </div>
        <div 
          className="p-4 rounded-xl shadow-lg border-2"
          style={{ 
            backgroundColor: 'white',
            borderColor: '#E6E6FF'
          }}
        >
          <p 
            className="text-sm text-gray-500"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Pending Follow-ups
          </p>
          <p 
            className="text-3xl text-yellow-600"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
          >
            {stats.pendingFollowUps}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bar Chart: Daily Call Performance */}
          <div 
            className="p-6 rounded-xl shadow-lg border-2"
            style={{ 
              backgroundColor: 'white',
              borderColor: '#E6E6FF'
            }}
          >
            <h2 
              className="text-xl mb-4"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                color: '#0000CC'
              }}
            >
              Daily Call Performance
            </h2>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={dailyCallData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="target"
                    fill="#e5e7eb"
                    name="Target"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="calls"
                    fill="#0000CC"
                    name="Calls Made"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Lead Status Breakdown */}
          <div 
            className="p-6 rounded-xl shadow-lg border-2"
            style={{ 
              backgroundColor: 'white',
              borderColor: '#E6E6FF'
            }}
          >
            <h2 
              className="text-xl mb-4"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                color: '#0000CC'
              }}
            >
              Lead Status Breakdown
            </h2>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(props: any) => {
                      const { name, percent } = props;
                      return `${name} ${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {stats.pieData.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div 
          className="p-6 rounded-xl shadow-lg border-2"
          style={{ 
            backgroundColor: 'white',
            borderColor: '#E6E6FF'
          }}
        >
          <h2 
            className="text-xl mb-4 flex items-center"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              color: '#0000CC'
            }}
          >
            <Lightbulb 
              className="mr-3"
              style={{ color: '#0000CC' }}
            />
            Suggested Strategies
          </h2>
          <ul 
            className="space-y-3 list-disc list-inside text-sm text-gray-600"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <li>
              Leads from "Webinar Signup" have a 25% higher conversion rate this
              month. Prioritize these calls.
            </li>
            <li>
              Mention our new "RISE" package to leads from the tech industry.
            </li>
            <li>
              Follow up with leads who were contacted but didn't answer within
              24 hours.
            </li>
          </ul>
        </div>
      </div>

      {/* NEW: Leads Table with Red Status Badges */}
      <div 
        className="p-6 rounded-xl shadow-lg border-2"
        style={{ 
          backgroundColor: 'white',
          borderColor: '#E6E6FF'
        }}
      >
        <h2 
          className="text-xl mb-4"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            color: '#0000CC'
          }}
        >
          Recent Leads
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#F9FAFB' }}>
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#6B7280'
                  }}
                >
                  Name
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#6B7280'
                  }}
                >
                  Company
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#6B7280'
                  }}
                >
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#6B7280'
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.slice(0, 5).map((lead: Lead) => (
                <tr key={lead.id}>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {lead.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* RED STATUS BADGE */}
                    <span 
                      className="px-3 py-1 text-xs text-white rounded-lg"
                      style={{ 
                        backgroundColor: '#DC2626',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* RED ACTION BUTTON */}
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="px-4 py-2 text-xs text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ 
                        backgroundColor: '#DC2626',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      Log Activity
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LogActivityModal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onLogActivity={handleLogActivity}
      />
    </div>
  );
};

export default NewLeadsDashboard;
