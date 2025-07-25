const WebSocket = require("ws");

const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });

const rooms = {};

server.on("connection", (ws) => {
  let currentRoom = null;

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      currentRoom = data.room;
      rooms[currentRoom] = rooms[currentRoom] || [];
      rooms[currentRoom].push(ws);

      if (rooms[currentRoom].length === 2) {
        rooms[currentRoom].forEach((client, idx) =>
          client.send(JSON.stringify({ type: "start", player: idx + 1 }))
        );
      }
    }

    if (data.type === "move" && rooms[currentRoom]) {
      rooms[currentRoom].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "move", move: data.move }));
        }
      });
    }
  });

  ws.on("close", () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter((client) => client !== ws);
    }
  });
});
