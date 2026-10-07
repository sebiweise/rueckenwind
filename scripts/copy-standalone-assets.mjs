// The standalone server does not include public/ and .next/static by default.
// Copy them next to server.js so `npm start` serves a complete app (the Dockerfile does the same).
import { cpSync, existsSync } from 'node:fs';

if (existsSync('.next/standalone')) {
	cpSync('public', '.next/standalone/public', { recursive: true });
	cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
}
