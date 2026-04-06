import type { Request, Response } from 'express';
import { UserService } from '../../services/auth/user.service';
import { OTPService } from '../../services/otp/otp.service';
import { EmailService } from '../../services/email/email.service';
import { HashService } from '../../services/hash/hash.service';
import { JWTService } from '../../services/jwt/jwt.service';
import { OTPType } from '@prisma/client';
import { AuthRequest } from '../../middlewares/auth/jwt.middleware';


// to do : don't write the code in classes and statics 
// use simle funcs like const register = async (req: Request, res: Response) => {


export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await HashService.hashPassword(password);

      // Create new user (initially unverified)
      //todo : create a service to create a unverifed user and add it here 
      const user = await UserService.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Generate OTP
      const otp = await OTPService.createOTP(email, OTPType.REGISTRATION, user.id);

      // Send OTP via Email
      await EmailService.sendOTPEmail(email, otp, firstName);

      return res.status(201).json({
        success: true,
        message: 'OTP sent to your email. Please verify.',
      });
    } catch (error) {
      console.error('Registration Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await UserService.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email first' });
      }

      const isPasswordValid = await HashService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = JWTService.generateToken({ userId: user.id, email: user.email });

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        },
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await UserService.findByEmail(email);
      if (!user) {
        // Return 200 for security to prevent email enumeration
        return res.json({ success: true, message: 'If email exists, a reset link will be sent' });
      }

      // Generate reset token and OTP/Link logic
      // User said "get a reset pass link on email"
      const resetToken = JWTService.generateToken({ userId: user.id, email: user.email }, '1h');
      
      await EmailService.sendPasswordResetEmail(email, resetToken, user.firstName);

      return res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
      console.error('Forgot Password Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      return res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        }
      });
    } catch (error) {
      console.error('Profile Fetch Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
