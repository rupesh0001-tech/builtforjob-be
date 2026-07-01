import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth/auth.routes';
import { userRouter } from './routes/user/user.routes';
import { otpRouter } from './routes/otp/otp.routes';
import { atsRouter } from './routes/ats/ats.routes';
import versionsRouter from './routes/versions/versions.routes';
import resumeRouter from './routes/resume/resume.routes';
import coverLetterRouter from './routes/cover-letter/cover-letter.routes';
import { aiRouter } from './routes/ai/ai.routes';
import { errorMiddleware } from './middlewares/error/error.middleware';

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "https://build-for-job-fe.vercel.app", 
  'http://buildforjob.rupeshhh.in',
  'https://buildforjob.rupeshhh.in',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  if (process.env.FRONTEND_URL.endsWith('/')) {
    allowedOrigins.push(process.env.FRONTEND_URL.slice(0, -1));
  }
}

// Middlewares
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/verify', otpRouter);
app.use('/ats', atsRouter);
app.use('/versions', versionsRouter);
app.use('/resumes', resumeRouter);
app.use('/cover-letters', coverLetterRouter);
app.use('/ai', aiRouter);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Project-Management Backend API is running' });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
