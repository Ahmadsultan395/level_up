import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { comparePassword } from '@/lib/password';
import { loginSchema } from '@/validations/auth';

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error('Enter a valid email and password.');
        }

        await connectDB();
        const user = await User.findOne({ email: parsed.data.email }).select('+password');

        if (!user) {
          throw new Error('No account found with this email.');
        }

        if (user.status === 'inactive') {
          throw new Error('This account has been deactivated. Contact support.');
        }

        const isValid = await comparePassword(parsed.data.password, user.password);
        if (!isValid) {
          throw new Error('Incorrect password.');
        }

        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.avatarUrl = (user as { avatarUrl?: string }).avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'customer' | 'admin' | 'superadmin';
        session.user.avatarUrl = token.avatarUrl as string | undefined;
      }
      return session;
    },
  },
};
