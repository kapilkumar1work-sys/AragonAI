#!/usr/bin/env node
/**
 * MongoDB connection diagnostic script.
 * Run: npm run test:db
 */
require('dotenv').config();
const mongoose = require('mongoose');
const net = require('net');
const dns = require('dns').promises;

async function getPublicIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=text');
    return (await res.text()).trim();
  } catch {
    return 'unknown';
  }
}

async function testTcp(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => resolve(false));
    socket.connect(port, host);
  });
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  const sanitized = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log('URI:', sanitized);
  console.log('Public IP:', await getPublicIp());
  console.log('');

  const host = 'cluster0.xiyw1cr.mongodb.net';
  try {
    const records = await dns.resolveSrv(`_mongodb._tcp.${host}`);
    console.log(`SRV records found: ${records.length}`);
    for (const record of records.slice(0, 1)) {
      const reachable = await testTcp(record.name, record.port);
      console.log(`TCP ${record.name}:${record.port} → ${reachable ? 'OPEN' : 'BLOCKED'}`);
    }
  } catch (e) {
    console.error('DNS lookup failed:', e.message);
  }

  console.log('\nConnecting to MongoDB...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000, family: 4 });
    console.log('SUCCESS: Connected to MongoDB Atlas');
    process.exit(0);
  } catch (e) {
    console.error('FAILED:', e.message);
    console.error('\nFix checklist:');
    console.error('  1. Add your public IP to Atlas → Network Access (or use 0.0.0.0/0)');
    console.error('  2. Verify username/password in Atlas → Database Access');
    console.error('  3. If on corporate network, try mobile hotspot (port 27017 may be blocked)');
    process.exit(1);
  }
}

main();
