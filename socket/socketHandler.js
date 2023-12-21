const WebSocket = require("ws");

const wss = new WebSocket.Server({ noServer: true });

let onlineUsers = 0;

const broadcastOnlineUserCount = async () => {
    try {

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ onlineUsers }));
            };
        });

    } catch (error) {
        throw new Error(error);
    };
};

const broadcastNotification = async (notification) => {
    try {

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'notification', data: notification }));
            };
        });

    } catch (error) {
        throw new Error(error);
    };
};

const initializeWebSocket = (server) => {
    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });

    wss.on('connection', (ws) => {
        onlineUsers++;
        broadcastOnlineUserCount();

        console.log(`New user connected. Online users: ${onlineUsers}`);

        ws.on("close", () => {
            onlineUsers--;
            broadcastOnlineUserCount();

            console.log(`User disconnected. Online users: ${onlineUsers}`);
        });
    });

    return wss;
};

const broadcastSupportUpdate = (supportTicket) => {
    try {

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'supportUpdate', data: supportTicket }));
            };
        });
         
    } catch (error) {
        throw new Error(error);
    };
};

const broadcastChatMessage = async (message) => {
    try {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'chatMessage', data: message }));
            }
        });
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = { initializeWebSocket, broadcastNotification, broadcastSupportUpdate, broadcastChatMessage };
