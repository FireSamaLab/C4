// Simple JSON file storage service.
// This is intentionally beginner-friendly and synchronous for MVP clarity.

const fs = require('fs');
const { DATA_DIR, PROJECTS_FILE, PRICES_FILE } = require('../config/paths');

// Default lumber prices (editable from UI).
const DEFAULT_PRICES = {
  lumber_2x4x8: 4.95,
  lumber_2x4x10: 6.25,
  lumber_2x6x8: 7.45,
  lumber_2x6x10: 9.45,
  lumber_2x8x10: 13.95,
  lumber_2x10x12: 22.95,
  osb_sheet: 18.5,
  plywood_sheet: 27.5
};

function ensureStorageFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2), 'utf8');
  }

  if (!fs.existsSync(PRICES_FILE)) {
    fs.writeFileSync(PRICES_FILE, JSON.stringify(DEFAULT_PRICES, null, 2), 'utf8');
  }
}

function readJsonFile(filePath, fallbackValue) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (_error) {
    return fallbackValue;
  }
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function getProjects() {
  return readJsonFile(PROJECTS_FILE, []);
}

function saveProjects(projects) {
  writeJsonFile(PROJECTS_FILE, projects);
}

function getPrices() {
  return readJsonFile(PRICES_FILE, DEFAULT_PRICES);
}

function savePrices(prices) {
  writeJsonFile(PRICES_FILE, prices);
}

function createProject(projectInput) {
  const projects = getProjects();

  const newProject = {
    id: `prj_${Date.now()}`,
    clientName: projectInput.clientName,
    projectName: projectInput.projectName,
    projectAddress: projectInput.projectAddress,
    projectType: projectInput.projectType,
    planFileName: projectInput.planFileName || null,
    planFilePath: projectInput.planFilePath || null,
    assumptions: null,
    estimate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.push(newProject);
  saveProjects(projects);

  return newProject;
}

function getProjectById(projectId) {
  const projects = getProjects();
  return projects.find((project) => project.id === projectId) || null;
}

function updateProject(projectId, updater) {
  const projects = getProjects();
  const index = projects.findIndex((project) => project.id === projectId);

  if (index === -1) {
    return null;
  }

  const current = projects[index];
  const updated = {
    ...current,
    ...updater,
    updatedAt: new Date().toISOString()
  };

  projects[index] = updated;
  saveProjects(projects);

  return updated;
}

module.exports = {
  DEFAULT_PRICES,
  ensureStorageFiles,
  getProjects,
  saveProjects,
  getPrices,
  savePrices,
  createProject,
  getProjectById,
  updateProject
};
