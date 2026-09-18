#!/usr/bin/env node
// ===== Generate the admin credentials =====
//
//   npm run hash-password
//
// Prompts for a password and prints the environment variables to paste into
// Netlify (Site configuration -> Environment variables). The password itself is
// never written to disk, never printed, and never committed — only its hash.
//
// Run this again whenever you rotate the password. Changing AUTH_SECRET as well
// invalidates every signed-in session immediately, which is what you want if a
// password has leaked.
import { createInterface } from 'node:readline';
import { randomBytes } from 'node:crypto';
import { hashPassword, PBKDF2_ITERATIONS } from '../netlify/lib/credentials.mjs';

// Terminal mode only when stdin really is a terminal. Forcing it on a pipe
// makes readline echo the whole buffer at once and never settle.
const interactive = Boolean(process.stdin.isTTY);
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: interactive });

let muted = false;
// In terminal mode readline echoes each keystroke through this. Swallowing it
// while muted keeps the password off the screen and out of the scrollback.
// Without a terminal there is no echo to suppress in the first place.
rl._writeToOutput = (chunk) => { if (!muted) rl.output.write(chunk); };

// A queue, because a piped stdin delivers every line at once: readline fires
// all its `line` events immediately and any that arrive with no question
// waiting would simply be dropped.
const queued = [];
const waiting = [];
rl.on('line', (line) => {
  const resolve = waiting.shift();
  if (resolve) resolve(line);
  else queued.push(line);
});
rl.on('close', () => { while (waiting.length) waiting.shift()(''); });

const readLine = () => (queued.length
  ? Promise.resolve(queued.shift())
  : new Promise((resolve) => { waiting.push(resolve); }));

// Prompts go to stderr, so `npm run hash-password > vars.env` captures the
// four variables and nothing else.
function ask(prompt) {
  process.stderr.write(prompt);
  return readLine();
}

async function askHidden(prompt) {
  process.stderr.write(prompt);
  muted = interactive;
  const answer = await readLine();
  muted = false;
  if (interactive) process.stderr.write('\n');
  return answer;
}

const fail = (message) => {
  muted = false;
  rl.close();
  console.error(`\n${message}`);
  process.exit(1);
};

const username = (await ask('Admin username [admin]: ')).trim() || 'admin';
const displayName = (await ask('Display name [Administrator]: ')).trim() || 'Administrator';

const password = await askHidden('Password: ');
if (password.length < 12) {
  fail('Too short. Use at least 12 characters — this password is the only thing between a stranger and the booklets.');
}

const again = await askHidden('Password again: ');
if (password !== again) {
  fail('Those did not match. Nothing was generated.');
}

rl.close();

console.error(`\nHashing with PBKDF2-SHA256, ${PBKDF2_ITERATIONS.toLocaleString()} iterations...\n`);
console.error('Set these in Netlify -> Site configuration -> Environment variables:\n');

console.log(`ADMIN_USERNAME=${username}`);
console.log(`ADMIN_DISPLAY_NAME=${displayName}`);
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
console.log(`AUTH_SECRET=${randomBytes(32).toString('base64')}`);

console.error('\nAUTH_SECRET signs the session tokens. Keep it secret; changing it signs everyone out.');
console.error('Do not commit any of these. The password itself is stored nowhere.\n');
