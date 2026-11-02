import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const standaloneNextDir = path.join(standaloneDir, '.next');
const staticSourceDir = path.join(rootDir, '.next', 'static');
const staticTargetDir = path.join(standaloneNextDir, 'static');
const publicSourceDir = path.join(rootDir, 'public');
const publicTargetDir = path.join(standaloneDir, 'public');
const serverEntry = path.join(standaloneDir, 'server.js');

if (!existsSync(serverEntry)) {
	throw new Error('Standalone server build not found. Run `bun run build` first.');
}

mkdirSync(standaloneNextDir, { recursive: true });

if (existsSync(staticSourceDir)) {
	cpSync(staticSourceDir, staticTargetDir, { recursive: true, force: true });
}

if (existsSync(publicSourceDir)) {
	cpSync(publicSourceDir, publicTargetDir, { recursive: true, force: true });
}

await import(pathToFileURL(serverEntry).href);
