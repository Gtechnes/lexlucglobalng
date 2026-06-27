#!/usr/bin/env node

/**
 * Simple wrapper to run NestJS backend from TypeScript
 * Uses ts-node with proper configuration
 */

const { spawn } = require('child_process');
const path = require('path');

const proc = spawn('npx', ['ts-node', '-r', 'tsconfig-paths/register', 'src/main.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

proc.on('exit', (code) => {
  process.exit(code);
});

proc.on('error', (err) => {
  console.error('Error starting backend:', err);
  process.exit(1);
});