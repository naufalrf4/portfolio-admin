import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from '@/lib/db/schema';
import { isEmailAllowed } from '@/lib/auth-security';

interface AuthDbCallbacks {
  getUserByEmail(email: string): Promise<{ id: string; role: string } | null>;
  upsertUser(data: {
    email: string;
    name?: string | null;
    image?: string | null;
    role: 'ADMIN' | 'USER';
  }): Promise<void>;
}

const ROLE_REVALIDATION_INTERVAL_MS = 60 * 60 * 1000;

function readProfileImage(profile: unknown, fallbackImage?: string | null) {
  if (profile && typeof profile === 'object') {
    if ('picture' in profile && typeof profile.picture === 'string') {
      return profile.picture;
    }

    if ('image' in profile && typeof profile.image === 'string') {
      return profile.image;
    }
  }

  return fallbackImage ?? null;
}

export function isDemoAuthEnabled(): boolean {
  return process.env.DEMO_AUTH_ENABLED === 'true' && Boolean(process.env.DEMO_AUTH_PASSWORD);
}

function createAuthConfig(authCallbacks: AuthDbCallbacks) {
  const providers: NonNullable<NextAuthConfig['providers']> = [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ];

  if (isDemoAuthEnabled()) {
    providers.push(
      Credentials({
        id: 'demo',
        name: 'Demo',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          const email = (typeof credentials?.email === 'string' ? credentials.email : '')
            .trim()
            .toLowerCase();
          const password = typeof credentials?.password === 'string' ? credentials.password : '';
          if (!email || !password || password !== process.env.DEMO_AUTH_PASSWORD) return null;
          if (!isEmailAllowed(email)) return null;

          await authCallbacks.upsertUser({ email, name: 'Demo User', role: 'ADMIN' });
          const dbUser = await authCallbacks.getUserByEmail(email);
          return { id: dbUser?.id ?? `demo:${email}`, email, name: 'Demo User' };
        },
      })
    );
  }

  return NextAuth({
    providers,
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/signin',
    },
    callbacks: {
      async signIn({ account, profile, user }) {
        if (account?.provider === 'google') {
          const isEmailVerified = Boolean(profile?.email_verified);
          if (!isEmailVerified) return false;

          const email = profile?.email || user?.email;
          if (!email) return false;

          const role = isEmailAllowed(email) ? 'ADMIN' : 'USER';

          await authCallbacks.upsertUser({
            email,
            name: profile?.name || user?.name,
            image: readProfileImage(profile, user?.image),
            role,
          });

          return true;
        }
        return true;
      },
      async redirect({ url, baseUrl }) {
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }

        try {
          const redirectUrl = new URL(url);
          return redirectUrl.origin === baseUrl ? url : baseUrl;
        } catch {
          return baseUrl;
        }
      },
      async jwt({ token, user, trigger }) {
        if (user) {
          token.userId = user.id;
          token.role = user.role === 'ADMIN' || user.role === 'USER' ? user.role : 'USER';
          token.lastValidated = Date.now();
        }

        const lastValidated = token.lastValidated as number | undefined;
        const isStale =
          !lastValidated || Date.now() - lastValidated > ROLE_REVALIDATION_INTERVAL_MS;

        if (trigger === 'update' || trigger === 'signIn' || isStale) {
          if (token.email) {
            const dbUser = await authCallbacks.getUserByEmail(token.email);
            if (dbUser) {
              token.userId = dbUser.id;
              token.role = isEmailAllowed(token.email) ? 'ADMIN' : 'USER';
            }
            token.lastValidated = Date.now();
          }
        }

        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          if (typeof token.userId === 'string') {
            session.user.id = token.userId;
          }

          session.user.role = token.role === 'ADMIN' || token.role === 'USER' ? token.role : 'USER';
        }
        return session;
      },
    },
  });
}

function isRecoverableSessionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorWithCause: Error & { cause?: unknown } = error;
  const causeMessage =
    errorWithCause.cause instanceof Error
      ? errorWithCause.cause.message
      : typeof errorWithCause.cause === 'string'
        ? errorWithCause.cause
        : '';

  return [error.name, error.message, causeMessage].some((value) =>
    ['JWTSessionError', 'JWEInvalid', 'Invalid Compact JWE'].some((needle) =>
      value.includes(needle)
    )
  );
}

const authCallbacks: AuthDbCallbacks = {
  async getUserByEmail(email: string) {
    const result = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  },
  async upsertUser({ email, name, image, role }) {
    const now = new Date().toISOString();
    await db
      .insert(users)
      .values({ id: createId(), email, name, image, role, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: users.email,
        set: { name, image, role, updatedAt: now },
      });
  },
};

export const { auth, signIn, signOut, handlers } = createAuthConfig(authCallbacks);

export async function safeAuth() {
  try {
    return await auth();
  } catch (error) {
    if (isRecoverableSessionError(error)) {
      return null;
    }

    throw error;
  }
}
