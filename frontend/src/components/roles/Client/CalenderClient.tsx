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
  Eye,
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
  imageUrls: string[];
}

// --- MODAL COMPONENT ---
// const ContentModal = ({
//   isOpen,
//   onClose,
//   content,
//   onApprove,
//   onRework,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   // Make sure the MarketingContent type includes reworkCount
//   content: (MarketingContent & { reworkCount: number }) | null;
//   onApprove: (id: string) => void;
//   onRework: (id: string, comment: string) => void;
// }) => {
//   const [isReworking, setIsReworking] = useState(false);
//   const [reworkComment, setReworkComment] = useState("");

//   if (!content) return null;

//   const handleSendRework = () => {
//     if (!content || !reworkComment.trim()) return;
//     onRework(content.id, reworkComment);
//     setIsReworking(false);
//     setReworkComment("");
//   };

//   const handleClose = () => {
//     setIsReworking(false);
//     setReworkComment("");
//     onClose();
//   };

//   const getStatusStyles = (status: MarketingContent["status"]) => {
//     switch (status) {
//       case "rework_requested":
//         return "bg-yellow-100 text-yellow-800";
//       case "approved":
//       case "DM_APPROVED":
//         return "bg-green-100 text-green-800";
//       default:
//         return "bg-blue-100 text-blue-800";
//     }
//   };

//   // const isAlreadyApproved = content.status === "approved" || content.status === "DM_APPROVED";

