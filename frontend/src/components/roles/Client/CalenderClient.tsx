import React, { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Hash,
  FileText,
  X,
  MessageSquare,
  Info,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../utils/api/Employees/api";

// --- TYPE DEFINITIONS ---
interface MarketingContent {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string from backend
  hashtags: string[];
  // NEW: Added status to the type definition for safety and clarity
  status: "pending_review" | "approved" | "rework_requested" | "DM_APPROVED";
  reworkCount: number;
}

// --- MODAL COMPONENT ---
const ContentModal = ({
  isOpen,
  onClose,
  content,
  onApprove,
  onRework,
}: {
  isOpen: boolean;
  onClose: () => void;
  // Make sure the MarketingContent type includes reworkCount
  content: (MarketingContent & { reworkCount: number }) | null;
  onApprove: (id: string) => void;
  onRework: (id: string, comment: string) => void;
}) => {
  const [isReworking, setIsReworking] = useState(false);
  const [reworkComment, setReworkComment] = useState("");

  if (!content) return null;

  const handleSendRework = () => {
    if (!content || !reworkComment.trim()) return;
    onRework(content.id, reworkComment);
    setIsReworking(false);
    setReworkComment("");
  };

  const handleClose = () => {
    setIsReworking(false);
    setReworkComment("");
    onClose();
  };

  const getStatusStyles = (status: MarketingContent["status"]) => {
    switch (status) {
      case "rework_requested":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
      case "DM_APPROVED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const isAlreadyReworked = content.status === "rework_requested";
  // This variable determines the button's state
  const reworkLimitReached = content.reworkCount >= 3;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
              {/* ... Dialog Title and Content sections remain the same ... */}
              <div className="flex justify-between items-start">
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    {content.title || "Marketing Guide"}
                  </Dialog.Title>
                  <div
                    className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles(
                      content.status
                    )}`}
                  >
                    {content.status?.replace("_", " ") || "NO STATUS"}
                  </div>
                </div>
                <button onClick={handleClose}>
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="bg-gray-50 border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-line">
                    {content.content}
                  </p>
                </div>
                {content.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {content.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {isReworking && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback for rework:
                  </label>
                  <textarea
                    className="w-full border rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={reworkComment}
                    onChange={(e) => setReworkComment(e.target.value)}
                    placeholder="Describe what needs to be improved..."
                  />
                </div>
              )}

              {/* --- ACTION BUTTONS SECTION --- */}
              <div className="mt-6 flex justify-end space-x-3">
                {content.status === "approved" || content.status === "DM_APPROVED" ? (
                  <div className="flex items-center p-3 text-sm text-green-800 bg-green-50 rounded-lg w-full">
                    <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>
                      This content has been approved. No further actions are
                      needed.
                    </span>
                  </div>
                ) : isAlreadyReworked ? (
                  <div className="flex items-center p-3 text-sm text-yellow-800 bg-yellow-50 rounded-lg w-full">
                    <Info className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>
                      This content is pending rework. You will be notified when
                      an update is available.
                    </span>
                  </div>
                ) : !isReworking ? (
                  <>
                    {/* 👇 THIS IS THE MODIFIED BUTTON 👇 */}
                    <button
                      onClick={() => setIsReworking(true)}
                      disabled={reworkLimitReached} // CHANGED: Disable button if limit is reached
                      title={
                        reworkLimitReached
                          ? "You have reached the limit to rework"
                          : ""
                      } // CHANGED: Add hover message
                      className={`px-4 py-2 text-white rounded-lg font-semibold transition-colors ${
                        reworkLimitReached
                          ? "bg-gray-400 cursor-not-allowed" // CHANGED: Add disabled styles
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Request Rework
                    </button>
                    <button
                      onClick={() => onApprove(content.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsReworking(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendRework}
                      disabled={!reworkComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-blue-300"
                    >
                      Send Feedback
                    </button>
                  </>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- MAIN COMPONENT ---
const ClientCalendarDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [contentData, setContentData] = useState<MarketingContent[]>([]);
  const [activeContent, setActiveContent] = useState<MarketingContent | null>(
    null
  );

  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();
  // NEW: State to trigger a refresh after an action
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // 1. Fetch client data (runs on mount and whenever toggle changes)
  useEffect(() => {
    const fetchClientInfo = async () => {
      const response = await api.Client.getContentData.get(
        accessToken,
        dispatch
      );
      setContentData(response.content || []);
      console.log("Fetched content data: ", response.content);
    };

    fetchClientInfo();
  }, [accessToken, dispatch, needsRefresh]);

  // 2. Subscribe realtime (runs only once on mount)
  useEffect(() => {
    let channel: any;

    const setupSubscription = async () => {
      const response = await api.Client.getMyClientId.get(
        accessToken,
        dispatch
      );
      const clientId = response.clientId;

      channel = supabase
        .channel("Content-Functionality")
        .on("broadcast", { event: "leads_updated" }, async (payload) => {
          const content = payload.payload.content;
          const eventClientId = content.clientId;

          if (eventClientId === clientId) {
            console.log("Content updated for your client. Refreshing...");
            const time = setTimeout(async () => {
              try {
                console.log("Ready to fetch the data");
                const response = await api.Client.getContentData.get(
                  accessToken,
                  dispatch
                );
                setContentData(response.content || []);
                console.log("the data fetched: ", response.content);
              } catch (err) {
                console.error("Failed to refresh content:", err);
              }
            }, 10000);
            console.log("It is working");
          }
        })
        .subscribe();
    };

    setupSubscription();

    // ✅ cleanup at the hook level
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
  });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getContentForDate = (date: Date) => {
    return contentData.filter((c) => isSameDay(new Date(c.date), date));
  };

  const handleApprove = async (id: string) => {
    try {
      await api.Client.approval.put(accessToken, dispatch, id);
      alert("The Content is Approved");
    } catch (error) {
      alert("The content is not approved");
      console.error(error);
    }
    setActiveContent(null);
  };

  const handleRework = async (id: string, comment: string) => {
    console.log("hi");
    try {
      await api.Client.rework.add(accessToken, dispatch, id, comment);
    } catch (error) {
      console.log(error);
    }
    setActiveContent(null);
  };

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Your Campaign Calendar
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Real-time overview of your scheduled marketing guides.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-t border-l border-gray-200">
            {weekdays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-500 py-2 border-r border-b"
              >
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const dayContent = getContentForDate(day);

              return (
                <div
                  key={index}
                  className={`relative p-2 h-32 border-r border-b flex flex-col ${
                    !isSameMonth(day, startOfMonth(currentDate))
                      ? "bg-gray-50"
                      : "bg-white"
                  }`}
                >
                  <span
                    className={`font-medium text-xs ${
                      isSameDay(day, new Date())
                        ? "text-blue-600 font-bold"
                        : "text-gray-600"
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  <div className="mt-1 space-y-1">
                    {dayContent.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveContent(c)}
                        className="w-full text-left px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800 font-medium truncate hover:bg-blue-200"
                      >
                        <FileText className="inline h-4 w-4 mr-1" />
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ContentModal
        isOpen={!!activeContent}
        onClose={() => setActiveContent(null)}
        content={activeContent}
        onApprove={handleApprove}
        onRework={handleRework}
      />
    </div>
  );
};

export default ClientCalendarDashboard;
