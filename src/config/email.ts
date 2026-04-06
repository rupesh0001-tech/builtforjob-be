import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const emailConfig = {
  from: 'onboarding@resend.dev', // Change this to your verified domain
  replyTo: 'support@yourapp.com',
};
