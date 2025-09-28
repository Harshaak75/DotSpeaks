import React, { useState, Fragment, useMemo, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Phone, Mail, Send, Star } from "lucide-react";
import { api } from "../../../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../../../redux/slice/authSlice";

// --- TYPE DEFINITIONS ---
type LeadStatus =
  | "New"
  | "Contacted"
  | "Follow-up"
  | "Interested"
  | "Forwarded"
  | "Not Interested";
// MODIFIED: Added 'Interested' as a direct outcome
type ActivityOutcome =
  | "Contacted - No Answer"
  | "Contacted - Left Voicemail"
  | "Emailed"
  | "Interested"
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
                  Log Activity for {lead.name}
                </Dialog.Title>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    Contact Details
                  </h4>
                  <div className="space-y-2">
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {lead.email}
                      </a>
                    )}
                  </div>
                </div>

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

                  <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actions Taken
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={actions.discussedPricing}
                            onChange={() =>
                              handleActionToggle("discussedPricing")
                            }
                            className="h-4 w-4 rounded mr-2"
                          />{" "}
                          Discussed Pricing
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={actions.sentFollowUp}
                            onChange={() => handleActionToggle("sentFollowUp")}
                            className="h-4 w-4 rounded mr-2"
                          />{" "}
                          Sent Follow-up
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={actions.scheduledDemo}
                            onChange={() => handleActionToggle("scheduledDemo")}
                            className="h-4 w-4 rounded mr-2"
                          />{" "}
                          Scheduled Demo
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Ratings
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

// --- MAIN COMPONENT ---
const FollowUpDashboard = ({ info }: any) => {
  const [leads, setLeads] = useState(info);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setloading] = useState(false);
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  console.log("info", info);

  const handleLogActivity = async (
    leadId: string,
    outcome: ActivityOutcome,
    notes: string
  ) => {
    let newStatus: LeadStatus;

    // --- THIS IS THE FIX ---
    // The logic is now more specific to correctly assign the status.
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
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }

    setLeads((prev: any) =>
      prev.map((l: any) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    alert(`Activity logged for lead ID ${leadId}.`);
  };

  const handleSendToDeveloper = async (leadId: string) => {
    try {
      setloading(true);
      await api.TelleCaller.SendToBussinessDeveloper.post(
        accessToken,
        dispatch,
        leadId
      );
    } catch (error) {
      console.log(error);
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

  const followUps = info.filter((l: any) => {
  console.log(l.status); // ✅ This will log
  return l.status?.trim() === "Follow-up";
});
  return (
    <div className=" min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Contacted & Follow-up Leads
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Pending Follow-ups</p>
          <p className="text-3xl font-bold text-yellow-600">
            {followUps.length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Hot Leads (Interested)</p>
          <p className="text-3xl font-bold text-orange-500">
            {leads.filter((l: any) => l.status === "Interested").length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Meetings Scheduled</p>
          <p className="text-3xl font-bold text-green-600">{4}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Total Calls to Make</p>
          <p className="text-3xl font-bold text-gray-800">
            {info.filter((l: any) => l.status === "New").length}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Follow-up Queue
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
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
              {info.map((lead: any) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.company}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === "Interested"
                          ? "bg-yellow-100 text-yellow-800"
                          : lead.status === "Follow-up"
                          ? "bg-indigo-100 text-indigo-800"
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

export default FollowUpDashboard;