//   const isAlreadyReworked = content.status === "rework_requested";
//   // This variable determines the button's state
//   const reworkLimitReached = content.reworkCount >= 3;

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-50" onClose={handleClose}>
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
//         </Transition.Child>
//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
//               {/* ... Dialog Title and Content sections remain the same ... */}
//               <div className="flex justify-between items-start">
//                 <div>
//                   <Dialog.Title className="text-xl font-bold text-gray-900">
//                     {content.title || "Marketing Guide"}
//                   </Dialog.Title>
//                   <div
//                     className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles(
//                       content.status
//                     )}`}
//                   >
//                     {content.status?.replace("_", " ") || "NO STATUS"}
//                   </div>
//                 </div>
//                 <button onClick={handleClose}>
//                   <X className="h-6 w-6 text-gray-500" />
//                 </button>
//               </div>
//               <div className="mt-4 space-y-4">
//                 <div className="bg-gray-50 border rounded-lg p-4 max-h-60 overflow-y-auto">
//                   <p className="text-gray-700 whitespace-pre-line">
//                     {content.content}
//                   </p>
//                 </div>
//                 {content.hashtags?.length > 0 && (
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {content.hashtags.map((tag, idx) => (
//                       <span
//                         key={idx}
//                         className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
//                       >
//                         {/* <Hash className="h-3 w-3 mr-1" /> */}
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               {isReworking && (
//                 <div className="mt-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Feedback for rework:
//                   </label>
//                   <textarea
//                     className="w-full border rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows={3}
//                     value={reworkComment}
//                     onChange={(e) => setReworkComment(e.target.value)}
//                     placeholder="Describe what needs to be improved..."
//                   />
//                 </div>
//               )}

//               {/* --- ACTION BUTTONS SECTION --- */}
//               <div className="mt-6 flex justify-end space-x-3">
//                 {content.status === "approved" ||
//                 content.status === "DM_APPROVED" ? (
//                   <div className="flex items-center p-3 text-sm text-green-800 bg-green-50 rounded-lg w-full">
//                     <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
//                     <span>
//                       This content has been approved. No further actions are
//                       needed.
//                     </span>
//                   </div>
//                 ) : isAlreadyReworked ? (
//                   <div className="flex items-center p-3 text-sm text-yellow-800 bg-yellow-50 rounded-lg w-full">
//                     <Info className="h-5 w-5 mr-3 flex-shrink-0" />
//                     <span>
//                       This content is pending rework. You will be notified when
//                       an update is available.
//                     </span>
//                   </div>
//                 ) : !isReworking ? (
//                   <>
//                     {/* 👇 THIS IS THE MODIFIED BUTTON 👇 */}
//                     <button
//                       onClick={() => setIsReworking(true)}
//                       disabled={reworkLimitReached} // CHANGED: Disable button if limit is reached
//                       title={
//                         reworkLimitReached
//                           ? "You have reached the limit to rework"
//                           : ""
//                       } // CHANGED: Add hover message
//                       className={`px-4 py-2 text-white rounded-lg font-semibold transition-colors ${
//                         reworkLimitReached
//                           ? "bg-gray-400 cursor-not-allowed" // CHANGED: Add disabled styles
//                           : "bg-red-600 hover:bg-red-700"
//                       }`}
//                     >
//                       Feedback
//                     </button>
//                     <button
//                       onClick={() => onApprove(content.id)}
//                       className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
//                     >
//                       Approve
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       onClick={() => setIsReworking(false)}
//                       className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleSendRework}
//                       disabled={!reworkComment.trim()}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-blue-300"
//                     >
//                       Send Feedback
//                     </button>
//                   </>
//                 )}
//               </div>
//             </Dialog.Panel>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };

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
   const [currentImageIndex, setCurrentImageIndex] = useState(0); 

  useEffect(() => {
    if (!isOpen) {
      setIsReworking(false);
      setReworkComment("");
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  if (!content) return null;

  const handleSendRework = () => {
    if (!reworkComment.trim()) return;
    onRework(content.id, reworkComment);
  };

  const isContentReview = content.status === 'approved' || content.status === "pending_review";
  const isDesignReview = content.status === 'DM_APPROVED';
  const reworkLimitReached = content.reworkCount >= 3;

    const navigateImages = (direction: 'prev' | 'next') => {
    if (!content || !content.imageUrls || content.imageUrls.length === 0) return;
    const totalImages = content.imageUrls.length;
    if (direction === 'next') {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
    } else {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    }
  };

  return (
<Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
              <div className="flex justify-between items-start">
                <Dialog.Title className="text-xl font-bold text-gray-900">{content.title}</Dialog.Title>
                <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Marketing Guide</h3>
                  <div className="bg-gray-50 border rounded-lg p-4 max-h-72 overflow-y-auto"><p className="text-gray-700 whitespace-pre-line">{content.content}</p></div>
                </div>

                {/* --- UPDATED VISUALS SECTION START --- */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Visuals</h3>
                  {isDesignReview && content.imageUrls?.length > 0 ? (
                    <div className="relative w-full aspect-video border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner">
                      {/* Current Image */}
                      <img 
                        src={content.imageUrls[currentImageIndex]} 
                        alt={`Visual ${currentImageIndex + 1}`} 
                        className="w-full h-full object-contain transition-transform duration-300 ease-in-out" // object-contain for full image visibility
                      />
                      
                      {/* Navigation Arrows (only if more than one image) */}
                      {content.imageUrls.length > 1 && (
                        <>
                          <button 
                            onClick={() => navigateImages('prev')} 
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10"
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button 
                            onClick={() => navigateImages('next')} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10"
                            aria-label="Next image"
                          >
                            <ChevronRight size={20} />
                          </button>
                          {/* Image Count Indicator */}
                          <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                            {currentImageIndex + 1} / {content.imageUrls.length}
                          </div>
                        </>
                      )}

                      {/* View Full Size Button on hover */}
                      <a href={content.imageUrls[currentImageIndex]} target="_blank" rel="noopener noreferrer" 
                         className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 group">
                        <span className="flex items-center text-white text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                          <Eye className="h-4 w-4 mr-1.5" /> View Full Size
                        </span>
                      </a>
                    </div>
                  ) : (
                    // Placeholder when no visuals or not yet in design review
                    <div className="flex flex-col items-center justify-center h-full min-h-[180px] border-2 border-dashed rounded-lg bg-gray-50 text-gray-500 p-4">
                      {isDesignReview ? (
                         <>
                            <Info className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-center">No visuals were submitted for this guide.</p>
                         </>
                      ) : (
                         <>
                            <FileText className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-center">Visuals will appear here after the content is approved for design.</p>
                         </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isReworking && (
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback for rework:</label>
                    <textarea className="w-full border rounded-lg p-2" rows={3} value={reworkComment} onChange={(e) => setReworkComment(e.target.value)} placeholder="Please provide specific feedback..."/>
                 </div>
              )}

              <div className="mt-[3rem] flex justify-end space-x-3">
                {isReworking ? (
                    <>
                        <button onClick={() => setIsReworking(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                        <button onClick={handleSendRework} disabled={!reworkComment.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-blue-300">Send Feedback</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsReworking(true)} disabled={reworkLimitReached} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed">Request Rework</button>
                        <button onClick={() => onApprove(content.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                            {isContentReview ? 'Approve Content' : 'Accept Design'}
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
  const [needsRefreshs, setNeedsRefreshs] = useState(false);

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

  useEffect(() => {
    let channel: any;

    const setupSubscription = async () => {
      // 1. Get the current client's ID to build the channel name and for comparison
      const response = await api.Client.getMyClientId.get(
        accessToken,
        dispatch
      );
      const clientId = response.clientId;

      if (!clientId) {
        console.error("Could not get client ID for subscription.");
        return;
      }

      // 2. Use the correct private channel name
      const privateChannelName = `private-client-notifications-${clientId}`;

      channel = supabase.channel(privateChannelName);

      channel
        .on(
          "broadcast",
          // 3. Listen for the specific event from your backend (e.g., 'design_ready_for_review')
          { event: "design_ready_for_review" },
          async (payload: any) => {
            // Get the clientId from the broadcast's payload
            const eventClientId = payload.payload.clientId;

            // 4. Check if the broadcast is intended for this client
            if (eventClientId === clientId) {
              console.log(
                "Update received for this client. Waiting to refresh..."
              );

              // 5. Use setTimeout to wait for 10 seconds before fetching
              setTimeout(async () => {
                try {
                  console.log("Timer finished. Fetching updated data...");
                  const response = await api.Client.getContentDesignData.get(
                    accessToken,
                    dispatch
                  );
                  // Directly update the state with the new data
                  setContentData(response.content || []);
                  console.log(
                    "Data fetched and calendar updated.",
                    response.content
                  );
                } catch (err) {
                  console.error("Failed to refresh content after delay:", err);
                }
              }, 10000); // 10-second delay
            }
          }
        )
        .subscribe((status: any) => {
          if (status === "SUBSCRIBED") {
            console.log(`Successfully subscribed to ${privateChannelName}`);
          }
        });
    };

    setupSubscription();

    // Cleanup subscription when the component unmounts
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []); // Dependencies

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

  const getStatusStyles = (status: any) => {
    switch (status) {
      case "pending_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "approved":
        return "bg-green-100 text-green-800 border-green-400";
      case "rework_requested":
        return "bg-red-100 text-red-800 border-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
                        className={`w-full text-left px-2 py-1 font-bold text-xs rounded-md ${getStatusStyles(
                          c.status
                        )} truncate hover:bg-blue-200`}
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
