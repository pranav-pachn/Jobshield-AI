#!/usr/bin/env node

/**
 * Authentication Security Tests
 * Verifies that the login/register endpoints properly validate credentials
 */

import axios from 'axios';

const API_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';
const delayMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  message: string;
  details?: unknown;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  const icon = {
    PASS: '✅',
    FAIL: '❌',
    ERROR: '⚠️'
  }[result.status];
  
  console.log(`\n${icon} ${result.name}`);
  console.log(`   ${result.message}`);
  if (result.details) {
    console.log(`   Details:`, JSON.stringify(result.details, null, 4));
  }
  results.push(result);
}

async function testEmptyPassword() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: Empty Password Login Attempt');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: ''
    });
    
    logResult({
      name: 'Empty Password Rejection',
      status: 'FAIL',
      message: 'VULNERABILITY: Server accepted login with empty password!',
      details: { status: response.status, data: response.data }
    });
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      logResult({
        name: 'Empty Password Rejection',
        status: 'PASS',
        message: `Server correctly rejected empty password (${error.response.status})`,
        details: { message: error.response.data.message }
      });
    } else {
      logResult({
        name: 'Empty Password Rejection',
        status: 'ERROR',
        message: `Unexpected error status: ${error.response?.status || error.message}`
      });
    }
  }
}

async function testWhitespacePassword() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: Whitespace-Only Password Attempt');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: '       '
    });
    
    logResult({
      name: 'Whitespace Password Rejection',
      status: 'FAIL',
      message: 'VULNERABILITY: Server accepted login with whitespace password!',
      details: { status: response.status, data: response.data }
    });
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      logResult({
        name: 'Whitespace Password Rejection',
        status: 'PASS',
        message: `Server correctly rejected whitespace password (${error.response.status})`,
        details: { message: error.response.data.message }
      });
    } else {
      logResult({
        name: 'Whitespace Password Rejection',
        status: 'ERROR',
        message: `Unexpected error status: ${error.response?.status || error.message}`
      });
    }
  }
}

async function testMissingPassword() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: Missing Password Field Attempt');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com'
      // password intentionally omitted
    });
    
    logResult({
      name: 'Missing Password Rejection',
      status: 'FAIL',
      message: 'VULNERABILITY: Server accepted login with missing password!',
      details: { status: response.status, data: response.data }
    });
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      logResult({
        name: 'Missing Password Rejection',
        status: 'PASS',
        message: `Server correctly rejected missing password (${error.response.status})`,
        details: { message: error.response.data.message }
      });
    } else {
      logResult({
        name: 'Missing Password Rejection',
        status: 'ERROR',
        message: `Unexpected error status: ${error.response?.status || error.message}`
      });
    }
  }
}

async function testShortPassword() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: Too-Short Password Attempt');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: '12345'  // Only 5 characters
    });
    
    logResult({
      name: 'Short Password Rejection',
      status: 'FAIL',
      message: 'VULNERABILITY: Server accepted password shorter than 6 characters!',
      details: { status: response.status, data: response.data }
    });
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      logResult({
        name: 'Short Password Rejection',
        status: 'PASS',
        message: `Server correctly rejected short password (${error.response.status})`,
        details: { message: error.response.data.message }
      });
    } else {
      logResult({
        name: 'Short Password Rejection',
        status: 'ERROR',
        message: `Unexpected error status: ${error.response?.status || error.message}`
      });
    }
  }
}

async function testInvalidEmail() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 5: Invalid Email Format Attempt');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'notanemail',
      password: 'validpassword123'
    });
    
    logResult({
      name: 'Invalid Email Rejection',
      status: 'FAIL',
      message: 'VULNERABILITY: Server accepted invalid email format!',
      details: { status: response.status, data: response.data }
    });
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      logResult({
        name: 'Invalid Email Rejection',
        status: 'PASS',
        message: `Server correctly rejected invalid email (${error.response.status})`,
        details: { message: error.response.data.message }
      });
    } else {
      logResult({
        name: 'Invalid Email Rejection',
        status: 'ERROR',
        message: `Unexpected error status: ${error.response?.status || error.message}`
      });
    }
  }
}

async function testRegisterShortPassword() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 6: Register with Short Password');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const testEmail = `test-${Date.now()}@example.com`;
  
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      password: '123',  // Only 3 characters
      name: 'Test User'
    });
    
    logResult({
      name: 'Register Short Password Rejection',
      status: 'FAIL',
      message: 'VULNERABILITY: Server accepted registration with short password!',
      details: { status: response.status, data: response.data }
    });
  } catch (error: any) {
    if (error.response?.status === 400) {
      logResult({
        name: 'Register Short Password Rejection',
        status: 'PASS',
        message: `Server correctly rejected short password during registration (${error.response.status})`,
        details: { message: error.response.data.message }
      });
    } else {
      logResult({
        name: 'Register Short Password Rejection',
        status: 'ERROR',
        message: `Unexpected error status: ${error.response?.status || error.message}`
      });
    }
  }
}

async function testRegisterEmptyPassword() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 7: Register with Empty Password');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const testEmail = `test-${Date.now()}@example.com`;
  
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      password: '',
      name: 'Test User'
    });
    
    logResult({
      name: 'Register Empty Password Rejection',
      status: 'FAIL',
      message: 'VULNERABILITY: Server accepted registration with empty password!',
      details: { status: response.status, data: response.data }
    });
  } catch (error: any) {
    if (error.response?.status === 400) {
      logResult({
        name: 'Register Empty Password Rejection',
        status: 'PASS',
        message: `Server correctly rejected empty password during registration (${error.response.status})`,
        details: { message: error.response.data.message }
      });
    } else {
      logResult({
        name: 'Register Empty Password Rejection',
        status: 'ERROR',
        message: `Unexpected error status: ${error.response?.status || error.message}`
      });
    }
  }
}

async function printSummary() {
  console.log('\n\n' + '═'.repeat(60));
  console.log('TEST SUMMARY');
  console.log('═'.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const total = results.length;
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⚠️ Errors:  ${errors}`);
  
  console.log('\n' + '═'.repeat(60));
  
  if (failed > 0 || errors > 0) {
    console.log('\n🚨 SECURITY ISSUES DETECTED!');
    console.log('   Failed tests indicate authentication vulnerabilities.');
    process.exit(1);
  } else {
    console.log('\n✅ ALL SECURITY TESTS PASSED!');
    console.log('   Authentication system is properly secured.');
    process.exit(0);
  }
}

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  AUTH SECURITY TEST SUITE v1.0               ║');
  console.log('║  Testing password validation & sanitization  ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`\nAPI Endpoint: ${API_URL}`);
  
  try {
    await testEmptyPassword();
    await delayMs(200);
    
    await testWhitespacePassword();
    await delayMs(200);
    
    await testMissingPassword();
    await delayMs(200);
    
    await testShortPassword();
    await delayMs(200);
    
    await testInvalidEmail();
    await delayMs(200);
    
    await testRegisterShortPassword();
    await delayMs(200);
    
    await testRegisterEmptyPassword();
    await delayMs(200);
    
    await printSummary();
  } catch (error) {
    console.error('\n❌ Test suite crashed:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
