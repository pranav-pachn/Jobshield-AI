#!/usr/bin/env ts-node
/**
 * Environment Configuration Diagnostic
 * Run this to verify that .env file is being loaded correctly
 */

import './src/config/loadEnv';
import { env } from './src/config/env';

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   ENVIRONMENT CONFIGURATION DIAGNOSTIC                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log('📁 .env File Status:');
console.log(`   Path: ${envPath}`);
console.log(`   Exists: ${envExists ? '✅ Yes' : '❌ No - ISSUE!'}` );

if (!envExists) {
  console.log('\n⚠️  CRITICAL: .env file not found!');
  console.log('   Create a .env file in the backend directory with:');
  console.log('   - GOOGLE_CLIENT_ID');
  console.log('   - GOOGLE_CLIENT_SECRET');
  console.log('   - MONGODB_URI');
  console.log('   - JWT_SECRET');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 Google OAuth Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log(`   GOOGLE_CLIENT_ID:     ${env.googleClientId ? '✅ Set' : '❌ Missing'}`);
if (env.googleClientId) {
  console.log(`                         ${env.googleClientId.substring(0, 20)}...`);
}

console.log(`   GOOGLE_CLIENT_SECRET: ${env.googleClientSecret ? '✅ Set' : '❌ Missing'}`);
if (env.googleClientSecret) {
  console.log(`                         ${env.googleClientSecret.substring(0, 20)}...`);
}

console.log(`   GOOGLE_CALLBACK_URL:  ${env.googleCallbackUrl ? '✅ Set' : '❌ Missing'}`);
if (env.googleCallbackUrl) {
  console.log(`                         ${env.googleCallbackUrl}`);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔑 Security Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log(`   JWT_SECRET:           ${env.jwtSecret && env.jwtSecret !== 'default-jwt-secret' ? '✅ Set' : '⚠️ Using default'}`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🗄️  Database Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log(`   MONGODB_URI:          ${env.mongoUri ? '✅ Set' : '❌ Missing'}`);
if (env.mongoUri && env.mongoUri.includes('localhost')) {
  console.log(`                         (local development)`);
} else if (env.mongoUri) {
  console.log(`                         (cloud hosted)`);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🌐 Server Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log(`   PORT:                 ${env.port}`);
console.log(`   FRONTEND_URL:         ${env.frontendUrl}`);
console.log(`   AI_SERVICE_URL:       ${env.aiServiceUrl}`);
console.log(`   FRONTEND_ORIGINS:     ${env.frontendOrigins.join(', ')}`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ DIAGNOSTIC SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const issues = [];
if (!envExists) issues.push('❌ .env file missing');
if (!env.googleClientId) issues.push('❌ GOOGLE_CLIENT_ID not set');
if (!env.googleClientSecret) issues.push('❌ GOOGLE_CLIENT_SECRET not set');
if (!env.mongoUri) issues.push('❌ MONGODB_URI not set');

if (issues.length === 0) {
  console.log('\n✅ All critical configurations are set!');
  console.log('   Your application should be ready to run.');
  console.log('\nTo start the backend:');
  console.log('   npm run dev');
}  else {
  console.log('\n❌ Issues found:');
  issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log('\nPlease fix the above issues before starting the application.');
}

console.log('\n' + '═'.repeat(60) + '\n');
