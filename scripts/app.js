// Frontend vanilla JS du MVP C4.
// Cette page pilote: import RONA, prix locaux, formulaire estimation, résultats, liste projets.

const TARGET_KEYS = ['2x4x8', '2x4x10', '2x6x8', '2x6x10', '2x8x10', '2x10x12'];

const elements = {
  btnImportRona: document.getElementById('btnImportRona'),
  btnRefreshProjects: document.getElementById('btnRefreshProjects'),
  importStatus: document.getElementById('importStatus'),

  pricesTableBody: document.getElementById('pricesTableBody'),
  btnSavePrices: document.getElementById('btnSavePrices'),
  priceStatus: document.getElementById('priceStatus'),

  estimateForm: document.getElementById('estimateForm'),
  estimateStatus: document.getElementById('estimateStatus'),

  resultsBody: document.getElementById('resultsBody'),
  totalOutput: document.getElementById('totalOutput'),

  projectsList: document.getElementById('projectsList')
};

let currentPricesDoc = { metadata: {}, prices: {} };

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Erreur API (${response.status})`);
  }

  return data;
}

function setStatus(el, text, kind = 'muted') {
  el.className = kind;
  el.textContent = text;
}

function getPriceOverridesFromUi() {
  const overrides = {};

  for (const key of TARGET_KEYS) {
    const input = document.querySelector(`[data-price-key="${key}"]`);
    if (!input) {
      continue;
    }

    const value = Number(input.value);
    overrides[key] = Number.isFinite(value) && value >= 0 ? value : 0;
  }

  // Optionnel: prix manuel pour revêtement dans ce MVP.
  const sheathing = document.querySelector('[data-price-key="SHEATHING-OSB-4x8"]');
  if (sheathing) {
    const sheathingValue = Number(sheathing.value);
    overrides['SHEATHING-OSB-4x8'] =
      Number.isFinite(sheathingValue) && sheathingValue >= 0 ? sheathingValue : 0;
  }

  return overrides;
}

function renderPricesTable(pricesDoc) {
  const rows = [];

  for (const key of TARGET_KEYS) {
    const row = pricesDoc.prices?.[key] || {};

    rows.push(`
      <tr>
        <td><strong>${key}</strong></td>
        <td>${row.title || 'Non importé'}</td>
        <td>
          <input
            type="number"
            min="0"
            step="0.01"
            value="${Number(row.price || 0)}"
            data-price-key="${key}"
          />
        </td>
      </tr>
    `);
  }

  rows.push(`
    <tr>
      <td><strong>SHEATHING-OSB-4x8</strong></td>
      <td>Revêtement extérieur (manuel MVP)</td>
      <td>
        <input type="number" min="0" step="0.01" value="18.50" data-price-key="SHEATHING-OSB-4x8" />
      </td>
    </tr>
  `);

  elements.pricesTableBody.innerHTML = rows.join('');
}

async function loadPrices() {
  const data = await apiFetch('/api/lumber-prices');
  currentPricesDoc = data;
  renderPricesTable(data);
}

async function saveManualPrices() {
  const prices = getPriceOverridesFromUi();

  await apiFetch('/api/lumber-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prices })
  });

  await loadPrices();
}

function renderProjects(projects) {
  if (!projects.length) {
    elements.projectsList.innerHTML = '<p class="muted">Aucun projet estimé pour le moment.</p>';
    return;
  }

  elements.projectsList.innerHTML = projects
    .map((project) => {
      return `
        <article class="project-item">
          <strong>${project.project.projectName}</strong><br/>
          Client: ${project.project.clientName}<br/>
          Adresse: ${project.project.projectAddress}<br/>
          Type: ${project.project.projectType}<br/>
          Créé le: ${new Date(project.createdAt).toLocaleString('fr-CA')}<br/>
          Total: <strong>${money(project.total)}</strong>
        </article>
      `;
    })
    .join('');
}

async function loadProjects() {
  const projects = await apiFetch('/api/projects');
  renderProjects(projects);
}

function renderResults(projectRecord) {
  const items = projectRecord.items || [];

  if (!items.length) {
    elements.resultsBody.innerHTML = '<tr><td colspan="5">Aucun résultat.</td></tr>';
    elements.totalOutput.textContent = 'Total: $0.00';
    return;
  }

  elements.resultsBody.innerHTML = items
    .map((item) => {
      return `
        <tr>
          <td>${item.materialKey}</td>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${money(item.unitPrice)}</td>
          <td>${money(item.subtotal)}</td>
        </tr>
      `;
    })
    .join('');

  elements.totalOutput.textContent = `Total: ${money(projectRecord.total)}`;
}

async function handleImportRonaClick() {
  setStatus(elements.importStatus, 'L\'import RONA n\'est pas disponible. Utilisez la saisie manuelle des prix.', 'error');
}

async function handleEstimateSubmit(event) {
  event.preventDefault();

  setStatus(elements.estimateStatus, 'Calcul en cours...', 'muted');

  try {
    const form = elements.estimateForm;
    const formData = new FormData(form);

    const payload = {
      clientName: formData.get('clientName'),
      projectName: formData.get('projectName'),
      projectAddress: formData.get('projectAddress'),
      projectType: formData.get('projectType'),

      buildingLength: Number(formData.get('buildingLength')),
      buildingWidth: Number(formData.get('buildingWidth')),
      numberOfFloors: Number(formData.get('numberOfFloors')),
      exteriorWallHeight: Number(formData.get('exteriorWallHeight')),

      interiorPartitionsCount: Number(formData.get('interiorPartitionsCount')),
      interiorLinearFeet: Number(formData.get('interiorLinearFeet')),

      studSpacing: Number(formData.get('studSpacing')),
      joistSpacing: Number(formData.get('joistSpacing')),
      wasteFactor: Number(formData.get('wasteFactor')),

      exteriorWallLumberType: formData.get('exteriorWallLumberType'),
      interiorWallLumberType: formData.get('interiorWallLumberType'),
      sheathingIncluded: formData.get('sheathingIncluded') === 'on',

      // On envoie les valeurs de prix affichées à l'écran (override utilisateur)
      priceOverrides: getPriceOverridesFromUi()
    };

    const response = await apiFetch('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    renderResults(response.project);
    setStatus(elements.estimateStatus, 'Estimation créée avec succès.', 'success');
    await loadProjects();
  } catch (error) {
    setStatus(elements.estimateStatus, error.message, 'error');
  }
}

function bindEvents() {
  elements.btnImportRona.addEventListener('click', handleImportRonaClick);
  elements.btnRefreshProjects.addEventListener('click', () => {
    loadProjects().catch((error) => setStatus(elements.importStatus, error.message, 'error'));
  });

  elements.btnSavePrices.addEventListener('click', async () => {
    setStatus(elements.priceStatus, 'Enregistrement des prix...', 'muted');

    try {
      await saveManualPrices();
      setStatus(elements.priceStatus, 'Prix enregistrés.', 'success');
    } catch (error) {
      setStatus(elements.priceStatus, error.message, 'error');
    }
  });

  elements.estimateForm.addEventListener('submit', handleEstimateSubmit);
}

async function initializeApp() {
  try {
    await apiFetch('/api/health');
    await loadPrices();
    await loadProjects();
    bindEvents();
  } catch (error) {
    setStatus(elements.importStatus, `Erreur au démarrage: ${error.message}`, 'error');
  }
}

initializeApp();
