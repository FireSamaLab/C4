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

function mapProjectMeta(project) {
  // Compatibilité: certains anciens enregistrements utilisent project.{...}
  const source = project.project || project;

  return {
    clientName: source.clientName || '',
    projectName: source.projectName || '',
    projectAddress: source.projectAddress || '',
    projectType: source.projectType || ''
  };
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
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );
  res.json(sorted);
});

app.post('/api/projects', async (req, res) => {
  const payload = req.body || {};
  const requiredFields = ['clientName', 'projectName', 'projectAddress', 'projectType'];

  for (const field of requiredFields) {
    if (!String(payload[field] || '').trim()) {
      return res.status(400).json({ message: `Champ requis manquant: ${field}.` });
    }
  }

  const projects = await readJson(PROJECTS_FILE, []);
  const createdAt = new Date().toISOString();

  const newProject = {
    id: `prj_${Date.now()}`,
    clientName: String(payload.clientName).trim(),
    projectName: String(payload.projectName).trim(),
    projectAddress: String(payload.projectAddress).trim(),
    projectType: String(payload.projectType).trim(),
    projectWorkType: String(payload.projectWorkType || 'Projet').trim() || 'Projet',
    status: String(payload.status || 'Brouillon').trim() || 'Brouillon',
    projectInformation: {
      projectType: 'new_construction',
      projectInfo: {},
      propertyType: 'Maison',
      buildScope: 'Construction complète',
      buildingLength: '',
      buildingWidth: '',
      numberOfStories: '',
      basementType: 'Aucun',
      wallHeightBasement: '',
      wallHeightMainFloor: '',
      wallHeightSecondFloor: '',
      wallHeightGarage: '',
      hasCathedralCeiling: 'Non',
      hasGarage: 'Non',
      garageType: 'Aucun',
      garageSize: '',
      roofPitch: '',
      roofMaterial: 'Asphalte',
      hasFlatRoof: 'Non',
      architecturalPlansFileName: null,
      floorPlanFileNames: [],
      clientPreferencesNotes: '',
      updatedAt: null
    },
    location: {
      projectAddress: String(payload.projectAddress).trim(),
      city: '',
      province: 'QC',
      postalCode: '',
      region: 'Outaouais',
      lotReference: '',
      updatedAt: null
    },
    contact: {
      fullName: String(payload.clientName).trim(),
      address: '',
      projectAddress: String(payload.projectAddress).trim(),
      phoneNumber: '',
      email: '',
      updatedAt: null
    },
    materialLabor: {
      entries: [],
      updatedAt: null
    },
    profile: {
      planFileName: null,
      planNotes: '',
      aiContextNotes: '',
      specialPriceListsText: '',
      specialPriceListFileName: null,
      planFileNames: [],
      aiSupportFileNames: [],
      updatedAt: null
    },
    estimate: null,
    createdAt,
    updatedAt: createdAt
  };

  projects.push(newProject);
  await writeJson(PROJECTS_FILE, projects);

  res.status(201).json({ ok: true, project: newProject });
});

