import { EmailService } from '../src/services/email/email.service';

async function run() {
  console.log('Sending professional OTP test email...');
  try {
    await EmailService.sendOTPEmail('rupeshwillbepro@gmail.com', '739481', 'Rupesh');
    console.log('OTP test email sent successfully!');
  } catch (err: any) {
    console.error('Failed to send OTP email:', err.message);
  }

  console.log('Sending professional Password Reset test email...');
  try {
    await EmailService.sendPasswordResetEmail('rupeshwillbepro@gmail.com', 'test-token-xyz-123', 'Rupesh');
    console.log('Password Reset test email sent successfully!');
  } catch (err: any) {
    console.error('Failed to send Password Reset email:', err.message);
  }
}

run();
