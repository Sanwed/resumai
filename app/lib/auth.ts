import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Resend } from 'resend';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const resend = new Resend(process.env.RESEND_API_KEY);

const prisma = new PrismaClient({ adapter });
const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  advanced: {
    cookiePrefix: 'resumai',
  },
  logger: {
    level: 'debug',
  },
  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        void resend.emails.send({
          from: 'onboarding@resend.dev',
          to: user.email,
          subject: 'Account deletion',
          text: `Click the link to permanently delete your account. After this action the changes can not be undone and you can lose all data on this account - ${url}`,
        });
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        void resend.emails.send({
          from: 'onboarding@resend.dev',
          to: user.email,
          subject: 'Approve email change',
          text: `Click the link to approve the change to ${newEmail}: ${url}`,
        });
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void resend.emails.send({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: 'Verification letter',
        text: `Click <a href="${url}">here</a> to verify your email.`,
      });
    },
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void resend.emails.send({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: 'Reset your password',
        html: `Click <a href="${url}">here</a> to reset your password.`,
      });
    },
  },
  rateLimit: {
    enabled: true,
    customRules: {
      '/request-password-reset': {
        window: 10,
        max: 3,
      },
      '/sign-up/email': {
        window: 10,
        max: 3,
      },
      '/sign-in/email': {
        window: 10,
        max: 3,
      },
      '/reset-password': {
        window: 10,
        max: 3,
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    },
  },
});

export { auth, resend, prisma };