app.get('/api/projects/:id', async (req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const project = projects.find((item) => item.id === req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  return res.json(project);
});

app.get('/api/projects/:id/ai-export', async (req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const project = projects.find((item) => item.id === req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  const pricesDoc = await readJson(LUMBER_PRICES_FILE, { metadata: {}, prices: {} });
  const info = project.projectInformation || {};
  const dynamicInfo = info.projectInfo && typeof info.projectInfo === 'object' ? info.projectInfo : {};

  const getProjectInfoTypeKey = () => {
    const explicitType = String(info.projectType || '').trim();
    if (explicitType) {
      return explicitType;
    }

    const map = {
      'Construction neuve': 'new_construction',
      'Rénovation': 'renovation',
      'Démolition / Rénovation': 'demolition_renovation',
      Projet: 'small_project'
    };

    return map[String(project.projectWorkType || '').trim()] || 'new_construction';
  };

  const getProjectInfoTypeLabel = (typeKey) => {
    const map = {
      new_construction: 'Construction neuve',
      renovation: 'Rénovation',
      demolition_renovation: 'Démolition / Rénovation',
      small_project: 'Projet'
    };

    return map[String(typeKey || '').trim()] || 'Construction neuve';
  };

  const buildLegacyProjectInfoFields = () => {
    const keys = [
      'propertyType',
      'buildScope',
      'buildingLength',
      'buildingWidth',
      'numberOfStories',
      'basementType',
      'wallHeightBasement',
      'wallHeightMainFloor',
      'wallHeightSecondFloor',
      'wallHeightGarage',
      'hasCathedralCeiling',
      'hasGarage',
      'garageType',
      'garageSize',
      'interiorWallEstimate',
      'studSpacing',
      'wasteFactor',
      'roofStyle',
      'roofPitch',
      'roofMaterial',
      'hasFlatRoof',
      'flooringType',
      'exteriorCladding'
    ];

    const result = {};
    for (const key of keys) {
      const value = info[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        result[key] = value;
      }
    }

    if (!result.notes && String(info.clientPreferencesNotes || '').trim()) {
      result.notes = String(info.clientPreferencesNotes || '').trim();
    }

    return result;
  };

  const buildingLength =
    numberOrDefault(dynamicInfo.buildingLength, NaN) || numberOrDefault(info.buildingLength, NaN) || 30;
  const buildingWidth =
    numberOrDefault(dynamicInfo.buildingWidth, NaN) || numberOrDefault(info.buildingWidth, NaN) || 24;
  const numberOfFloors =
    Math.round(
      numberOrDefault(dynamicInfo.numberOfStories, NaN) ||
        numberOrDefault(info.numberOfStories, NaN) ||
        numberOrDefault(dynamicInfo.existingFloors, NaN) ||
        numberOrDefault(dynamicInfo.numberOfFloors, NaN) ||
        1
    ) || 1;

  const estimatePreview = makeEstimate(
    {
      clientName: project.clientName,
      projectName: project.projectName,
      projectAddress: project.projectAddress,
      projectType: project.projectType,
      buildingLength,
      buildingWidth,
      numberOfFloors,
      exteriorWallHeight:
        numberOrDefault(dynamicInfo.wallHeightMainFloor, NaN) ||
        numberOrDefault(info.wallHeightMainFloor, NaN) ||
        8,
      studSpacing: numberOrDefault(dynamicInfo.studSpacing, NaN) || numberOrDefault(info.studSpacing, NaN) || 16,
      wasteFactor: numberOrDefault(dynamicInfo.wasteFactor, NaN) || numberOrDefault(info.wasteFactor, NaN) || 10,
      interiorLinearFeet:
        numberOrDefault(dynamicInfo.interiorWallEstimate, NaN) || numberOrDefault(info.interiorWallEstimate, NaN) || 0,
      sheathingIncluded: true
    },
    pricesDoc
  );

  const projectInfoTypeKey = getProjectInfoTypeKey();
  const uniqueProjectInfoFields = Object.keys(dynamicInfo).length ? dynamicInfo : buildLegacyProjectInfoFields();

  const aiPackage = {
    schemaVersion: 'ai-export-v2',
    generatedAt: new Date().toISOString(),
    language: 'fr-CA',
    objective:
      'Valider les informations collectées, analyser le plan PDF et estimer les besoins de bois de charpente.',
    projectContext: {
      id: project.id,
      estimateNumber: project.estimateNumber || '',
      projectName: project.projectName || '',
      clientName: project.clientName || '',
      projectAddress: project.projectAddress || '',
      projectTypeOverview: project.projectType || '',
      projectTypeWork: project.projectWorkType || getProjectInfoTypeLabel(projectInfoTypeKey),
      status: project.status || ''
    },
    collectedData: {
      contact: project.contact || {},
      location: project.location || {},
      materialLabor: {
        entries: Array.isArray(project.materialLabor?.entries) ? project.materialLabor.entries : []
      },
      projectInformation: {
        typeKey: projectInfoTypeKey,
        typeLabel: getProjectInfoTypeLabel(projectInfoTypeKey),
        fields: uniqueProjectInfoFields
      },
      attachments: {
        architecturalPlanPdf: info.architecturalPlansFileName || null,
        floorPlanFiles: Array.isArray(info.floorPlanFileNames) ? info.floorPlanFileNames : [],
        pricingDocument: project.profile?.specialPriceListFileName || null,
        planDocuments: Array.isArray(project.profile?.planFileNames) ? project.profile.planFileNames : [],
        aiSupportDocuments: Array.isArray(project.profile?.aiSupportFileNames) ? project.profile.aiSupportFileNames : []
      },
      notes: {
        clientNotes: String(uniqueProjectInfoFields.notes || info.clientPreferencesNotes || '').trim() || null,
        planNotes: String(project.profile?.planNotes || '').trim() || null,
        aiContext: String(project.profile?.aiContextNotes || '').trim() || null,
        pricingNotes: String(project.profile?.specialPriceListsText || '').trim() || null
      }
    },
    framingEstimatePreview: {
      assumptions: estimatePreview.assumptions,
      items: estimatePreview.items,
      total: estimatePreview.total
    },
    pricingContext: {
      source: pricesDoc?.metadata?.source || 'local',
      updatedAt: pricesDoc?.metadata?.updatedAt || null
    },
    analysisRequest: {
      steps: [
        'Valider les données collectées contre le plan PDF.',
        'Identifier les manquants critiques et incohérences.',
        'Appliquer des hypothèses minimales explicites.',
        'Calculer les besoins de bois de charpente (quantités + hypothèses).'
      ],
      outputFormat: {
        validation: 'tableau des champs validés / à corriger',
        missingData: 'liste priorisée',
        assumptions: 'liste claire et justifiée',
        woodTakeoff: 'tableau quantités par élément',
        riskAndConfidence: 'risques + niveau de confiance (%)',
        clientQuestions: 'questions finales avant soumission'
      }
    }
  };

  return res.json({ ok: true, aiPackage });
});

app.put('/api/projects/:id/profile', async (req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const index = projects.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  const current = projects[index];
  const payload = req.body || {};

  const planFileNames = Array.isArray(payload.planFileNames)
    ? payload.planFileNames.filter((value) => typeof value === 'string' && value.trim())
    : [];

  const aiSupportFileNames = Array.isArray(payload.aiSupportFileNames)
    ? payload.aiSupportFileNames.filter((value) => typeof value === 'string' && value.trim())
    : [];

  const updatedProfile = {
    ...(current.profile || {}),
    planFileName: payload.planFileName || null,
    planNotes: String(payload.planNotes || '').trim(),
    aiContextNotes: String(payload.aiContextNotes || '').trim(),
    specialPriceListsText: String(payload.specialPriceListsText || '').trim(),
    specialPriceListFileName: payload.specialPriceListFileName || null,
    planFileNames,
    aiSupportFileNames,
    updatedAt: new Date().toISOString()
  };

  const updatedProject = {
    ...current,
    profile: updatedProfile,
    updatedAt: new Date().toISOString()
  };

  projects[index] = updatedProject;
  await writeJson(PROJECTS_FILE, projects);

  return res.json({ ok: true, project: updatedProject });
});

app.put('/api/projects/:id/contact', async (req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const index = projects.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  const payload = req.body || {};
  const current = projects[index];

  const updatedContact = {
    ...(current.contact || {}),
    fullName: String(payload.fullName || current.clientName || '').trim(),
    address: String(payload.address || '').trim(),
    projectAddress: String(payload.projectAddress || current.projectAddress || '').trim(),
    phoneNumber: String(payload.phoneNumber || '').trim(),
    email: String(payload.email || '').trim(),
    updatedAt: new Date().toISOString()
  };

  const updatedProject = {
    ...current,
    contact: updatedContact,
    clientName: updatedContact.fullName || current.clientName,
    projectAddress: updatedContact.projectAddress || current.projectAddress,
    updatedAt: new Date().toISOString()
  };

  projects[index] = updatedProject;
  await writeJson(PROJECTS_FILE, projects);

  return res.json({ ok: true, project: updatedProject });
});

app.put('/api/projects/:id/material-labor', async (req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const index = projects.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  const payload = req.body || {};
  const current = projects[index];

  const normalizeType = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (['main_oeuvre', 'main d\'oeuvre', 'main d oeuvre', 'labour', 'labor'].includes(raw)) {
      return 'main_oeuvre';
    }

    return 'materiel';
  };

  const cleanQuantity = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? String(parsed) : '0';
  };

  const entries = Array.isArray(payload.entries)
    ? payload.entries
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry, index) => ({
          id: String(entry.id || `ml_${Date.now()}_${index}`).trim(),
          type: normalizeType(entry.type),
          category: String(entry.category || '').trim(),
          subType: String(entry.subType || '').trim(),
          itemName: String(entry.itemName || '').trim(),
          quantity: cleanQuantity(entry.quantity),
          createdAt: entry.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
        .filter((entry) => entry.itemName)
    : Array.isArray(current.materialLabor?.entries)
      ? current.materialLabor.entries
      : [];

  const updatedMaterialLabor = {
    ...(current.materialLabor || {}),
    entries,
    updatedAt: new Date().toISOString()
  };

  const updatedProject = {
    ...current,
    materialLabor: updatedMaterialLabor,
    updatedAt: new Date().toISOString()
  };

  projects[index] = updatedProject;
  await writeJson(PROJECTS_FILE, projects);

  return res.json({ ok: true, project: updatedProject });
});

app.put('/api/projects/:id/location', async (req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const index = projects.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  const payload = req.body || {};
  const current = projects[index];

  const updatedLocation = {
    ...(current.location || {}),
    projectAddress: String(payload.projectAddress || current.projectAddress || '').trim(),
    city: String(payload.city || '').trim(),
    province: String(payload.province || 'QC').trim() || 'QC',
    postalCode: String(payload.postalCode || '').trim(),
    region: String(payload.region || 'Outaouais').trim() || 'Outaouais',
    lotReference: String(payload.lotReference || '').trim(),
    updatedAt: new Date().toISOString()
  };

  const updatedProject = {
    ...current,
    projectAddress: updatedLocation.projectAddress || current.projectAddress,
    location: updatedLocation,
    contact: {
      ...(current.contact || {}),
      projectAddress: updatedLocation.projectAddress || current.contact?.projectAddress || current.projectAddress,
      updatedAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  };

  projects[index] = updatedProject;
  await writeJson(PROJECTS_FILE, projects);

  return res.json({ ok: true, project: updatedProject });
});

app.put('/api/projects/:id/project-information', async (req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const index = projects.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  const payload = req.body || {};
  const current = projects[index];

  const yesNoValues = ['Oui', 'Non'];
  const basementValues = [
    'Aucun',
    'Sous-sol complet',
    'Sous-sol avec sortie extérieure',
    'Dalle sur sol',
    'Vide sanitaire'
  ];
  const garageTypeValues = ['Aucun', 'Attaché', 'Détaché'];
  const roofMaterialValues = ['Asphalte', 'Métal'];

  const toYesNo = (value, fallback = 'Non') => {
    const raw = String(value || '').trim();
    const map = {
      Yes: 'Oui',
      yes: 'Oui',
      true: 'Oui',
      No: 'Non',
      no: 'Non',
      false: 'Non'
    };
    const normalized = map[raw] || raw;
    return yesNoValues.includes(normalized) ? normalized : fallback;
  };

  const toBasementType = (value, fallback = 'Aucun') => {
    const raw = String(value || '').trim();
    const map = {
      none: 'Aucun',
      'full basement': 'Sous-sol complet',
      'walkout basement': 'Sous-sol avec sortie extérieure',
      'slab-on-grade': 'Dalle sur sol',
      crawlspace: 'Vide sanitaire'
    };
    const normalized = map[raw] || raw;
    return basementValues.includes(normalized) ? normalized : fallback;
  };

  const toGarageType = (value, fallback = 'Aucun') => {
    const raw = String(value || '').trim();
    const map = {
      none: 'Aucun',
      attached: 'Attaché',
      detached: 'Détaché'
    };
    const normalized = map[raw] || raw;
    return garageTypeValues.includes(normalized) ? normalized : fallback;
  };

  const toRoofMaterial = (value, fallback = 'Asphalte') => {
    const raw = String(value || '').trim();
    const map = {
      Asphalt: 'Asphalte',
      Metal: 'Métal'
    };
    const normalized = map[raw] || raw;
    return roofMaterialValues.includes(normalized) ? normalized : fallback;
  };

  const cleanNumberish = (value, fallback = '') => {
    const text = String(value ?? '').trim();
    if (!text) {
      return fallback;
    }

    const numeric = Number(text);
    return Number.isFinite(numeric) ? String(numeric) : fallback;
  };

  const floorPlanFileNames = Array.isArray(payload.floorPlanFileNames)
    ? payload.floorPlanFileNames.filter((value) => typeof value === 'string' && value.trim())
    : current.projectInformation?.floorPlanFileNames || [];

  const validProjectInfoTypes = ['new_construction', 'renovation', 'demolition_renovation', 'small_project'];
  const workTypeToProjectInfoType = {
    'Construction neuve': 'new_construction',
    'Rénovation': 'renovation',
    'Démolition / Rénovation': 'demolition_renovation',
    Projet: 'small_project'
  };

  const selectedWorkType = String(payload.projectWorkType || current.projectWorkType || 'Construction neuve').trim();
  const fallbackProjectInfoType = workTypeToProjectInfoType[selectedWorkType] || 'new_construction';
  const rawProjectInfoType = String(payload.projectType || current.projectInformation?.projectType || '').trim();
  const selectedProjectInfoType = validProjectInfoTypes.includes(rawProjectInfoType)
    ? rawProjectInfoType
    : fallbackProjectInfoType;

  const projectInfoPayload =
    payload.projectInfo && typeof payload.projectInfo === 'object' && !Array.isArray(payload.projectInfo)
      ? payload.projectInfo
      : {};

  const normalizedNewConstructionInfo = {
    propertyType:
      String(projectInfoPayload.propertyType || payload.propertyType || current.projectInformation?.propertyType || 'Maison').trim() ||
      'Maison',
    buildScope:
      String(projectInfoPayload.buildScope || payload.buildScope || current.projectInformation?.buildScope || 'Construction complète').trim() ||
      'Construction complète',
    buildingLength: cleanNumberish(
      projectInfoPayload.buildingLength ?? payload.buildingLength,
      current.projectInformation?.buildingLength || ''
    ),
    buildingWidth: cleanNumberish(
      projectInfoPayload.buildingWidth ?? payload.buildingWidth,
      current.projectInformation?.buildingWidth || ''
    ),
    numberOfStories: cleanNumberish(
      projectInfoPayload.numberOfStories ?? payload.numberOfStories,
      current.projectInformation?.numberOfStories || ''
    ),
    basementType: toBasementType(
      projectInfoPayload.basementType ?? payload.basementType,
      current.projectInformation?.basementType || 'Aucun'
    ),
    wallHeightBasement: cleanNumberish(
      projectInfoPayload.wallHeightBasement ?? payload.wallHeightBasement,
      current.projectInformation?.wallHeightBasement || ''
    ),
    wallHeightMainFloor: cleanNumberish(
      projectInfoPayload.wallHeightMainFloor ?? payload.wallHeightMainFloor,
      current.projectInformation?.wallHeightMainFloor || ''
    ),
    wallHeightSecondFloor: cleanNumberish(
      projectInfoPayload.wallHeightSecondFloor ?? payload.wallHeightSecondFloor,
      current.projectInformation?.wallHeightSecondFloor || ''
    ),
    wallHeightGarage: cleanNumberish(
      projectInfoPayload.wallHeightGarage ?? payload.wallHeightGarage,
      current.projectInformation?.wallHeightGarage || ''
    ),
    hasCathedralCeiling: toYesNo(
      projectInfoPayload.hasCathedralCeiling ?? payload.hasCathedralCeiling,
      current.projectInformation?.hasCathedralCeiling || 'Non'
    ),
    hasGarage: toYesNo(projectInfoPayload.hasGarage ?? payload.hasGarage, current.projectInformation?.hasGarage || 'Non'),
    garageType: toGarageType(projectInfoPayload.garageType ?? payload.garageType, current.projectInformation?.garageType || 'Aucun'),
    garageSize: String(projectInfoPayload.garageSize ?? payload.garageSize ?? current.projectInformation?.garageSize || '').trim(),
    interiorWallEstimate: cleanNumberish(
      projectInfoPayload.interiorWallEstimate,
      current.projectInformation?.interiorWallEstimate || ''
    ),
    studSpacing: cleanNumberish(projectInfoPayload.studSpacing, current.projectInformation?.studSpacing || ''),
    wasteFactor: cleanNumberish(projectInfoPayload.wasteFactor, current.projectInformation?.wasteFactor || ''),
    roofStyle: String(projectInfoPayload.roofStyle || current.projectInformation?.roofStyle || '').trim(),
    roofPitch: String(projectInfoPayload.roofPitch ?? payload.roofPitch ?? current.projectInformation?.roofPitch || '').trim(),
    roofMaterial: toRoofMaterial(
      projectInfoPayload.roofMaterial ?? payload.roofMaterial,
      current.projectInformation?.roofMaterial || 'Asphalte'
    ),
    hasFlatRoof: toYesNo(
      projectInfoPayload.hasFlatRoof ?? payload.hasFlatRoof,
      current.projectInformation?.hasFlatRoof || 'Non'
    ),
    flooringType: String(projectInfoPayload.flooringType || current.projectInformation?.flooringType || '').trim(),
    exteriorCladding: String(projectInfoPayload.exteriorCladding || current.projectInformation?.exteriorCladding || '').trim(),
    notes: String(projectInfoPayload.notes || payload.clientPreferencesNotes || current.projectInformation?.clientPreferencesNotes || '').trim()
  };

  const mergedDynamicProjectInfo =
    selectedProjectInfoType === 'new_construction'
      ? normalizedNewConstructionInfo
      : {
          ...(current.projectInformation?.projectInfo || {}),
          ...projectInfoPayload
        };

  const legacyNewConstructionFields =
    selectedProjectInfoType === 'new_construction'
      ? {
          propertyType: normalizedNewConstructionInfo.propertyType,
          buildScope: normalizedNewConstructionInfo.buildScope,
          buildingLength: normalizedNewConstructionInfo.buildingLength,
          buildingWidth: normalizedNewConstructionInfo.buildingWidth,
          numberOfStories: normalizedNewConstructionInfo.numberOfStories,
          basementType: normalizedNewConstructionInfo.basementType,
          wallHeightBasement: normalizedNewConstructionInfo.wallHeightBasement,
          wallHeightMainFloor: normalizedNewConstructionInfo.wallHeightMainFloor,
          wallHeightSecondFloor: normalizedNewConstructionInfo.wallHeightSecondFloor,
          wallHeightGarage: normalizedNewConstructionInfo.wallHeightGarage,
          hasCathedralCeiling: normalizedNewConstructionInfo.hasCathedralCeiling,
          hasGarage: normalizedNewConstructionInfo.hasGarage,
          garageType: normalizedNewConstructionInfo.garageType,
          garageSize: normalizedNewConstructionInfo.garageSize,
          interiorWallEstimate: normalizedNewConstructionInfo.interiorWallEstimate,
          studSpacing: normalizedNewConstructionInfo.studSpacing,
          wasteFactor: normalizedNewConstructionInfo.wasteFactor,
          roofStyle: normalizedNewConstructionInfo.roofStyle,
          roofPitch: normalizedNewConstructionInfo.roofPitch,
          roofMaterial: normalizedNewConstructionInfo.roofMaterial,
          hasFlatRoof: normalizedNewConstructionInfo.hasFlatRoof,
          flooringType: normalizedNewConstructionInfo.flooringType,
          exteriorCladding: normalizedNewConstructionInfo.exteriorCladding,
          clientPreferencesNotes: normalizedNewConstructionInfo.notes
        }
      : {};

  const updatedProjectInformation = {
    ...(current.projectInformation || {}),
    projectType: selectedProjectInfoType,
    projectInfo: mergedDynamicProjectInfo,
    ...legacyNewConstructionFields,
    architecturalPlansFileName:
      payload.architecturalPlansFileName || current.projectInformation?.architecturalPlansFileName || null,
    floorPlanFileNames,
    clientPreferencesNotes:
      String(
        payload.clientPreferencesNotes ||
          legacyNewConstructionFields.clientPreferencesNotes ||
          current.projectInformation?.clientPreferencesNotes ||
          ''
      ).trim(),
    updatedAt: new Date().toISOString()
  };

  const overviewProjectTypeCandidate = String(payload.overviewProjectType || '').trim();
  const legacyOverviewTypeCandidate = String(payload.projectType || '').trim();
  const resolvedOverviewProjectType = overviewProjectTypeCandidate ||
    (validProjectInfoTypes.includes(legacyOverviewTypeCandidate) ? '' : legacyOverviewTypeCandidate);

  const updatedProject = {
    ...current,
    projectType: resolvedOverviewProjectType || current.projectType,
    projectWorkType:
      String(payload.projectWorkType || current.projectWorkType || 'Projet').trim() || current.projectWorkType,
    projectInformation: updatedProjectInformation,
    updatedAt: new Date().toISOString()
  };

  projects[index] = updatedProject;
  await writeJson(PROJECTS_FILE, projects);

  return res.json({ ok: true, project: updatedProject });
});

app.put('/api/projects/:id/status', async (req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const index = projects.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  const payload = req.body || {};
  const nextStatus = String(payload.status || '').trim();

  if (!nextStatus) {
    return res.status(400).json({ message: 'Statut du projet requis.' });
  }

  const current = projects[index];
  const updatedProject = {
    ...current,
    status: nextStatus,
    updatedAt: new Date().toISOString()
  };

  projects[index] = updatedProject;
  await writeJson(PROJECTS_FILE, projects);

  return res.json({ ok: true, project: updatedProject });
});

app.put('/api/projects/:id/overview', async (req, res) => {
  const projects = await readJson(PROJECTS_FILE, []);
  const index = projects.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  const payload = req.body || {};
  const current = projects[index];

  const updatedProject = {
    ...current,
    estimateNumber: String(payload.estimateNumber || current.estimateNumber || '').trim() || current.estimateNumber,
    projectName: String(payload.projectName || current.projectName || '').trim() || current.projectName,
    clientName: String(payload.clientName || current.clientName || '').trim() || current.clientName,
    projectAddress:
      String(payload.projectAddress || current.projectAddress || '').trim() || current.projectAddress,
    projectType: String(payload.projectType || current.projectType || '').trim() || current.projectType,
    projectWorkType:
      String(payload.projectWorkType || current.projectWorkType || 'Projet').trim() || current.projectWorkType,
    status: String(payload.status || current.status || 'Brouillon').trim() || 'Brouillon',
    contact: {
      ...(current.contact || {}),
      fullName:
        String(payload.clientName || current.contact?.fullName || current.clientName || '').trim() ||
        current.clientName,
      projectAddress:
        String(payload.projectAddress || current.contact?.projectAddress || current.projectAddress || '').trim() ||
        current.projectAddress,
      updatedAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  };

  projects[index] = updatedProject;
  await writeJson(PROJECTS_FILE, projects);

  return res.json({ ok: true, project: updatedProject });
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
  const itemType = String(req.body?.itemType || '').trim();
  const current = await readJson(LUMBER_PRICES_FILE, { metadata: {}, prices: {} });

  if (!itemType) {
    return res.status(400).json({ message: "Type d'item requis pour enregistrer les prix manuels." });
  }

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
    lastManualItemType: itemType,
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
  const targetProjectId = String(payload.projectId || '').trim();

  if (targetProjectId) {
    const index = projects.findIndex((item) => item.id === targetProjectId);

    if (index !== -1) {
      const current = projects[index];
      const meta = mapProjectMeta(current);

      const merged = {
        ...current,
        ...meta,
        assumptions: estimate.assumptions,
        items: estimate.items,
        total: estimate.total,
        estimate: {
          assumptions: estimate.assumptions,
          items: estimate.items,
          total: estimate.total,
          createdAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };

      projects[index] = merged;
      await writeJson(PROJECTS_FILE, projects);

      return res.status(201).json({ ok: true, project: merged });
    }
  }

  const projectRecord = {
    id: `prj_${Date.now()}`,
    ...estimate,
    updatedAt: estimate.createdAt
  };

  projects.push(projectRecord);
  await writeJson(PROJECTS_FILE, projects);

  return res.status(201).json({ ok: true, project: projectRecord });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route non trouvée: ${req.method} ${req.url}` });
});

await ensureDataFiles();

app.listen(PORT, () => {
  console.log(`Serveur C4 lancé sur http://localhost:${PORT}`);
});
