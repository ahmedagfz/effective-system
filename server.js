import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Serve production static assets from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

const players = {};
const PLAYER_COLORS = [
  '#FF3366', // Crimson Neon
  '#00E5FF', // Cyan Neon
  '#FFD700', // Gold
  '#00FF66', // Toxic Green
  '#BF55EC', // Electric Purple
  '#FF8C00', // Neon Orange
  '#FF1493', // Deep Pink
];

let colorIndex = 0;

io.on('connection', (socket) => {
  console.log(`[Player Connected] ${socket.id}`);

  // Assign player data
  players[socket.id] = {
    id: socket.id,
    x: 0,
    y: 2,
    z: 0,
    rotationY: 0,
    color: PLAYER_COLORS[colorIndex % PLAYER_COLORS.length],
    lives: 3,
    health: 100,
    isDowned: false,
  };
  colorIndex++;

  // Send connection success and current player list
  socket.emit('connectionSuccess', {
    message: 'Connected to Street Brawler Server!',
    id: socket.id,
    players: Object.keys(players).length,
  });

  // Send the current list of players to the newly connected player
  socket.emit('currentPlayers', players);

  // Handle player joined event from client
  socket.on('playerJoined', (data) => {
    console.log(`[Player Joined Event] ID: ${socket.id}`, data || {});
    socket.broadcast.emit('newPlayer', players[socket.id]);
  });

  // Handle player movements
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].z = movementData.z;
      players[socket.id].rotationY = movementData.rotationY;

      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        x: movementData.x,
        y: movementData.y,
        z: movementData.z,
        rotationY: movementData.rotationY,
      });
    }
  });

  // Handle player shooting projectiles
  socket.on('playerShoot', (shootData) => {
    socket.broadcast.emit('playerShot', {
      id: socket.id,
      ...shootData,
    });
  });

  // Handle boss attack shooting
  socket.on('bossAttack', (attackData) => {
    socket.broadcast.emit('bossAttacked', attackData);
  });

  // Handle player state changes (lives, health, downed, revived)
  socket.on('playerStateUpdate', (stateData) => {
    if (players[socket.id]) {
      players[socket.id].lives = stateData.lives;
      players[socket.id].health = stateData.health;
      players[socket.id].isDowned = stateData.isDowned;
      socket.broadcast.emit('playerStateChanged', {
        id: socket.id,
        ...stateData,
      });
    }
  });

  // Handle one-click co-op revive & summon trigger
  socket.on('playerRevive', (data) => {
    console.log(`💖 [One-Click Revive] ${socket.id} summoned and revived ${data.targetId}`);
    if (players[data.targetId]) {
      players[data.targetId].lives = 3;
      players[data.targetId].health = 100;
      players[data.targetId].isDowned = false;
    }
    io.emit('playerRevived', {
      reviverId: socket.id,
      targetId: data.targetId,
      spawnPos: data.spawnPos,
    });
  });

  // Handle synchronized boss damage
  socket.on('bossDamage', (damageData) => {
    io.emit('bossDamaged', damageData);
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log(`[Player Disconnected] ${socket.id}`);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Street Brawler Multiplayer Server running on http://localhost:${PORT}`);
});
