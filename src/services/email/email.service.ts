import { resend, emailConfig } from '../../config/email/resend';

export class EmailService {
  static async sendOTPEmail(email: string, otp: string, firstName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: emailConfig.from,
        to: email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome ${firstName}!</h2>
            <p>Your verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
              ${otp}
            </div>
            <p>This code will expire in ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  static async sendPasswordResetEmail(email: string, resetToken: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    try {
      await resend.emails.send({
        from: emailConfig.from,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hi ${firstName},</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in ${process.env.RESET_TOKEN_EXPIRY_HOURS || '1'} hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
