import React, { useState, Fragment, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Phone, Mail, Send, Star, EyeOff } from "lucide-react";
import { api } from "../../../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../../../redux/slice/authSlice";
import ToastNotification from "../../../../ToastMessageComp";

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
  | "Interested"
  | "Interested - Scheduled Follow-up"
  | "Not Interested";

interface Lead {
  id: string;
  name?: string;
  company: string;
  phone?: string;
  email?: string;
  source: string;
  status: LeadStatus;
  package?: { name: string };
}

// --- HELPER FUNCTIONS ---
const maskPhone = (phone: string) => {
  if (!phone) return "";
  return phone.replace(/(\d{2})\d{4}(\d{2})$/, "$1******$2");
};

const maskEmail = (email: string) => {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return (
    user.slice(0, 2) + "*".repeat(Math.max(0, user.length - 2)) + "@" + domain
  );
};

// --- LOG ACTIVITY MODAL ---
const LogActivityModal = ({ isOpen, onClose, lead, onLogActivity }: any) => {
  const [outcome, setOutcome] = useState<ActivityOutcome>(
    "Contacted - No Answer"
  );
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [actions, setActions] = useState({
    discussedPricing: false,
    sentFollowUp: false,
    scheduledDemo: false,
  });

  useEffect(() => {
    setRating(0);
    setActions({
      discussedPricing: false,
      sentFollowUp: false,
      scheduledDemo: false,
    });
  }, [outcome]);

  if (!isOpen || !lead) return null;

  const handleLog = () => {
    onLogActivity(lead.id, outcome, notes, rating, actions);
    onClose();
    setNotes("");
    setRating(0);
    setActions({
      discussedPricing: false,
      sentFollowUp: false,
      scheduledDemo: false,
    });
  };

  const handleCompanyCall = async (leadId: string) => {
    alert("Initiating call to lead ID: " + leadId);
  };

  const handleActionToggle = (action: any) => {
    setActions((prev: any) => ({ ...prev, [action]: !prev[action] }));
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
                  Log Activity for {lead.name || lead.company}
                </Dialog.Title>

                {/* CONTACT DETAILS (MASKED) */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    Contact Details
                  </h4>
                  <div className="flex items-center text-gray-700 justify-between">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-blue-500" />
                      {maskPhone(lead.phone)}
                    </div>
                    <button
                      onClick={() => handleCompanyCall(lead.id)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Call via Company
                    </button>
                  </div>
                  {lead.email && (
                    <div className="mt-2 flex items-center text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      {maskEmail(lead.email)}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-400 italic">
                    The real number is hidden. The call will be made through the
                    company phone line.
                  </p>
                </div>

                {/* FORM FIELDS */}
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
                      <option>Interested</option>
                      <option>Interested - Scheduled Follow-up</option>
                      <option>Not Interested</option>
                    </select>
                  </div>

                  {/* ACTIONS */}
                  <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actions Taken
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {[
                          ["discussedPricing", "Discussed Pricing"],
                          ["sentFollowUp", "Sent Follow-up"],
                          ["scheduledDemo", "Scheduled Demo"],
                        ].map(([key, label]) => (
                          <label
                            key={key}
                            className="flex items-center text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={actions[key as keyof typeof actions]}
                              onChange={() => handleActionToggle(key)}
                              className="h-4 w-4 rounded mr-2"
                            />{" "}
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* RATING */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Rating
                      </label>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <button key={i} onClick={() => setRating(i + 1)}>
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                i < rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* NOTES */}
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

                {/* SUBMIT */}
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

// --- MAIN COMPONENT ---
const FollowUpDashboard = ({ info }: any) => {
  const [leads, setLeads] = useState(info);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>("All");
  const [loading, setloading] = useState(false);
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // --- Compute dynamic package grouping ---
  const packageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((lead: any) => {
      const pkg = lead.package?.name || "Unknown";
      counts[pkg] = (counts[pkg] || 0) + 1;
    });
    return counts;
  }, [leads]);

  const uniquePackages = ["All", ...Object.keys(packageCounts)];

  const filteredLeads =
    selectedPackage === "All"
      ? leads
      : leads.filter((l: any) => l.package?.name === selectedPackage);

  const handleLogActivity = async (
    leadId: string,
    outcome: ActivityOutcome,
    notes: string,
    rating: any
  ) => {
    let newStatus: LeadStatus;

    if (outcome === "Interested - Scheduled Follow-up") {
      newStatus = "Follow-up";
    } else if (outcome === "Interested") {
      newStatus = "Interested";
    } else if (outcome === "Not Interested") {
      newStatus = "Not Interested";
    } else {
      newStatus = "Contacted";
    }

    try {
      setloading(true);
      await api.TelleCaller.ChangeStatus.post(
        accessToken,
        dispatch,
        leadId,
        newStatus
      );
      setToast({
        show: true,
        message: `Lead status updated successfully.`,
        type: "success",
      });
    } catch (error) {
      console.log(error);
      setToast({
        show: true,
        message: "Failed to update status. Please try again.",
        type: "error",
      });
    } finally {
      setloading(false);
    }

    setLeads((prev: any) =>
      prev.map((l: any) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  };

  const handleSendToDeveloper = async (leadId: string) => {
    try {
      setloading(true);
      await api.TelleCaller.SendToBussinessDeveloper.post(
        accessToken,
        dispatch,
        leadId
      );
      setToast({
        show: true,
        message: "The Lead sent to Business Developer successfully.",
        type: "success",
      });
    } catch (error) {
      console.log(error);
      setToast({
        show: true,
        message: "Failed to send lead to Business Developer. Please try again.",
        type: "error",
      });
    } finally {
      setloading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  const followUps = leads.filter((l: any) => l.status === "Follow-up");

  return (
    <div className="min-h-screen">
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Contacted & Follow-up Leads
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(packageCounts).map(([pkg, count]) => (
          <div key={pkg} className="p-4 bg-white rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">{pkg} Leads</p>
            <p className="text-3xl font-bold text-blue-600">{count}</p>
          </div>
        ))}
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Hot Leads (Interested)</p>
          <p className="text-3xl font-bold text-orange-500">
            {leads.filter((l: any) => l.status === "Interested").length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Pending Follow-ups</p>
          <p className="text-3xl font-bold text-yellow-600">
            {followUps.length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Total Calls to Make</p>
          <p className="text-3xl font-bold text-gray-800">
            {leads.filter((l: any) => l.status === "New").length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mr-2">
          Filter by Package:
        </label>
        <select
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
          className="p-2 border rounded-md"
        >
          {uniquePackages.map((pkg) => (
            <option key={pkg}>{pkg}</option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Leads Queue ({selectedPackage})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead: any) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {lead.name || lead.company}
                    </p>
                    <p className="text-sm text-gray-500">{lead.company}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {lead.package?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === "Interested"
                          ? "bg-yellow-100 text-yellow-800"
                          : lead.status === "Follow-up"
                          ? "bg-indigo-100 text-indigo-800"
                          : lead.status === "New"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200"
                      >
                        Log Activity
                      </button>
                      {lead.status === "Interested" && (
                        <button
                          onClick={() => handleSendToDeveloper(lead.id)}
                          className="flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-700 font-semibold rounded-full hover:bg-green-200"
                        >
                          <Send className="h-4 w-4 mr-2" /> Send to Business
                          Developer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <p className="text-center py-4 text-gray-500">
              No leads available for this package.
            </p>
          )}
        </div>
      </div>

      {/* MODAL */}
      <LogActivityModal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onLogActivity={handleLogActivity}
      />
    </div>
  );
};

export default FollowUpDashboard;
