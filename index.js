var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var port = process.env.PORT || 5000;

var app = express();
    app.get('/', (req, res) => {
        res.send("Yooooo!");
    });
    app.listen(80); //port 80 need to run as root

    console.log("app listening on %d ", 80);

var server = http.createServer(app);
    server.listen(port);

console.log("http server listening on %d", port);

var wss = new WebSocketServer({server: server, path: '/'});
    wss.on("connection", function (ws) {
        console.info("websocket connection open");

        ws.on("message", function (data, flags) {
            console.log("websocket received a message");
            
            // Parse JSON to send original audio data back
            ws.send(JSON.parse(data));
    });

    ws.on("close", function () {
        console.log("websocket connection close");
    });
});
console.log("websocket server created");