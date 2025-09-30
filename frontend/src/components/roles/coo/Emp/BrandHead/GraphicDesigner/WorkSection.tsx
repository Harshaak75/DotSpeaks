import React, { useState, Fragment, useRef, useEffect } from "react";
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
  UploadCloud,
  Paperclip,
  PlayCircle,
  Timer,
  HelpCircle,
  Send,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../../../../../../utils/supabase";
import { api } from "../../../../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";

// --- TYPE DEFINITIONS ---
// --- UPDATED TYPE DEFINITIONS ---
interface ClientType {
  id: string;
  name: string; // We'll derive this from the tasks
  avatarUrl: string;
}

// This now matches the fields from your backend data to avoid confusion
interface TaskDetails {
  marketerGuide: string; // 'content' from backend
  // Designer Guide fields
  objective: string;
  visual: string;
  headline: string;
  message: string;
  cta: string;
  branding: string;
}

// This is the main type for a task in the frontend
interface DesignerTask {
  id: string; // Changed to string to match backend UUID
  clientId: string;
  clientName: string; // Added for display purposes
  title: string; // 'campaignTitle' from backend
  start: Date;
  status: "pending_review" | "rework_requested" | "approved" | "Help_requested" | "GF_APPROVED";
  details: TaskDetails;
  imageUrl?: string;
  helpRequest?: string;
  reworkComment?: string;
  suggestion?: { text: string; link?: string };
}

// --- Memoized component with its OWN state for file uploads ---
// --- REDESIGNED MODAL CONTENT COMPONENT ---
const MemoizedTaskContent = React.memo(
  ({
    activeTask,
    handleUpload,
  }: {
    activeTask: DesignerTask;
    handleUpload: (files: File[]) => void;
  }) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRemoveFile = (fileName: string) => {
      setUploadedFiles((prevFiles) =>
        prevFiles.filter((file) => file.name !== fileName)
      );
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        // Convert the FileList to an array and append it to the current state
        const newFiles = Array.from(event.target.files);
        setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      }
    };

    const onUploadClick = () => {
      handleUpload(uploadedFiles);
    };

    return (
      <div className="mt-4 space-y-4">
        {/* --- RESPONSE FROM BRAND HEAD (FULL WIDTH) --- */}
        {/* This block is now outside the grid, so it takes up the full width */}
        {activeTask.suggestion && (
          <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-md shadow-sm">
            <h4 className="font-bold text-blue-800 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Response from Brand Head
            </h4>
            <p className="mt-2 text-sm text-blue-700 whitespace-pre-wrap">
              {activeTask.suggestion.text}
            </p>
          </div>
        )}

        {activeTask.reworkComment && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
            <h4 className="font-bold text-yellow-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Rework Requested by Digital Marketer
            </h4>
            <p className="mt-2 text-sm text-yellow-700 whitespace-pre-wrap">
              "{activeTask.reworkComment}"
            </p>
          </div>
        )}

        {/* --- GUIDES (TWO COLUMNS) --- */}
        {/* This grid now only contains the two guide sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* --- MARKETER GUIDE SECTION (LEFT SIDE) --- */}
          <div className="space-y-3 bg-white p-4 rounded-lg border">
            <h4 className="text-lg font-bold text-gray-800">Marketer Guide</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {activeTask.details.marketerGuide}
            </p>
          </div>

          {/* --- DESIGNER GUIDE SECTION (RIGHT SIDE) --- */}
          <div className="space-y-3 bg-white p-4 rounded-lg border">
            <h4 className="text-lg font-bold text-gray-800">Designer Guide</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Objective:</strong> {activeTask.details.objective}
              </p>
              <p>
                <strong>Visual:</strong> {activeTask.details.visual}
              </p>
              <p>
                <strong>Headline:</strong> {activeTask.details.headline}
              </p>
              <p>
                <strong>Message:</strong> {activeTask.details.message}
              </p>
              <p>
                <strong>CTA:</strong> {activeTask.details.cta}
              </p>
              <p>
                <strong>Branding:</strong> {activeTask.details.branding}
              </p>
            </div>
          </div>
        </div>
        {/* --- SUBMISSION SECTION (FULL WIDTH) --- */}
        <div className="md:col-span-2 space-y-4 mt-4 pt-4 border-t">
          <h4 className="font-semibold text-gray-700">Submission</h4>
          <div
            className="flex justify-center items-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold text-blue-600">
                  Click to upload image/video
                </span>
              </p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*"
            multiple // This allows multiple file selection
          />

          {/* 👇 THIS ENTIRE BLOCK IS THE FIX 👇 */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-600">
                Selected Files:
              </h5>
              {/* 1. We now MAP over the uploadedFiles array */}
              {uploadedFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between bg-white p-2 rounded-lg border"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Paperclip className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    {/* We display the individual file.name here */}
                    <span className="text-sm text-gray-700 truncate">
                      {file.name}
                    </span>
                  </div>
                  {/* 2. The remove button now removes only ONE file */}
                  <button onClick={() => handleRemoveFile(file.name)}>
                    <X className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onUploadClick}
            // Disable button if the files array is empty
            disabled={uploadedFiles.length === 0}
            className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-3 text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            Upload {uploadedFiles.length} File(s) & Complete Task
          </button>
        </div>
      </div>
    );
  }
);

