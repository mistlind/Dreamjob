import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Get all subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Create a new subject
app.post('/api/subjects', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Subject name is required' });
    }

    const subject = await prisma.subject.create({
      data: { name: name.trim() },
    });

    // Broadcast new subject to all connected clients
    io.emit('subject:created', subject);
    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Subject already exists' });
    }
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Get answers for a subject with pagination
app.get('/api/subjects/:subjectId/answers', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { cursor, limit = 50 } = req.query;

    const answers = await prisma.answer.findMany({
      where: { subjectId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        subject: {
          select: { name: true },
        },
      },
    });

    res.json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

// Create a new answer
app.post('/api/answers', async (req, res) => {
  try {
    const { content, author, subjectId } = req.body;

    if (!content?.trim() || !author?.trim() || !subjectId) {
      return res.status(400).json({ error: 'Content, author, and subjectId are required' });
    }

    const answer = await prisma.answer.create({
      data: {
        content: content.trim(),
        author: author.trim(),
        subjectId,
      },
      include: {
        subject: {
          select: { name: true },
        },
      },
    });

    // Broadcast new answer to all clients in the subject room
    io.to(`subject:${subjectId}`).emit('answer:created', answer);

    // Also broadcast to clients viewing all subjects
    io.to('subject:all').emit('answer:created', answer);

    res.status(201).json(answer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a subject room to receive real-time updates
  socket.on('subject:join', (subjectId) => {
    // Leave all previous subject rooms
    socket.rooms.forEach((room) => {
      if (room.startsWith('subject:')) {
        socket.leave(room);
      }
    });

    // Join the new subject room
    const room = subjectId ? `subject:${subjectId}` : 'subject:all';
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
