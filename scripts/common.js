// Utilitaires partagés entre les différentes vues.

export async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Erreur API (${response.status})`);
  }

  return data;
}

export function formatMoney(value) {
  const numeric = Number(value || 0);
  return `$${numeric.toFixed(2)}`;
}

export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function projectMeta(project) {
  const source = project.project || project;

  return {
    clientName: source.clientName || '-',
    projectName: source.projectName || '-',
    projectAddress: source.projectAddress || '-',
    projectType: source.projectType || '-'
  };
}

export function setStatus(element, text, kind = 'muted') {
  element.className = kind;
  element.textContent = text;
}
