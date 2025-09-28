import React, { useState, useEffect, useRef } from "react";
import { Send, Users, MessageSquare, Search } from "lucide-react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { api } from "../../../../utils/api/Employees/api";

const socket = io("http://localhost:5001", {
  transports: ["websocket"],
  withCredentials: true,
});

// --- TYPE DEFINITIONS ---
interface User {
  uid: string;
  name: string;
  role: string;
}

interface TeamMember extends User {
  lastMessage: string;
  timestamp: Date;
}

interface Message {
  id: number;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
  type: "group" | "individual";
  lastMessage?: string;
  timestamp?: Date;
}

type MockMessages = Record<string, Message[]>;

// --- MOCK DATA (for demonstration) ---
const MOCK_CURRENT_USER: User = {
  uid: "bd_raj_patel",
  name: "Raj Patel",
  role: "Business Developer",
};

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    uid: "tc_sunita_sharma",
    name: "Sunita Sharma",
    role: "Telecaller",
    lastMessage: "Got it, Raj!",
    timestamp: new Date(Date.now() - 9 * 60000),
  },
  {
    uid: "tc_amit_kumar",
    name: "Amit Kumar",
    role: "Telecaller",
    lastMessage: "Will do.",
    timestamp: new Date(Date.now() - 8 * 60000),
  },
  {
    uid: "tc_priya_singh",
    name: "Priya Singh",
    role: "Telecaller",
    lastMessage: "Can you check my latest report?",
    timestamp: new Date(Date.now() - 20 * 60000),
  },
];

const MOCK_MESSAGES: MockMessages = {
  group_bd_raj_patel: [
    {
      id: 1,
      text: "Hi Team, please remember to update your lead statuses by EOD. Thanks!",
      senderId: "bd_raj_patel",
      senderName: "Raj Patel",
      timestamp: new Date(Date.now() - 10 * 60000),
    },
    {
      id: 2,
      text: "Got it, Raj!",
      senderId: "tc_sunita_sharma",
      senderName: "Sunita Sharma",
      timestamp: new Date(Date.now() - 9 * 60000),
    },
    {
      id: 3,
      text: "Will do.",
      senderId: "tc_amit_kumar",
      senderName: "Amit Kumar",
      timestamp: new Date(Date.now() - 8 * 60000),
    },
  ],
  bd_raj_patel_tc_sunita_sharma: [
    {
      id: 1,
      text: "Hey Sunita, how are the follow-ups for the new campaign going?",
      senderId: "bd_raj_patel",
      senderName: "Raj Patel",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: 2,
      text: "Hi Raj, going well! I have three promising leads I'll be calling back this afternoon.",
      senderId: "tc_sunita_sharma",
      senderName: "Sunita Sharma",
      timestamp: new Date(Date.now() - 4 * 60000),
    },
    {
      id: 3,
      text: "Excellent, keep me posted!",
      senderId: "bd_raj_patel",
      senderName: "Raj Patel",
      timestamp: new Date(Date.now() - 3 * 60000),
    },
  ],
  bd_raj_patel_tc_amit_kumar: [
    {
      id: 1,
      text: "Amit, do you have the report for last week?",
      senderId: "bd_raj_patel",
      senderName: "Raj Patel",
      timestamp: new Date(Date.now() - 2 * 60000),
    },
  ],
  bd_raj_patel_tc_priya_singh: [], // No messages yet
};

// --- HELPER COMPONENTS ---

const UserAvatar = ({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) => {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div
      className={`rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold flex-shrink-0 ${sizeClasses[size]}`}
    >
      {initial}
    </div>
  );
};

// --- CHAT COMPONENTS ---

