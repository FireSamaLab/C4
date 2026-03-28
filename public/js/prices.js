// Price list page logic.
// Loads current prices and saves manual updates.

const formEl = document.getElementById('pricesForm');
const statusEl = document.getElementById('status');

async function loadPrices() {
  statusEl.className = 'muted';
  statusEl.textContent = 'Loading price list...';

  try {
    const prices = await apiFetch('/api/prices');

    for (const [key, value] of Object.entries(prices)) {
      if (formEl.elements[key]) {
        formEl.elements[key].value = value;
      }
    }

    statusEl.textContent = 'Prices loaded.';
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    lumber_2x4x8: formEl.lumber_2x4x8.value,
    lumber_2x4x10: formEl.lumber_2x4x10.value,
    lumber_2x6x8: formEl.lumber_2x6x8.value,
    lumber_2x6x10: formEl.lumber_2x6x10.value,
    lumber_2x8x10: formEl.lumber_2x8x10.value,
    lumber_2x10x12: formEl.lumber_2x10x12.value,
    osb_sheet: formEl.osb_sheet.value,
    plywood_sheet: formEl.plywood_sheet.value
  };

  statusEl.className = 'muted';
  statusEl.textContent = 'Saving prices...';

  try {
    await apiFetch('/api/prices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    statusEl.className = 'success';
    statusEl.textContent = 'Price list saved successfully.';
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
});

loadPrices();
