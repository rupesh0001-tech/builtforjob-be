import { resend, emailConfig } from '../../config/email.config';

export async function sendOTPEmail(email: string, otp: string, firstName: string): Promise<void> {
  try {
    await resend.emails.send({
      from: emailConfig.from,
      to: email,
      subject: 'Verify Your Build For Job Account',
      html: `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            <!-- Decorative Header Band -->
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Build For Job</h1>
            </div>
            <!-- Body Content -->
            <div style="padding: 40px 30px; color: #1e293b;">
              <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #0f172a;">Verify Your Account</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Hello ${firstName},<br/><br/>
                Thank you for choosing <strong>Build For Job</strong>. Please use the verification code below to complete your authentication process:
              </p>
              
              <!-- Code Box -->
              <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; display: block; margin-bottom: 8px;">Verification Code</span>
                <div style="font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: 6px; font-family: 'Courier New', Courier, monospace;">${otp}</div>
              </div>
              
              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 24px 0;">
                This code is valid for <strong>${process.env.OTP_EXPIRY_MINUTES || '10'} minutes</strong>. For security reasons, please do not share this code with anyone.
              </p>
              
              <p style="font-size: 13px; line-height: 1.5; color: #94a3b8; margin: 0;">
                If you did not request this verification, you can safely ignore this email.
              </p>
            </div>
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Build For Job. All rights reserved.</p>
              <div style="font-size: 12px; color: #94a3b8;">
                <a href="${process.env.FRONTEND_URL || 'https://rupeshhh.in'}" style="color: #4f46e5; text-decoration: none;">Website</a> &bull; 
                <a href="mailto:support@rupeshhh.in" style="color: #4f46e5; text-decoration: none;">Support</a>
              </div>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string, firstName: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  try {
    await resend.emails.send({
      from: emailConfig.from,
      to: email,
      subject: 'Reset Your Build For Job Password',
      html: `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            <!-- Decorative Header Band -->
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Build For Job</h1>
            </div>
            <!-- Body Content -->
            <div style="padding: 40px 30px; color: #1e293b;">
              <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #0f172a;">Reset Your Password</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Hello ${firstName},<br/><br/>
                We received a request to reset your password for your <strong>Build For Job</strong> account. Click the button below to set a new password:
              </p>
              
              <!-- Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 700; display: inline-block; box-shadow: 0 4px 8px rgba(79, 70, 229, 0.15);">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 24px 0;">
                This password reset link is valid for <strong>${process.env.RESET_TOKEN_EXPIRY_HOURS || '1'} hour</strong>.
              </p>
              
              <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px; word-break: break-all;">
                <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">Or copy and paste this link:</span>
                <a href="${resetUrl}" style="font-size: 12px; color: #4f46e5; text-decoration: underline;">${resetUrl}</a>
              </div>
              
              <p style="font-size: 13px; line-height: 1.5; color: #94a3b8; margin: 0;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Build For Job. All rights reserved.</p>
              <div style="font-size: 12px; color: #94a3b8;">
                <a href="${process.env.FRONTEND_URL || 'https://rupeshhh.in'}" style="color: #4f46e5; text-decoration: none;">Website</a> &bull; 
                <a href="mailto:support@rupeshhh.in" style="color: #4f46e5; text-decoration: none;">Support</a>
              </div>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
