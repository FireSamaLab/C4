// Main Express application setup.
// Keeps server.js small and easy to read for beginners.

const express = require('express');
const path = require('path');
const { ensureStorageFiles } = require('./services/storageService');
const projectsRoutes = require('./routes/projectsRoutes');
const pricesRoutes = require('./routes/pricesRoutes');
const estimatesRoutes = require('./routes/estimatesRoutes');

const app = express();

// Make sure data files exist when the app starts.
ensureStorageFiles();

// Parse incoming JSON and URL-encoded form data.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folders for front-end files and uploaded plans.
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API routes.
app.use('/api/projects', projectsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/estimates', estimatesRoutes);

// Friendly health endpoint.
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'C4 Construction Estimator MVP' });
});

module.exports = app;
