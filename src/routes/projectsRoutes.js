// Routes for project CRUD actions and assumptions updates.

const express = require('express');
const path = require('path');
const multer = require('multer');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject
} = require('../services/storageService');
const { UPLOADS_DIR } = require('../config/paths');
const { normalizeAssumptions } = require('../services/estimateService');

const router = express.Router();

// Multer setup for local plan upload storage.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = `${Date.now()}_${safeName}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// GET /api/projects -> dashboard list.
router.get('/', (_req, res) => {
  const projects = getProjects();

  // Show newest first for better UX.
  const sorted = [...projects].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(sorted);
});

// GET /api/projects/:id -> project details.
router.get('/:id', (req, res) => {
  const project = getProjectById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  return res.json(project);
});

// POST /api/projects -> create project + optional plan upload.
router.post('/', upload.single('planUpload'), (req, res) => {
  const { clientName, projectName, projectAddress, projectType } = req.body;

  if (!clientName || !projectName || !projectAddress || !projectType) {
    return res.status(400).json({
      message: 'Veuillez remplir tous les champs requis : nom du client, nom du projet, adresse, type.'
    });
  }

  const planFileName = req.file ? req.file.filename : null;
  const planFilePath = req.file ? path.join('uploads', req.file.filename) : null;

  const project = createProject({
    clientName,
    projectName,
    projectAddress,
    projectType,
    planFileName,
    planFilePath
  });

  return res.status(201).json(project);
});

// PUT /api/projects/:id/assumptions -> save dimensions/spacing/waste assumptions.
router.put('/:id/assumptions', (req, res) => {
  const project = getProjectById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  const assumptions = normalizeAssumptions(req.body);

  const updated = updateProject(req.params.id, {
    assumptions,
    estimate: null // Reset estimate when assumptions change.
  });

  return res.json(updated);
});

module.exports = router;
