import { readFile, writeFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const htmlFiles = ['index.html', 'werk.html', 'over-mij.html'];

for (const file of htmlFiles) {
  const source = await readFile(file, 'utf8');
  const versioned = source.replace(/\?v=(?:__VERSION__|\d+\.\d+\.\d+)/g, `?v=${packageJson.version}`);
  await writeFile(file, versioned);
}