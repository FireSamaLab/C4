/**
 * Serveur backend principal du MVP C4 Construction.
 * - API pour importer les prix RONA (une fois)
 * - API pour lire/modifier les prix locaux
 * - API pour produire une estimation de charpente simple
 * - Service de fichiers JSON local
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { runRonaImport } from './scripts/import-rona-prices.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

const DATA_DIR = path.join(__dirname, 'data');
const RAW_RONA_FILE = path.join(DATA_DIR, 'raw-rona-prices.json');
const LUMBER_PRICES_FILE = path.join(DATA_DIR, 'lumber-prices.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

const RONA_SOURCE_URL =
  process.env.RONA_CATEGORY_URL ||
  'https://www.rona.ca/webapp/wcs/stores/servlet/CategorySearchDisplay?urlLangId=-2&navDescriptors=&catalogId=10051&pageSize=infinite&page=1&storeId=10151&langId=-2&categoryId=3074457345617090669&content=Products&productCategory=507447';

const TARGET_KEYS = ['2x4x8', '2x4x10', '2x6x8', '2x6x10', '2x8x10', '2x10x12'];

function numberOrDefault(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(RAW_RONA_FILE);
  } catch {
    await fs.writeFile(
      RAW_RONA_FILE,
      JSON.stringify({ sourceUrl: RONA_SOURCE_URL, importedAt: null, products: [] }, null, 2),
      'utf8'
    );
  }

  try {
    await fs.access(LUMBER_PRICES_FILE);
  } catch {
    const defaults = {
      metadata: {
        source: 'manual-defaults',
        updatedAt: new Date().toISOString(),
        note: 'Prix par défaut pour démarrer localement avant import RONA.'
      },
      prices: {
        '2x4x8': { key: '2x4x8', title: 'Bois 2x4x8', price: 4.95, unit: 'ch', source: 'manual-defaults' },
        '2x4x10': { key: '2x4x10', title: 'Bois 2x4x10', price: 6.25, unit: 'ch', source: 'manual-defaults' },
        '2x6x8': { key: '2x6x8', title: 'Bois 2x6x8', price: 7.45, unit: 'ch', source: 'manual-defaults' },
        '2x6x10': { key: '2x6x10', title: 'Bois 2x6x10', price: 9.45, unit: 'ch', source: 'manual-defaults' },
        '2x8x10': { key: '2x8x10', title: 'Bois 2x8x10', price: 13.95, unit: 'ch', source: 'manual-defaults' },
        '2x10x12': { key: '2x10x12', title: 'Bois 2x10x12', price: 22.95, unit: 'ch', source: 'manual-defaults' }
      }
    };

    await fs.writeFile(LUMBER_PRICES_FILE, JSON.stringify(defaults, null, 2), 'utf8');
  }

  try {
    await fs.access(PROJECTS_FILE);
  } catch {
    await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function getUnitPrice(pricesDoc, key, overrides = {}) {
  const overrideValue = numberOrDefault(overrides[key], NaN);
  if (Number.isFinite(overrideValue) && overrideValue >= 0) {
    return overrideValue;
  }

  const importedValue = numberOrDefault(pricesDoc?.prices?.[key]?.price, NaN);
  if (Number.isFinite(importedValue) && importedValue >= 0) {
    return importedValue;
  }

  return 0;
}

function chooseLengthByPricePerFoot(typeKey, lengths, pricesDoc, overrides) {
  const candidates = lengths
    .map((length) => {
      const key = `${typeKey}x${length}`;
      const unitPrice = getUnitPrice(pricesDoc, key, overrides);

      if (unitPrice <= 0) {
        return null;
      }

      return {
        key,
        length,
        unitPrice,
        pricePerFoot: unitPrice / length
      };
    })
    .filter(Boolean);

  if (!candidates.length) {
    return {
      key: `${typeKey}x${lengths[0]}`,
      length: lengths[0],
      unitPrice: 0,
      pricePerFoot: 0
    };
  }

  candidates.sort((a, b) => a.pricePerFoot - b.pricePerFoot);
  return candidates[0];
}

function makeEstimate(payload, pricesDoc) {
  // Données projet
  const clientName = String(payload.clientName || '').trim();
  const projectName = String(payload.projectName || '').trim();
  const projectAddress = String(payload.projectAddress || '').trim();
  const projectType = String(payload.projectType || 'Bâtiment rectangulaire');

  // Hypothèses de base (éditables)
  const buildingLength = Math.max(1, numberOrDefault(payload.buildingLength, 30));
  const buildingWidth = Math.max(1, numberOrDefault(payload.buildingWidth, 24));
  const numberOfFloors = Math.max(1, Math.round(numberOrDefault(payload.numberOfFloors, 1)));
  const exteriorWallHeight = Math.max(8, numberOrDefault(payload.exteriorWallHeight, 8));
  const studSpacing = Math.max(12, numberOrDefault(payload.studSpacing, 16));
  const joistSpacing = Math.max(12, numberOrDefault(payload.joistSpacing, 16));
  const wasteFactor = Math.max(0, numberOrDefault(payload.wasteFactor, 10));

  const exteriorWallLumberType = String(payload.exteriorWallLumberType || '2x6');
  const interiorWallLumberType = String(payload.interiorWallLumberType || '2x4');

  const interiorPartitionsCount = Math.max(0, Math.round(numberOrDefault(payload.interiorPartitionsCount, 0)));
  let interiorLinearFeet = Math.max(0, numberOrDefault(payload.interiorLinearFeet, 0));
  const sheathingIncluded = Boolean(payload.sheathingIncluded);

  // Si l'utilisateur préfère entrer un nombre de cloisons, on approxime en largeur du bâtiment.
  if (interiorLinearFeet <= 0 && interiorPartitionsCount > 0) {
    interiorLinearFeet = interiorPartitionsCount * buildingWidth;
  }

  const overrides = payload.priceOverrides || {};
  const perimeter = 2 * (buildingLength + buildingWidth);
  const wasteMultiplier = 1 + wasteFactor / 100;

  const exteriorStudLength = exteriorWallHeight > 8 ? 10 : 8;
  const interiorStudLength = exteriorWallHeight > 8 ? 10 : 8;

  const exteriorStudKey = `${exteriorWallLumberType}x${exteriorStudLength}`;
  const interiorStudKey = `${interiorWallLumberType}x${interiorStudLength}`;

  const exteriorPlatesChoice = chooseLengthByPricePerFoot(
    exteriorWallLumberType,
    [8, 10, 12],
    pricesDoc,
    overrides
  );
  const interiorPlatesChoice = chooseLengthByPricePerFoot(
    interiorWallLumberType,
    [8, 10, 12],
    pricesDoc,
    overrides
  );

  // Quantités de base (avant perte)
  const exteriorStudsBase = Math.ceil((perimeter * 12) / studSpacing + 8) * numberOfFloors;
  const exteriorPlatesLinearFeet = perimeter * numberOfFloors * 3; // 2 lisses hautes + 1 basse
  const exteriorPlatesBase = Math.ceil(exteriorPlatesLinearFeet / exteriorPlatesChoice.length);

  const interiorStudsBase = Math.ceil((interiorLinearFeet * 12) / studSpacing + interiorPartitionsCount * 2) * numberOfFloors;
  const interiorPlatesLinearFeet = interiorLinearFeet * numberOfFloors * 3;
  const interiorPlatesBase = interiorLinearFeet > 0
    ? Math.ceil(interiorPlatesLinearFeet / interiorPlatesChoice.length)
    : 0;

  const sheathingBase = sheathingIncluded
    ? Math.ceil((perimeter * exteriorWallHeight * numberOfFloors) / 32)
    : 0;

  // Application du facteur de perte à la fin
  const exteriorStudsQty = Math.ceil(exteriorStudsBase * wasteMultiplier);
  const exteriorPlatesQty = Math.ceil(exteriorPlatesBase * wasteMultiplier);
  const interiorStudsQty = Math.ceil(interiorStudsBase * wasteMultiplier);
  const interiorPlatesQty = Math.ceil(interiorPlatesBase * wasteMultiplier);
  const sheathingQty = Math.ceil(sheathingBase * wasteMultiplier);

  const items = [
    {
      materialKey: exteriorStudKey,
      description: `Montants extérieurs (${exteriorWallLumberType})`,
      quantity: exteriorStudsQty,
      unitPrice: getUnitPrice(pricesDoc, exteriorStudKey, overrides)
    },
    {
      materialKey: exteriorPlatesChoice.key,
      description: `Lisses extérieures hautes + basses (${exteriorWallLumberType})`,
      quantity: exteriorPlatesQty,
      unitPrice: exteriorPlatesChoice.unitPrice
    },
    {
      materialKey: interiorStudKey,
      description: `Montants intérieurs (${interiorWallLumberType})`,
      quantity: interiorStudsQty,
      unitPrice: getUnitPrice(pricesDoc, interiorStudKey, overrides)
    },
    {
      materialKey: interiorPlatesChoice.key,
      description: `Lisses intérieures hautes + basses (${interiorWallLumberType})`,
      quantity: interiorPlatesQty,
      unitPrice: interiorPlatesChoice.unitPrice
    },
    {
      materialKey: 'SHEATHING-OSB-4x8',
      description: 'Revêtement extérieur de base (optionnel) - feuilles 4x8',
      quantity: sheathingQty,
      unitPrice: numberOrDefault(overrides['SHEATHING-OSB-4x8'], 0)
    }
  ]
    .filter((row) => row.quantity > 0)
    .map((row) => ({
      ...row,
      unitPrice: roundMoney(row.unitPrice),
      subtotal: roundMoney(row.quantity * row.unitPrice)
    }));

  const total = roundMoney(items.reduce((sum, row) => sum + row.subtotal, 0));

  return {
    project: {
      clientName,
      projectName,
      projectAddress,
      projectType
    },
    assumptions: {
      heading: 'Hypothèses par défaut pour estimation – Québec / Outaouais',
      disclaimer:
        'Ces paramètres sont des hypothèses d\'affaires pour l\'estimation seulement et ne constituent pas un avis légal ou de conformité au Code.',
      exteriorWallLumberType,
      interiorWallLumberType,
      studSpacing,
      joistSpacing,
      wasteFactor,
      buildingLength,
      buildingWidth,
      numberOfFloors,
      exteriorWallHeight,
      interiorPartitionsCount,
      interiorLinearFeet,
      sheathingIncluded
    },
    items,
    total,
    createdAt: new Date().toISOString()
  };
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    app: 'C4 Construction MVP',
    mode: 'local'
  });
});

app.get('/api/projects', async (_req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const sorted = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

app.post('/api/import-rona-prices', async (_req, res) => {
  try {
    const summary = await runRonaImport({ sourceUrl: RONA_SOURCE_URL });
    res.json({ ok: true, summary });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: `Import RONA échoué: ${error.message}`
    });
  }
});

app.get('/api/lumber-prices', async (_req, res) => {
  const pricesDoc = await readJson(LUMBER_PRICES_FILE, { metadata: {}, prices: {} });

  // S'assurer que les clés cibles existent toujours pour l'UI.
  for (const key of TARGET_KEYS) {
    if (!pricesDoc.prices[key]) {
      pricesDoc.prices[key] = {
        key,
        title: `Bois ${key}`,
        price: 0,
        unit: 'ch',
        source: 'missing'
      };
    }
  }

  res.json(pricesDoc);
});

app.post('/api/lumber-prices', async (req, res) => {
  const incoming = req.body?.prices || {};
  const current = await readJson(LUMBER_PRICES_FILE, { metadata: {}, prices: {} });

  for (const [key, value] of Object.entries(incoming)) {
    const numeric = numberOrDefault(value, NaN);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return res.status(400).json({ message: `Prix invalide pour ${key}.` });
    }

    const previous = current.prices[key] || { key, title: `Bois ${key}`, unit: 'ch' };
    current.prices[key] = {
      ...previous,
      price: roundMoney(numeric),
      source: 'manual-override',
      updatedAt: new Date().toISOString()
    };
  }

  current.metadata = {
    ...current.metadata,
    source: 'manual-override',
    updatedAt: new Date().toISOString()
  };

  await writeJson(LUMBER_PRICES_FILE, current);
  res.json({ ok: true, prices: current });
});

app.post('/api/estimate', async (req, res) => {
  const payload = req.body || {};
  const requiredFields = ['clientName', 'projectName', 'projectAddress', 'projectType'];

  for (const field of requiredFields) {
    if (!String(payload[field] || '').trim()) {
      return res.status(400).json({ message: `Champ requis manquant: ${field}.` });
    }
  }

  const pricesDoc = await readJson(LUMBER_PRICES_FILE, { metadata: {}, prices: {} });
  const estimate = makeEstimate(payload, pricesDoc);

  const projects = await readJson(PROJECTS_FILE, []);
  const projectRecord = {
    id: `prj_${Date.now()}`,
    ...estimate
  };

  projects.push(projectRecord);
  await writeJson(PROJECTS_FILE, projects);

  res.status(201).json({ ok: true, project: projectRecord });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route non trouvée: ${req.method} ${req.url}` });
});

await ensureDataFiles();

app.listen(PORT, () => {
  console.log(`Serveur C4 lancé sur http://localhost:${PORT}`);
});
