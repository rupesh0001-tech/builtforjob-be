import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { authRouter } from './routes/auth/auth.routes';
import { userRouter } from './routes/user/user.routes';
import { otpRouter } from './routes/otp/otp.routes';
import { atsRouter } from './routes/ats/ats.routes';
import versionsRouter from './routes/versions/versions.routes';
import resumeRouter from './routes/resume/resume.routes';
import coverLetterRouter from './routes/cover-letter/cover-letter.routes';
import { aiRouter } from './routes/ai/ai.routes';
import { companiesRouter } from './routes/companies/companies.routes';
import portfolioRouter from './routes/portfolio/portfolio.routes';
import { adminRouter } from './routes/admin/admin.routes';
import { errorMiddleware } from './middlewares/error/error.middleware';
import prisma from './config/db.config';

const app = express();

// HIGH-04: Trust first hop proxy so req.ip is correctly resolved behind reverse proxies
// (Vercel, Render, Railway, nginx etc.)
app.set('trust proxy', 1);

// CRIT-05: Security headers via helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://ik.imagekit.io"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding images from ImageKit
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

// MEDIUM-05: Only allow localhost origins in non-production environments
const productionOrigins = [
  'https://build-for-job-fe.vercel.app',
  'https://buildforjob.rupeshhh.in',
  'http://buildforjob.rupeshhh.in',
];

const allowedOrigins = [...productionOrigins];

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001',
  );
}

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
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
app.use('/companies', companiesRouter);
app.use('/portfolio', portfolioRouter);
app.use('/admin', adminRouter);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'BuildForJob Backend API is running' });
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
