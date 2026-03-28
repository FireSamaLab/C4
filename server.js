// Entry point for the C4 Construction estimator MVP.
// This file starts the Express server and wires all routes.

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`C4 estimator running at http://localhost:${PORT}`);
});
