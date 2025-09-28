import React, { useState, Fragment, useEffect } from "react";
import {
  Briefcase,
  User,
  Users,
  ChevronDown,
  FileText,
  Paintbrush,
  Mic,
  CheckCircle,
  AlertTriangle,
  X,
  Gem,
  Zap,
  Rocket,
  Crown,
  Star,
  Shield,
  MessageSquare,
  Send,
  Inbox,
  TrendingDown,
  BarChart2,
  Eye,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../../redux/store";
import { api } from "../../../../../../utils/api/Employees/api";
import { supabase } from "../../../../../../utils/supabase";

// --- TYPE DEFINITIONS ---
type Role =
  | "Digital Marketer"
  | "Graphics Designer"
  | "Project Manager"
  | "Content Strategist";

interface TeamMember {
  id: string;
  name: string;
  role: Role;
  avatarUrl: string;
}

interface Client {
  id: string;
  name: string;
  team: {
    name: string;
    members: TeamMember[];
  };
}

interface Request {
  id: string;
  from: string;
  role: string;
  task: string;
  client: string;
  details: string; // This is the help request message
  taskDetails: {
    id: string;
    campaignTitle: string;
    date: string;
    content: string; // marketerGuide
    hashtags: string[];
    objective: string;
    visual: string;
    headline: string;
    message: string;
    cta: string;
    branding: string;
  };
}

interface PerformanceReview {
  id: string;
  name: string;
  role: Role;
  avatarUrl: string;
  performanceScore: number;
  feedback: string[];
}

// for now we are using it, i future we get it from the backend

const brandInfo: any = {
  SCALE: {
    name: "SCALE",
    description: "Advanced brand management tools",
    icon: <Gem className="h-8 w-8 text-white" />,
  },
};

// --- MOCK DATA ---
const brandHeadData = {
  name: "Anika Sharma",
  package: {
    name: "SPARK",
    description: "Foundation-level brand support",
    icon: <Shield className="h-8 w-8 text-white" />,
  },
  clients: [
    {
      id: "c-1",
      name: "Nexus Corp",
      team: {
        name: "Alpha Squad",
        members: [
          {
            id: "emp-1",
            name: "Rohan Sharma",
            role: "Digital Marketer",
            avatarUrl: "https://placehold.co/100x100/E9D5FF/7C3AED?text=RS",
          },
          {
            id: "emp-2",
            name: "Priya Patel",
            role: "Graphics Designer",
            avatarUrl: "https://placehold.co/100x100/FECACA/DC2626?text=PP",
          },
        ],
      },
    },
    {
      id: "c-2",
      name: "Stellar Solutions",
      team: {
        name: "Bravo Unit",
        members: [
          {
            id: "emp-4",
            name: "Sneha Reddy",
            role: "Digital Marketer",
            avatarUrl: "https://placehold.co/100x100/E9D5FF/7C3AED?text=SR",
          },
          {
            id: "emp-5",
            name: "Vikram Kumar",
            role: "Graphics Designer",
            avatarUrl: "https://placehold.co/100x100/FECACA/DC2626?text=VK",
          },
        ],
      },
    },
  ],
  requests: [
    {
      id: "req-1",
      from: "Priya Patel",
      role: "Graphics Designer",
      task: "Instagram Post Design",
      client: "Nexus Corp",
      details:
        "I'm unsure about the color palette specified in the brief. Can you provide a secondary option?",
    },
    {
      id: "req-2",
      from: "Rohan Sharma",
      role: "Digital Marketer",
      task: "SEO Audit for Q3",
      client: "Nexus Corp",
      details:
        "The competitor analysis tool subscription has expired. Need approval to renew.",
    },
    {
      id: "req-3",
      from: "Project Manager",
      role: "Project Manager",
      task: "Stellar Solutions Report",
      client: "Stellar Solutions",
      details:
        "Please review the attached draft for the monthly report before it's finalized.",
    },
  ],
  performanceReviews: [
    {
      id: "perf-1",
      name: "Vikram Kumar",
      role: "Graphics Designer",
      avatarUrl: "https://placehold.co/100x100/FECACA/DC2626?text=VK",
      performanceScore: 68,
      feedback: [
        "Missed two deadlines in July.",
        "Needs to improve communication on project blockers.",
      ],
    },
    {
      id: "perf-2",
      name: "Rohan Sharma",
      role: "Digital Marketer",
      avatarUrl: "https://placehold.co/100x100/E9D5FF/7C3AED?text=RS",
      performanceScore: 72,
      feedback: ["Ad campaign CPA was higher than projected."],
    },
    {
      id: "perf-3",
      name: "Amit Singh",
      role: "Content Strategist",
      avatarUrl: "https://placehold.co/100x100/A7F3D0/059669?text=AS",
      performanceScore: 75,
      feedback: ["Blog post engagement is slightly below target."],
    },
  ],
};

// --- MODAL COMPONENTS ---
const RequestModal = ({ isOpen, onClose, request, onRespond }: any) => {
  if (!request) return null;
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    // Clear the textarea when a new request is opened
    if (isOpen) {
      setResponseText("");
    }
  }, [isOpen]);

  if (!request) return null;

  const handleSend = () => {
    onRespond(request.id, responseText);
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-bold leading-6 text-gray-900"
                    >
                      Request: {request.taskDetails.campaignTitle}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      From: {request.from} ({request.role}) for {request.client}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-8 border-t pt-4">
                  {/* --- LEFT COLUMN (REFERENCE INFO) --- */}
                  <div className="lg:col-span-3 space-y-4">
                    <h4 className="font-semibold text-gray-800">
                      Original Task Brief
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg border text-sm text-gray-700 space-y-3">
                      <h5 className="font-semibold text-gray-600">
                        Marketer's Guide
                      </h5>
                      <p className="whitespace-pre-wrap">
                        {request.taskDetails.content}
                      </p>
                      <div>
                        <h6 className="font-semibold text-xs text-gray-500 mb-2">
                          Hashtags
                        </h6>
                        <div className="flex flex-wrap gap-2">
                          {request.taskDetails.hashtags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border text-sm text-gray-700 space-y-4">
                      <h5 className="font-semibold text-gray-600">
                        Designer's Guide
                      </h5>

                      {/* Objective */}
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-indigo-500 mr-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Objective
                          </p>
                          <p className="text-gray-800">
                            {request.taskDetails.objective}
                          </p>
                        </div>
                      </div>

                      {/* Visual */}
                      <div className="flex items-start">
                        <Eye className="h-5 w-5 text-indigo-500 mr-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Visual
                          </p>
                          <p className="text-gray-800">
                            {request.taskDetails.visual}
                          </p>
                        </div>
                      </div>

                      {/* Headline */}
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-indigo-500 mr-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Headline
                          </p>
                          <p className="text-gray-800">
                            {request.taskDetails.headline}
                          </p>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="flex items-start">
                        <MessageSquare className="h-5 w-5 text-indigo-500 mr-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Message
                          </p>
                          <p className="text-gray-800">
                            {request.taskDetails.message}
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-start">
                        <Send className="h-5 w-5 text-indigo-500 mr-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            CTA (Call to Action)
                          </p>
                          <p className="text-gray-800">
                            {request.taskDetails.cta}
                          </p>
                        </div>
                      </div>

                      {/* Branding */}
                      <div className="flex items-start">
                        <Paintbrush className="h-5 w-5 text-indigo-500 mr-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Branding
                          </p>
                          <p className="text-gray-800">
                            {request.taskDetails.branding}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- RIGHT COLUMN (ACTION PANEL) --- */}
                  <div className="lg:col-span-2 flex flex-col">
                    <div className="flex-grow space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Designer's Question
                        </h4>
                        <p className="mt-2 text-sm text-gray-600 italic bg-yellow-50 p-3 rounded-md border border-yellow-200">
                          "{request.details}"
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Your Response
                        </h4>
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Provide a clear suggestion or answer..."
                          className="w-full p-2 border rounded-md"
                          rows={8}
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={!responseText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Send Response
                      </button>
                    </div>
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

const FeedbackModal = ({ isOpen, onClose, review }: any) => {
  if (!review) return null;
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
                  Feedback for {review.name}
                </Dialog.Title>
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-gray-800">
                    Performance Notes
                  </h4>
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
                    {review.feedback.map((item: any, i: any) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <textarea
                    placeholder="Add your feedback or schedule a meeting..."
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Feedback
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
const BrandheadOverview = () => {
  const [activeView, setActiveView] = useState("requests");
  const [openClient, setOpenClient] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [activeReview, setActiveReview] = useState<PerformanceReview | null>(
    null
  );
  const profile = useSelector((state: RootState) => state.profile) as {
    name: string;
    PackageName: string;
    // add other properties as needed
  };

  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOpenTickets = async () => {
      if (!accessToken) return;
      setIsLoading(true);
      try {
        const openTickets = await api.BrandHead.getTickets.get(
          accessToken,
          dispatch
        );
        setRequests(openTickets);
      } catch (error) {
        console.error("Failed to fetch open tickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpenTickets();
  }, [accessToken, dispatch, needsRefresh]);

  useEffect(() => {
    let privateChannel: any;

    const setupSubscription = async () => {
      const userId = await api.designer.getUserId.get(accessToken, dispatch);
      console.log("userId", userId);

      const privateChannelName = `private-notifications-${userId}`;
      console.log(`👂 Brand Head listening on: ${privateChannelName}`);

      privateChannel = supabase.channel(privateChannelName);

      privateChannel
        .on("broadcast", { event: "new_help_ticket" }, (payload: any) => {
          console.log("🎟️ New help ticket received in real-time!", payload);

          // The simplest and most reliable way to update is to refetch the list
          setNeedsRefresh((prev) => !prev);
        })
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (privateChannel) {
        supabase.removeChannel(privateChannel);
      }
    };
  }, []);

  const handleTicketResponse = async (ticketId: string, response: string) => {
    try {
      await api.BrandHead.resolveTicket.post(
        accessToken,
        dispatch,
        ticketId,
        response
      );
      alert("Response sent successfully!");
      setActiveRequest(null); // Close the modal
      setNeedsRefresh((prev) => !prev); // Refresh the ticket list
    } catch (error) {
      console.error("Failed to send response:", error);
      alert("Error: Could not send response.");
    }
  };

  const toggleClient = (id: string) => {
    setOpenClient((prev) => (prev === id ? null : id));
  };

  const views = [
    { id: "requests", label: "Requests & Tickets", icon: Inbox },
    { id: "overview", label: "Client & Team Overview", icon: Briefcase },
    { id: "performance", label: "Performance Review", icon: TrendingDown },
  ];

  const renderViewContent = () => {
    switch (activeView) {
      case "requests":
        if (isLoading) return <p>Loading requests...</p>;
        // --- MODIFIED: Use the `requests` state variable ---
        return (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-gray-500">The request inbox is empty.</p>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {req.task}{" "}
                      <span className="font-normal text-gray-500">
                        for {req.client}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      From: {req.from} ({req.role})
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveRequest(req)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 font-semibold rounded-full hover:bg-blue-200"
                  >
                    Open
                  </button>
                </div>
              ))
            )}
          </div>
        );
      case "overview":
        return (
          <div className="space-y-2">
            {brandHeadData.clients.map((client) => (
              <div key={client.id} className="bg-gray-50 rounded-lg border">
                <button
                  onClick={() => toggleClient(client.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100"
                >
                  <p className="font-semibold text-gray-800">{client.name}</p>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      openClient === client.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openClient === client.id && (
                  <div className="p-4 border-t">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Assigned Team: {client.team.name}
                    </h4>
                    <div className="space-y-2">
                      {client.team.members.map((member) => (
                        <div
                          key={member.name}
                          className="flex items-center text-sm"
                        >
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="h-6 w-6 rounded-full mr-2"
                          />
                          <span className="font-medium text-gray-800">
                            {member.name}
                          </span>
                          <span className="text-gray-500 ml-auto">
                            {member.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case "performance":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              "Digital Marketer",
              "Graphics Designer",
              "Content Strategist",
            ].map((role) => (
              <div key={role}>
                <h3 className="font-bold text-gray-700 mb-2">{role}s</h3>
                <div className="space-y-3">
                  {brandHeadData.performanceReviews
                    .filter((r) => r.role === role)
                    .map((review: any) => (
                      <div
                        key={review.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div className="flex items-center">
                          <img
                            src={review.avatarUrl}
                            alt={review.name}
                            className="h-10 w-10 rounded-full"
                          />
                          <div className="ml-3">
                            <p className="font-semibold text-gray-800">
                              {review.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {review.role}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveReview(review)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 font-semibold rounded-full hover:bg-red-200"
                        >
                          View
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className=" bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Brand Head Dashboard
          </h1>
          <p className="text-gray-500">Welcome back, {profile.name}</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-600 text-white shadow-lg flex items-center">
          <div className="p-2 rounded-full bg-white/20">
            {brandInfo[profile.PackageName]?.icon}
          </div>
          <div className="ml-4">
            <p className="font-bold text-lg">{profile.PackageName} Package</p>
            <p className="text-xs text-blue-200">
              {brandInfo[profile.PackageName]?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === view.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <view.icon
                  className={`mr-2 h-5 w-5 ${
                    activeView === view.id ? "text-blue-500" : "text-gray-400"
                  }`}
                />
                {view.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[400px]">{renderViewContent()}</div>
      </div>

      <RequestModal
        isOpen={!!activeRequest}
        onClose={() => setActiveRequest(null)}
        request={activeRequest}
        onRespond={handleTicketResponse}
      />
      <FeedbackModal
        isOpen={!!activeReview}
        onClose={() => setActiveReview(null)}
        review={activeReview}
      />
    </div>
  );
};

export default BrandheadOverview;
