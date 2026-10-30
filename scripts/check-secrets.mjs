// Fails (exit code 1) if text that looks like a secret is found.
// Usage:
//   node scripts/check-secrets.mjs           -> scans the staged diff (run before every commit)
//   node scripts/check-secrets.mjs --history -> scans the full git history
import { execSync } from 'node:child_process';

const PATTERNS = [
  { name: 'Google API key', regex: /AIza[0-9A-Za-z_-]{20,}/ },
  { name: 'OpenAI-style key', regex: /sk-[0-9A-Za-z_-]{20,}/ },
  // Also catches the legacy Supabase service-role key, which is a JWT.
  { name: 'JWT-like token', regex: /eyJ[0-9A-Za-z_-]{20,}\.[0-9A-Za-z_-]{20,}/ },
  { name: 'Supabase secret key', regex: /sb_secret_[0-9A-Za-z_-]{16,}/ },
  // The role name "service_role" (SQL grants, env variable names) is not a secret; a value
  // assigned to a service-role variable is.
  {
    name: 'Assigned service role key',
    regex: /SERVICE_ROLE_KEY\s*[=:]\s*['"]?[0-9A-Za-z._-]{20,}/i,
  },
  { name: 'Assigned API key', regex: /API_KEY\s*=\s*['"]?[^\s'"#]{8,}/ },
];

// This file contains the patterns themselves, so it is excluded from the scan.
const SELF = 'scripts/check-secrets.mjs';

const scanHistory = process.argv.includes('--history');
const command = scanHistory
  ? `git log -p --all -- . ":(exclude)${SELF}"`
  : `git diff --staged -- . ":(exclude)${SELF}"`;

const diff = execSync(command, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

// Only added lines can introduce a secret (in history, removed lines were added earlier).
// The matched value is never printed, only the file and the kind of secret.
const findings = [];
let currentFile = '';
let addedLines = 0;
for (const line of diff.split('\n')) {
  if (line.startsWith('+++ ')) {
    currentFile = line.slice(4).replace(/^b\//, '');
    continue;
  }
  if (!line.startsWith('+')) continue;
  addedLines += 1;
  for (const { name, regex } of PATTERNS) {
    if (regex.test(line)) {
      findings.push(`${name} in ${currentFile}`);
    }
  }
}

const scope = scanHistory ? 'full git history' : 'staged diff';
if (findings.length > 0) {
  process.stderr.write(`Secret scan FAILED on ${scope}:\n${findings.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`Secret scan passed on ${scope} (${addedLines} added lines checked).\n`);
