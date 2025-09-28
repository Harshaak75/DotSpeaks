import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, MapPin, Plus, Video } from "lucide-react";
import { api } from "../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../redux/slice/authSlice";

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: string[];
  location: string;
  type: string;
  status: string;
  agenda: string;
  organizer: string;
  meeting_link: string;
}

const MeetingsSection: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    duration: "",
    type: "Virtual",
    location: "",
    organizer: "",
    meeting_link: "",
    participants: "",
    agenda: "",
  });

  const accessToken = useSelector(selectAccessToken);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await api.coo.calendar.get(accessToken, dispatch);
      setMeetings(meetingsData);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "virtual":
        return <Video className="h-4 w-4" />;
      case "in-person":
        return <MapPin className="h-4 w-4" />;
      case "hybrid":
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleCreateMeeting = async () => {
    try {
      setLoading(true);
      const participantsArray = newMeeting.participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean); // remove empty strings

      const payload = {
        ...newMeeting,
        participants: participantsArray,
        status: "Scheduled", // or default value
      };

      const response = await api.coo.calendar.create(payload, accessToken, dispatch);

      setMeetings([...meetings, response]);
      setShowAddModal(false);
      setNewMeeting({
        title: "",
        date: "",
        time: "",
        duration: "",
        type: "Virtual",
        location: "",
        organizer: "",
        meeting_link: "",
        participants: "",
        agenda: "",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Meeting Calendar</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </button>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {meeting.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Organized by {meeting.organizer}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    meeting.status
                  )}`}
                >
                  {meeting.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Date</p>
                    <p className="text-sm font-medium">
                      {new Date(meeting.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Time</p>
                    <p className="text-sm font-medium">{meeting.time}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTypeIcon(meeting.type)}
                  <div className="ml-2">
                    <p className="text-xs text-gray-600">Type</p>
                    <p className="text-sm font-medium">{meeting.type}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Location</p>
                    <p className="text-sm font-medium">{meeting.location}</p>
                  </div>
                </div>
                {/* 👇 Add this right here */}
                {meeting.meeting_link && (
                  <div className="flex items-center">
                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      🔗&nbsp;<span>Join Meeting</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Participants
                </h4>
                <div className="flex flex-wrap gap-2">
                  {meeting.participants.map((participant, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {participant}
                    </span>
                  ))}
                </div>
              </div>

              {meeting.agenda && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Agenda
                  </h4>
                  <p className="text-sm text-gray-700">{meeting.agenda}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {meetings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No meetings scheduled</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 m-0">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl border border-gray-200 p-6 relative">
            {/* Close button (top-right) */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
              title="Close"
            >
              ✕
            </button>

            {/* Header */}
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Schedule a New Meeting
            </h3>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project Kickoff"
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, duration: e.target.value })
                  }
                  placeholder="e.g. 1h 30m"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Type
                </label>
                <select
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      type: e.target.value as
                        | "Virtual"
                        | "In-Person"
                        | "Hybrid",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="virtual">Virtual</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, location: e.target.value })
                  }
                  placeholder="e.g. Zoom, Board Room A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Organizer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organizer
                </label>
                <input
                  type="text"
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, organizer: e.target.value })
                  }
                  placeholder="e.g. Sarah Johnson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Meeting Link */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Link
                </label>
                <input
                  type="url"
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      meeting_link: e.target.value,
                    })
                  }
                  placeholder="e.g. https://zoom.us/j/123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the meeting link if available (Zoom, Google Meet, Teams,
                  etc.)
                </p>
              </div>

              {/* Participants */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participants
                </label>
                <input
                  type="text"
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      participants: e.target.value,
                    })
                  }
                  placeholder="Comma-separated names/emails"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: alice@company.com, bob@company.com
                </p>
              </div>

              {/* Agenda */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agenda
                </label>
                <textarea
                  placeholder="Outline the discussion points"
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, agenda: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleCreateMeeting}
              >
                Create Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsSection;
