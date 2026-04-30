import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id:            string;
      emailVerified: string | null;
    } & DefaultSession['user'];
  }
}
