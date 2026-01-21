import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/user-auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Find or create OAuth account
          let oauthAccount = await prisma.oAuthAccount.findUnique({
            where: {
              provider_providerId: {
                provider: 'google',
                providerId: profile.id,
              },
            },
            include: { user: true },
          });

          if (oauthAccount) {
            // Update access token
            oauthAccount = await prisma.oAuthAccount.update({
              where: { id: oauthAccount.id },
              data: {
                accessToken: _accessToken,
                refreshToken: _refreshToken,
              },
              include: { user: true },
            });
            return done(null, oauthAccount.user);
          }

          // Create new user and OAuth account
          const displayName = profile.displayName || profile.emails?.[0]?.value || 'User';
          const email = profile.emails?.[0]?.value;
          const avatarUrl = profile.photos?.[0]?.value;

          const user = await prisma.user.create({
            data: {
              displayName,
              email,
              avatarUrl,
              oauthAccounts: {
                create: {
                  provider: 'google',
                  providerId: profile.id,
                  accessToken: _accessToken,
                  refreshToken: _refreshToken,
                },
              },
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

// Configure Facebook OAuth
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/user-auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails', 'photos'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Find or create OAuth account
          let oauthAccount = await prisma.oAuthAccount.findUnique({
            where: {
              provider_providerId: {
                provider: 'facebook',
                providerId: profile.id,
              },
            },
            include: { user: true },
          });

          if (oauthAccount) {
            // Update access token
            oauthAccount = await prisma.oAuthAccount.update({
              where: { id: oauthAccount.id },
              data: {
                accessToken: _accessToken,
                refreshToken: _refreshToken,
              },
              include: { user: true },
            });
            return done(null, oauthAccount.user);
          }

          // Create new user and OAuth account
          const displayName = profile.displayName || profile.emails?.[0]?.value || 'User';
          const email = profile.emails?.[0]?.value;
          const avatarUrl = profile.photos?.[0]?.value;

          const user = await prisma.user.create({
            data: {
              displayName,
              email,
              avatarUrl,
              oauthAccounts: {
                create: {
                  provider: 'facebook',
                  providerId: profile.id,
                  accessToken: _accessToken,
                  refreshToken: _refreshToken,
                },
              },
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

// Configure Discord OAuth
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/user-auth/discord/callback`,
        scope: ['identify', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Find or create OAuth account
          let oauthAccount = await prisma.oAuthAccount.findUnique({
            where: {
              provider_providerId: {
                provider: 'discord',
                providerId: profile.id,
              },
            },
            include: { user: true },
          });

          if (oauthAccount) {
            // Update access token
            oauthAccount = await prisma.oAuthAccount.update({
              where: { id: oauthAccount.id },
              data: {
                accessToken: _accessToken,
                refreshToken: _refreshToken,
              },
              include: { user: true },
            });
            return done(null, oauthAccount.user);
          }

          // Create new user and OAuth account
          const displayName = profile.username || profile.email || 'User';
          const email = profile.email;
          const avatarUrl = profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : undefined;

          const user = await prisma.user.create({
            data: {
              displayName,
              email,
              avatarUrl,
              oauthAccounts: {
                create: {
                  provider: 'discord',
                  providerId: profile.id,
                  accessToken: _accessToken,
                  refreshToken: _refreshToken,
                },
              },
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

// Serialize user to session
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
