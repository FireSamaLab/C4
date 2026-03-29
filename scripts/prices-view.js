import { apiFetch, setStatus } from './common.js';

const TARGET_KEYS = ['2x4x8', '2x4x10', '2x6x8', '2x6x10', '2x8x10', '2x10x12'];

const importBtn = document.getElementById('btnImportRona');
const saveBtn = document.getElementById('btnSavePrices');
const statusEl = document.getElementById('priceStatus');
const tableBody = document.getElementById('pricesTableBody');

function renderPricesTable(pricesDoc) {
  const rows = TARGET_KEYS.map((key) => {
    const row = pricesDoc.prices?.[key] || {};

    return `
      <tr>
        <td><strong>${key}</strong></td>
        <td>${row.title || 'Non importé'}</td>
        <td><input type="number" min="0" step="0.01" data-key="${key}" value="${Number(row.price || 0)}" /></td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows.join('');
}

async function loadPrices() {
  setStatus(statusEl, 'Chargement des prix...', 'muted');

  try {
    const data = await apiFetch('/api/lumber-prices');
    renderPricesTable(data);
    setStatus(statusEl, 'Prix chargés.', 'success');
  } catch (error) {
    setStatus(statusEl, error.message, 'error');
  }
}

function getPricePayloadFromTable() {
  const payload = {};
  const inputs = tableBody.querySelectorAll('input[data-key]');

  for (const input of inputs) {
    payload[input.dataset.key] = Number(input.value || 0);
  }

  return payload;
}

importBtn.addEventListener('click', async () => {
  setStatus(statusEl, 'Import RONA en cours...', 'muted');

  try {
    const result = await apiFetch('/api/import-rona-prices', { method: 'POST' });
    setStatus(
      statusEl,
      `Import terminé. Produits bruts: ${result.summary.rawProductCount}. Clés normalisées: ${result.summary.normalizedKeyCount}.`,
      'success'
    );
    await loadPrices();
  } catch (error) {
    setStatus(statusEl, error.message, 'error');
  }
});

saveBtn.addEventListener('click', async () => {
  const itemType = window.prompt(
    "Pour quel type d'item voulez-vous enregistrer ces prix ? (ex: bois d'ossature, OSB, contreplaqué)",
    'bois d\'ossature'
  );

  // Si l'utilisateur annule, on ne fait rien.
  if (itemType === null) {
    setStatus(statusEl, 'Enregistrement annulé.', 'muted');
    return;
  }

  const cleanedItemType = itemType.trim();
  if (!cleanedItemType) {
    setStatus(statusEl, "Veuillez entrer un type d'item valide.", 'error');
    return;
  }

  setStatus(statusEl, 'Enregistrement des prix...', 'muted');

  try {
    await apiFetch('/api/lumber-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemType: cleanedItemType,
        prices: getPricePayloadFromTable()
      })
    });

    setStatus(statusEl, `Prix enregistrés pour: ${cleanedItemType}.`, 'success');
  } catch (error) {
    setStatus(statusEl, error.message, 'error');
  }
});

loadPrices();
