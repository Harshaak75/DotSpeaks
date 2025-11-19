import { useState, useEffect, useRef } from "react";
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
      className={`rounded-full text-white flex items-center justify-center font-bold flex-shrink-0 ${sizeClasses[size]}`}
      style={{ backgroundColor: '#0000CC' }}
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
        isSelected ? "hover:bg-gray-100" : "hover:bg-gray-100"
      }`}
      style={isSelected ? { backgroundColor: '#E6E6FF' } : {}}
    >
      {chat.type === "group" ? (
        <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#0000CC' }}>
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
  chats,
  selectedChat,
  onSelectChat,
}: {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}) => {

  const groupChats = chats.filter(chat => chat.type === 'group');
  const individualChats = chats.filter(chat => chat.type === 'individual');

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
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-2 space-y-1">
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
            ? "text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none"
        }`}
        style={isCurrentUser ? { backgroundColor: '#0000CC' } : {}}
      >
        {!isCurrentUser && (
          <p className="text-xs font-bold mb-1" style={{ color: '#0000CC' }}>
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
  currentUser: User | null;
  selectedChat: Chat | null;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sentMessage, setsentMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
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
          setMessages([]);
        }
        finally {
          setIsLoading(false);
        }
      } else {
        setMessages([]);
        setIsLoading(false);
      }
    };
    setMessages([])
    fetchMessages();
    setIsLoading(true);
  }, [selectedChat, accessToken, dispatch, sentMessage]);

  useEffect(() => {
    const handleNewMessage = (incomingMessage: any) => {
      const formattedMessage: Message = {
        id: incomingMessage.id,
        text: incomingMessage.content,
        senderId: incomingMessage.sender_id,
        senderName: incomingMessage.senderName || '...',
        timestamp: new Date(incomingMessage.created_at),
      };

      if (incomingMessage.chat_id === selectedChat?.id) {
        setMessages((prevMessages) => [...prevMessages, formattedMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat?.id || !currentUser?.uid || !accessToken) return;
    const data = newMessage;

    const messagePayload = {
      chatId: selectedChat.id,
      content: newMessage,
      senderId: currentUser.uid,
    };

    try {
      setNewMessage("");
      
      await api.ChattingSystem.storeMessage.post(
        accessToken,
        dispatch,
        messagePayload
      );
      setsentMessage(data)

    } catch (error) {
      console.error("Failed to send message:", error);
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
            className="flex-grow px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
          />
          <button
            type="submit"
            className="ml-4 p-3 text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-2 transition-colors duration-200 disabled:bg-gray-300"
            style={{ backgroundColor: '#0000CC', '--tw-ring-color': '#0000CC' } as React.CSSProperties}
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
export const ChatDashboard = () => {
  const [currentUser, setcurrentUser] = useState<any | null>(MOCK_CURRENT_USER);
  const [chart, setChat] = useState([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const role = useSelector((state: RootState) => state.auth.role);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCharts = async () => {
      try {

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

        socket.emit("joinChats", {
          userId: response.userId,
          chatIds: response.chatIds,
        });

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
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#0000CC' }}>Chat</h1>

      <div
        className="w-full flex overflow-hidden shadow-lg rounded-lg border-2"
        style={{ height: "calc(100vh - 200px)", borderColor: '#0000CC' }}
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

export default function App() {
  return <ChatDashboard />;
}
