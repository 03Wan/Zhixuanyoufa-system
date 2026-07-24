import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve from this script instead of process.cwd(), so the release check is
// reliable from the repository root, frontend directory, or CI workspace.
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const roots = [join(projectRoot, 'frontend+', 'dist'), join(projectRoot, 'backend', 'dist')];
const terms = ['MVP', '测试', '演示', 'Mock', 'mock-token', '占位', '暂未开放', '敬请期待', '试点', 'demo', 'DEMO'];
const extensions = new Set(['.html', '.js', '.css', '.json', '.txt', '.xml', '.svg']);

function hasAllowedExtension(file) {
  const dot = file.lastIndexOf('.');
  return dot >= 0 && extensions.has(file.slice(dot).toLowerCase());
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (hasAllowedExtension(entry.name)) files.push(path);
  }
  return files;
}

const hits = [];
for (const root of roots) {
  for (const file of await walk(root)) {
    const text = await readFile(file, 'utf8').catch(() => '');
    for (const term of terms) {
      if (text.includes(term)) hits.push(`${file}: ${term}`);
    }
  }
}

if (hits.length) {
  console.error(hits.join('\n'));
  process.exit(1);
}

console.log('Forbidden term scan passed.');
