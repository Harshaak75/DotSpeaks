import { useState, Fragment, useRef, useEffect, useMemo } from "react";
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
} from "date-fns";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  MessageSquare,
  CheckCircle,
  Instagram,
  Facebook,
  Twitter,
  Clock,
  Link as LinkIcon,
  Calendar,
  ListChecks,
  Play,
  Square,
  HelpCircle,
  Send,
  FileText,
  Timer,
} from "lucide-react";
import { api } from "../../../../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../../../../utils/supabase";

// --- TYPE DEFINITIONS ---
interface ClientType {
  id: string;
  name: string;
  avatarUrl: string;
}

interface TaskFromApi {
  taskDetails: {
    id: string;
    campaignTitle: string;
    date: string;
    marketerGuide: string;
    hashtags: string[];
    postType: string;
    platform: "Instagram" | "Facebook" | "Twitter" | string;
    clientId: string;
    clientName: string;
  };
  designerSubmissions: {
    id: string;
    fileName: string;
    fileType: string;
    uploadedBy: string;
    imageUrl: string;
    createdAt: string;
  }[];
}

type ReviewStatus =
  | "pending_review"
  | "rework"
  | "completed"
  | "HELP_REQUESTED"
  | "DM_APPROVED";

interface ReviewEventType {
  id: string;
  clientId: string;
  title: string;
  start: Date;
  status: ReviewStatus;
  imageUrl: string;
  reworkComment?: string;
}

