const express = require('express');
const app = express();
http = require('http');
const cors = require('cors');
const { Server } = require('socket.io'); // Add this
const leaveRoom = require('./utils/leave-room');
const mongoConnect = require('./database');
const { createChatMessage, getChatMessage } = require('./services/chat_message.service');
app.use(cors()); // Add cors middleware

mongoConnect();
const server = http.createServer(app); // Add this

// Add this
// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const CHAT_BOT = 'ChatBot';
let chatRoom = ''; 
let allUsers = [];

io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on('join_room', async (data) => {
    const { username, room } = data;
    socket.join(room); 

    let __createdtime__ = Date.now();
    socket.to(room).emit('receive_message', {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      __createdtime__,
    });

    socket.emit('receive_message', {
        message: `Welcome ${username}`,
        username: CHAT_BOT,
        __createdtime__,
      });

      chatRoom = room;
      allUsers.push({ id: socket.id, username, room });
      const chatRoomUsers = allUsers.filter((user) => user.room === room);
      socket.to(room).emit('chatroom_users', chatRoomUsers);
      socket.emit('chatroom_users', chatRoomUsers);

      const last100MessagesData = await getChatMessage(room);
      const last100Messages = last100MessagesData.map((data)=>{
        return {
          message: data.message,
          username: data.username,
          room: data.room,
          __createdtime__: data.__createdtime__,
        };
      })
        socket.emit('last_100_messages', last100Messages);
  });

  socket.on('send_message', async(data) => {
    const { message, username, room } = data;
    io.in(room).emit('receive_message', data);
    await createChatMessage(message, username, room);
  });

  socket.on('leave_room', (data) => {
    const { username, room } = data;
    socket.leave(room);
    const __createdtime__ = Date.now();
    // Remove user from memory
    allUsers = leaveRoom(socket.id, allUsers);
    socket.to(room).emit('chatroom_users', allUsers);
    socket.to(room).emit('receive_message', {
      username: CHAT_BOT,
      message: `${username} has left the chat`,
      __createdtime__,
    });
    console.log(`${username} has left the chat`);
  });

  socket.on('disconnect', () => {
    const __createdtime__ = Date.now();
    console.log('User disconnected from the chat');
    const user = allUsers.find((user) => user.id == socket.id);
    if (user?.username) {
      allUsers = leaveRoom(socket.id, allUsers);
      socket.to(chatRoom).emit('chatroom_users', allUsers);
      socket.to(chatRoom).emit('receive_message', {
        message: `${user.username} has disconnected from the chat.`,
        username: CHAT_BOT,
        __createdtime__,
      });
    }
  });
});

server.listen(4000, () => 'Server is running on port 4000');