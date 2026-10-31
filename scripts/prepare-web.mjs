import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const webDir = resolve(root, 'www');

rmSync(webDir, { recursive: true, force: true });
mkdirSync(webDir, { recursive: true });
mkdirSync(resolve(root, 'assets'), { recursive: true });
cpSync(resolve(root, 'index.html'), resolve(webDir, 'index.html'));
cpSync(resolve(root, 'manifest.webmanifest'), resolve(webDir, 'manifest.webmanifest'));
cpSync(resolve(root, 'service-worker.js'), resolve(webDir, 'service-worker.js'));
cpSync(resolve(root, 'icons'), resolve(webDir, 'icons'), { recursive: true });
cpSync(resolve(root, 'icons/volt-flow-512.png'), resolve(root, 'assets/icon.png'));

