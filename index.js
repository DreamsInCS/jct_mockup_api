// var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var app = express();

// process.env.PORT is for Heroku
var port = process.env.PORT || 5000;

// App setup
    app.get('/', (req, res) => {
        res.send("Yooooo!");
    });
    app.listen(80); //port 80 need to run as root
console.log("app listening on %d ", 80);

// Server setup
var server = http.createServer(app);
//     server.listen(port);
console.log("http server listening on %d", port);

// // WebSocket behavior
// var wss = new WebSocketServer({server: server, path: '/perform'});
//     wss.on("connection", function (ws) {
//         console.info("websocket connection open");
        
//         ws.on("message", function (data, flags) {
//             console.log("websocket received a message");
            
//             // Parse JSON to send original audio data back
//             ws.send(JSON.parse(data));
//     });

//     ws.on("close", function () {
//         console.log("websocket connection close");
//     });
// });
// console.log("websocket server created");

const WebSocket = require('ws');
const url = require('url');
const wss1 = new WebSocket.Server({ noServer: true });
const wss2 = new WebSocket.Server({ noServer: true });
let audioData = null;
let twoSecondsPassed = false;

// Performer websocket
wss1.on('connection', function connection(ws) {
    console.info("performer websocket connection open");

    ws.on("message", function (data, flags) {
        console.log("performer websocket received a message");

        
        // Parse JSON to send original audio data back
        audioData = JSON.parse(data);
        ws.send(audioData);
        twoSecondsPassed = true;
    });

    ws.on("close", function () {
        console.log("performer websocket connection close");
    });
});

// Listener websocket
wss2.on('connection', function connection(ws) {
    console.info("listener websocket connection open");

    ws.on("message", function (data, flags) {
    //     console.log("listener websocket received a message");

        if (twoSecondsPassed) {
            twoSecondsPassed = false;
            ws.send(audioData);
            console.log("audioData passed!");
        } else {
            console.log("still waiting...");
        }
    });

    ws.on("close", function () {
        console.log("listener websocket connection close");
    });
});

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/perform') {
    wss1.handleUpgrade(request, socket, head, function done(ws) {
      wss1.emit('connection', ws, request);
    });
  } else if (pathname === '/listen') {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(port);