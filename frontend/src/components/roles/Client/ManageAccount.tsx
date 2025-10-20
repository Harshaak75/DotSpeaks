import React, { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Lock,
  Shield,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  ExternalLink,
  X,
  KeyRound,
  CheckCircle,
  Link as LinkIcon,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import axios from "axios";

// --- TYPE DEFINITIONS ---
type Platform = "Instagram" | "Facebook" | "LinkedIn" | "YouTube" | "Twitter";
type ConnectionType = "oauth" | "manual" | null;

interface SocialAccount {
  id: number;
  platform: Platform;
  username?: string;
  password?: string;
  connectionType: ConnectionType;
  status: "connected" | "disconnected";
}

// --- MOCK DATA ---
const initialAccounts: SocialAccount[] = [
  {
    id: 1,
    platform: "Instagram",
    connectionType: null,
    status: "disconnected",
  },
  {
    id: 2,
    platform: "LinkedIn",
    username: "Nexus Corporation",
    connectionType: "manual",
    status: "connected",
    password: "password456",
  },
  { id: 3, platform: "Facebook", connectionType: null, status: "disconnected" },
  { id: 4, platform: "Twitter", connectionType: null, status: "disconnected" },
  {
    id: 5,
    platform: "YouTube",
    connectionType: "oauth",
    status: "connected",
    username: "NexusCorpTV",
  },
];

const platformConfig: any = {
  Instagram: {
    icon: Instagram,
    color: "text-pink-600",
    authUrl: "/auth/instagram",
  },
  Facebook: {
    icon: Facebook,
    color: "text-blue-700",
    authUrl: "/auth/facebook",
  },
  LinkedIn: {
    icon: Linkedin,
    color: "text-sky-600",
    authUrl: "/auth/linkedin",
  },
  Twitter: { icon: Twitter, color: "text-blue-400", authUrl: "/auth/twitter" },
  YouTube: { icon: Youtube, color: "text-red-600", authUrl: "/auth/youtube" },
};

const ConnectionEvents = new EventTarget();

export const dispatchConnectionStatus = (
  status: "success" | "failure",
  message: string,
  redirectToComponent: string
) => {
  ConnectionEvents.dispatchEvent(
    new CustomEvent("meta-connection", {
      detail: { status, message, redirectToComponent },
    })
  );
};

export const subscribeToConnectionStatus = (
  callback: (event: CustomEvent) => void
) => {
  ConnectionEvents.addEventListener(
    "meta-connection",
    callback as EventListener
  );
  return () =>
    ConnectionEvents.removeEventListener(
      "meta-connection",
      callback as EventListener
    );
};

// --- MODAL FOR ADDING/EDITING ACCOUNTS (MANUAL) ---
const AccountFormModal = ({ isOpen, onClose, onSave, platform }: any) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    setUsername("");
    setPassword("");
  }, [isOpen]);

  const handleSave = () => {
    onSave({ platform, username, password });
    onClose();
  };

  const PlatformIcon = platform ? platformConfig[platform].icon : Fragment;

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
          <div className="fixed inset-0 bg-black/60" />
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
                  className="text-lg font-bold leading-6 text-gray-900 flex items-center"
                >
                  <PlatformIcon
                    className={`h-6 w-6 mr-2 ${
                      platform ? platformConfig[platform].color : ""
                    }`}
                  />
                  Manually Connect {platform}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Enter the credentials for your account. This is not
                    recommended for platforms that support secure connection.
                  </p>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                  >
                    Save Credentials
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

