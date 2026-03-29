import { apiFetch, setStatus } from './common.js';

const form = document.getElementById('createProjectForm');
const statusEl = document.getElementById('createProjectStatus');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    clientName: form.clientName.value,
    projectName: form.projectName.value,
    projectAddress: form.projectAddress.value,
    projectType: form.projectType.value,
    projectWorkType: form.projectWorkType.value
  };

  setStatus(statusEl, 'Création du projet...', 'muted');

  try {
    const result = await apiFetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setStatus(statusEl, 'Projet créé. Redirection vers la page projet...', 'success');
    window.location.href = `project.html?projectId=${result.project.id}`;
  } catch (error) {
    setStatus(statusEl, error.message, 'error');
  }
});
