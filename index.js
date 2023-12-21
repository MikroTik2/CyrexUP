const express = require("express");
const http = require("http");
const ping = require("net-ping");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const SteamStrategy = require("passport-steam").Strategy;
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect.js");
dbConnect();

const { notFound, errorHandler } = require("./middleware/errorHandler.js");
const { initializeWebSocket } = require("./socket/socketHandler.js");

const userRoute = require("./routes/userRoute.js");
const supportRoute = require("./routes/supportRoute.js");

const app = express();
const PORT = process.env.PORT || process.env.PORT_NODE;
const session = ping.createSession();
const server = http.createServer(app);
const wss = initializeWebSocket(server);

let onlineUsers = 0;

function broadcastOnlineUserCount() {
     wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
               client.send(JSON.stringify({ onlineUsers }));
          };
     });
};

function sendPing() {
     
     const target = "127.0.0.1";

     session.pingHost(target, (error, target, sent, rcvd) => {

          if (error) {
               console.error(target + ': ' + error.toString());
          } else {
               const ms = rcvd - sent;
               console.log('==> ' + target + ': Alive (ms=' + ms + ')');

               wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                         client.send(JSON.stringify({ onlineUsers, pingResult: { target, ms } }));
                    };
               });

          };
          
          setTimeout(sendPing, 1000);

     });
};

sendPing();

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

app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use((req, res, next) => {
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader(
         'Access-Control-Allow-Headers',
         'Origin, X-Requested-With, Content-Type, Accept, Authorization'
     ); 
     res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PATCH, PUT');
     next();
});

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:4000/api/user/auth/return/',
    realm: 'http://localhost:4000/',
    apiKey: process.env.STEAM_API_KEY,
}, (identifier, profile, done) => {
        return done(null, profile);
    }
));

app.get("/", (req, res) => {
     res.render("home.ejs");
});

app.use("/api/user", userRoute);
app.use("/api/support", supportRoute);

app.use(notFound);
app.use(errorHandler);

server.listen(PORT, (error) => {
     if (error) {
          console.log(error);
          throw error;
     } else {
          console.log(`==> Listening on port ${PORT}. Open up http://localhost:${PORT} in your browser`);
     };
});