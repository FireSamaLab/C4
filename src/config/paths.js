// Centralized absolute paths used by the backend.
// Keeping paths in one file makes future refactors easier.

const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

module.exports = {
  ROOT_DIR,
  DATA_DIR: path.join(ROOT_DIR, 'data'),
  UPLOADS_DIR: path.join(ROOT_DIR, 'uploads'),
  PROJECTS_FILE: path.join(ROOT_DIR, 'data', 'projects.json'),
  PRICES_FILE: path.join(ROOT_DIR, 'data', 'prices.json')
};
