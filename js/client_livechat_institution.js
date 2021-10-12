const socket = io('http://localhost:3000');
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users'); //used by institution livechat
const roomName = document.getElementById('room-name'); //used by student livechat

const role = "insitution";
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

//livechat 
    //send new user and room data to server
    socket.emit('joinRoom', { username, room, role });

    // receive room and users data
    socket.on('roomUsers', ({ room, users }) => {
        outputRoomName(room);
        outputUsers(users);
    });
  
    // Message from server
    socket.on('message', message => {
        console.log(message);
        outputMessage(message);
  
        // Scroll down
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Message submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        // Get message text
        let msg = e.target.elements.msg.value;
        msg = msg.trim();
        if (!msg) {
            return false;
        }
    
        // Emit message to server
        socket.emit('chatMessage', msg);
    
        // Clear input
        e.target.elements.msg.value = '';
        e.target.elements.msg.focus();
    });

    // Output message to DOM
    function outputMessage(message) {
        const div = document.createElement('div');
        div.classList.add('message');
        const p = document.createElement('p');
        p.classList.add('meta');
        p.innerText = message.username;
        p.innerHTML += ` <span> ${message.time}</span>`;
        div.appendChild(p);
        const para = document.createElement('p');
        para.classList.add('text');
        para.innerText = message.text;
        div.appendChild(para);
        document.querySelector('.chat-messages').appendChild(div);
    }
  
    // Add room name to DOM
    function outputRoomName(room) {
        roomName.innerText = room;
    }
  
    // Add users to DOM
    function outputUsers(users) {
        userList.innerHTML = '';
        users.forEach((user) => {
            const li = document.createElement('li');
            li.innerText = user.username;
            userList.appendChild(li);
        });
    }

    //Prompt the user before leave chat room
    document.getElementById('leave-btn').addEventListener('click', () => {
        const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
        if (leaveRoom) {
            window.location = '../institution_page/institution_JoinChatRoom.html';
        } 
    });
