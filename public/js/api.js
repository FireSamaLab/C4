// Small helper functions for calling backend APIs.

async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);

  // Try to parse JSON response body safely.
  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const message = data && data.message ? data.message : `Échec de la requête : ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function formatMoney(value) {
  const numeric = Number(value || 0);
  return `$${numeric.toFixed(2)}`;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
