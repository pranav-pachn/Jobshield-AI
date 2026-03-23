#!/usr/bin/env node
/**
 * Quick Environment Verification Script
 * This verifies that .env is being loaded correctly
 * Requires: node (no TypeScript compilation needed)
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   ENVIRONMENT CONFIGURATION VERIFICATION                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log('📁 .env File Status:');
console.log(`   Path: ${envPath}`);
console.log(`   Exists: ${envExists ? '✅ YES' : '❌ NO - Create the file!'}`);

if (!envExists) {
  console.log('\n⚠️  ERROR: .env file not found in backend directory!');
  process.exit(1);
}

// Load env variables
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log(`\n❌ Error loading .env: ${result.error.message}`);
  process.exit(1);
}

console.log(`\n✅ Successfully loaded .env file (${Object.keys(result.parsed).length} variables)\n`);

// Check critical variables
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 Google OAuth Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const checks = {
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'GOOGLE_CALLBACK_URL': process.env.GOOGLE_CALLBACK_URL,
  'MONGO_URI': process.env.MONGO_URI,
  'JWT_SECRET': process.env.JWT_SECRET,
};

let allGood = true;
for (const [key, value] of Object.entries(checks)) {
  const status = value ? '✅' : '❌';
  console.log(`   ${key}: ${status}`);
  if (value) {
    if (key === 'GOOGLE_CLIENT_ID' || key === 'GOOGLE_CLIENT_SECRET') {
      console.log(`      ${value.substring(0, 30)}...`);
    } else if (key === 'MONGO_URI') {
      console.log(`      ${value.substring(0, 40)}...`);
    } else {
      console.log(`      ${value}`);
    }
  } else {
    allGood = false;
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 VERIFICATION SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (allGood) {
  console.log('\n✅ ALL CONFIGURATION CHECKS PASSED!');
  console.log('\n🚀 Your backend is ready to start:');
  console.log('   npm run dev              (development with hot reload)');
  console.log('   npm run build && npm start  (production build)');
  console.log('\n✨ Google OAuth should work correctly!');
  process.exit(0);
} else {
  console.log('\n❌ MISSING CONFIGURATION!');
  console.log('\n📝 Please add these to your .env file:');
  for (const [key, value] of Object.entries(checks)) {
    if (!value) {
      console.log(`   ${key}=YOUR_VALUE_HERE`);
    }
  }
  console.log('\nℹ️  Example .env:');
  console.log(`   GOOGLE_CLIENT_ID=290394540693-xxxxx.apps.googleusercontent.com`);
  console.log(`   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxx`);
  console.log(`   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db`);
  console.log(`   JWT_SECRET=your_secret_key`);
  process.exit(1);
}