const ChatListItem = ({
  chat,
  isSelected,
  onClick,
}: {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const formatTimestamp = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 flex items-center rounded-lg transition-colors duration-200 ${
        isSelected ? "bg-indigo-100" : "hover:bg-gray-100"
      }`}
    >
      {chat.type === "group" ? (
        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          <Users size={20} />
        </div>
      ) : (
        <UserAvatar name={chat.name} />
      )}
      <div className="ml-3 flex-grow overflow-hidden">
        <p className="font-semibold text-sm text-gray-800 truncate">
          {chat.name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {chat.lastMessage || "No messages yet"}
        </p>
      </div>
      <span className="text-xs text-gray-400 self-start flex-shrink-0">
        {formatTimestamp(chat.timestamp)}
      </span>
    </button>
  );
};

const ChatList = ({
  chats, // We only need the list of chats now
  selectedChat,
  onSelectChat,
}: {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}) => {

  // 1. Filter the incoming chats array into two separate lists
  const groupChats = chats.filter(chat => chat.type === 'group');
  const individualChats = chats.filter(chat => chat.type === 'individual');

  // 2. Sort each list individually by the most recent message
  const sortedGroupChats = [...groupChats].sort(
    (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  );
  const sortedIndividualChats = [...individualChats].sort(
    (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  );

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col h-full rounded-l-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Conversations</h2>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-2 space-y-1">
        {/* Render the Group Chats section */}
        {sortedGroupChats.length > 0 && (
          <div>
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Groups
            </h3>
            {sortedGroupChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChat?.id === chat.id}
                onClick={() => onSelectChat(chat)}
              />
            ))}
          </div>
        )}

        {/* Render the Individual Chats (Team Members) section */}
        {sortedIndividualChats.length > 0 && (
          <div className="mt-2">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Team Members
            </h3>
            {sortedIndividualChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChat?.id === chat.id}
                onClick={() => onSelectChat(chat)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({
  message,
  isCurrentUser,
}: {
  message: Message;
  isCurrentUser: boolean;
}) => {
  return (
    <div
      className={`flex items-end mb-4 gap-2 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUser && <UserAvatar name={message.senderName} size="sm" />}
      <div
        className={`px-4 py-3 rounded-2xl max-w-xs lg:max-w-md shadow-sm ${
          isCurrentUser
            ? "bg-indigo-500 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none"
        }`}
      >
        {!isCurrentUser && (
          <p className="text-xs font-bold text-indigo-600 mb-1">
            {message.senderName}
          </p>
        )}
        <p className="text-sm">{message.text}</p>
        <p className="text-xs text-right mt-2 opacity-70">
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Sending..."}
        </p>
      </div>
      {isCurrentUser && <UserAvatar name={message.senderName} size="sm" />}
    </div>
  );
};

