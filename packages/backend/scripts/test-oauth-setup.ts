import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing OAuth setup...\n');

  // Check if tables exist
  console.log('1. Checking database tables...');

  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'oauth_accounts', 'edit_suggestions', 'session')
    ORDER BY tablename
  `;

  console.log('   Found tables:', tables.map(t => t.tablename).join(', '));

  if (tables.length < 4) {
    console.log('   ❌ Missing tables! Expected: users, oauth_accounts, edit_suggestions, session');
    return;
  }
  console.log('   ✅ All required tables exist\n');

  // Check User model
  console.log('2. Testing User model...');
  const userCount = await prisma.user.count();
  console.log(`   Current user count: ${userCount}`);
  console.log('   ✅ User model working\n');

  // Check OAuthAccount model
  console.log('3. Testing OAuthAccount model...');
  const oauthCount = await prisma.oAuthAccount.count();
  console.log(`   Current OAuth account count: ${oauthCount}`);
  console.log('   ✅ OAuthAccount model working\n');

  // Check EditSuggestion model
  console.log('4. Testing EditSuggestion model...');
  const suggestionCount = await prisma.editSuggestion.count();
  console.log(`   Current suggestion count: ${suggestionCount}`);
  console.log('   ✅ EditSuggestion model working\n');

  // Check environment variables
  console.log('5. Checking environment variables...');
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'SESSION_SECRET'];
  const optionalEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
  ];

  let allRequired = true;
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(`   ❌ Missing required: ${envVar}`);
      allRequired = false;
    } else {
      console.log(`   ✅ ${envVar} is set`);
    }
  }

  if (!allRequired) {
    console.log('   ❌ Some required environment variables are missing!\n');
  } else {
    console.log('   ✅ All required environment variables are set\n');
  }

  console.log('6. Checking OAuth provider configurations...');
  let hasAnyProvider = false;

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('   ✅ Google OAuth configured');
    hasAnyProvider = true;
  } else {
    console.log('   ⚠️  Google OAuth not configured (optional)');
  }

  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    console.log('   ✅ Facebook OAuth configured');
    hasAnyProvider = true;
  } else {
    console.log('   ⚠️  Facebook OAuth not configured (optional)');
  }

  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    console.log('   ✅ Discord OAuth configured');
    hasAnyProvider = true;
  } else {
    console.log('   ⚠️  Discord OAuth not configured (optional)');
  }

  if (!hasAnyProvider) {
    console.log('\n   ⚠️  No OAuth providers configured. Add credentials to .env to enable OAuth.');
    console.log('   See OAUTH_SETUP.md for instructions.\n');
  } else {
    console.log('   ✅ At least one OAuth provider is configured\n');
  }

  console.log('✅ OAuth setup test completed!\n');
  console.log('To set up OAuth providers, see: packages/backend/OAUTH_SETUP.md');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
