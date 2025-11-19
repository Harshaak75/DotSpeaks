import { useState, Fragment } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar as CalendarIcon, Info, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface EventType {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description: string;
  important: boolean;
  allDay?: boolean;
}

// --- MOCK DATA ---
const mockEvents: EventType[] = [
  {
    id: 1,
    title: 'Q3 All-Hands Meeting',
    start: new Date(2025, 6, 22, 10, 0, 0),
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
    start: new Date(2025, 7, 1, 0, 0, 0),
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

// --- MAIN CALENDAR COMPONENT ---
const EventsCalendarSection = () => {
  const [events] = useState<EventType[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1));

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const CalendarHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <h2 
        className="text-3xl font-bold"
        style={{ color: '#0000CC' }}
      >
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      <div className="flex items-center space-x-2">
        <button 
          onClick={goToPrevMonth} 
          className="p-2 rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#F0F0FF' }}
        >
          <ChevronLeft className="h-5 w-5" style={{ color: '#0000CC' }} />
        </button>
        <button 
          onClick={() => setCurrentDate(new Date())} 
          className="px-4 py-2 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity text-white"
          style={{ backgroundColor: '#0000CC' }}
        >
          Today
        </button>
        <button 
          onClick={goToNextMonth} 
          className="p-2 rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#F0F0FF' }}
        >
          <ChevronRight className="h-5 w-5" style={{ color: '#0000CC' }} />
        </button>
      </div>
    </div>
  );

  const CalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div className="flex-grow flex flex-col">
        <div className="grid grid-cols-7 gap-px mb-2">
          {weekdays.map(weekday => (
            <div 
              key={weekday} 
              className="text-center text-sm font-bold py-2"
              style={{ color: '#0000CC' }}
            >
              {weekday}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 gap-px flex-grow bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {days.map((day, index) => {
            const dayEvents = events.filter(event => isSameDay(event.start, day));
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div
                key={index}
                className={`relative p-2 bg-white flex flex-col transition-colors ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400 bg-gray-50'
                }`}
                style={isToday ? { backgroundColor: '#F0F0FF' } : {}}
              >
                <span 
                  className="font-bold text-sm"
                  style={{ 
                    color: isToday ? '#0000CC' : undefined
                  }}
                >
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-1 overflow-y-auto">
                  {dayEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      className="w-full text-left text-xs p-1 rounded-lg transition-colors truncate hover:opacity-90"
                      style={{
                        backgroundColor: event.important ? '#FFE6E6' : '#F0F0FF',
                        color: event.important ? '#DC2626' : '#0000CC',
                      }}
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
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="rounded-xl shadow-lg p-6 h-[85vh] flex flex-col bg-white border-l-4" style={{ borderLeftColor: '#0000CC' }}>
        <CalendarHeader />
        <CalendarGrid />
      </div>

      {/* EVENT DETAILS MODAL */}
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
                <Dialog.Panel 
                  className="w-full max-w-md transform overflow-hidden rounded-2xl shadow-xl transition-all border-2"
                  style={{ 
                    backgroundColor: '#0000CC',
                    borderColor: '#0000CC'
                  }}
                >
                  {selectedEvent && (
                    <>
                      {/* MODAL HEADER */}
                      <div className="p-6 flex justify-between items-center">
                        <Dialog.Title 
                          as="h3" 
                          className="text-xl font-bold text-white"
                        >
                          {selectedEvent.title}
                        </Dialog.Title>
                        <button 
                          onClick={closeModal} 
                          className="p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                          <X className="h-5 w-5 text-white" />
                        </button>
                      </div>
                      
                      {/* MODAL CONTENT */}
                      <div className="bg-white p-6 text-left">
                        {selectedEvent.important && (
                          <div 
                            className="mb-4 inline-flex items-center text-xs px-3 py-1 rounded-lg font-bold"
                            style={{
                              backgroundColor: '#FFE6E6',
                              color: '#DC2626',
                            }}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1.5" />
                            Important Event
                          </div>
                        )}
                        <div className="space-y-4">
                          <div className="flex items-start">
                             <CalendarIcon 
                               className="h-5 w-5 mr-3 mt-1 flex-shrink-0"
                               style={{ color: '#0000CC' }}
                             />
                             <div>
                                <p 
                                  className="text-sm font-bold"
                                  style={{ color: '#0000CC' }}
                                >
                                  {format(selectedEvent.start, 'eeee, MMMM d, yyyy')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {selectedEvent.allDay ? 'All Day' : `${format(selectedEvent.start, 'p')} - ${format(selectedEvent.end, 'p')}`}
                                </p>
                             </div>
                          </div>
                           <div className="flex items-start">
                             <Info 
                               className="h-5 w-5 mr-3 mt-1 flex-shrink-0"
                               style={{ color: '#0000CC' }}
                             />
                             <div>
                                <p 
                                  className="text-sm font-bold mb-1"
                                  style={{ color: '#0000CC' }}
                                >
                                  Description
                                </p>
                                <p className="text-sm text-gray-600">
                                  {selectedEvent.description}
                                </p>
                             </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: '#0000CC' }}
                            onClick={closeModal}
                          >
                            Close
                          </button>
                        </div>
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
