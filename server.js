import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

const users = new Set();
const waitingUsers = new Set();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('newUser', (peerId) => {
    users.add(peerId);
    console.log(`New user added: ${peerId}`);
  });

  socket.on('findPartner', (peerId) => {
    if (waitingUsers.size > 0) {
      const partner = waitingUsers.values().next().value;
      waitingUsers.delete(partner);
      socket.emit('match', partner);
      io.to(partner).emit('match', peerId);
    } else {
      waitingUsers.add(peerId);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    users.forEach((user) => {
      if (!io.sockets.sockets.get(user)) {
        users.delete(user);
        waitingUsers.delete(user);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});