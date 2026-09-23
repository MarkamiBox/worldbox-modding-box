import { execSync } from 'node:child_process';

const VIRTUAL_ID = 'virtual:build-info';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

function getBuildInfo() {
  let commitCount = '1';
  let commitHash = 'dev';
  let commitDate = new Date().toISOString().slice(0, 10);

  try {
    commitCount = execSync('git rev-list --count HEAD', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim() || '1';
    commitHash = execSync('git rev-parse --short HEAD', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim() || 'dev';
    commitDate = execSync('git log -1 --format=%cd --date=short', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim() || commitDate;
  } catch {
    // fallback if git is not available
  }

  return {
    commitCount,
    commitHash,
    commitDate,
    gameVersion: '0.51.2',
    nmlVersion: 'v0.1.18+',
  };
}

export function buildInfo() {
  return {
    name: 'vite-plugin-build-info',

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;
      return `export default ${JSON.stringify(getBuildInfo())};`;
    },
  };
}
