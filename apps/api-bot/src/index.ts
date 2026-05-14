import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Client, GatewayIntentBits, Events, EmbedBuilder, Partials } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import session from 'express-session';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Trust proxy is required for secure cookies on Vercel/proxies
app.set('trust proxy', 1);

// --- Discord Strategy Setup ---
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  callbackURL: process.env.DISCORD_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/discord/callback`,
  scope: ['identify', 'guilds'],
  state: false
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await prisma.profile.upsert({
      where: { id: profile.id },
      update: { username: profile.username },
      create: {
        id: profile.id,
        username: profile.username,
        role: 'STUDENT'
      }
    });
    return done(null, user);
  } catch (err) {
    console.error('DATABASE_ERROR during upsert:', err);
    return done(err, null);
  }
}));

const FRONTEND_URL = process.env.FRONTEND_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');

console.log('--- API CONFIGURATION ---');
console.log('FRONTEND_URL:', FRONTEND_URL);
console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);

// --- Middleware ---
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Middleware to ensure Discord Bot is connected (crucial for Vercel serverless)
app.use(async (req, res, next) => {
  if (!client.isReady() && process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== "YOUR_DISCORD_BOT_TOKEN") {
    try {
      console.log('[Bot] Not ready, attempting login in middleware...');
      await client.login(process.env.DISCORD_TOKEN);
      console.log('[Bot] Login successful in middleware');
    } catch (err: any) {
      console.error('[Bot] Login failed in middleware:', err.message);
    }
  }
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.VERCEL === '1', sameSite: 'lax' }
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Auth Routes ---
app.get('/api/auth/discord', (req, res, next) => {
  console.log('Starting Discord Auth...');
  next();
}, passport.authenticate('discord'));

app.get('/api/auth/discord/callback', (req, res, next) => {
  console.log('Discord Callback received...');
  next();
}, passport.authenticate('discord', {
  failureRedirect: `${FRONTEND_URL}/login`
}), (req, res) => {
  console.log('Discord Auth Successful for user:', (req.user as any)?.username);
  const token = jwt.sign({ id: (req.user as any).id }, JWT_SECRET, { expiresIn: '7d' });
  const redirectUrl = `${FRONTEND_URL}/login?token=${token}`;
  console.log('Redirecting to:', redirectUrl);
  res.redirect(redirectUrl);
});

app.get('/api/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const profile = await prisma.profile.findUnique({ where: { id: decoded.id } });
    
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    let ftData = null;
    if (profile.minecraftName) {
      try {
        const ftResponse = await axios.get(`https://francetiers.fr/search_playerV2.php?pseudo=${profile.minecraftName}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 5000
        });
        ftData = ftResponse.data;
      } catch (ftError: any) {
        console.error('Failed to fetch FT data during /api/me:', ftError.message);
      }
    }

    res.json({ ...profile, ftData });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/profile/setup', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { minecraftName } = req.body;
  
  if (!authHeader || !minecraftName) return res.status(400).json({ error: 'Missing data' });
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const updated = await prisma.profile.update({
      where: { id: decoded.id },
      data: { minecraftName }
    });
    
    res.json(updated);
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/sessions/request', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { mode, type } = req.body; 
  
  if (!authHeader || !mode) return res.status(400).json({ error: 'Missing data' });
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const session = await prisma.session.create({
      data: {
        type: type || 'Train',
        mode,
        status: 'PENDING',
        studentId: decoded.id
      }
    });
    
    res.json(session);
  } catch (err) {
    console.error('Session request error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/lookup/:pseudo', async (req, res) => {
  const { pseudo } = req.params;
  try {
    const response = await axios.get(`https://francetiers.fr/search_playerV2.php?pseudo=${pseudo}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Erreur serveur lors de la récupération des données');
  }
});

// --- Discord Bot Setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bot: client.isReady(),
    hasToken: !!process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== "YOUR_DISCORD_BOT_TOKEN",
    tokenPreview: process.env.DISCORD_TOKEN ? `${process.env.DISCORD_TOKEN.substring(0, 5)}...` : 'none'
  });
});

app.get('/api/stats/:trainerId', async (req, res) => {
  const { trainerId } = req.params;
  const stats = await prisma.session.findMany({
    where: { trainerId },
    include: { student: true }
  });
  res.json(stats);
});

app.get('/api/users/students', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const students = await prisma.profile.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, username: true, minecraftName: true }
    });
    res.json(students);
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/sessions/create', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { studentIds, mode, type, date } = req.body;
  
  if (!authHeader || !studentIds || !mode) return res.status(400).json({ error: 'Missing data' });
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const sessions = await Promise.all(studentIds.map(async (sId: string) => {
      console.log(`[Session] Creating session for student: ${sId}, mode: ${mode}, trainer: ${decoded.id}`);
      const session = await prisma.session.create({
        data: {
          type: type || 'Train',
          mode,
          status: 'COMPLETED',
          trainerId: decoded.id,
          studentId: sId,
          date: date ? new Date(date) : new Date()
        }
      });

      // Notify the student via Discord DM
      try {
        console.log(`[Notification] Attempting to notify student: ${sId}`);
        const trainer = await prisma.profile.findUnique({ where: { id: decoded.id } });
        const student = await prisma.profile.findUnique({ where: { id: sId } });
        
        console.log(`[Notification] Trainer found: ${trainer?.username}, Student found: ${student?.username}`);

        if (student) {
          // If client is not ready, wait a bit
          if (!client.isReady()) {
            console.log('[Notification] Bot not ready, waiting...');
            await new Promise((resolve) => {
              const timeout = setTimeout(resolve, 5000); // Max 5s wait
              client.once(Events.ClientReady, () => {
                clearTimeout(timeout);
                resolve(null);
              });
              // If it's already logging in, just wait for ready. 
              // If not logged in at all, start() will handle it but we still wait.
            });
          }

          if (client.isReady()) {
            console.log(`[Notification] Bot is ready, fetching user: ${student.id}`);
            try {
              const discordUser = await client.users.fetch(student.id);
              if (discordUser) {
                console.log(`[Notification] Discord user fetched: ${discordUser.tag}, sending DM...`);
                const embed = new EmbedBuilder()
                  .setTitle('🎯 Nouvelle session d\'entraînement !')
                  .setDescription(`Un trainer vient de valider une session avec toi.`)
                  .addFields(
                    { name: 'Trainer', value: trainer?.username || 'Inconnu', inline: true },
                    { name: 'Mode', value: mode, inline: true },
                    { name: 'Type', value: type || 'Train', inline: true }
                  )
                  .setColor('#00ff00')
                  .setTimestamp();
                
                await discordUser.send({ embeds: [embed] });
                console.log(`[Notification] DM sent successfully to ${discordUser.tag}`);
              } else {
                console.error(`[Notification] Could not fetch discord user for ID: ${student.id}`);
              }
            } catch (fetchError: any) {
              console.error(`[Notification] Error fetching discord user ${student.id}:`, fetchError.message);
            }
          } else {
            console.warn(`[Notification] Bot still not ready after waiting.`);
          }
        }
      } catch (notifyError) {
        console.error('[Notification] Failed to process notification:', notifyError);
      }

      return session;
    }));
    
    res.json(sessions);
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/wiki', async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { published: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wiki resources' });
  }
});

app.get('/api/wiki/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resource = await prisma.resource.findUnique({ where: { id } });
    res.json(resource);
  } catch (err) {
    res.status(404).json({ error: 'Resource not found' });
  }
});

app.post('/api/wiki/save', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { id, title, content, published } = req.body;

  if (!authHeader || !title) return res.status(400).json({ error: 'Missing data' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await prisma.profile.findUnique({ where: { id: decoded.id } });
    if (!user || (user.role !== 'OWNER' && user.role !== 'TRAINER')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (id) {
      const updated = await prisma.resource.update({
        where: { id },
        data: { title, content, published: published ?? true }
      });
      res.json(updated);
    } else {
      const created = await prisma.resource.create({
        data: {
          title,
          content,
          authorId: user.id,
          published: published ?? true
        }
      });
      res.json(created);
    }
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await prisma.profile.findUnique({ where: { id: decoded.id } });
    if (!user || user.role !== 'OWNER') return res.status(403).json({ error: 'Forbidden' });

    const [userCount, trainerCount, sessionCount, recentApplications] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { role: 'TRAINER' } }),
      prisma.session.count(),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      totalUsers: userCount,
      totalTrainers: trainerCount,
      totalSessions: sessionCount,
      recentApplications,
      systemStatus: 'ONLINE'
    });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Démarrage
const start = async () => {
  try {
    if (!process.env.VERCEL) {
      app.listen(port, () => {
        console.log(`API listening on port ${port}`);
      });
    }

    if (process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== "YOUR_DISCORD_BOT_TOKEN") {
      try {
        await client.login(process.env.DISCORD_TOKEN);
      } catch (botError) {
        console.error('Impossible de connecter le bot Discord:', botError.message);
      }
    }
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
  }
};

start();

export default app;
