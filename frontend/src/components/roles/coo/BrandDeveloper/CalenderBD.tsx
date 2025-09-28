import React, { useState, useEffect, Fragment } from "react";
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
import { Dialog, Transition } from "@headlessui/react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
  Users,
  Coffee,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../../redux/slice/authSlice";
import { api } from "../../../../utils/api/Employees/api";

// --- TYPE DEFINITIONS ---
type EventCategory =
  | "Meeting"
  | "Deadline"
  | "Focus Work"
  | "Personal"
  | "Cancelled";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  category: EventCategory;
  date: Date;
  meetingLink?: string;
  isCancelled?: boolean;
  notes?: string;
  joinUrl?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;
  location?: string;
}

const eventStyles: Record<
  EventCategory,
  { icon: JSX.Element; color: string; dotColor: string }
> = {
  Meeting: {
    icon: <Users className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-800 border-blue-500",
    dotColor: "bg-blue-500",
  },
  Deadline: {
    icon: <Calendar className="h-5 w-5" />,
    color: "bg-red-100 text-red-800 border-red-500",
    dotColor: "bg-red-500",
  },
  Cancelled: {
    icon: <XCircle className="h-5 w-5" />,
    color: "bg-gray-100 text-gray-600 border-gray-400",
    dotColor: "bg-gray-400",
  },
  "Focus Work": {
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-800 border-purple-500",
    dotColor: "bg-purple-500",
  },
  Personal: {
    icon: <Coffee className="h-5 w-5" />,
    color: "bg-green-100 text-green-800 border-green-500",
    dotColor: "bg-green-500",
  },
};

interface ParsedDescription {
  notes?: string;
  joinUrl?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;
  location?: string;
}

const parseDescription = (description: string): ParsedDescription => {
  if (!description) return {};

  const parsed: ParsedDescription = {};

  // Extract "Location" line
  const locationMatch = description.match(/Location:\s*(.+)/i);
  if (locationMatch) {
    parsed.location = locationMatch[1].trim();
  }

  // Extract join URL (Google Meet, Zoom, etc.)
  const urlMatch = description.match(/(https?:\/\/[^\s]+)/g);
  if (urlMatch) {
    // Take first as join URL unless matched below
    parsed.joinUrl =
      urlMatch.find(
        (u) =>
          u.includes("meet.google.com") ||
          u.includes("zoom.us") ||
          u.includes("teams.microsoft.com")
      ) || urlMatch[0];
  }

  // Cancel URL
  const cancelMatch = description.match(/Cancel:\s*(https?:\/\/[^\s]+)/i);
  if (cancelMatch) {
    parsed.cancelUrl = cancelMatch[1];
  }

  // Reschedule URL
  const rescheduleMatch = description.match(
    /Reschedule:\s*(https?:\/\/[^\s]+)/i
  );
  if (rescheduleMatch) {
    parsed.rescheduleUrl = rescheduleMatch[1];
  }

  // Notes ("Please share anything ...")
  const notesMatch = description.match(/Please share anything.*?:\s*(.+)/i);
  if (notesMatch) {
    parsed.notes = notesMatch[1].trim();
  }

  return parsed;
};

// --- NEW: Data Transformation Function ---
const transformGoogleEvents = (googleEvents: any[]): CalendarEvent[] => {
  if (!googleEvents) return [];

  return googleEvents.map((event) => {
    let category: EventCategory = "Meeting"; // Default category
    const title = event.summary || "No Title";

    const cancel =
      title.toLowerCase().startsWith("canceled") || event.status === "canceled";

    console.log(title.toLowerCase());

    // Smart categorization based on keywords
    if (title.toLowerCase().includes("deadline")) category = "Deadline";
    else if (
      title.toLowerCase().includes("focus") ||
      title.toLowerCase().includes("work on")
    )
      category = "Focus Work";
    else if (
      title.toLowerCase().includes("coffee") ||
      title.toLowerCase().includes("lunch")
    )
      category = "Personal";

    // Handle all-day vs. specific time events
    let time = "All Day";
    if (event.start.dateTime) {
      const startTime = format(new Date(event.start.dateTime), "p");
      const endTime = event.end.dateTime
        ? format(new Date(event.end.dateTime), "p")
        : "";
      time = endTime ? `${startTime} - ${endTime}` : startTime;
    }

    const parsed = parseDescription(event.description);

    return {
      id: event.id,
      title: title,
      time: time,
      category: category,
      date: new Date(event.start.dateTime || event.start.date),
      meetingLink: event.hangoutLink,
      isCancelled: cancel,
      notes: parsed.notes,
      joinUrl: parsed.joinUrl,
      cancelUrl: parsed.cancelUrl,
      rescheduleUrl: parsed.rescheduleUrl,
      location: parsed.location,
    };
  });
};

// --- Event Detail Modal ---
interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  date: Date;
  onSelectEvent: (event: CalendarEvent | null) => void;
}