const ChatWindow = ({
  currentUser,
  selectedChat,
}: {
  currentUser: User | null; // currentUser can be null initially
  selectedChat: Chat | null;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sentMessage, setsentMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add a loading state

  // Get Redux state for API calls
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // --- 1. FETCH MESSAGE HISTORY ---
  // This effect runs whenever the user selects a different chat.
  useEffect(() => {
    const fetchMessages = async () => {
      // Don't fetch if no chat is selected or we don't have a token
      if (selectedChat?.id && accessToken) {
        try {
          const fetchedMessages = await api.ChattingSystem.getMessages.get(
            accessToken,
            dispatch,
            selectedChat.id
          );
          setMessages(fetchedMessages || []);
        } catch (error) {
          console.error("Failed to fetch messages:", error);
          setMessages([]); // Clear messages on error
        }
        finally {
          setIsLoading(false); // Stop loading
        }
      } else {
        setMessages([]); // Clear messages if no chat is selected
        setIsLoading(false);
      }
    };
    setMessages([])
    fetchMessages();
    setIsLoading(true);
  }, [selectedChat, accessToken, dispatch, sentMessage]);


  // --- 2. LISTEN FOR NEW MESSAGES ---
  // This effect sets up the real-time listener.
  useEffect(() => {
    const handleNewMessage = (incomingMessage: any) => {
      // The backend sends the full message object after saving it.
      // We need to format it slightly for our frontend Message type.
      const formattedMessage: Message = {
        id: incomingMessage.id,
        text: incomingMessage.content,
        senderId: incomingMessage.sender_id,
        senderName: incomingMessage.senderName || '...', // You might need to add senderName to the socket broadcast
        timestamp: new Date(incomingMessage.created_at),
      };

      // Only add the message if it belongs to the currently open chat
      if (incomingMessage.chat_id === selectedChat?.id) {
        setMessages((prevMessages) => [...prevMessages, formattedMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    // IMPORTANT: Clean up the listener when the component unmounts
    // or when the selectedChat changes, to avoid duplicate listeners.
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedChat]); // Re-subscribe if the selected chat changes


  // --- 3. SEND A NEW MESSAGE ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat?.id || !currentUser?.uid || !accessToken) return;
    const data = newMessage;

    // The data payload for our /storeMessage endpoint
    const messagePayload = {
      chatId: selectedChat.id,
      content: newMessage,
      senderId: currentUser.uid, // The backend should verify this against the token
    };

    try {
      // Clear the input field immediately for a snappy UI
      setNewMessage("");
      
      // Call the API to store the message. The backend will handle the socket broadcast.
      await api.ChattingSystem.storeMessage.post(
        accessToken,
        dispatch,
        messagePayload
      );
      setsentMessage(data)

    } catch (error) {
      console.error("Failed to send message:", error);
      // Optional: Show an error to the user
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 h-full rounded-r-lg">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-700">Select a conversation</h3>
          <p className="mt-1 text-sm text-gray-500">Choose a person or group from the left to start chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col bg-gray-50 h-full rounded-r-lg">
      <div className="p-3 border-b border-gray-200 flex items-center bg-white shadow-sm rounded-tr-lg">
        <h3 className="text-lg font-semibold text-gray-800 ml-2">{selectedChat.name}</h3>
      </div>
      <div className="flex-grow p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isCurrentUser={msg.senderId === currentUser?.uid}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-gray-200 rounded-br-lg">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="ml-4 p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200 disabled:bg-gray-300"
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};


// --- MAIN DASHBOARD COMPONENT ---
// This is the component you will import and render in your main dashboard area.
export const ChatDashboard = () => {
  const [currentUser, setcurrentUser] = useState<any | null>(MOCK_CURRENT_USER);
  const [teamMembers, setteamMembers] = useState(MOCK_TEAM_MEMBERS);
  const [chart, setChat] = useState([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const role = useSelector((state: RootState) => state.auth.role);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCharts = async () => {
      try {

        // check it later
        const response = await api.ChattingSystem.myChats.get(
          accessToken,
          dispatch
        );

        console.log(response);

        const data = {
          uid: response.userId,
          name: response.name,
          role: role,
        };
        console.log(data);

        setcurrentUser(data);

        const conversationsResponse =
          await api.ChattingSystem.myConversations.get(accessToken, dispatch);

       console.log("conversations: ", conversationsResponse);

       setChat(conversationsResponse)

       setteamMembers(conversationsResponse);
        socket.emit("joinChats", {
          userId: response.userId,
          chatIds: response.chatIds,
        });

        // Handle the fetched chart data
      } catch (error) {
        console.error(error);
      }
    };

    if (accessToken) {
      fetchCharts();
    }
  }, []);

  return (
    <div className=" bg-gray-50 font-sans antialiased text-gray-900">
      {/* Header to match your dashboard design */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Chat</h1>

      {/* Main Chat Container */}
      <div
        className="w-full flex overflow-hidden shadow-lg rounded-lg border border-gray-200"
        style={{ height: "calc(100vh - 200px)" }} // Adjust height to fit your layout
      >
        <ChatList
          chats={chart}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />
        <ChatWindow currentUser={currentUser} selectedChat={selectedChat} />
      </div>
    </div>
  );
};

// You can still use this default export for standalone testing if needed
export default function App() {
  return <ChatDashboard />;
}
