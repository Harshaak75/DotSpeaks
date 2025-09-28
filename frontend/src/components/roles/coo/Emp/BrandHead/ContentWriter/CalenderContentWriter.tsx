import React, { useState, Fragment, useRef, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  isSameMonth,
  isSameDay,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  UploadCloud,
  Paperclip,
  FileText,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../../../../utils/api/Employees/api";
import { RootState } from "../../../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../../../../utils/supabase";

// --- TYPE DEFINITIONS ---

interface ClientType {
  id: string;
  company_name: string;
  avatarUrl?: string;
}

// This is the new primary data type for our calendar items
interface MarketingContentItem {
  id: string;
  clientId: string;
  title: string;
  content?: string; // The actual marketing text from the parsed document
  date: Date;
  status: "pending_review" | "approved" | "rework_requested";
  reworkComment?: string;
}

// --- MAIN COMPONENT ---
const ContentWriterCalender = () => {
  // --- STATE MANAGEMENT ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clients, setClients] = useState<ClientType[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [allMarketingContent, setAllMarketingContent] = useState<
    MarketingContentItem[]
  >([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDateForUpload, setSelectedDateForUpload] =
    useState<Date | null>(null);
  const [activeContent, setActiveContent] =
    useState<MarketingContentItem | null>(null);

  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch();

  // --- DATA FETCHING & REAL-TIME ---

  const handleUpdateContent = async (id: string, newContent: string) => {
    // For now, we'll just show an alert as requested.
    // Later, you will replace this with your API call.
    // alert(`Content updated!
    // ID: ${id}
    // New Content: "${newContent}"`);

    try {
      const response = await api.ContentWriter.UpdateContent.update(accessToken,dispatch, id, newContent)
    } catch (error) {
      console.error("Failed to update content:", error);
    }

    // Your API call will look something like this:
    // await api.ContentWriter.updateContent.post(accessToken, dispatch, { id, content: newContent });

    // Close the modal and trigger a refresh after updating
    setIsViewModalOpen(false);
    setNeedsRefresh((prev) => !prev);
  };

  useEffect(() => {
    // Listen for backend broadcasts that content has been processed
    const channel = supabase
      .channel("Content-Functionality")
      .on("broadcast", { event: "content_processed" }, (payload) => {
        console.log(
          "📩 Real-time update received, refreshing calendar...",
          payload
        );
        setNeedsRefresh((prev) => !prev);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const getClientData = async () => {
      if (!accessToken) return;
      try {
        const response = await api.ContentWriter.getClientData.get(
          accessToken,
          dispatch
        );

        console.log("Respone: ", response);

        const clientDetails: ClientType[] = response.map((client: any) => ({
          id: client.id,
          company_name: client.company_name,
        }));
        setClients(clientDetails);

        const flattenedContent: MarketingContentItem[] = response.flatMap(
          (client: any) =>
            (client.MarketingContent || []).map((item: any) => ({
              id: item.id,
              clientId: client.id,
              title: item.campaignTitle || "Untitled Content",
              content: item.content,
              date: new Date(item.date),
              status: item.status,
              reworkComment: item.reworkComment || " ",
            }))
        );
        setAllMarketingContent(flattenedContent);
        console.log("market data: ", flattenedContent);

        if (clientDetails.length > 0 && !selectedClient) {
          setSelectedClient(clientDetails[0]);
        }
      } catch (error) {
        console.error("Failed to fetch client data:", error);
      }
    };

    getClientData();
  }, [accessToken, dispatch, needsRefresh, selectedClient]);

  // --- DERIVED STATE ---

  const filteredContent = allMarketingContent.filter(
    (item) => item.clientId === selectedClient?.id
  );

  // --- EVENT HANDLERS ---

  const handleDayClick = (day: Date) => {
    const contentOnDay = filteredContent.filter((item) =>
      isSameDay(item.date, day)
    );
    if (contentOnDay.length > 0) {
      setActiveContent(contentOnDay[0]);
      setIsViewModalOpen(true);
    } else {
      setSelectedDateForUpload(day);
      setIsAddModalOpen(true);
    }
  };

  const handleAddContent = async (title: string, file: File) => {
    // We use selectedDateForUpload from the state, which is set when the user clicks an empty day
    if (!title || !file || !selectedDateForUpload) {
      alert("Please provide a title, a file, and select a date.");
      return;
    }

    // Your backend endpoint must take these arguments and create a
    // single entry in the "MarketingContent" table.
    try {
      const response = await api.ContentWriter.uploadDocument.post(
        accessToken,
        dispatch,
        title,
        selectedClient?.id,
        file,
        selectedDateForUpload // Use the date from the state
      );

      console.log("data: ", response);

      // This part assumes the backend immediately creates the item.
      // We trigger a refresh to see the new item on the calendar.
      setNeedsRefresh((prev) => !prev);

      alert(
        `Content "${title}" has been scheduled for ${format(
          selectedDateForUpload,
          "MMMM d"
        )}!`
      );

      closeAddModal(); // Close the modal after submission
    } catch (error) {
      console.error("Failed to add content:", error);
      alert("There was an error adding the content.");
    }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedDateForUpload(null);
  };

  // --- SUB-COMPONENTS ---

  const ClientSelector = () => (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center mb-4">
        <Users className="h-6 w-6 text-gray-500 mr-3" />
        <h2 className="text-xl font-bold text-gray-800">Select a Client</h2>
      </div>
      <div className="client-selector-container flex items-center space-x-2 pb-2 -mb-2 overflow-x-auto">
        {clients.map((client) => (
          <button
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-full border-2 transition-all duration-200 ${
              selectedClient?.id === client.id
                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                : "bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <span className="font-semibold text-sm whitespace-nowrap">
              {client.company_name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const Calendar = () => {
    const monthStart = startOfMonth(currentDate);
    const days = eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
    });
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const getStatusStyles = (status: MarketingContentItem["status"]) => {
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
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-semibold border rounded-md hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 flex-grow">
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dayContent = filteredContent.filter((item) =>
              isSameDay(item.date, day)
            );
            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={`relative p-2 h-36 border-t border-l flex flex-col group cursor-pointer ${
                  isSameMonth(day, monthStart)
                    ? "bg-white hover:bg-blue-50"
                    : "bg-gray-50"
                }`}
              >
                <span
                  className={`font-medium ${
                    isSameDay(day, new Date())
                      ? "text-blue-600"
                      : "text-gray-800"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1 overflow-y-auto">
                  {dayContent.map((item) => (
                    <div
                      key={item.id}
                      className={`w-full text-left text-xs font-bold p-1.5 rounded-md border-l-4 truncate ${getStatusStyles(
                        item.status
                      )}`}
                    >
                      <FileText className="inline-block h-4 w-4 mr-1" />
                      {item.title}
                    </div>
                  ))}
                </div>
                {isSameMonth(day, monthStart) && (
                  <button className="absolute bottom-2 right-2 p-1 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlusCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const AddContentModal = () => {
    // Restored the 'title' state to capture user input
    const [title, setTitle] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        setUploadedFile(event.target.files[0]);
      }
    };

    // This function now calls your original handleAddContent function
    const handleSubmit = () => {
      if (uploadedFile && title) {
        // It passes both the title from the input and the uploaded file
        handleAddContent(title, uploadedFile);
      }
    };

    // The modal will not open if this state is not set
    if (!isAddModalOpen || !selectedDateForUpload) return null;

    return (
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeAddModal}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold flex justify-between"
                >
                  {/* The title now reflects the date the user clicked on */}
                  Add Content for{" "}
                  {format(selectedDateForUpload, "MMMM d, yyyy")}
                  <button onClick={closeAddModal}>
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  {/* 👇 RESTORED: The input field for the content title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Content Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Guide to SEO Basics"
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* File upload section */}
                  <div
                    className="mt-2 flex justify-center items-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload document
                      </p>
                      <p className="text-xs text-gray-500">PDF or DOCX</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />

                  {uploadedFile && (
                    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border">
                      <div className="flex items-center space-x-2 truncate">
                        <Paperclip className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate">
                          {uploadedFile.name}
                        </span>
                      </div>
                      <button onClick={() => setUploadedFile(null)}>
                        <X className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  )}

                  {/* The button is now disabled if either title or file is missing */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!uploadedFile || !title}
                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Content for Review
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  };

  const ViewContentModal = ({
    onUpdateContent,
  }: {
    onUpdateContent: (id: string, newContent: string) => void;
  }) => {
    // NEW: State to manage the editable content
    const [editableContent, setEditableContent] = useState("");

    // This effect syncs the modal's state with the active content when it opens
    useEffect(() => {
      if (activeContent) {
        setEditableContent(activeContent.content || "");
      }
    }, [activeContent]);

    if (!isViewModalOpen || !activeContent) return null;

    // Handler for the new "Update" button
    const handleUpdate = () => {
      onUpdateContent(activeContent.id, editableContent);
    };

    const isRework = activeContent.status === "rework_requested";

    return (
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsViewModalOpen(false)}
        >
          {/* Backdrop */}
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
              <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold flex justify-between"
                >
                  {activeContent.title}
                  <button onClick={() => setIsViewModalOpen(false)}>
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  {/* Rework comment is always visible for context */}
                  {isRework && (
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                      <h4 className="font-bold text-yellow-900 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Rework Requested: Client Feedback
                      </h4>
                      <p className="mt-2 text-sm text-yellow-800 italic">
                        "
                        {activeContent.reworkComment || "No feedback provided."}
                        "
                      </p>
                    </div>
                  )}

                  {/* --- CONDITIONAL CONTENT AREA --- */}
                  <div className="bg-gray-50 border rounded-lg p-1">
                    {isRework ? (
                      // If rework, show an editable textarea
                      <textarea
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        rows={10}
                        className="w-full p-3 bg-white border-2 border-transparent rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    ) : (
                      // Otherwise, show read-only text
                      <p className="p-3 text-gray-800 whitespace-pre-line">
                        {activeContent.content || "No content available."}
                      </p>
                    )}
                  </div>
                </div>

                {/* --- CONDITIONAL UPDATE BUTTON --- */}
                {isRework && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleUpdate}
                      // Disable button if no changes have been made
                      disabled={editableContent === activeContent.content}
                      className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Update & Resubmit
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col p-6 gap-6">
      <style>{`.client-selector-container::-webkit-scrollbar { display: none; }`}</style>
      <ClientSelector />
      <Calendar />
      <AddContentModal />
      <ViewContentModal onUpdateContent={handleUpdateContent} />
    </div>
  );
};

export default ContentWriterCalender;
