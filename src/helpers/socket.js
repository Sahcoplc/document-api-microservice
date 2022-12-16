import { Server } from "socket.io";

const io = new Server();

const Socket = {
    emit: function (event, data) {
        io.sockets.emit(event, data);
    }
};

io.on("connection", function (socket) {
    console.log(`A user connected ${socket.id}`);

    const room = socket.handshake.query.channelName;
    socket.join(room);
});

export { Socket, io };
