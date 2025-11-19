// DashboardWrapper.tsx
import React, { Fragment, useEffect, useState, useCallback } from "react";
import {
  LogOut,
  Sun,
  Sunset,
  Moon,
  CheckCircle,
  Circle,
  Sparkles,
  Coffee,
  Play,
} from "lucide-react";
import { getSidebarItems } from "../../utils/sidebarConfig";
import { getDashboardComponent } from "../../utils/DashboardConfig";
import { api } from "../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAccessToken } from "../../redux/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import logo from "../../assets/logo.png";
import WorkCountdown from "./WorkCountdown";

// --- TYPE DEFINITIONS ---
interface GreetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

interface BreakModalProps {
  isOpen: boolean;
  onStartBreak: () => void;
  onEndBreak: () => void;
}

interface Task {
  text: string;
  completed: boolean;
}

const BREAK_STORAGE_KEY = import.meta.env.BREAK_STORAGE_KEY;

// Greeting Modal
const GreetingModal = ({ isOpen, onClose, userName }: GreetingModalProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", Icon: Sun };
    if (hour < 18) return { text: "Good Afternoon", Icon: Sunset };
    return { text: "Good Evening", Icon: Moon };
  };

  const { text, Icon } = getGreeting();
  const todaysTasks: Task[] = [
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
                  <div className="flex items-start">
                    <div className="p-3 bg-white rounded-full shadow-sm flex-shrink-0">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-gray-800 leading-tight"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        {text},
                      </Dialog.Title>
                      <p
                        className="text-xl text-blue-700 font-semibold -mt-1"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        {userName}!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mt-2">
                    <p
                      className="text-md font-semibold text-gray-800"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "bold",
                      }}
                    >
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
                            style={{ fontFamily: "Roboto, sans-serif" }}
                          >
                            {task.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <p
                      className="text-sm italic text-gray-500"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      "The secret of getting ahead is getting started."
                    </p>
                    <p
                      className="text-xs text-gray-400 mt-1"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      - Mark Twain
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "bold",
                    }}
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

// Logout Modal
const LogoutModal = ({
  isOpen,
  onClose,
  onConfirmLogout,
}: LogoutModalProps) => {
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
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Thank You for Your Hard Work!
                </Dialog.Title>
                <div className="mt-4">
                  <p
                    className="text-md text-gray-600"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  >
                    Your dedication helps{" "}
                    <span
                      className="font-semibold"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "bold",
                      }}
                    >
                      DotSpeaks
                    </span>{" "}
                    thrive. Now, it's time to go home to those who matter most.
                  </p>
                </div>
                <div className="mt-8 flex space-x-4">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "bold",
                    }}
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

