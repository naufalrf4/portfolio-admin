import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: 'ADMIN' | 'USER';
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: 'ADMIN' | 'USER';
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userId?: string;
    role?: 'ADMIN' | 'USER';
    lastValidated?: number;
  }
}

export {};
