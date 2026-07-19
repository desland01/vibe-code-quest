import 'server-only';

import { jwtVerify, SignJWT } from 'jose';

export const SESSION_COOKIE_NAME = 'ct_session';
export const SESSION_MAX_AGE = 400 * 24 * 60 * 60;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE
};

const TOKEN_AUDIENCE = 'code-tutor';
const TOKEN_ISSUER = 'code-tutor';

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is required');
  }

  return new TextEncoder().encode(secret);
}

export function issueSessionToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuer(TOKEN_ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      audience: TOKEN_AUDIENCE,
      issuer: TOKEN_ISSUER
    });

    return typeof payload.sub === 'string' && payload.sub ? { userId: payload.sub } : null;
  } catch {
    return null;
  }
}