// --- Isolated Countdown Timer Component ---
const CountdownTimer = ({ initialTime, isRunning }: any) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (isRunning) {
      setTimeLeft(initialTime);
    }
  }, [isRunning, initialTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime: any) => prevTime - 1);
      }, 1000);
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

  return (
    <div className="flex items-center space-x-2 p-2 bg-red-100 text-red-700 rounded-lg">
      <Timer className="h-6 w-6" />
      <span className="font-mono text-xl font-bold">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

// --- THE MAIN DASHBOARD COMPONENT ---
const WorkSection = () => {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1));
  const [allTasks, setAllTasks] = useState<DesignerTask[]>([]);
  const [activeTask, setActiveTask] = useState<DesignerTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();

  // 1. Fetch initial data
  useEffect(() => {
    const fetchAndProcessTasks = async () => {
      if (!accessToken) return;

      // 1. Fetch data from the API
      const response = await api.designer.getContent.get(accessToken, dispatch);
      console.log("response", response);

      // 1. First, flatten the nested structure to get one big array of all marketing content.
      const transformedTasks: DesignerTask[] = response.flatMap(
        (client: any) => {
          return (
            client.MarketingContent
              // ✅ FIX 1: Corrected filter to show ALL actionable tasks for the designer
              .filter(
                (data: any) =>
                  data.status === "pending_review" ||
                  data.status === "rework_requested" ||
                  data.status === "Help_requested" || data.status === "approved"
              )
              .map((data: any) => {
                // ✅ FIX 2: Added logic to find the Brand Head's latest comment
                const latestResolvedTicket = data.HelpTicket?.filter(
                  (t: any) => t.status === "RESOLVED" && t.response
                ).sort(
                  (a: any, b: any) =>
                    new Date(b.resolvedAt).getTime() -
                    new Date(a.resolvedAt).getTime()
                )[0];

                return {
                  id: data.id,
                  clientId: data.clientId,
                  clientName: client.company_name,
                  title: data.campaignTitle,
                  start: new Date(data.date),
                  status: data.status === "approved" ? "pending_review" : data.status, // Use the real status from the backend
                  suggestion: latestResolvedTicket
                ? { text: latestResolvedTicket.response }
                : undefined,
                  reworkComment: data.reworkComment,
                  details: {
                    marketerGuide: data.content,
                    objective: data.objective,
                    visual: data.visual,
                    headline: data.headline,
                    message: data.message,
                    cta: data.cta,
                    branding: data.branding,
                  },
                };
              })
          );
        }
      );

      console.log("transformedTasks", transformedTasks);

      setAllTasks(transformedTasks);

      // Dynamically create the list of clients from the fetched tasks
      const uniqueClients: ClientType[] = [];
      const clientMap = new Map();
      transformedTasks.forEach((task) => {
        if (!clientMap.has(task.clientId)) {
          clientMap.set(task.clientId, true);
          uniqueClients.push({
            id: task.clientId,
            name: task.clientName,
            avatarUrl: `https://placehold.co/100x100/7c3aed/ffffff?text=${task.clientName.charAt(
              0
            )}`,
          });
        }
      });
      setClients(uniqueClients);

      if (uniqueClients.length > 0 && !selectedClient) {
        setSelectedClient(uniqueClients[0]);
      }
    };

    fetchAndProcessTasks();
  }, [accessToken, dispatch, needsRefresh]);

  // 2. Listen for PRIVATE real-time updates for THIS user
  useEffect(() => {
    // This variable will hold our channel subscription
    let privateChannel: any;

    // We need to get the user's ID to build the channel name
    const setupSubscription = async () => {
      // const { data: { user } } = await supabase.auth.getUser();
      const userId = await api.designer.getUserId.get(accessToken, dispatch);
      console.log("userId", userId);

      if (userId) {
        // 1. Construct the private channel name. MUST match the backend convention.
        const privateChannelName = `private-notifications-${userId}`;
        console.log(`👂 Subscribing to private channel: ${privateChannelName}`);

        privateChannel = supabase.channel(privateChannelName);

        privateChannel
          .on(
            "broadcast",
            { event: "new_task_ready" }, // Listen for the specific event from the backend
            (payload: any) => {
              console.log(
                "🎉 A new task was assigned specifically to me!",
                payload
              );

              alert("A new design task is ready for you!");

              // 2. Trigger a data refresh to show the new task in the UI
              setNeedsRefresh((prev) => !prev);
            }
          )

          .on("broadcast", { event: "ticket_resolved" }, (payload: any) => {
            console.log("✅ Help ticket was resolved!", payload);
            alert(
              "The Brand Head has responded to your help request. Your task is now unblocked."
            );
            setNeedsRefresh((prev) => !prev); // Refresh data to see the new status and suggestion
          })
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

    // 3. The cleanup function is crucial to prevent memory leaks
    return () => {
      if (privateChannel) {
        supabase.removeChannel(privateChannel);
        console.log("Unsubscribed from private channel.");
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const filteredEvents = allTasks.filter(
    (task) =>
      task.clientId === selectedClient?.id &&
      task.status !== "approved" &&
      task.status !== "Help_requested" &&
      task.status !== "GF_APPROVED"
  );

  const nextTask = filteredEvents.sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )[0];

  const handleProceed = () => {
    if (nextTask) {
      setActiveTask(nextTask);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveTask(null);
  };

  const handleUpload = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0 || !activeTask) return;

    console.log(
      `Sending ${uploadedFiles.length} files to the backend for task "${activeTask.title}"`
    );

    // Create an array of promises, one for each file upload
    const uploadPromises = uploadedFiles.map(async (file) => {
      // 1. Create a FormData object for each file
      const formData = new FormData();
      formData.append("file", file); // 'file' is the key the backend will look for
      formData.append("taskId", activeTask.id); // Send the task ID along with the file

      // 2. Call a new API endpoint designed to handle file uploads
      //    We will create this API function in your utils/api.ts file
      //    and the corresponding route on the backend.
      await api.designer.uploadSubmission.post(accessToken, dispatch, formData);
    });

    try {
      // 3. Wait for all files to be successfully sent and processed by the backend
      await Promise.all(uploadPromises);

      // 4. If all uploads succeed, update the UI
      setAllTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === activeTask.id ? { ...task, status: "approved" } : task
        )
      );

      alert(
        `Task "${activeTask.title}" completed successfully with ${uploadedFiles.length} file(s) uploaded!`
      );
      closeModal();
    } catch (error) {
      alert(`An error occurred during upload. Please check the console.`);
      console.error("Upload failed:", error);
    }
  };

  const handleHelpRequest = (comment: string) => {
    if (!comment || !activeTask) return;

    try {
      const response = api.designer.getHelpRequests.post(
        accessToken,
        dispatch,
        comment,
        activeTask.id
      );
    } catch (error) {
      console.error("Error sending help request:", error);
    }

    // CHANGED: Use 'setAllTasks' to match your current state variable.

    setNeedsRefresh((prev) => !prev);
    closeModal();
  };

  // --- SUB-COMPONENTS ---
  const ClientSelector = () => (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center mb-4">
        <Users className="h-6 w-6 text-gray-500 mr-3" />
        <h2 className="text-xl font-bold text-gray-800">Clients</h2>
      </div>
      <div className="client-selector-container flex items-center space-x-2 pb-2 -mb-2 overflow-x-auto">
        {clients.map((client) => (
          <button
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-full border-2 transition-all duration-200 ${
              selectedClient && selectedClient.id === client.id
                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                : "bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:bg-blue-50"
            }`}
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

  const Calendar = () => {
    const monthStart = startOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const days = Array.from({ length: 35 }, (_, i) => addDays(startDate, i));

    const getStatusStyles = (status: DesignerTask["status"]) => {
      switch (status) {
        case "pending_review":
          return "bg-orange-100 text-orange-800 border-orange-400";
        case "rework_requested":
          return "bg-pink-100 text-pink-800 border-pink-400";
        case "Help_requested":
          return "bg-gray-100 text-gray-500 border-gray-400 opacity-60";
        case "approved":
          return "bg-green-100 text-green-800 border-green-400";
      }
    };

    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 flex-grow flex flex-col">
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
        <div className="grid grid-cols-7 gap-px flex-grow">
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            // --- THIS IS THE FIX ---
            // It now filters the main 'events' list by BOTH date AND the selected client.
            const dayEvents = allTasks.filter(
              (event) =>
                selectedClient &&
                event.clientId === selectedClient.id &&
                isSameDay(event.start, day) &&
                event.status !== "approved"
            );
            return (
              <div
                key={index}
                className={`relative p-2 border-t border-l border-gray-200 flex flex-col ${
                  isSameMonth(day, monthStart) ? "bg-white" : "bg-gray-50"
                }`}
              >
                <span
                  className={`font-medium ${
                    isSameDay(day, new Date())
                      ? "text-blue-600"
                      : isSameMonth(day, monthStart)
                      ? "text-gray-800"
                      : "text-gray-400"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`w-full text-left text-xs font-bold p-1.5 rounded-md border-l-4 truncate transition-opacity ${getStatusStyles(
                        event.status
                      )}`}
                    >
                      {event.suggestion && (
                        <MessageSquare className="inline-block h-4 w-4 mr-1 text-blue-600" />
                      )}
                      {event.title}
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

  const TaskModal = () => {
    const [showHelp, setShowHelp] = useState(false);
    const [helpComment, setHelpComment] = useState("");

    useEffect(() => {
      // Reset help state when modal opens for a new task
      setShowHelp(false);
      setHelpComment("");
    }, [isModalOpen]);

    if (!activeTask) return null;

    return (
      <Transition appear show={isModalOpen} as={Fragment}>
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
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-50 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-8 text-gray-900 flex justify-between items-start"
                  >
                    <div>
                      {activeTask.title}
                      <p className="text-sm font-normal text-gray-500">
                        Due: {format(activeTask.start, "eeee, MMMM d, yyyy")}
                      </p>
                    </div>
                    <CountdownTimer
                      initialTime={30 * 60}
                      isRunning={isModalOpen}
                    />
                  </Dialog.Title>

                  <MemoizedTaskContent
                    activeTask={activeTask}
                    handleUpload={handleUpload}
                  />

                  <div className="mt-6 pt-4 border-t">
                    {showHelp ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          What problem are you facing?
                        </label>
                        <textarea
                          value={helpComment}
                          onChange={(e) => setHelpComment(e.target.value)}
                          className="w-full p-2 border rounded-md"
                          rows={3}
                          placeholder="e.g., I'm not sure about the color palette..."
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setShowHelp(false)}
                            className="px-3 py-1 text-sm bg-gray-200 rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleHelpRequest(helpComment)}
                            disabled={!helpComment}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md disabled:bg-gray-300"
                          >
                            Send Request
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center text-sm font-semibold text-gray-500 hover:text-red-600"
                      >
                        <HelpCircle className="h-5 w-5 mr-2" /> Need Help? Raise
                        a Ticket
                      </button>
                    )}
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
        <button
          onClick={handleProceed}
          disabled={!nextTask}
          className="w-full flex items-center justify-center py-4 px-6 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <PlayCircle className="h-6 w-6 mr-3" />
          {nextTask
            ? `Proceed to Next Task: "${nextTask.title}"`
            : "No Pending Tasks for this Client"}
        </button>
      </div>
      <Calendar />
      <TaskModal />
    </div>
  );
};

export default WorkSection;
