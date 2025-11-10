// src/lib/socket.ts
import { Server } from "socket.io";
import http from "http";

let io: Server;

// This function will be called ONCE from your main server file to set up Socket.IO
export const initializeSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://dot-speaks.vercel.app"],// Your frontend URL
      credentials: true,
    },
  });
  return io;
};

// This function will be called from ANYWHERE else you need to use the socket server
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};