// Break Modal
const BreakModal = ({ isOpen, onStartBreak, onEndBreak }: BreakModalProps) => {
  useEffect(() => {
    if (isOpen) {
      onStartBreak();
    }
  }, [isOpen, onStartBreak]);

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
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Enjoy Your Break
                </Dialog.Title>
                <div className="mt-4">
                  <p
                    className="text-[1rem] text-white/70"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  >
                    Step away and recharge. A clear mind creates amazing work.
                  </p>
                </div>
                <div className="mt-10">
                  <button
                    type="button"
                    className="inline-flex bg-[#0000cc] items-center justify-center rounded-md border-2 border-white/80 px-8 py-3 text-lg font-semibold text-white hover:bg-[#0000cc]/70 focus:outline-none transition-all duration-300"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "bold",
                    }}
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
  const BREAK_STORAGE_KEY = "WorkBreakKeyv1";
  console.log("The break id is:", BREAK_STORAGE_KEY);

  const SERECT_KEY = "WorkStoragev1";

  // load persisted break state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BREAK_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { open?: boolean; breakId?: string };
        if (parsed?.open) {
          setIsBreakModalOpen(true);
          if (parsed?.breakId) {
            setBreakId(parsed.breakId);
          } else {
            // if break was open but breakId missing, we'll initiate start break to obtain an id
            (async () => {
              try {
                const data = await api.attendance.StartBreak.post(
                  accessToken,
                  dispatch
                );
                setBreakId(data.break_id);
                // save updated breakId
                console.log("The break id is:", BREAK_STORAGE_KEY);
                localStorage.setItem(
                  BREAK_STORAGE_KEY,
                  JSON.stringify({ open: true, breakId: data.break_id })
                );
              } catch (err) {
                console.error(
                  "Failed to restore breakId, will keep modal open:",
                  err
                );
              }
            })();
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load break state", e);
    }
  }, [accessToken, dispatch]);

  // IMPORTANT: All hooks must be called before any conditional returns
  const handleStartBreak = useCallback(async () => {
    try {
      const data = await api.attendance.StartBreak.post(accessToken, dispatch);
      setBreakId(data.break_id);
      // persist that break is open and store breakId
      try {
        localStorage.setItem(
          BREAK_STORAGE_KEY,
          JSON.stringify({ open: true, breakId: data.break_id })
        );
      } catch (e) {
        console.warn("Failed to persist break state", e);
      }
    } catch (error) {
      console.error("Error starting break:", error);
    }
  }, [accessToken, dispatch]);

  const handleEndBreak = useCallback(async () => {
    if (!breakId) {
      console.error("No break ID found to end the break.");
      // Still clear persisted open flag to avoid stuck UI
      try {
        localStorage.removeItem(BREAK_STORAGE_KEY);
      } catch (e) {
        /* ignore */
      }
      setIsBreakModalOpen(false);
      return;
    }
    try {
      await api.attendance.EndBreak.post(accessToken, dispatch, breakId);
      console.log("Break ended");
      // clear persisted break info
      try {
        localStorage.removeItem(BREAK_STORAGE_KEY);
      } catch (e) {
        console.warn("Failed to remove break state", e);
      }
      setBreakId("");
      setIsBreakModalOpen(false);
    } catch (error) {
      console.error("Error ending break:", error);
    }
  }, [accessToken, dispatch, breakId]);

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
  }, [userRole]);

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
        localStorage.removeItem(SERECT_KEY);
        // clear break storage on logout
        try {
          localStorage.removeItem(BREAK_STORAGE_KEY);
        } catch (e) {
          /* ignore */
        }
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

  // NOW this conditional return comes AFTER all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="animate-spin rounded-full h-16 w-16 border-b-4"
          style={{ borderColor: "#0000CC" }}
        ></div>
      </div>
    );
  }

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

      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Sidebar with #0000CC color */}
        <aside
          className="w-64 shadow-lg flex flex-col"
          style={{ backgroundColor: "#0000CC", minHeight: "100vh" }}
        >
          {/* Logo at the very top */}
          <div
            className="p-3.5 flex items-center justify-center border-b"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            <img
              src={logo}
              alt="DotSpeaks Logo"
              className="h-10 w-auto max-w-full object-contain"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-[1.1rem] flex font-medium items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeSection === item.id
                          ? "bg-white text-[#0000CC] font-semibold"
                          : "text-white hover:bg-white/20"
                      }`}
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button at the bottom */}
          <div
            className="p-4 border-t"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-white hover:bg-red-600"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header - LAYOUT: Empty (left), Role (center), Break & Time (right) */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-8 py-4 flex justify-between items-center">
              {/* Left side - Empty for balance */}
              <div className="w-64"></div>

              {/* Center - Role Badge (NO "Role:" label, just the role directly) */}
              <div className="flex-1 flex justify-center">
                <div
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: "#0000CC",
                    
                    fontWeight: "bold",
                  }}
                >
                  <span className="text-sm text-[1.25rem] font-bold text-white">
                    {userRole.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")}
                    {/* {userRole.toLowerCase()} */}
                  </span>
                </div>
              </div>

              {/* Right side - Take a Break & Time Badge */}
              {!rolesWithoutClock.includes(userRole) ? (
                <div className="w-auto flex justify-end items-center space-x-4">
                  {/* Take a Break Button - NOW RED */}
                  <button
                    onClick={() => {
                      setIsBreakModalOpen(true);
                      // persist open flag now; breakId will be set after API returns inside handleStartBreak
                      try {
                        console.log("The break id is:", BREAK_STORAGE_KEY);
                        localStorage.setItem(
                          BREAK_STORAGE_KEY,
                          JSON.stringify({ open: true })
                        );
                      } catch (e) {
                        console.warn("Failed to persist break open state", e);
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity shadow-md"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "bold",
                      backgroundColor: "#D70707",
                    }}
                  >
                    <Coffee className="h-5 w-5" />
                    <span className="text-sm font-semibold">Take a Break</span>
                  </button>

                  {/* Time Badge */}
                  <WorkCountdown
                    initialSeconds={
                      process.env.NODE_ENV === "development" ? 60 : 8 * 3600
                    }
                    paused={isBreakModalOpen} // when you open Take a Break modal, parent sets isBreakModalOpen true -> timer pauses
                    onOvertime={() => {
                      // called once when overtime starts — call your API here
                      // example: api.attendance.markOvertime(accessToken).catch(console.error)
                      console.log("OVERTIME STARTED - call your API here");
                    }}
                  />
                </div>
              ) : (
                <div className="w-64 flex justify-end">
                  <WorkCountdown
                    initialSeconds={
                      process.env.NODE_ENV === "development" ? 60 : 8 * 3600
                    }
                    paused={isBreakModalOpen}
                    onOvertime={() => {
                      console.log("OVERTIME STARTED - call your API here");
                    }}
                  />
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-8">
            <DashboardComponent activeSection={activeSection} />
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardWrapper;
