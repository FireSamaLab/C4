// Entry point for the C4 Construction estimator MVP.
// This file starts the Express server and wires all routes.

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Estimateur C4 démarré sur http://localhost:${PORT}`);
});
