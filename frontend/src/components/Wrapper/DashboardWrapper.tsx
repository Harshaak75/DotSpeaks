// DashboardWrapper.tsx
import React, { Fragment, useEffect, useState } from "react";
import {
  Building2,
  LogOut,
  Clock as ClockIcon,
  Sun,
  Sunset,
  Moon,
  CheckCircle,
  Circle,
  Sparkles,
  Coffee,
  Play,
} from "lucide-react"; // Make sure to add ClockIcon
import { getSidebarItems } from "../../utils/sidebarConfig";
import { getDashboardComponent } from "../../utils/DashboardConfig";
import { api } from "../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAccessToken } from "../../redux/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";

// --- A reusable, minimalistic Clock component for the header ---
const HeaderClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
      <ClockIcon className="h-4 w-4" />
      <span className="font-mono tracking-wider">
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
    </div>
  );
};

// Greeting

const GreetingModal = ({ isOpen, onClose, userName }: any) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", Icon: Sun };
    if (hour < 18) return { text: "Good Afternoon", Icon: Sunset };
    return { text: "Good Evening", Icon: Moon };
  };

  const { text, Icon } = getGreeting();
  // Mock tasks for today with a completed status
  const todaysTasks = [
    { text: "Finalize Nexus Corp banner", completed: true },
    { text: "Rework Stellar Solutions video ad", completed: false },
    { text: "Client follow-up call", completed: false },
  ];

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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="bg-blue-50 p-6">
                  {/* MODIFIED: Changed to items-start for better vertical alignment */}
                  <div className="flex items-start">
                    <div className="p-3 bg-white rounded-full shadow-sm flex-shrink-0">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-gray-800 leading-tight"
                      >
                        {text},
                      </Dialog.Title>
                      {/* MODIFIED: Added negative margin to tighten spacing */}
                      <p className="text-xl text-blue-700 font-semibold -mt-1">
                        {userName}!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mt-2">
                    <p className="text-md font-semibold text-gray-800">
                      Here's your focus for today:
                    </p>
                    <ul className="mt-3 space-y-3">
                      {todaysTasks.map((task, index) => (
                        <li key={index} className="flex items-center">
                          {task.completed ? (
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-300 mr-3 flex-shrink-0" />
                          )}
                          <span
                            className={`text-gray-700 ${
                              task.completed ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {task.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <p className="text-sm italic text-gray-500">
                      "The secret of getting ahead is getting started."
                    </p>
                    <p className="text-xs text-gray-400 mt-1">- Mark Twain</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Start My Day
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

// logout greeting

const LogoutModal = ({ isOpen, onClose, onConfirmLogout }: any) => {
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-center align-middle shadow-xl transition-all">
                <Sparkles className="mx-auto h-12 w-12 text-pink-500" />
                <Dialog.Title
                  as="h3"
                  className="text-2xl mt-4 font-bold text-gray-800"
                >
                  Thank You for Your Hard Work!
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-md text-gray-600">
                    Your dedication helps{" "}
                    <span className="font-semibold">DotSpeaks</span> thrive.
                    Now, it's time to go home to those who matter most.
                  </p>
                </div>
                <div className="mt-8 flex space-x-4">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                    onClick={onConfirmLogout}
                  >
                    Confirm Logout
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

// --- NEW: Break Modal Component ---
const BreakModal = ({ isOpen, onStartBreak, onEndBreak }: any) => {
  useEffect(() => {
    if (isOpen) {
      onStartBreak();
    }
  }, [isOpen]);
  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-500"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-transparent p-8 text-center align-middle transition-all">
                <Coffee className="mx-auto h-16 w-16 text-white/80" />
                <Dialog.Title
                  as="h3"
                  className="text-3xl mt-6 font-bold text-white"
                >
                  Enjoy Your Break
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-lg text-white/70">
                    Step away and recharge. A clear mind creates amazing work.
                  </p>
                </div>
                <div className="mt-10">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/80 bg-white/20 px-8 py-3 text-lg font-semibold text-white hover:bg-white/30 focus:outline-none transition-all duration-300"
                    onClick={onEndBreak}
                  >
                    <Play className="h-6 w-6 mr-3 -ml-2" />
                    Back to Work
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

interface Props {
  userRole: string;
}

const DashboardWrapper: React.FC<Props> = ({ userRole }) => {
  let choise;

  if (userRole == "CLIENT") {
    choise = "brandkit";
  } else {
    choise = "Profile";
  }

  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("activeSection") || choise;
  });
  const sidebarItems = getSidebarItems(userRole);
  const DashboardComponent = getDashboardComponent(userRole);

  const [isGreetingOpen, setIsGreetingOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);

  const [breakId, setBreakId] = useState("");

  const [loading, setLoading] = useState(false);

  const accessToken = useSelector(selectAccessToken);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  useEffect(() => {
    if (userRole != "CLIENT") {
      const greetingInfo = sessionStorage.getItem("greetingInfo");
      if (!greetingInfo) {
        setIsGreetingOpen(true);
        sessionStorage.setItem("greetingInfo", "true");
      }
    }
  }, []);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      setLoading(true);
      console.log("role:", userRole);
      if (userRole == "CLIENT") {
        navigate("/ClientLogin");
        await api.auth.logout.client(accessToken);
        localStorage.removeItem("activeSection");
        dispatch(logout());
        sessionStorage.removeItem("greetingInfo");
        console.log("hi everyone");
      } else {
        await api.auth.logout.post(accessToken);
        localStorage.removeItem("activeSection");
        dispatch(logout());
        sessionStorage.removeItem("greetingInfo");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const handleStartBreak = async () => {
    try {
      const data = await api.attendance.StartBreak.post(accessToken, dispatch);
      setBreakId(data.break_id);
    } catch (error) {
      console.error("Error starting break:", error);
    }
  };

  const handleEndBreak = async () => {
    if (!breakId) {
      console.error("No break ID found to end the break.");
      return;
    }
    try {
      await api.attendance.EndBreak.post(accessToken, dispatch, breakId);
      console.log("Break ended");
      setIsBreakModalOpen(false);
    } catch (error) {
      console.error("Error ending break:", error);
    }
  };

  // --- Roles that should NOT see the clock ---
  const rolesWithoutClock = ["coo", "ceo", "CLIENT"];

  return (
    <>
      <GreetingModal
        isOpen={isGreetingOpen}
        onClose={() => setIsGreetingOpen(false)}
        userName="Harsha"
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={confirmLogout}
      />

      <BreakModal
        isOpen={isBreakModalOpen}
        onStartBreak={handleStartBreak}
        onEndBreak={handleEndBreak}
      />

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <h1 className="ml-3 text-xl font-bold text-gray-900">
                  DotSpeaks
                </h1>
              </div>

              {/* --- Middle section of the header --- */}
              <div className="flex-1 flex justify-center">
                {!rolesWithoutClock.includes(userRole) && <HeaderClock />}
              </div>

              {!rolesWithoutClock.includes(userRole) && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsBreakModalOpen(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                  >
                    <Coffee className="h-4 w-4" />
                    <span className="text-sm font-semibold">Take a Break</span>
                  </button>
                  <span className="text-sm text-gray-500">Role:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {userRole}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex">
          <aside className="w-64 bg-white shadow-sm">
            <nav
              className="mt-8 px-4 flex flex-col"
              style={{ height: "calc(100vh - 4rem)" }}
            >
              {/* Main navigation items */}
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Dashboard
                </h2>
                <ul className="mt-4 space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeSection === item.id
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5 mb-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>

              {/* Logout Button pushed to the bottom */}
            </nav>
          </aside>

          <main className="flex-1 p-8">
            <DashboardComponent activeSection={activeSection} />
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardWrapper;
