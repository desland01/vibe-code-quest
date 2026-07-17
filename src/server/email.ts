import 'server-only';

type OtpEmail = {
  to: string;
  code: string;
};

export async function sendOtpEmail({ to, code }: OtpEmail): Promise<void> {
  const consoleTransport = process.env.OTP_EMAIL_TRANSPORT === 'console';

  if (consoleTransport) {
    console.info(`[otp-email local-only] to=${to} code=${code}`);
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const [local, domain = ''] = to.split('@');
    const redacted = `${local.slice(0, 1)}***@${domain}`;
    console.info(`[otp-email] to=${redacted} code=[redacted]`);
    return;
  }

  throw new Error('No email transport configured');
}