// --- REUSABLE PLATFORM CARD COMPONENT ---
const PlatformCard = ({
  account,
  onManualConnect,
  onDisconnect,
  onConnectOAuth,
}: any) => {
  const config = platformConfig[account.platform];
  const PlatformIcon = config.icon;

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <PlatformIcon className={`h-10 w-10 mr-4 ${config.color}`} />
            <div>
              <p className="text-xl font-bold text-gray-800">
                {account.platform}
              </p>
              {account.status === "connected" ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <p className="text-sm font-semibold">Connected</p>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <X className="h-4 w-4 mr-1" />
                  <p className="text-sm">Not Connected</p>
                </div>
              )}
            </div>
          </div>
          {account.status === "connected" && (
            <a
              href={`${config.authUrl}${account.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"
              title="Visit Profile"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>

        {account.status === "connected" && (
          <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm">
            <p className="font-semibold text-gray-700">Username:</p>
            <p className="text-gray-600 truncate">{account.username}</p>
            <p className="font-semibold text-gray-700 mt-2">Connection Type:</p>
            <p
              className={`font-medium ${
                account.connectionType === "oauth"
                  ? "text-green-700"
                  : "text-amber-700"
              }`}
            >
              {account.connectionType === "oauth"
                ? "Secure (OAuth)"
                : "Manual (Password)"}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        {account.status === "disconnected" ? (
          <div className="space-y-2">
            <button
              onClick={() => onConnectOAuth(account.platform)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <LinkIcon className="h-5 w-5 mr-2" />
              Connect securely
            </button>
            <button
              onClick={() => onManualConnect(account.platform)}
              className="w-full text-center text-sm text-gray-600 hover:text-blue-700 py-1"
            >
              or enter credentials manually
            </button>
          </div>
        ) : (
          <button
            onClick={() => onDisconnect(account.id)}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-red-100 hover:text-red-800 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const SocialAccountsDashboard = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  );
  const [connectionFeedback, setConnectionFeedback] = useState<{
    status: "success" | "failure" | null;
    message: string;
  }>({ status: null, message: "" });

  const appId = import.meta.env.VITE_APP_ID;
  const appUrl = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const handleConnectionEvent = (event: CustomEvent) => {
      const { status, message, redirectToComponent } = event.detail;

      // 1. Set the visual feedback (success/failure banner)
      setConnectionFeedback({ status, message });

      // 2. If successful, update the account status (MOCK: only for Facebook/Instagram)
      if (status === "success") {
        const metaPlatforms: Platform[] = ["Instagram", "Facebook"];
        const updatedAccounts = accounts.map((acc) => {
          if (metaPlatforms.includes(acc.platform)) {
            return {
              ...acc,
              status: "connected",
              connectionType: "oauth",
              username: `user_${acc.platform.toLowerCase()}_meta`, // Mock update
            };
          }
          return acc;
        });
        //  setAccounts(updatedAccounts);
        console.log(updatedAccounts);
        alert("Done ");

        // 3. Perform internal component switch if requested (e.g., to a "ManageCalendar" view)
        if (redirectToComponent) {
          // 🚨 ASSUMPTION: You would set a main component state here to switch views
          // Example: setMainView(redirectToComponent);
          console.log(
            `Internal Navigation requested: Switch to ${redirectToComponent} component.`
          );
        }
      }

      // OPTIONAL: Clear the message after a delay
      setTimeout(
        () => setConnectionFeedback({ status: null, message: "" }),
        5000
      );
    };

    // Subscribe when mounting
    const unsubscribe = subscribeToConnectionStatus(handleConnectionEvent);

    // Cleanup when unmounting
    return () => unsubscribe();
  }, [accounts]);

  const handleManualConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  const META_URL =
    `
    ${appUrl}` +
    `?client_id=${appId}` +
    `&redirect_uri=http://localhost:5173/auth/meta/callback` +
    `&scope=pages_manage_posts,instagram_content_publish,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,ads_management,ads_read` +
    `&response_type=token`;

  const handleConnectOAuth = async (platform: Platform) => {
    // In a real app, this would redirect to the OAuth URL

    // Example of what would happen after successful OAuth:
    // const newAccount = { id: Date.now(), platform, username: 'user_from_oauth', connectionType: 'oauth', status: 'connected' };
    // setAccounts([...accounts.filter(a => a.platform !== platform), newAccount]);

    window.location.href = META_URL;
  };

  const onManualSave = ({ platform, username, password }: any) => {
    const newAccount: SocialAccount = {
      id: Date.now(),
      platform,
      username,
      password,
      connectionType: "manual",
      status: "connected",
    };
    setAccounts([
      ...accounts.filter((a) => a.platform !== platform),
      newAccount,
    ]);
  };

  const handleDisconnect = (accountId: number) => {
    const accountToDisconnect = accounts.find((acc) => acc.id === accountId);
    if (
      accountToDisconnect &&
      window.confirm(
        `Are you sure you want to disconnect ${accountToDisconnect.platform}?`
      )
    ) {
      const disconnectedAccount: SocialAccount = {
        ...accountToDisconnect,
        status: "disconnected",
        username: undefined,
        password: undefined,
        connectionType: null,
      };
      setAccounts(
        accounts.map((acc) =>
          acc.id === accountId ? disconnectedAccount : acc
        )
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Social Connections
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your connected social media accounts for auto-posting.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-8 flex items-start">
          <AlertTriangle className="h-8 w-8 text-amber-600 mr-4 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-amber-800">
              Security Recommendation
            </h3>
            <p className="text-sm text-amber-700">
              For your security, we strongly recommend using the "Connect
              securely" (OAuth) option. This method does not require storing
              your password and provides a more secure connection for
              auto-posting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(platformConfig).map((platformStr) => {
            const platform = platformStr as Platform;
            const account = accounts.find(
              (acc) => acc.platform === platform && acc.status === "connected"
            ) || {
              id: Date.now(),
              platform,
              status: "disconnected",
              connectionType: null,
            };
            return (
              <PlatformCard
                key={platform}
                account={account}
                onManualConnect={handleManualConnect}
                onDisconnect={handleDisconnect}
                onConnectOAuth={handleConnectOAuth}
              />
            );
          })}
        </div>
      </div>

      <AccountFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onManualSave}
        platform={selectedPlatform}
      />
    </div>
  );
};

export default SocialAccountsDashboard;
