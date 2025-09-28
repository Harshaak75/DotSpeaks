import express from "express";
import { authenticate_user } from "../middleware/authMiddleware";
import prisma from "../lib/prismaClient";
import { getIO } from "../lib/socket";

const app = express();

app.get("/myChats", authenticate_user, async (req, res) => {
  try {
    const userId = req.user?.user_id;

    const chats = await prisma.chat_members.findMany({
      where: { user_id: userId },
      select: { 
        chat_id: true ,
        user:{
            select:{
                profile:{
                    select:{
                        name: true
                    }
                }
            }
        }
    },
    });

    res.json({
      userId: userId, // single value
      name: chats[0].user?.profile?.name, // single value
      chatIds: chats.map((c) => c.chat_id), // array
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve chats" });
  }
});

app.post("/storeMessage", authenticate_user, async (req, res) => {
  try {
    // 1. Get content from body, but senderId securely from the auth middleware
    const { chatId, content } = req.body;
    const senderId = req.user?.user_id;

    if (!senderId) {
        return res.status(401).json({ error: "Authentication error." });
    }

    // 2. Check if the authenticated user belongs to this chat
    const isMember = await prisma.chat_members.findFirst({
      where: {
        chat_id: chatId,
        user_id: senderId, // Check against the secure senderId
      },
    });

    if (!isMember) {
      return res
        .status(403)
        .json({ error: "You are not allowed to send messages in this chat" });
    }

    // 3. Create the message in the database
    const newMessage = await prisma.chat_messages.create({
      data: {
        chat_id: chatId,
        sender_id: senderId,
        content: content,
      },
      // 4. Include the sender's profile in the response
      include: {
        sender: {
          select: {
            profile: {
              select: { name: true }
            }
          }
        }
      }
    });

    // 5. Format the message for the socket broadcast
    const messageForSocket = {
        id: newMessage.id,
        content: newMessage.content,
        sender_id: newMessage.sender_id,
        senderName: newMessage.sender.profile?.name || 'Unknown User',
        created_at: newMessage.created_at,
        chat_id: newMessage.chat_id
    };

    const io = getIO();
    // 6. Emit the formatted message that includes the sender's name
    io.to(`chat_${chatId}`).emit("newMessage", messageForSocket);

    res.json(messageForSocket); // Also return the full object in the HTTP response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// In your routes/charttingRoutes.ts file

// This new route gets all chats with their members and last message
app.get("/myConversations", authenticate_user, async (req, res) => {
  try {
    const userId = req.user?.user_id;

    // 1. Find all chats the user is a member of
    const userChats = await prisma.chats.findMany({
      where: {
        members: {
          some: {
            user_id: userId,
          },
        },
      },
      // 2. Include related data we need
      include: {
        // Include all members of the chat
        members: {
          include: {
            // And include the user profile for each member to get their name
            user: {
              select: {
                id: true,
                profile: {
                  select: { name: true },
                },
                role: true
              },
            },
          },
        },
        // Include the very last message sent in the chat
        messages: {
          orderBy: {
            created_at: "desc",
          },
          take: 1, // Only get the most recent one
        },
      },
    });

    // 3. Format the data into the structure your frontend wants
    const formattedChats = userChats.map((chat) => {
      // Find the other person in the chat (assuming DMs for now)
      const otherMember = chat.members.find((m) => m.user_id !== userId);
      const lastMessage = chat.messages[0];
      let chatName = chat.title;

      return {
        id: chat.id,
        // Use the other member's name as the chat title
        name: chatName || "Unknown Chat",
        type: chat.type === 'GROUP' ? 'group' : 'individual',
        lastMessage: lastMessage?.content || "No messages yet",
        timestamp: lastMessage?.created_at || chat.updated_at,
        // We can also return the members if needed on the frontend
        members: chat.members.map(m => ({
            uid: m.user.id,
            name: m.user.profile?.name,
            role: m.user.role
        }))
      };
    });

    res.json(formattedChats);

  } catch (error) {
    console.error("Failed to retrieve conversations:", error);
    res.status(500).json({ error: "Failed to retrieve conversations" });
  }
});


// In your routes/charttingRoutes.ts file

app.get("/messages/:chatId", authenticate_user, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.user_id;

    // Verify the user is a member of this chat to prevent unauthorized access
    const isMember = await prisma.chat_members.findFirst({
      where: { chat_id: chatId, user_id: userId },
    });

    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Fetch all messages for the chat, ordered by creation time
    const messages = await prisma.chat_messages.findMany({
      where: { chat_id: chatId },
      orderBy: { created_at: 'asc' },
      include: {
        sender: {
          select: { profile: { select: { name: true } } }
        }
      }
    });
    
    // Format the data for the frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      text: msg.content, // Renaming 'content' to 'text' for the frontend
      senderId: msg.sender_id,
      senderName: msg.sender.profile?.name || 'Unknown User',
      timestamp: msg.created_at,
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error("Failed to retrieve messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

export default app;
