import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/auth/user.service';
import { OTPService } from '../../services/otp/otp.service';
import { EmailService } from '../../services/email/email.service';
import { HashService } from '../../services/hash/hash.service';
import { JWTService } from '../../services/jwt/jwt.service';
import { OTPType } from '@prisma/client';
import type { AuthRequest } from '../../middlewares/auth/jwt.middleware';
import { uploadToImageKit } from '../../services/imagekit/imagekit.service';


// to do : don't write the code in classes and statics 
// use simle funcs like const register = async (req: Request, res: Response) => {


export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await UserService.findByEmail(email);
      
      let user;
      if (existingUser) {
        if (existingUser.isVerified) {
          return res.status(400).json({ success: false, message: 'Email already exists and is verified' });
        }
        
        // Update existing unverified user with new details
        const hashedPassword = await HashService.hashPassword(password);
        user = await UserService.updateUser(existingUser.id, {
          password: hashedPassword,
          firstName,
          lastName,
        });
      } else {
        // Hash password
        const hashedPassword = await HashService.hashPassword(password);

        // Create new user (initially unverified)
        user = await UserService.createUser({
          email,
          password: hashedPassword,
          firstName,
          lastName,
        });
      }

      // Generate OTP
      const otp = await OTPService.createOTP(email, OTPType.REGISTRATION, user.id);

      // Send OTP via Email
      await EmailService.sendOTPEmail(email, otp, firstName);

      return res.status(201).json({
        success: true,
        message: 'OTP sent to your email. Please verify.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const updatedUser = await UserService.updateUser(userId, req.body);

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
  static async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Upload to ImageKit
      const result = await uploadToImageKit(file.buffer, `avatar-${userId}-${Date.now()}`, "/avatars");

      // Update user profile with the new avatar URL
      const updatedUser = await UserService.updateUser(userId, { avatarUrl: result.url });

      return res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
}
