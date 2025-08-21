// 1. Require necessary modules. 'http' is a built-in Node.js module.
const httpServer = require('http').createServer();
const { Server } = require('socket.io');

// 2. Define the port the server will run on.
const PORT = process.env.PORT || 3000;

// 3. Create the Socket.IO server and attach it to the HTTP server.
//    We also configure CORS here to allow our frontend (running on a different origin) to connect.
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow connections from any origin. For production, you might want to restrict this.
    methods: ["GET", "POST"]
  }
});

const users = {};

// 4. Keep your existing logic for handling connections. This part is good!
io.on('connection', socket => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });

  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${users[socket.id]}`);
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });
});

// 5. Start the HTTP server and have it listen on the specified port.
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});