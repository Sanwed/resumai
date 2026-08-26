import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { Resend } from 'resend';
import { stripe } from '../../server/lib/stripe';
import { MIN_PASSWORD_LENGTH } from '~/constants';
import { del } from '@vercel/blob';

const resend = new Resend(process.env.RESEND_API_KEY);

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: process.env.NUXT_PUBLIC_SITE_URL ? [process.env.NUXT_PUBLIC_SITE_URL] : [],
  advanced: {
    cookiePrefix: 'resumai',
    disableCSRFCheck: false,
    disableOriginCheck: false,
  },
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  },
  session: {
    freshAge: 60 * 60,
  },
  user: {
    additionalFields: {
      customerId: {
        type: 'string',
        required: false,
        input: false,
      },
      tokens: {
        type: 'number',
        required: false,
        input: false,
        defaultValue: 0,
      },
    },
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
      beforeDelete: async (user) => {
        const filesToDelete = await prisma.projectFile.findMany({
          where: { userId: user.id },
          select: { url: true },
        });

        await del(filesToDelete.map((el) => el.url));
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
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      void resend.emails.send({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: 'Verification letter',
        text: `Click the link below to verify your email. \n ${url}"`,
      });
    },
  },
  account: {
    accountLinking: {
      allowDifferentEmails: false,
    },
    encryptOAuthTokens: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 30,
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
      requireEmailVerification: true,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      requireEmailVerification: true,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      requireEmailVerification: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const customer = await stripe.customers.create({
              email: user.email,
              name: user.name,
              metadata: {
                user_id: user.id,
              },
            });

            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                customerId: customer.id,
              },
            });
          } catch (e) {
            console.error('[databaseHooks.user.create.after] Failed to create Stripe customer', e);
          }
        },
      },
    },
  },
});

export { auth, resend, prisma };
