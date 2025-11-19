import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, MapPin, Plus, Video, X } from "lucide-react";
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

  const getStatusColor = () => {
    // All statuses now have white background with blue text
    return "bg-white";
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "virtual":
        return <Video className="h-4 w-4" style={{ color: '#0000CC' }} />;
      case "in-person":
        return <MapPin className="h-4 w-4" style={{ color: '#0000CC' }} />;
      case "hybrid":
        return <Users className="h-4 w-4" style={{ color: '#0000CC' }} />;
      default:
        return <Calendar className="h-4 w-4" style={{ color: '#0000CC' }} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: '#0000CC' }}
        ></div>
      </div>
    );
  }

  const handleCreateMeeting = async () => {
    try {
      setLoading(true);
      const participantsArray = newMeeting.participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        ...newMeeting,
        participants: participantsArray,
        status: "Scheduled",
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
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: '#FEF9F5' }}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 
            className="text-3xl"
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontWeight: 'bold',
              color: '#0000CC'
            }}
          >
            Meeting Calendar
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: '#0000CC',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
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
              className="rounded-xl shadow-lg overflow-hidden"
              style={{ backgroundColor: '#0000CC' }}
            >
              {/* Meeting Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1">
                    <Calendar className="h-5 w-5 text-white mr-3" />
                    <div>
                      <h3 
                        className="text-lg text-white mb-1"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                      >
                        {meeting.title}
                      </h3>
                      <p 
                        className="text-sm text-white"
                        style={{ fontFamily: 'Roboto, sans-serif', opacity: 0.9 }}
                      >
                        Organized by {meeting.organizer}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 text-xs rounded-lg ${getStatusColor()}`}
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    {meeting.status}
                  </span>
                </div>
              </div>

              {/* Meeting Content */}
              <div className="bg-white p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar 
                      className="h-4 w-4 mr-2"
                      style={{ color: '#0000CC' }}
                    />
                    <div>
                      <p 
                        className="text-xs text-gray-600"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Date
                      </p>
                      <p 
                        className="text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold',
                          color: '#333'
                        }}
                      >
                        {new Date(meeting.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock 
                      className="h-4 w-4 mr-2"
                      style={{ color: '#0000CC' }}
                    />
                    <div>
                      <p 
                        className="text-xs text-gray-600"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Time
                      </p>
                      <p 
                        className="text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold',
                          color: '#333'
                        }}
                      >
                        {meeting.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getTypeIcon(meeting.type)}
                    <div className="ml-2">
                      <p 
                        className="text-xs text-gray-600"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Type
                      </p>
                      <p 
                        className="text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold',
                          color: '#333'
                        }}
                      >
                        {meeting.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin 
                      className="h-4 w-4 mr-2"
                      style={{ color: '#0000CC' }}
                    />
                    <div>
                      <p 
                        className="text-xs text-gray-600"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Location
                      </p>
                      <p 
                        className="text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 'bold',
                          color: '#333'
                        }}
                      >
                        {meeting.location}
                      </p>
                    </div>
                  </div>
                </div>

                {meeting.meeting_link && (
                  <div className="mb-4">
                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                      style={{ 
                        backgroundColor: '#E6E6FF',
                        color: '#0000CC',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </a>
                  </div>
                )}

                <div className="mb-4">
                  <h4 
                    className="text-sm mb-2"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    Participants
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {meeting.participants.map((participant, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-lg"
                        style={{ 
                          backgroundColor: '#E6E6FF',
                          color: '#0000CC',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '12px'
                        }}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>

                {meeting.agenda && (
                  <div 
                    className="rounded-lg p-4"
                    style={{ backgroundColor: '#E6E6FF' }}
                  >
                    <h4 
                      className="text-sm mb-2"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold',
                        color: '#0000CC'
                      }}
                    >
                      Agenda
                    </h4>
                    <p 
                      className="text-sm text-gray-700"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {meeting.agenda}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {meetings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Calendar 
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: '#0000CC' }}
            />
            <p 
              className="text-gray-500"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              No meetings scheduled
            </p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 m-0">
          <div 
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg"
            style={{ backgroundColor: '#0000CC' }}
          >
            {/* Modal Header */}
            <div className="p-6 flex items-center justify-between">
              <h3 
                className="text-xl text-white"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
              >
                Schedule a New Meeting
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="bg-white p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Project Kickoff"
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Date */}
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Time */}
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, time: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Duration
                  </label>
                  <input
                    type="text"
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, duration: e.target.value })
                    }
                    placeholder="e.g. 1h 30m"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Type */}
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Meeting Type
                  </label>
                  <select
                    onChange={(e) =>
                      setNewMeeting({
                        ...newMeeting,
                        type: e.target.value as "Virtual" | "In-Person" | "Hybrid",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <option value="virtual">Virtual</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, location: e.target.value })
                    }
                    placeholder="e.g. Zoom, Board Room A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Organizer */}
                <div>
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Organizer
                  </label>
                  <input
                    type="text"
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, organizer: e.target.value })
                    }
                    placeholder="e.g. Sarah Johnson"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Meeting Link */}
                <div className="md:col-span-2">
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                  <p 
                    className="text-xs text-gray-500 mt-1"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Paste the meeting link if available (Zoom, Google Meet, Teams, etc.)
                  </p>
                </div>

                {/* Participants */}
                <div className="md:col-span-2">
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                  <p 
                    className="text-xs text-gray-500 mt-1"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Example: alice@company.com, bob@company.com
                  </p>
                </div>

                {/* Agenda */}
                <div className="md:col-span-2">
                  <label 
                    className="block text-sm mb-2 text-gray-700"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    Agenda
                  </label>
                  <textarea
                    placeholder="Outline the discussion points"
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, agenda: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    color: '#666'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  onClick={handleCreateMeeting}
                  style={{ 
                    backgroundColor: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  Create Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsSection;
