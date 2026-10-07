import { copyFile } from 'node:fs/promises';
await copyFile(new URL('../shared/motion.js', import.meta.url), new URL('../dsh/src/motion.js', import.meta.url));
console.log('Synced canonical motion definition into the standalone DSH package.');
