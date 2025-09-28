import React, { useState, Fragment, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Phone,
  Mail,
  Send,
  User,
  Globe,
  ChevronRight,
  CheckCircle,
  X,
  MessageSquare,
  PhoneOutgoing,
  Users as UsersIcon,
  Archive,
  Lightbulb,
  Plus,
} from "lucide-react";
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
import { api } from "../../../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../../../redux/slice/authSlice";

// Pie chart color palette
const PIE_COLORS = [
  "#3b82f6",
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
}

// --- MOCK DATA ---
const initialLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Alice Johnson",
    company: "Innovate Inc.",
    phone: "555-0101",
    email: "alice.j@innovate.com",
    source: "Website Visit",
    status: "New",
  },
  {
    id: "lead-2",
    name: "Bob Williams",
    company: "Future Gadgets",
    email: "bob.w@futuregadgets.com",
    source: "Webinar Signup",
    status: "New",
  },
  {
    id: "lead-3",
    name: "Charlie Brown",
    company: "Eco Solutions",
    phone: "555-0103",
    source: "Referral",
    status: "New",
  },
  {
    id: "lead-4",
    name: "Diana Miller",
    company: "Data Systems",
    phone: "555-0104",
    email: "diana.m@datasys.com",
    source: "Website Visit",
    status: "New",
  },
];

// --- LOG ACTIVITY MODAL ---
const LogActivityModal = ({ isOpen, onClose, lead, onLogActivity }: any) => {
  const [outcome, setOutcome] = useState<ActivityOutcome>(
    "Contacted - No Answer"
  );
  const [notes, setNotes] = useState("");

  if (!isOpen || !lead) return null;

  const handleLog = () => {
    onLogActivity(lead.id, outcome, notes);
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900"
                >
                  Log Activity for {lead.name}
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Outcome
                    </label>
                    <select
                      value={outcome}
                      onChange={(e) =>
                        setOutcome(e.target.value as ActivityOutcome)
                      }
                      className="mt-1 w-full p-2 border rounded-md"
                    >
                      <option>Contacted - No Answer</option>
                      <option>Contacted - Left Voicemail</option>
                      <option>Emailed</option>
                      <option>Interested - Scheduled Follow-up</option>
                      <option>Not Interested</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-1 w-full p-2 border rounded-md"
                      placeholder="Add details about the interaction..."
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleLog}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                  >
                    Log Activity
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
interface Lead {
  id: string;
  status: LeadStatus;
  contactedDate?: string;
}

const mockLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Alice Johnson",
    company: "Innovate Inc.",
    source: "Website Visit",
    status: "New",
  },
  {
    id: "lead-2",
    name: "Bob Williams",
    company: "Future Gadgets",
    source: "Webinar Signup",
    status: "New",
  },
  {
    id: "lead-3",
    name: "Charlie Brown",
    company: "Eco Solutions",
    source: "Referral",
    status: "New",
  },
  {
    id: "lead-4",
    name: "Diana Miller",
    company: "Data Systems",
    source: "Website Visit",
    status: "Contacted",
    contactedDate: new Date().toISOString(),
  },
  {
    id: "lead-5",
    name: "Eve Smith",
    company: "GreenTech",
    source: "Referral",
    status: "Contacted",
    contactedDate: new Date().toISOString(),
  },
  {
    id: "lead-6",
    name: "Frank Lee",
    company: "Smart Solutions",
    source: "Cold Call",
    status: "Follow-up",
  },
  {
    id: "lead-7",
    name: "Grace Kim",
    company: "NextGen",
    source: "Webinar Signup",
    status: "Interested",
  },
  {
    id: "lead-8",
    name: "Henry Ford",
    company: "AutoMakers",
    source: "Website Visit",
    status: "Forwarded",
  },
];

const stats = {
  pieData: [
    { name: "New", value: mockLeads.filter((l) => l.status === "New").length },
    {
      name: "Contacted",
      value: mockLeads.filter((l) => l.status === "Contacted").length,
    },
    {
      name: "Follow-up",
      value: mockLeads.filter((l) => l.status === "Follow-up").length,
    },
    {
      name: "Interested",
      value: mockLeads.filter((l) => l.status === "Interested").length,
    },
    {
      name: "Forwarded",
      value: mockLeads.filter((l) => l.status === "Forwarded").length,
    },
  ],
  callsMade: 20,
};
const dailyCallData = [
  { day: "Mon", calls: 15, target: 20 },
  { day: "Tue", calls: 18, target: 20 },
  { day: "Wed", calls: 22, target: 20 },
  { day: "Thu", calls: 19, target: 20 },
  { day: "Fri", calls: stats.callsMade, target: 20 },
];

// --- MAIN COMPONENT ---
const NewLeadsDashboard = ({ info }: any) => {
  const [leads, setLeads] = useState(info);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleLogActivity = (
    leadId: string,
    outcome: ActivityOutcome,
    notes: string
  ) => {
    let newStatus: LeadStatus = "Contacted";
    if (outcome.includes("Interested")) newStatus = "Interested";
    if (outcome.includes("Not Interested")) newStatus = "Not Interested";
    if (outcome.includes("Follow-up")) newStatus = "Follow-up";

    setLeads((prev: any) =>
      prev.map((l: any) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    alert(
      `Activity logged for lead ID ${leadId}. In a real app, this lead would now move to the 'Contacted' queue.`
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
      meetingsScheduled: 4, // This would come from another data source
      pendingFollowUps: leads.filter((l: any) => l.status === "Follow-up")
        .length,
      pieData,
    };
  }, [leads]);

  return (
    <div className=" min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Telecommunicator Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Today's New Leads</p>
          <p className="text-3xl font-bold text-blue-600">{stats.newLeads}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Calls to Make</p>
          <p className="text-3xl font-bold text-gray-800">
            {stats.callsToMake}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Calls Made</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.meetingsScheduled}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Pending Follow-ups</p>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pendingFollowUps}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-1 gap-8">
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-8">
          {/* Bar Chart: Daily Call Performance */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
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
                    fill="#3b82f6"
                    name="Calls Made"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Lead Status Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
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
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {stats.pieData.map((entry, index) => (
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
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Lightbulb className="mr-3 text-purple-600" />
            Suggested Strategies
          </h2>
          <ul className="space-y-3 list-disc list-inside text-sm text-gray-600">
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