// --- TASK ITEM COMPONENT ---
const TaskItem = ({ task, onClick }: any) => {
  return (
    <button
      onClick={() => onClick(task)}
      disabled={task.status === "done" || task.status === "help_requested"}
      className={`w-full text-left p-4 border rounded-lg shadow-sm flex items-center justify-between transition-all ${
        task.status === "done"
          ? "bg-gray-100 opacity-70 cursor-default"
          : task.status === "help_requested"
          ? "bg-gray-100 opacity-70 cursor-not-allowed"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <div>
        <span
          className={`font-medium ${
            task.status === "done"
              ? "line-through text-gray-500"
              : "text-gray-800"
          }`}
        >
          {task.text}
        </span>
        {task.suggestion && (
          <p className="text-xs flex items-center mt-1" style={{ color: '#0000CC' }}>
            <MessageSquare className="h-3 w-3 mr-1" /> Suggestion from Brand
            Head
          </p>
        )}
        {task.status === "help_requested" && (
          <p className="text-xs text-yellow-600 font-semibold flex items-center mt-1">
            <HelpCircle className="h-3 w-3 mr-1" /> Awaiting Feedback from Brand
            Head
          </p>
        )}
      </div>
      {task.status === "done" ? (
        <CheckCircle className="h-6 w-6 text-green-500" />
      ) : (
        <ChevronRight className="h-6 w-6 text-gray-400" />
      )}
    </button>
  );
};

// --- PERSONAL TASK MODAL ---
const PersonalTaskModal = ({
  task,
  onClose,
  onComplete,
  onHelpRequest,
}: any) => {
  const [isRunning, setIsRunning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(task.duration * 60);
  const [workNotes, setWorkNotes] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [helpComment, setHelpComment] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSendHelp = () => {
    onHelpRequest(task.id, helpComment);
  };

  const handleComplete = () => {
    onComplete(task.id, workNotes);
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border-2" style={{ borderColor: '#0000CC' }}>
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-8 text-gray-900 flex justify-between items-start"
                  style={{ color: '#0000CC' }}
                >
                  <div>
                    {task.text}
                    <p className="text-sm font-normal text-gray-500">
                      Task in progress...
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg" style={{ backgroundColor: '#FFE6E6', color: '#DC2626' }}>
                    <Timer className="h-6 w-6" />
                    <span className="font-mono text-xl font-bold">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  {task.suggestion && (
                    <div className="p-4 rounded-r-md border-l-4" style={{ backgroundColor: '#F0F0FF', borderLeftColor: '#0000CC' }}>
                      <h4 className="font-bold flex items-center" style={{ color: '#0000CC' }}>
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Suggestion from Brand Head
                      </h4>
                      <p className="mt-2 text-sm text-gray-700">
                        {task.suggestion.text}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-700">
                      Task Details
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{task.details}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">
                      Proof of Work
                    </h4>
                    <textarea
                      value={workNotes}
                      onChange={(e) => setWorkNotes(e.target.value)}
                      placeholder="Add a link or notes to complete the task..."
                      className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <div>
                    {showHelp ? (
                      <div className="flex items-center space-x-2">
                        <textarea
                          value={helpComment}
                          onChange={(e) => setHelpComment(e.target.value)}
                          placeholder="What's the issue?"
                          className="p-2 border rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                          rows={3}
                        />
                        <button
                          onClick={handleSendHelp}
                          disabled={!helpComment}
                          className="px-3 py-2 text-sm text-white rounded-md disabled:bg-gray-300"
                          style={{ backgroundColor: !helpComment ? '' : '#DC2626' }}
                        >
                          Send
                        </button>
                        <button
                          onClick={() => setShowHelp(false)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center text-sm font-semibold text-gray-500 hover:opacity-80"
                        style={{ '--hover-color': '#DC2626' } as React.CSSProperties}
                      >
                        <HelpCircle className="h-5 w-5 mr-2" /> Need Help?
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleComplete}
                    disabled={!workNotes}
                    className="px-4 py-2 flex items-center justify-center text-white font-semibold rounded-lg hover:opacity-90 disabled:bg-gray-300"
                    style={{ backgroundColor: !workNotes ? '' : '#10B981' }}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" /> Complete Task
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

// --- THE MAIN DASHBOARD COMPONENT ---
const WorkSection = () => {
  const [viewMode, setViewMode] = useState<"review" | "tasks">("review");
  const [allTasks, setAllTasks] = useState<TaskFromApi[]>([]);
  const [clients, setClients] = useState<ClientType[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [activeReviewTask, setActiveReviewTask] = useState<TaskFromApi | null>(
    null
  );

  const [personalTasks, setPersonalTasks] = useState<any[]>([]);
  const [activePersonalTask, setActivePersonalTask] = useState<any | null>(
    null
  );

  const [needsRefresh, setNeedsRefresh] = useState(false);

  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!accessToken) return;
      try {
        const tasksFromApi: TaskFromApi[] =
          await api.digitalMarketer.getGraphicDesignerData.get(
            accessToken,
            dispatch
          );

        setAllTasks(tasksFromApi);

        const uniqueClients = new Map<string, ClientType>();
        tasksFromApi.forEach((task) => {
          if (!uniqueClients.has(task.taskDetails.clientId)) {
            uniqueClients.set(task.taskDetails.clientId, {
              id: task.taskDetails.clientId,
              name: task.taskDetails.clientName,
              avatarUrl: `https://placehold.co/100x100/7c3aed/ffffff?text=${task.taskDetails.clientName.charAt(
                0
              )}`,
            });
          }
        });

        const clientsArray = Array.from(uniqueClients.values());
        setClients(clientsArray);

        if (clientsArray.length > 0 && !selectedClient) {
          setSelectedClient(clientsArray[0]);
        }
      } catch (error) {
        console.error("Error fetching tasks for Digital Marketer:", error);
      }
    };
    fetchAndProcessData();
  }, [accessToken, dispatch, needsRefresh]);

  const reviewEvents = useMemo((): ReviewEventType[] => {
    return allTasks
      .map((task) => {
        const firstSubmission = task.designerSubmissions?.[0];
        if (!firstSubmission) return null;

        return {
          id: task.taskDetails.id,
          clientId: task.taskDetails.clientId,
          title: task.taskDetails.campaignTitle,
          start: new Date(task.taskDetails.date),
          status:
            ((task.taskDetails as any).status as ReviewStatus) ||
            "pending_review",
          imageUrl: firstSubmission.imageUrl,
        };
      })
      .filter((event): event is ReviewEventType => event !== null);
  }, [allTasks]);

  useEffect(() => {
    let privateChannel: any;

    const setupSubscription = async () => {
      const userId = await api.designer.getUserId.get(accessToken, dispatch);
      console.log("userId", userId);

      if (userId) {
        const privateChannelName = `private-notifications-${userId.user_id}`;
        console.log(`👂 Subscribing to private channel: ${privateChannelName}`);

        privateChannel = supabase.channel(privateChannelName);

        privateChannel
          .on(
            "broadcast",
            { event: "designer_viewing_gf" },
            (payload: any) => {
              console.log(
                "🎉 A new task was assigned specifically to me!",
                payload
              );

              alert("A new design task is ready for you!");

              setNeedsRefresh((prev) => !prev);
            }
          )
          .subscribe((status: any, err: any) => {
            if (status === "SUBSCRIBED") {
              console.log("Successfully subscribed to private channel!");
            }
            if (status === "CHANNEL_ERROR") {
              console.error("Failed to subscribe to private channel:", err);
            }
          });
      }
    };

    setupSubscription();

    return () => {
      if (privateChannel) {
        supabase.removeChannel(privateChannel);
        console.log("Unsubscribed from private channel.");
      }
    };
  }, [accessToken, dispatch]);

  const filteredReviewEvents = reviewEvents.filter(
    (event) => event.clientId === selectedClient?.id
  );

  const handlePersonalTaskHelpRequest = (taskId: number, comment: string) => {
    setPersonalTasks((tasks) =>
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "help_requested",
              helpRequest: comment,
              suggestion: undefined,
            }
          : task
      )
    );
    setActivePersonalTask(null);
    alert("Your help request has been sent to the Brand Head.");
  };

  // --- CALENDAR FUNCTIONS ---
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1));
  const [reviewEvent, setReviewEvent] = useState<ReviewEventType | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const openReviewModal = (event: ReviewEventType) => {
    const fullTaskData = allTasks.find(
      (task) => task.taskDetails.id === event.id
    );
    if (fullTaskData) {
      setActiveReviewTask(fullTaskData);
      setIsReviewModalOpen(true);
    }
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setTimeout(() => setActiveReviewTask(null), 300);
  };

  const handleMarkAsDone = async (taskId: string) => {
    try {
      const result = await api.digitalMarketer.ApproveTheDesign.post(
        accessToken,
        dispatch,
        taskId
      );

      if (result.allTasksCompleted) {
        alert(
          "Task approved! All tasks for this content batch are now complete and ready for the client."
        );
      } else {
        alert("Task approved successfully.");
      }
      setNeedsRefresh((prev) => !prev);
      closeReviewModal();
    } catch (error) {
      console.error("Failed to approve task:", error);
      alert("There was an error approving the task. Please try again.");
    }
  };

  const handleReworkSubmit = async (taskId: string, comment: string) => {
    if (!comment) return;

    try {
      await api.digitalMarketer.RequestRework.post(
        accessToken,
        dispatch,
        taskId,
        comment
      );
      alert("Rework request has been sent to the designer.");

      setNeedsRefresh((prev) => !prev);
      closeReviewModal();
    } catch (error) {
      console.error("Failed to submit rework request:", error);
      alert("There was an error submitting the rework request.");
    }
  };

  // --- SUB-COMPONENTS ---
  const ClientSelector = () => (
    <div className="p-6 bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: '#0000CC' }}>
      <div className="flex items-center mb-4">
        <Users className="h-6 w-6 mr-3" style={{ color: '#0000CC' }} />
        <h2 className="text-xl font-bold text-gray-800">
          Client Work: {selectedClient?.name}
        </h2>
      </div>
      <div className="client-selector-container flex items-center space-x-2 pb-2 -mb-2 overflow-x-auto">
        {clients.map((client) => (
          <button
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-full border-2 transition-all duration-200 ${
              selectedClient?.id === client.id
                ? "text-white shadow-md"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
            style={
              selectedClient?.id === client.id
                ? {
                    backgroundColor: '#0000CC',
                    borderColor: '#0000CC',
                  }
                : {}
            }
          >
            <img
              src={client.avatarUrl}
              alt={client.name}
              className="h-6 w-6 rounded-full"
            />
            <span className="font-semibold text-sm whitespace-nowrap">
              {client.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const ReviewCalendarView = () => {
    const monthStart = startOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const days = Array.from({ length: 35 }, (_, i) => addDays(startDate, i));

    const getStatusStyles = (status: ReviewEventType["status"]) => {
      switch (status) {
        case "pending_review":
          return "ring-blue-500";
        case "rework":
          return "ring-pink-500";
        case "completed":
          return "ring-green-500";
        default:
          return "ring-gray-500";
      }
    };

    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border-l-4 flex-grow flex flex-col" style={{ borderLeftColor: '#0000CC' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ color: '#0000CC' }}>
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
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
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
        <div className="grid grid-cols-7 grid-rows-5 gap-px flex-grow bg-gray-200 border-t border-l border-gray-200">
          {weekdays.map((day) => (
            <div key={day} className="p-1 text-center bg-white text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const dayEvents = filteredReviewEvents.filter((event) =>
              isSameDay(event.start, day)
            );
            return (
              <div
                key={index}
                className={`relative p-1.5 bg-white flex flex-col ${
                  !isSameMonth(day, monthStart) && "bg-gray-50"
                }`}
              >
                <span
                  className={`text-sm font-medium mb-1 ${
                    isSameDay(day, new Date())
                      ? "font-bold"
                      : isSameMonth(day, monthStart)
                      ? "text-gray-800"
                      : "text-gray-400"
                  }`}
                  style={
                    isSameDay(day, new Date())
                      ? { color: '#0000CC' }
                      : {}
                  }
                >
                  {format(day, "d")}
                </span>
                <div className="flex-grow space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group relative w-full h-full rounded-lg overflow-hidden cursor-pointer"
                    >
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div
                        className={`absolute inset-0 ring-4 ring-offset-2 ring-offset-white ${getStatusStyles(
                          event.status
                        )} rounded-lg`}
                      ></div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-xs font-bold truncate">
                          {event.title}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => openReviewModal(event)}
                          className="flex items-center text-white text-sm font-semibold px-3 py-1 rounded-full backdrop-blur-sm hover:bg-white/30"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MyTasksView = () => (
    <div className="p-6 bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: '#0000CC' }}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        My Tasks for {selectedClient?.name}
      </h2>
      <div className="space-y-3">
        {/* Tasks would be rendered here */}
      </div>
    </div>
  );

  const ReviewModal = () => {
    const [reworkCommentInput, setReworkCommentInput] = useState("");
    const [showReworkInput, setShowReworkInput] = useState(false);

    const taskData = activeReviewTask;
    const submissionData = taskData?.designerSubmissions?.[0];

    useEffect(() => {
      if (taskData) {
        setShowReworkInput(false);
        setReworkCommentInput("");
      }
    }, [taskData]);

    if (!taskData || !submissionData) {
      return null;
    }

    const handleSubmitRework = () => {
      handleReworkSubmit(taskData.taskDetails.id, reworkCommentInput);
    };

    const handleDone = () => {
      handleMarkAsDone(taskData.taskDetails.id);
    };

    const platformIcons: { [key: string]: React.ElementType } = {
      Instagram,
      Facebook,
      Twitter,
    };
    const PlatformIcon = platformIcons[taskData.taskDetails.platform] || Square;

    return (
      <Transition appear show={isReviewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeReviewModal}>
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
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all border-2" style={{ borderColor: '#0000CC' }}>
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-2 bg-gray-900 flex items-center justify-center p-4">
                      <img
                        src={submissionData.imageUrl}
                        alt="Design for review"
                        className="max-h-[90vh] w-auto object-contain rounded-lg"
                      />
                    </div>
                    <div className="p-8 flex flex-col h-full">
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold" style={{ color: '#0000CC' }}>
                              {taskData.taskDetails.campaignTitle}
                            </h3>
                            <p className="text-sm text-gray-500">
                              for {taskData.taskDetails.clientName}
                            </p>
                          </div>
                          <button
                            onClick={closeReviewModal}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <X className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                          <div className="flex items-center">
                            <Clock className="h-6 w-6 text-gray-500 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Post Time</p>
                              <p className="font-semibold text-gray-800">
                                {format(
                                  new Date(taskData.taskDetails.date),
                                  "p"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <PlatformIcon className="h-6 w-6 text-gray-500 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Platform</p>
                              <a
                                href="#"
                                className="font-semibold hover:underline"
                                style={{ color: '#0000CC' }}
                              >
                                {taskData.taskDetails.platform}
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 border-t pt-4">
                          <h4 className="font-semibold text-gray-800">
                            Marketer's Guide
                          </h4>
                          <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                            {taskData.taskDetails.marketerGuide}
                          </p>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Hashtags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {taskData.taskDetails.hashtags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs font-semibold rounded-full"
                                style={{ backgroundColor: '#F0F0FF', color: '#0000CC' }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 mt-8 pt-6 border-t">
                        {showReworkInput ? (
                          <div className="pt-4">
                            <label
                              htmlFor="reworkComment"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Rework Comments
                            </label>
                            <textarea
                              id="reworkComment"
                              rows={4}
                              value={reworkCommentInput}
                              onChange={(e) =>
                                setReworkCommentInput(e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': '#EC4899' } as React.CSSProperties}
                              placeholder="e.g., Please make the logo bigger..."
                            />
                            <button
                              onClick={handleSubmitRework}
                              disabled={!reworkCommentInput}
                              className="w-full mt-2 py-3 flex items-center justify-center text-white rounded-md font-semibold hover:opacity-90 disabled:bg-gray-300"
                              style={{ backgroundColor: !reworkCommentInput ? '' : '#EC4899' }}
                            >
                              <MessageSquare className="h-5 w-5 mr-2" /> Submit
                              Rework Request
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowReworkInput(true)}
                              className="w-full py-3 rounded-md font-semibold transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              Rework
                            </button>
                            <button
                              onClick={handleDone}
                              className="w-full py-3 flex items-center justify-center text-white rounded-md font-semibold hover:opacity-90"
                              style={{ backgroundColor: '#10B981' }}
                            >
                              <CheckCircle className="h-5 w-5 mr-2" /> Done
                            </button>
                          </div>
                        )}
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

  // --- MAIN RENDER ---
  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col">
      <style>{`
        .client-selector-container::-webkit-scrollbar { height: 6px; }
        .client-selector-container::-webkit-scrollbar-track { background: #f1f5f9; }
        .client-selector-container::-webkit-scrollbar-thumb { background: #cbd5e1; }
      `}</style>

      <ClientSelector />

      <div className="my-6">
        <div className="flex items-center p-1 bg-gray-200 rounded-lg">
          <button
            onClick={() => setViewMode("review")}
            className={`w-full flex items-center justify-center py-2.5 rounded-md font-semibold transition-all ${
              viewMode === "review"
                ? "bg-white shadow"
                : "text-gray-600"
            }`}
            style={
              viewMode === "review"
                ? { color: '#0000CC' }
                : {}
            }
          >
            <Calendar className="h-5 w-5 mr-2" />
            Creatives
          </button>
          <button
            onClick={() => setViewMode("tasks")}
            className={`w-full flex items-center justify-center py-2.5 rounded-md font-semibold transition-all ${
              viewMode === "tasks"
                ? "bg-white shadow"
                : "text-gray-600"
            }`}
            style={
              viewMode === "tasks"
                ? { color: '#0000CC' }
                : {}
            }
          >
            <ListChecks className="h-5 w-5 mr-2" />
            Tasks
          </button>
        </div>
      </div>

      {viewMode === "review" ? <ReviewCalendarView /> : <MyTasksView />}

      {activePersonalTask && (
        <PersonalTaskModal
          task={activePersonalTask}
          onClose={() => setActivePersonalTask(null)}
          onHelpRequest={handlePersonalTaskHelpRequest}
        />
      )}

      <ReviewModal />
    </div>
  );
};

export default WorkSection;
