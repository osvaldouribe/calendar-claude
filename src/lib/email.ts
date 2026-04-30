import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM ?? 'Cosmic Calendar <noreply@cosmiccalendar.app>';
const APP_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;

  if (!resend) {
    console.log(`[DEV] Email verification link for ${email}: ${url}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Confirm your Cosmic Calendar account',
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #F7F5F0;">
        <p style="text-align: center; font-size: 28px; color: #A8A29E; margin: 0 0 24px;">◎</p>
        <h1 style="font-size: 22px; font-weight: 300; color: #1C1917; text-align: center; margin: 0 0 8px;">
          Confirm your account
        </h1>
        <p style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #A8A29E;
                  text-align: center; font-family: system-ui, sans-serif; margin: 0 0 32px;">
          Cosmic Calendar
        </p>
        <p style="font-size: 14px; color: #6B6560; font-family: system-ui, sans-serif;
                  line-height: 1.6; margin: 0 0 28px; text-align: center;">
          Click the button below to verify your email and complete your account setup.
          This link expires in 24 hours.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${url}"
             style="display: inline-block; background: #1C1917; color: #fff;
                    font-family: system-ui, sans-serif; font-size: 13px; letter-spacing: 0.05em;
                    text-decoration: none; padding: 14px 32px; border-radius: 8px;">
            Verify email
          </a>
        </div>
        <p style="font-size: 11px; color: #A8A29E; font-family: system-ui, sans-serif;
                  text-align: center; line-height: 1.6;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
