import React, { useState, Fragment } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar as CalendarIcon, Info, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Define a type for our Event object for type safety ---
interface EventType {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description: string;
  important: boolean;
  allDay?: boolean; // This property is optional
}

// --- Mock Data: Represents events fetched from your API ---
const mockEvents: EventType[] = [
  {
    id: 1,
    title: 'Q3 All-Hands Meeting',
    start: new Date(2025, 6, 22, 10, 0, 0), // Note: Month is 0-indexed (6 = July)
    end: new Date(2025, 6, 22, 11, 30, 0),
    description: 'Company-wide update on Q3 performance and future outlook.',
    important: false,
  },
  {
    id: 2,
    title: 'Project Phoenix: Final Design Review',
    start: new Date(2025, 6, 25, 14, 0, 0),
    end: new Date(2025, 6, 25, 16, 0, 0),
    description: 'Final review of the new product design with key stakeholders. This is a critical milestone.',
    important: true,
  },
  {
    id: 3,
    title: 'Marketing Campaign Brainstorm',
    start: new Date(2025, 6, 29, 9, 0, 0),
    end: new Date(2025, 6, 29, 11, 0, 0),
    description: 'Creative session for the upcoming winter marketing campaign.',
    important: false,
  },
  {
    id: 4,
    title: 'New Feature Launch Day',
    start: new Date(2025, 7, 1, 0, 0, 0), // August 1st
    end: new Date(2025, 7, 1, 23, 59, 59),
    allDay: true,
    description: 'Official launch of the new analytics dashboard feature.',
    important: true,
  },
   {
    id: 5,
    title: 'Team Offsite - Planning Session',
    start: new Date(2025, 7, 8, 10, 0, 0),
    end: new Date(2025, 7, 8, 17, 0, 0),
    description: 'Full day offsite for strategic planning for the next half.',
    important: false,
  },
  {
    id: 6,
    title: 'Investor Relations Call',
    start: new Date(2025, 7, 15, 16, 30, 0),
    end: new Date(2025, 7, 15, 17, 30, 0),
    description: 'Quarterly call with major investors.',
    important: true,
  }
];


// --- The Main Calendar Component ---
const EventsCalendarSection = () => {
  const [events] = useState<EventType[]>(mockEvents);
  // --- Apply the EventType to the state, allowing it to be EventType or null ---
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1));

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // A small delay to allow the modal to animate out before clearing the event
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const CalendarHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h2>
      <div className="flex items-center space-x-2">
        <button onClick={goToPrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Today
        </button>
        <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );

  const CalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div className="flex-grow flex flex-col">
        <div className="grid grid-cols-7 gap-px">
          {weekdays.map(weekday => (
            <div key={weekday} className="text-center text-sm font-semibold text-gray-500 py-2">
              {weekday}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 gap-px flex-grow bg-gray-100 border-t border-l border-gray-200">
          {days.map((day, index) => {
            const dayEvents = events.filter(event => isSameDay(event.start, day));
            return (
              <div
                key={index}
                className={`relative p-2 bg-white flex flex-col transition-colors ${
                  isSameMonth(day, monthStart) ? 'text-gray-900' : 'text-gray-400 bg-gray-50'
                } ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
              >
                <span className={`font-medium ${isSameDay(day, new Date()) ? 'text-blue-600' : ''}`}>{format(day, 'd')}</span>
                <div className="mt-1 space-y-1 overflow-y-auto">
                  {dayEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      className={`w-full text-left text-xs font-medium p-1 rounded transition-colors truncate ${
                        event.important 
                        ? 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[85vh] flex flex-col">
      <CalendarHeader />
      <CalendarGrid />

      {/* --- Event Details Modal --- */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {selectedEvent && (
                    <>
                      <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 flex justify-between items-center">
                        {selectedEvent.title}
                        <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100">
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </Dialog.Title>
                       {selectedEvent.important && (
                        <div className="mt-2 inline-flex items-center bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-4 h-4 mr-1.5" />
                          Important Event
                        </div>
                      )}
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                           <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                           <div>
                              <p className="text-sm font-medium text-gray-900">
                                {format(selectedEvent.start, 'eeee, MMMM d, yyyy')}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedEvent.allDay ? 'All Day' : `${format(selectedEvent.start, 'p')} - ${format(selectedEvent.end, 'p')}`}
                              </p>
                           </div>
                        </div>
                         <div className="flex items-start">
                           <Info className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                           <div>
                              <p className="text-sm font-medium text-gray-900">Description</p>
                              <p className="text-sm text-gray-500">{selectedEvent.description}</p>
                           </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default EventsCalendarSection;
