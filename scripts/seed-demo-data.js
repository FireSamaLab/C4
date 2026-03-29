import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const copies = [
  {
    from: path.join(rootDir, 'data', 'demo', 'projects.demo.json'),
    to: path.join(rootDir, 'data', 'projects.json')
  },
  {
    from: path.join(rootDir, 'data', 'demo', 'lumber-prices.demo.json'),
    to: path.join(rootDir, 'data', 'lumber-prices.json')
  },
  {
    from: path.join(rootDir, 'data', 'demo', 'prices.demo.json'),
    to: path.join(rootDir, 'data', 'prices.json')
  },
  {
    from: path.join(rootDir, 'data', 'demo', 'raw-rona-prices.demo.json'),
    to: path.join(rootDir, 'data', 'raw-rona-prices.json')
  }
];

async function ensureExists(filePath) {
  await fs.access(filePath);
}

async function seedDemoData() {
  for (const file of copies) {
    await ensureExists(file.from);
    await fs.copyFile(file.from, file.to);
  }

  // Validation JSON rapide
  for (const file of copies) {
    const raw = await fs.readFile(file.to, 'utf8');
    JSON.parse(raw);
  }

  console.log('Données démo appliquées avec succès.');
}

seedDemoData().catch((error) => {
  console.error('Échec seed démo:', error.message);
  process.exit(1);
});