const MeetingInfo = ({ isOpen, onClose, selectedEvent }: any) => {
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

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              {selectedEvent && (
                <>
                  <Dialog.Title className="text-xl font-bold flex justify-between items-center">
                    {selectedEvent.title}
                    <button
                      onClick={onClose}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Title>

                  <div className="mt-3 text-gray-600 space-y-2">
                    <p>
                      <strong>Time:</strong> {selectedEvent.time}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedEvent.location || "—"}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedEvent.notes || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-2 py-2">
                    <div className="mt-4">
                      {selectedEvent.meetingLink &&
                        !selectedEvent.isCancelled && (
                          <a
                            href={selectedEvent.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                          >
                            Join Meet
                          </a>
                        )}
                    </div>
                    <div className="mt-4 ">
                      {selectedEvent.rescheduleUrl &&
                        !selectedEvent.isCancelled && (
                          <a
                            href={selectedEvent.rescheduleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-3 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
                          >
                            Reschedule Meet
                          </a>
                        )}
                    </div>
                    <div className="mt-4 ">
                      {selectedEvent.cancelUrl &&
                        !selectedEvent.isCancelled && (
                          <a
                            href={selectedEvent.cancelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                          >
                            Cancel Meet
                          </a>
                        )}
                    </div>
                  </div>
                </>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

const EventDetailModal = ({
  isOpen,
  onClose,
  events,
  date,
  onSelectEvent,
}: EventDetailModalProps) => {
  if (!isOpen) return null;
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900 flex justify-between items-center"
                >
                  <span>Schedule for {format(date, "eeee, MMMM d")}</span>

                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Title>

                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer ${
                        event.isCancelled
                          ? eventStyles["Cancelled"].color
                          : eventStyles[event.category].color
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-white mr-3">
                            {event.isCancelled
                              ? eventStyles["Cancelled"].icon
                              : eventStyles[event.category].icon}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {event.title}
                            </p>

                            <p className="text-sm text-gray-500">
                              {event.time}
                            </p>
                          </div>
                        </div>

                        {event.meetingLink && !event.isCancelled && (
                          <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1.5 text-xs bg-green-600 text-white font-semibold rounded-full hover:bg-green-700"
                          >
                            <Video className="h-4 w-4 mr-1.5" />
                            Join Meeting
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
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
const CalendarSyncDashboardBD = () => {
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchGoogleEvents();
  }, []);

  useEffect(() => {
    if (!popup) return;
    const intervalId = setInterval(() => {
      if (popup.closed) {
        clearInterval(intervalId);
        console.log("Popup has been closed! Fetching events now.");
        fetchGoogleEvents();
        setPopup(null);
      }
    }, 500);
    return () => clearInterval(intervalId);
  }, [popup]);

  const fetchGoogleEvents = async () => {
    setConnectionStatus("connecting");
    try {
      const response = await api.google.events.get(accessToken, dispatch);
      console.log("Raw Google Data:", response);
      // Use the transformation function here
      const formattedEvents = transformGoogleEvents(response);
      console.log("Formatted Events:", formattedEvents);

      setEvents(formattedEvents);
      setConnectionStatus("connected");
    } catch (error) {
      console.log(error);
      setConnectionStatus("disconnected"); // Revert on error
    }
  };

  const handleConnect = () => {
    try {
      const newpopup = window.open(
        `http://localhost:5000/api/googleAuth/google/redirect?tokens=${accessToken}`,
        "google-auth",
        "width=500,height=600"
      );
      setPopup(newpopup);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = events.filter((e) => isSameDay(e.date, day));
    if (dayEvents.length > 0) {
      setSelectedDate(day);
      setIsModalOpen(true);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
  });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const selectedDayEvents = events.filter((event) =>
    isSameDay(event.date, selectedDate)
  );

  if (connectionStatus === "disconnected") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="p-4 bg-white rounded-full shadow-md inline-block">
            <Calendar className="h-16 w-16 text-blue-600" />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Connect Your Calendar
          </h1>

          <p className="mt-2 text-lg text-gray-600">
            Sync your Google Calendar to see all your meetings and deadlines in
            one place.
          </p>

          <button
            onClick={handleConnect}
            className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all"
          >
            Connect to Google Calendar
          </button>
        </div>
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>

        <p className="mt-4 text-lg text-gray-600">
          Connecting to your calendar...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className=" bg-gray-50 min-h-screen">
        <div className="max-w-8xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Today
              </button>

              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 border-b">
            {weekdays.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayEvents = events.filter((e) => isSameDay(e.date, day));
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`p-2 h-24 border-r border-b flex flex-col transition-colors focus:outline-none ${
                    !isSameMonth(day, monthStart) ? "bg-gray-50" : "bg-white"
                  } ${
                    dayEvents.length > 0
                      ? "cursor-pointer hover:bg-blue-50"
                      : ""
                  } ${
                    isSameDay(selectedDate, day) && isModalOpen
                      ? "bg-blue-100 ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  <span
                    className={`font-medium text-sm ${
                      isSameDay(day, new Date())
                        ? "text-blue-600 font-bold"
                        : "text-gray-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  <div className="flex-grow mt-1 space-x-1 flex">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className={`h-1.5 w-1.5 rounded-full ${
                          e.isCancelled
                            ? eventStyles["Cancelled"].dotColor
                            : eventStyles[e.category].dotColor
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EventDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        events={selectedDayEvents}
        date={selectedDate}
        onSelectEvent={(event: any) => {
          setSelectedEvent(event);
          setIsModalOpen2(true);
        }}
      />
      <MeetingInfo
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
        selectedEvent={selectedEvent}
      />
    </>
  );
};

export default CalendarSyncDashboardBD;
