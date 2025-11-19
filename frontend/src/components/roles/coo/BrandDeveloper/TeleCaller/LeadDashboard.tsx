import { useState, Fragment, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Phone, Mail, Send, Star } from "lucide-react";
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
                    Log Activity for {lead.name || lead.company}
                  </Dialog.Title>
                </div>

                {/* Modal Content */}
                <div className="bg-white p-6">
                  {/* CONTACT DETAILS (MASKED) */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F9FAFB' }}>
                    <h4 
                      className="text-sm mb-2"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#0000CC'
                      }}
                    >
                      Contact Details
                    </h4>
                    <div className="flex items-center text-gray-700 justify-between">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" style={{ color: '#0000CC' }} />
                        <span style={{ fontFamily: 'Roboto, sans-serif' }}>{maskPhone(lead.phone)}</span>
                      </div>
                      <button
                        onClick={() => handleCompanyCall(lead.id)}
                        className="px-3 py-1 text-xs text-white rounded-lg hover:opacity-90"
                        style={{ 
                          backgroundColor: '#0000CC',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold'
                        }}
                      >
                        Call via Company
                      </button>
                    </div>
                    {lead.email && (
                      <div className="mt-2 flex items-center text-gray-700">
                        <Mail className="h-4 w-4 mr-2" style={{ color: '#0000CC' }} />
                        <span style={{ fontFamily: 'Roboto, sans-serif' }}>{maskEmail(lead.email)}</span>
                      </div>
                    )}
                    <p 
                      className="mt-2 text-xs text-gray-400 italic"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      The real number is hidden. The call will be made through the
                      company phone line.
                    </p>
                  </div>

                  {/* FORM FIELDS */}
                  <div className="mt-4 space-y-4">
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
                        <option>Interested</option>
                        <option>Interested - Scheduled Follow-up</option>
                        <option>Not Interested</option>
                      </select>
                    </div>

                    {/* ACTIONS */}
                    <div className="p-4 rounded-lg border space-y-3" style={{ backgroundColor: '#F9FAFB' }}>
                      <div>
                        <label 
                          className="block text-sm mb-2"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#0000CC'
                          }}
                        >
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
                              style={{ fontFamily: 'Roboto, sans-serif' }}
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
                        <label 
                          className="block text-sm mb-1"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#0000CC'
                          }}
                        >
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

                  {/* SUBMIT */}
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
    outcome: ActivityOutcome
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
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: '#0000CC' }}
        ></div>
      </div>
    );

  const followUps = leads.filter((l: any) => l.status === "Follow-up");

  return (
    <div 
      className="min-h-screen p-8"
      style={{ backgroundColor: '#FEF9F5' }}
    >
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <h1 
        className="text-3xl mb-6"
        style={{ 
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          color: '#0000CC'
        }}
      >
        Contacted & Follow-up Leads
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(packageCounts).map(([pkg, count]) => (
          <div 
            key={pkg} 
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
              {pkg} Leads
            </p>
            <p 
              className="text-3xl"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                color: '#0000CC'
              }}
            >
              {count}
            </p>
          </div>
        ))}
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
            Hot Leads (Interested)
          </p>
          <p 
            className="text-3xl text-orange-500"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
          >
            {leads.filter((l: any) => l.status === "Interested").length}
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
            {followUps.length}
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
            Total Calls to Make
          </p>
          <p 
            className="text-3xl text-gray-800"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
          >
            {leads.filter((l: any) => l.status === "New").length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label 
          className="text-sm mr-2"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            color: '#0000CC'
          }}
        >
          Filter by Package:
        </label>
        <select
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
          className="p-2 border rounded-md"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {uniquePackages.map((pkg) => (
            <option key={pkg}>{pkg}</option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
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
          Leads Queue ({selectedPackage})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#F9FAFB' }}>
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#6B7280'
                  }}
                >
                  Contact
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#6B7280'
                  }}
                >
                  Package
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#6B7280'
                  }}
                >
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase"
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
              {filteredLeads.map((lead: any) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4">
                    <p 
                      className="font-medium text-gray-900"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {lead.name || lead.company}
                    </p>
                    <p 
                      className="text-sm text-gray-500"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {lead.company}
                    </p>
                  </td>
                  <td 
                    className="px-6 py-4 text-sm text-gray-700"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {lead.package?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {/* RED ACTION BUTTON */}
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 text-xs text-white rounded-lg hover:opacity-90 transition-opacity"
                        style={{ 
                          backgroundColor: '#DC2626',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold'
                        }}
                      >
                        Log Activity
                      </button>
                      {lead.status === "Interested" && (
                        <button
                          onClick={() => handleSendToDeveloper(lead.id)}
                          className="flex items-center px-3 py-1.5 text-xs text-white rounded-lg hover:opacity-90 transition-opacity"
                          style={{ 
                            backgroundColor: '#DC2626',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold'
                          }}
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
            <p 
              className="text-center py-4 text-gray-500"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
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
