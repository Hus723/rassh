const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors'); // لإضافة دعم CORS

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware لتمكين CORS
app.use(cors());

// Middleware لتحليل JSON
app.use(express.json());

// Serve static files (like index.html) from the "static" folder
app.use(express.static(path.join(__dirname, 'static')));

// Handle incoming data from ESP32
app.post('/data', (req, res) => {
    const data = req.body;
    if (!data) {
        return res.status(400).send('No data received');
    }

    console.log("Received data:", data);

    // Broadcast data to all connected clients (Dashboard)
    io.emit('data', data);
    res.sendStatus(200);
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html')); // Serve index.html from the "static" folder
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A client connected');

    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
