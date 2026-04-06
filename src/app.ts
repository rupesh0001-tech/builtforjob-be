import express from 'express';
import cors from 'cors';
import { userRouter } from './routes/user/user.routes';
import { otpRouter } from './routes/otp/otp.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/user', userRouter);
app.use('/verify', otpRouter);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Project-Management Backend API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
