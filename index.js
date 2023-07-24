// backend.js

const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});
const connectedUsers = new Map(); // Store connected users in the room.

io.on("connection", (socket) => {
  //prints when new socket connection is formed
  console.log(`Socket Connected`, socket.id);


  //initates when a user tries to get into a existing room or try to create a new room from lobby
  socket.on("room:join", (data) => {
    const { email, room } = data;
    connectedUsers.set(socket.id, email); // Store the user's socket ID and email in the map.
    console.log("new user  joined "  , room);
  //sends the details of the all the user to all the users when a new user is joined the room 
    io.to(room).emit("user:joined", {
      email,
      id: socket.id,
      users: Array.from(connectedUsers.values()),
    });
    //pushes the new user into the room from the lobby 
    io.to(socket.id).emit("room:join", {
      ...data,
      // users: Array.from(connectedUsers.values()),
    });
    io.to(socket.id).emit("mycredentials", {
      ...data,
    });
    socket.join(room);

});











//disconnect the sockett
    socket.on("disconnect", () => {
      const email = connectedUsers.get(socket.id);
      if (email) {
        connectedUsers.delete(socket.id);
        const users = Array.from(connectedUsers.values());
        io.emit("user:left", { email, users });
      }
    });
  
});
