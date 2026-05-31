import { Resend } from 'resend';

const apiKey = 're_FxX2XbHu_CwUikwEimpy1a9zQmZRqMCQi';
const resend = new Resend(apiKey);

async function run() {
  console.log('Fetching domains from Resend...');
  try {
    const listResponse = await resend.domains.list();
    console.log('Resend Domains Info:', JSON.stringify(listResponse, null, 2));
  } catch (err: any) {
    console.error('Failed to list domains:', err.message);
  }

  const recipients = ['rupeshwillbepro@gmail.com'];
  const fromEmail = 'otp@rupeshhh.in'; // We can also try support@rupeshhh.in or contact@rupeshhh.in

  console.log(`\nAttempting to send test emails from "${fromEmail}"...`);

  for (const to of recipients) {
    try {
      console.log(`Sending email to: ${to}...`);
      const response = await resend.emails.send({
        from: fromEmail,
        to: to,
        subject: 'Resend Test Email',
        html: '<strong>Resend verification is working!</strong><p>This is a test email.</p>',
      });
      console.log(`Success response for ${to}:`, JSON.stringify(response, null, 2));
    } catch (err: any) {
      console.error(`Failed to send to ${to}:`, err.message, err);
    }
  }
}

run();
