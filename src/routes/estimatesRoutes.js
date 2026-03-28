// Routes for estimate generation and retrieval.

const express = require('express');
const { getProjectById, getPrices, updateProject } = require('../services/storageService');
const { calculateEstimate } = require('../services/estimateService');

const router = express.Router();

// POST /api/estimates/:projectId/generate
// Generates estimate from saved assumptions and current prices.
router.post('/:projectId/generate', (req, res) => {
  const project = getProjectById(req.params.projectId);

  if (!project) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  if (!project.assumptions) {
    return res.status(400).json({
      message: 'Les hypothèses sont manquantes. Veuillez les remplir avant de générer l\'estimation.'
    });
  }

  const prices = getPrices();
  const estimate = calculateEstimate(project.assumptions, prices);

  const updatedProject = updateProject(req.params.projectId, { estimate });
  return res.json(updatedProject);
});

// GET /api/estimates/:projectId
// Reads latest estimate from project.
router.get('/:projectId', (req, res) => {
  const project = getProjectById(req.params.projectId);

  if (!project) {
    return res.status(404).json({ message: 'Projet introuvable.' });
  }

  if (!project.estimate) {
    return res.status(404).json({ message: 'Aucune estimation n\'a encore été générée pour ce projet.' });
  }

  return res.json(project.estimate);
});

module.exports = router;
