import { cookies } from 'next/headers';
import { getIronSession, type IronSession } from 'iron-session';

export type SessionData = {
  teacherId?: string;
};

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'teacher_schedule_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}
