const io = require('socket.io')(3000, {
    cors:{
        origin: "*",
    },
});
const formatMessage = require('./js/utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./js/utils/users');

const LivechatBot = 'E-Scholarship Bot';


io.on('connection', socket => {
//livechat 
    socket.on("joinRoom", ({ username, room, role }) => {
        const user = userJoin(socket.id, username, room, role);
        console.log(socket.id, username, room, role);
        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(LivechatBot, 'Welcome to the Livechat!'));

        // Broadcast when a user connects
        if (user.role == "insitution") {
            socket.broadcast.to(user.room).emit('message', formatMessage(LivechatBot, `${user.username} (Room Master) has joined the chat`));
        } else if (user.role == "student") {
            socket.broadcast.to(user.room).emit('message', formatMessage(LivechatBot, `${user.username} has joined the chat`));
        }

        // Send users and room info
        io.to(user.room).emit('roomUsers', { room: user.room, users: getRoomUsers(user.room), role: user.role });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(LivechatBot, `${user.username} has left the chat`)
            );

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

//other
})