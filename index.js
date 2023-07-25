// backend.js

const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});
const users = {}; // Store connected users in the room.

io.on("connection", (socket) => {
  // Prints when a new socket connection is formed
  console.log(`Socket Connected`, socket.id);

  // Initiates when a user tries to get into an existing room or tries to create a new room from the lobby
  socket.on("room:join", async (data) => {
    const { email, room } = data;
    console.log("new user joined ", room);

    if (users[room]) {
      if (!users[room].some((id) => id === socket.id))
        users[room].push(socket.id);
    } else {
      users[room] = [socket.id]; // Initialize the users[room] array with the new socket ID
    }
    // Enter the new user into the room
    await socket.join(room);

    // Pushes the new user into the room from the lobby
    io.to(socket.id).emit("room:join", {
      ...data,
    });

    // Now the user is in the lobby - the server emits get:users to the new user sending its own socketid and
    // all the users in the room
    const allUsersInTheRoom = users[room].filter((id) => id !== socket.id);
    // Delay the emission of "get:users" event by 100ms using setTimeout
    setTimeout(() => {
      socket.emit("get:users", { users: allUsersInTheRoom, id: socket.id });
    }, 100);
  });




  // Handle disconnect event
  socket.on("disconnect:me", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Find the room where the user was present and remove their socket ID
    Object.keys(users).forEach((room) => {
      users[room] = users[room].filter((id) => id !== socket.id);
    });
    socket.disconnect(true);
  });
});
