const WebSocket = require('ws');

const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

const players = new Map(); // key = connection, value = player data

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'player_update') {
                players.set(ws, data.data);
            }
        } catch (e) {
            console.error('Invalid JSON:', e);
        }
    });

    ws.on('close', () => {
        players.delete(ws);
        console.log('Client disconnected');
    });
});

// Broadcast loop (10 times per second)
setInterval(() => {
    const allPlayers = Array.from(players.values());

    const packet = JSON.stringify({
        type: 'players_update',
        players: allPlayers
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(packet);
        }
    });
}, 100);

console.log('Relay server running on port 8080');
console.log("RAW:", message.toString());
