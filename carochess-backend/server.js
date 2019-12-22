const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8123 });
const clients = [];

wss.on("connection", ws => {
  console.log("Player has just connected");

  if (wss.clients.size > 2) {
    console.log("Room is full");
    ws.terminate();
    return;
  }
  const index = clients.push(ws) - 1;

  wss.clients.forEach(client => {
    const turn = ws !== client;
    client.send(JSON.stringify({ type: "start", data: turn }));
  });

  //Server send message
  ws.on("message", message => {
    const msg = JSON.parse(message);

    if (msg.type === "click") {
      const obj = {
        row: msg.data.row,
        col: msg.data.col,
        value: msg.data.value,
        turn: msg.data.turn
      };
      wss.clients.forEach(client => {
        if (ws !== client)
          client.send(JSON.stringify({ type: msg.type, data: obj }));
      });
    }
    if (msg.type === "restart") {
      wss.clients.forEach(client => {
        client.send(JSON.stringify({ type: msg.type }));
      });
    }
    if (msg.type === "undo") {
      wss.clients.forEach(client => {
        if (ws !== client) client.send(JSON.stringify({ type: msg.type }));
      });
    }
    if (msg.type === "redo") {
      wss.clients.forEach(client => {
        if (ws !== client) client.send(JSON.stringify({ type: msg.type }));
      });
    }
    if (msg.type === "wincheck") {
      wss.clients.forEach(client => {
        client.send(JSON.stringify({ type: msg.type }));
      });
    }
  });
  ws.on("close", () => {
    console.log("A player has just disconnected");
    clients.splice(index, 1);
  });
});
