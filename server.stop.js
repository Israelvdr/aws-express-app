console.log("Terminating target process.");

require('dotenv').config();
const port = process.env.PORT || 3000;

const io = require('socket.io-client');
const socketClient = io.connect(`http://localhost:${port}`);

socketClient.on('connect', () => {
    console.log("Connected to target.");
    socketClient.emit('npmStop');
    setTimeout(() => {
        console.log("Terminating self.");
        socketClient.disconnect();
        // process.exit(0);
    }, 1000);
});