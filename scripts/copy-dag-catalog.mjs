import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const sourceDir = join(rootDir, 'DAG');
const targetDir = join(rootDir, 'dist', 'dag-catalog');

const entriesToCopy = [
  'app.js',
  'appendix_c_evidence_report.md',
  'appendix_c_validation_report.txt',
  'data',
  'index.html',
  'styles.css',
];

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });

for (const entry of entriesToCopy) {
  cpSync(join(sourceDir, entry), join(targetDir, entry), { recursive: true });
}

console.log('Copied DAG catalog into dist/dag-catalog');
