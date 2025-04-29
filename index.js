const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');
const marked = require('marked');
const bodyParser = require('body-parser');
const ip = require('ip');

let trimNewlines;
import('trim-newlines').then((module) => {
  trimNewlines = module.default;
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/chat-websocket" }); // WebSocket server on the same port

app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: true }));

marked.setOptions({
  renderer: new marked.Renderer(),
  sanitize: true,
  mangle: false
});

// WebSocket handling
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    // Broadcast message to all connected clients
    wss.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) {
        client.send(data);
      }
    });
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates/home.html'));
});

app.get('/markdown', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates/markdown.html'));
});

app.get('/chat-ui', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates/chat.html'));
});

// ... keep your /trimnewlines and /checkip routes here (as you already have) ...

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
