import { Server } from "socket.io";

const io = new Server();

const Socket = {
    emit: function (event, data) {
        io.sockets.emit(event, data);
    },
    to: function (room, event, data) {
        io.sockets.to(room).emit(event, data);
    },
    broadcast: function (room1, room2, event, data) {
        io.sockets.to(room1).to(room2).emit(event, data);
    },
    send: function (rooms, event, data) {
        io.sockets.to(rooms).emit(event, data);
    }
};

io.on("connection", (socket) => {
    // eslint-disable-next-line no-console
    console.log(`A user connected ${socket.id}`);

    const room = socket.handshake.query.channelName;
    socket.join(room);
});

export { Socket, io };
