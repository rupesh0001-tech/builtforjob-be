import prisma from '../config/db.config';
import { resend, emailConfig } from '../config/email.config';

async function main() {
  const targetEmail = "utkarshp034@gmail.com";
  console.log(`Starting upgrade process for: ${targetEmail}`);

  // 1. Find user in the database
  const user = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (!user) {
    console.error(`Error: User with email ${targetEmail} not found in the database.`);
    process.exit(1);
  }

  console.log(`Found user: ${user.firstName} ${user.lastName} (Current Plan: ${user.plan}, Tokens: ${user.tokens})`);

  // 2. Update user profile to PRO and add/set tokens to 100
  const updatedUser = await prisma.user.update({
    where: { email: targetEmail },
    data: {
      plan: 'PRO',
      tokens: 100 // Set user tokens account to 100 tokens as requested
    }
  });

  console.log(`Database updated successfully! New Plan: ${updatedUser.plan}, New Tokens: ${updatedUser.tokens}`);

  // 3. Send email via Resend
  const subject = "Your Build For Job Account has been upgraded to PRO + 100 Free Tokens!";
  const htmlContent = `
    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        <!-- Header Band -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Build For Job</h1>
        </div>
        <!-- Body Content -->
        <div style="padding: 40px 30px; color: #1e293b;">
          <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #0f172a;">Exclusive Early User Reward! 🎁</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
            Hello ${user.firstName},<br/><br/>
            Thank you for being one of the very first users to join <strong>Build For Job</strong>! We are absolutely thrilled to have you onboard.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
            As a special thank you for your early support, we have upgraded your account to the <strong>PRO Plan</strong> and credited <strong>100 tokens</strong> to your account!
          </p>

          <!-- Reward Details Box -->
          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">Account Tier</span>
              <strong style="font-size: 16px; color: #10b981;">Upgraded to PRO Plan</strong>
            </div>
            <div>
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">Tokens Balance</span>
              <strong style="font-size: 16px; color: #f59e0b;">100 Tokens Granted</strong>
            </div>
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
            You can now use your tokens to generate resumes, build customized landing pages/portfolios, and perform ATS optimization reports without any limits!
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://buildforjob.rupeshhh.in'}" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 700; display: inline-block; box-shadow: 0 4px 8px rgba(79, 70, 229, 0.15);">
              Explore Your Dashboard
            </a>
          </div>

          <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">
            If you have any questions or feedback, feel free to reply to this email or contact us at <a href="mailto:support@rupeshhh.in" style="color: #4f46e5; text-decoration: none;">support@rupeshhh.in</a>.
          </p>
        </div>
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Build For Job. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: emailConfig.from,
      to: targetEmail,
      subject: subject,
      html: htmlContent,
    });
    console.log(`Success: Notification email sent to ${targetEmail}`);
  } catch (error) {
    console.error(`Warning: User upgraded successfully in the DB, but failed to send notification email:`, error);
  }

  process.exit(0);
}

main().catch(err => {
  console.error("Script execution crashed:", err);
  process.exit(1);
});
