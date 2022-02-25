const WebSocketServer = require("ws").Server;
const uuid = require("uuid").v4;
const wss = new WebSocketServer({ port: 3001 });

const users = {};

function decodePacket(data) {
  return JSON.parse(data);
}

function encodePacket(data) {
  return JSON.stringify(data);
}

function sendPacketTo(conn, to, data) {
  if (!(to in users)) {
    conn.send(encodePacket({
      type: "error",
      data: "User is not online!"
    }));
    return;
  }


  const userConnection = users[to];

  userConnection.send(encodePacket(data));

  return true;
}

wss.on("connection", function (socket) {
  const userId = uuid();
  users[userId] = socket;

  sendPacketTo(socket, userId, {
    type: "userList", data: {
     userList: Object.keys(users).filter(id => id != userId)
    }
  });


  socket.on("message", function (message) {
    const packet = decodePacket(message);
    switch (packet.type) {
      case "offer":
        const { from, offer, to } = packet.data;

        sendPacketTo(socket, to, {
          type: "offer", data: {
            offer,
            from,
          }
        })

        return;

      case "answer":

        const { from: answerFrom, to: answerTo, answer } = packet.data;
        sendPacketTo(socket, answerTo, {
          type: "answer",
          data: {
            answer,
            from: answerFrom
          }
        })
        return;

      case "candidate":
        const { to: candidateTo, candidate } = packet.data;
        sendPacketTo(socket, candidateTo, {
          type: "candidate",
          data: {
            candidate,
          }
        })

      default:
        console.log('Unknown packet type: ', packet.type)
        return;
    }
  });

  socket.on("close", function () {
    delete users[userId];
    sendPacketTo(socket, userId, {
      type: "userList", data: {
       userList: Object.keys(users).filter(id => id != userId)
      }
    });
  });

  socket.send(
    JSON.stringify({
      type: "setUserId",
      data: userId,
    })
  );
});
